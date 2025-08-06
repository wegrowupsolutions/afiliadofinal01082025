-- Fix security warning: Set search_path properly for the function
CREATE OR REPLACE FUNCTION public.mark_instance_connected(p_user_id uuid, p_instance_name text, p_phone_number text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_email text;
  corrected_user_id uuid;
  existing_record RECORD;
  updated_rows int;
  result_data jsonb;
  final_user_id uuid;
BEGIN
  -- Log início da função com detalhes
  RAISE NOTICE '[mark_instance_connected] Iniciando: user_id=%, instance=%, phone=%', 
    p_user_id, p_instance_name, p_phone_number;
  
  -- Validação de entrada
  IF p_instance_name IS NULL OR trim(p_instance_name) = '' THEN
    RAISE NOTICE '[mark_instance_connected] ERRO: Nome da instância é obrigatório';
    RETURN jsonb_build_object(
      'action', 'error',
      'error', 'Instance name is required'
    );
  END IF;
  
  -- Obter email e user_id do usuário autenticado
  SELECT id, email INTO corrected_user_id, current_email 
  FROM auth.users 
  WHERE id = auth.uid();
  
  -- Usar p_user_id se não há usuário autenticado
  IF corrected_user_id IS NULL THEN
    corrected_user_id := p_user_id;
    -- Buscar email pelo user_id fornecido
    SELECT email INTO current_email 
    FROM auth.users 
    WHERE id = p_user_id;
  END IF;
  
  final_user_id := corrected_user_id;
  
  RAISE NOTICE '[mark_instance_connected] Dados finais: user_id=%, email=%', 
    final_user_id, current_email;
  
  -- Buscar registro existente por user_id ou email
  SELECT * INTO existing_record
  FROM public.kiwify 
  WHERE (user_id = final_user_id) 
     OR (current_email IS NOT NULL AND email = current_email)
  ORDER BY 
    CASE WHEN user_id = final_user_id THEN 1 
         WHEN email = current_email THEN 2 
         ELSE 3 END
  LIMIT 1;
  
  IF existing_record IS NOT NULL THEN
    -- Atualizar registro existente
    RAISE NOTICE '[mark_instance_connected] Atualizando registro existente: id=%', existing_record.id;
    
    UPDATE public.kiwify 
    SET 
      user_id = final_user_id,
      email = COALESCE(current_email, email),
      "Nome da instancia da Evolution" = trim(p_instance_name),
      remojid = COALESCE(p_phone_number, remojid),
      is_connected = true,
      connected_at = now(),
      disconnected_at = NULL,
      evolution_last_sync = now()
    WHERE id = existing_record.id;
    
    GET DIAGNOSTICS updated_rows = ROW_COUNT;
    
    IF updated_rows > 0 THEN
      RAISE NOTICE '[mark_instance_connected] ✅ Atualizado com sucesso: % linha(s)', updated_rows;
      result_data := jsonb_build_object(
        'action', 'updated_existing',
        'user_id', final_user_id,
        'email', current_email,
        'instance_name', trim(p_instance_name),
        'phone_number', p_phone_number,
        'updated_rows', updated_rows,
        'record_id', existing_record.id
      );
    ELSE
      RAISE NOTICE '[mark_instance_connected] ❌ Falha na atualização';
      result_data := jsonb_build_object(
        'action', 'update_failed',
        'error', 'Failed to update existing record'
      );
    END IF;
  ELSE
    -- Criar novo registro
    RAISE NOTICE '[mark_instance_connected] Criando novo registro';
    
    IF final_user_id IS NULL THEN
      RAISE NOTICE '[mark_instance_connected] ❌ ERRO: user_id é obrigatório para criar registro';
      RETURN jsonb_build_object(
        'action', 'error',
        'error', 'user_id is required to create new record'
      );
    END IF;
    
    INSERT INTO public.kiwify (
      user_id, 
      email,
      "Nome da instancia da Evolution",
      remojid,
      is_connected, 
      connected_at,
      evolution_last_sync
    )
    VALUES (
      final_user_id,
      current_email,
      trim(p_instance_name), 
      p_phone_number, 
      true, 
      now(),
      now()
    );
    
    RAISE NOTICE '[mark_instance_connected] ✅ Novo registro criado para user_id=%, email=%', 
      final_user_id, current_email;
      
    result_data := jsonb_build_object(
      'action', 'created_new',
      'user_id', final_user_id,
      'email', current_email,
      'instance_name', trim(p_instance_name),
      'phone_number', p_phone_number
    );
  END IF;
  
  -- Verificação final
  SELECT COUNT(*) INTO updated_rows
  FROM public.kiwify 
  WHERE user_id = final_user_id 
    AND "Nome da instancia da Evolution" = trim(p_instance_name)
    AND is_connected = true;
  
  IF updated_rows > 0 THEN
    RAISE NOTICE '[mark_instance_connected] ✅ Verificação final: Dados persistidos corretamente';
    result_data := result_data || jsonb_build_object('verification', 'success');
  ELSE
    RAISE NOTICE '[mark_instance_connected] ❌ Verificação final: Dados NÃO persistidos';
    result_data := result_data || jsonb_build_object('verification', 'failed');
  END IF;
  
  RAISE NOTICE '[mark_instance_connected] 🏁 Função concluída: %', result_data;
  
  RETURN result_data;
END;
$function$;