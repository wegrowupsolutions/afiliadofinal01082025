-- Melhorar função mark_instance_connected com melhor logging e tratamento de erros
CREATE OR REPLACE FUNCTION public.mark_instance_connected(p_user_id uuid, p_instance_name text, p_phone_number text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_email text;
  corrected_user_id uuid;
  existing_record_count int;
  updated_rows int;
  result_data jsonb;
BEGIN
  -- Log início da função com detalhes
  RAISE NOTICE 'mark_instance_connected: Iniciando para user_id=%, instance=%, phone=%', 
    p_user_id, p_instance_name, p_phone_number;
  
  -- Obter email do usuário autenticado
  SELECT email INTO current_email 
  FROM auth.users 
  WHERE id = auth.uid();
  
  RAISE NOTICE 'mark_instance_connected: Email do usuário autenticado=%', current_email;
  
  -- Se não há usuário autenticado, usar o p_user_id fornecido
  corrected_user_id := COALESCE(auth.uid(), p_user_id);
  
  RAISE NOTICE 'mark_instance_connected: Usando user_id corrigido=%', corrected_user_id;
  
  -- Se há email disponível, tentar corrigir user_id por email primeiro
  IF current_email IS NOT NULL THEN
    UPDATE public.kiwify 
    SET user_id = corrected_user_id
    WHERE email = current_email 
    AND (user_id IS NULL OR user_id != corrected_user_id);
    
    GET DIAGNOSTICS updated_rows = ROW_COUNT;
    IF updated_rows > 0 THEN
      RAISE NOTICE 'mark_instance_connected: Corrigido user_id para % registros com email %', 
        updated_rows, current_email;
    END IF;
  END IF;
  
  -- Verificar se já existe um registro para este user_id com a instância
  SELECT COUNT(*) INTO existing_record_count
  FROM public.kiwify 
  WHERE user_id = corrected_user_id
  AND ("Nome da instancia da Evolution" = p_instance_name OR "Nome da instancia da Evolution" IS NULL);
  
  RAISE NOTICE 'mark_instance_connected: Encontrados % registros existentes para user_id %', 
    existing_record_count, corrected_user_id;
  
  IF existing_record_count > 0 THEN
    -- Atualizar registro existente
    UPDATE public.kiwify 
    SET 
      "Nome da instancia da Evolution" = p_instance_name,
      remojid = COALESCE(p_phone_number, remojid),
      is_connected = true,
      connected_at = now(),
      disconnected_at = NULL
    WHERE user_id = corrected_user_id;
    
    GET DIAGNOSTICS updated_rows = ROW_COUNT;
    RAISE NOTICE 'mark_instance_connected: Atualizado % registros existentes para user_id %', 
      updated_rows, corrected_user_id;
      
    result_data := jsonb_build_object(
      'action', 'updated_existing',
      'user_id', corrected_user_id,
      'instance_name', p_instance_name,
      'phone_number', p_phone_number,
      'updated_rows', updated_rows
    );
  ELSE
    -- Se não encontrou por user_id, tentar por email
    IF current_email IS NOT NULL THEN
      UPDATE public.kiwify 
      SET 
        user_id = corrected_user_id,
        "Nome da instancia da Evolution" = p_instance_name,
        remojid = COALESCE(p_phone_number, remojid),
        is_connected = true,
        connected_at = now(),
        disconnected_at = NULL
      WHERE email = current_email;
      
      GET DIAGNOSTICS updated_rows = ROW_COUNT;
      
      IF updated_rows = 0 THEN
        -- Inserir novo registro se não existe nenhum
        INSERT INTO public.kiwify (
          user_id, 
          email,
          "Nome da instancia da Evolution",
          remojid,
          is_connected, 
          connected_at
        )
        VALUES (
          corrected_user_id,
          current_email,
          p_instance_name, 
          p_phone_number, 
          true, 
          now()
        );
        
        RAISE NOTICE 'mark_instance_connected: Criado novo registro para user_id % e email %', 
          corrected_user_id, current_email;
          
        result_data := jsonb_build_object(
          'action', 'created_new',
          'user_id', corrected_user_id,
          'email', current_email,
          'instance_name', p_instance_name,
          'phone_number', p_phone_number
        );
      ELSE
        RAISE NOTICE 'mark_instance_connected: Atualizado registro existente por email % para user_id %', 
          current_email, corrected_user_id;
          
        result_data := jsonb_build_object(
          'action', 'updated_by_email',
          'user_id', corrected_user_id,
          'email', current_email,
          'instance_name', p_instance_name,
          'phone_number', p_phone_number,
          'updated_rows', updated_rows
        );
      END IF;
    ELSE
      RAISE NOTICE 'mark_instance_connected: Sem email disponível e nenhum registro encontrado';
      result_data := jsonb_build_object(
        'action', 'no_action',
        'error', 'No email available and no existing records found'
      );
    END IF;
  END IF;
  
  RAISE NOTICE 'mark_instance_connected: Função concluída para instância % com resultado %', 
    p_instance_name, result_data;
  
  RETURN result_data;
END;
$function$;