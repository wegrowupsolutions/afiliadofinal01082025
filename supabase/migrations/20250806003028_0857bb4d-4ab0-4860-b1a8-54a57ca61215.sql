-- Melhorar função mark_instance_connected com logs detalhados e validações
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
  result_status jsonb;
BEGIN
  -- Validação de entrada
  IF p_instance_name IS NULL OR trim(p_instance_name) = '' THEN
    RAISE NOTICE 'ERRO: Nome da instância não pode ser null/vazio';
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Nome da instância é obrigatório',
      'instance_name', p_instance_name
    );
  END IF;

  -- Log início da função
  RAISE NOTICE 'INÍCIO mark_instance_connected: instância=%, user_id=%', p_instance_name, p_user_id;
  
  -- Obter email do usuário autenticado
  SELECT email INTO current_email 
  FROM auth.users 
  WHERE id = auth.uid();
  
  RAISE NOTICE 'Email do usuário autenticado: %', current_email;
  
  -- Se não há usuário autenticado, usar o p_user_id fornecido
  corrected_user_id := COALESCE(auth.uid(), p_user_id);
  RAISE NOTICE 'User ID corrigido: %', corrected_user_id;
  
  -- Se há email disponível, tentar corrigir user_id por email primeiro
  IF current_email IS NOT NULL THEN
    UPDATE public.kiwify 
    SET user_id = corrected_user_id
    WHERE email = current_email 
    AND (user_id IS NULL OR user_id != corrected_user_id);
    
    GET DIAGNOSTICS updated_rows = ROW_COUNT;
    IF updated_rows > 0 THEN
      RAISE NOTICE 'Corrigido user_id para % registros com email %', updated_rows, current_email;
    END IF;
  END IF;
  
  -- Verificar se já existe um registro para este user_id
  SELECT COUNT(*) INTO existing_record_count
  FROM public.kiwify 
  WHERE user_id = corrected_user_id;
  
  RAISE NOTICE 'Registros existentes para user_id %: %', corrected_user_id, existing_record_count;
  
  IF existing_record_count > 0 THEN
    -- Atualizar registro existente, garantindo que nome da instância seja sempre salvo
    UPDATE public.kiwify 
    SET 
      "Nome da instancia da Evolution" = p_instance_name,
      remojid = COALESCE(p_phone_number, remojid),
      is_connected = true,
      connected_at = now(),
      disconnected_at = NULL
    WHERE user_id = corrected_user_id;
    
    GET DIAGNOSTICS updated_rows = ROW_COUNT;
    RAISE NOTICE 'Atualizado % registros existentes para user_id %', updated_rows, corrected_user_id;
    
    result_status := jsonb_build_object(
      'success', true,
      'action', 'updated_existing',
      'updated_rows', updated_rows,
      'user_id', corrected_user_id,
      'instance_name', p_instance_name,
      'phone_number', p_phone_number
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
        RAISE NOTICE 'Criado novo registro para user_id % e email %', corrected_user_id, current_email;
        
        result_status := jsonb_build_object(
          'success', true,
          'action', 'created_new',
          'user_id', corrected_user_id,
          'email', current_email,
          'instance_name', p_instance_name,
          'phone_number', p_phone_number
        );
      ELSE
        RAISE NOTICE 'Atualizado registro existente por email % para user_id %', current_email, corrected_user_id;
        
        result_status := jsonb_build_object(
          'success', true,
          'action', 'updated_by_email',
          'updated_rows', updated_rows,
          'user_id', corrected_user_id,
          'email', current_email,
          'instance_name', p_instance_name,
          'phone_number', p_phone_number
        );
      END IF;
    ELSE
      RAISE NOTICE 'ERRO: Não foi possível determinar email do usuário';
      result_status := jsonb_build_object(
        'success', false,
        'error', 'Email do usuário não encontrado',
        'user_id', corrected_user_id
      );
    END IF;
  END IF;
  
  RAISE NOTICE 'CONCLUSÃO mark_instance_connected: % para instância %', result_status, p_instance_name;
  RETURN result_status;
END;
$function$;

-- Função para marcar instância como desconectada
CREATE OR REPLACE FUNCTION public.mark_instance_disconnected(p_instance_name text, p_user_email text DEFAULT NULL)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  updated_rows int;
  current_email text;
BEGIN
  -- Log início da função
  RAISE NOTICE 'INÍCIO mark_instance_disconnected: instância=%, email=%', p_instance_name, p_user_email;
  
  -- Obter email do usuário autenticado ou usar o fornecido
  SELECT email INTO current_email 
  FROM auth.users 
  WHERE id = auth.uid();
  
  current_email := COALESCE(current_email, p_user_email);
  
  IF current_email IS NULL THEN
    RAISE NOTICE 'ERRO: Email não fornecido para desconexão';
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Email é obrigatório para desconexão'
    );
  END IF;
  
  -- Atualizar registro para marcar como desconectado
  UPDATE public.kiwify 
  SET 
    is_connected = false,
    disconnected_at = now()
  WHERE 
    ("Nome da instancia da Evolution" = p_instance_name OR email = current_email)
    AND is_connected = true;
  
  GET DIAGNOSTICS updated_rows = ROW_COUNT;
  RAISE NOTICE 'Marcado como desconectado % registros para instância %', updated_rows, p_instance_name;
  
  RETURN jsonb_build_object(
    'success', true,
    'action', 'disconnected',
    'updated_rows', updated_rows,
    'instance_name', p_instance_name,
    'email', current_email
  );
END;
$function$;