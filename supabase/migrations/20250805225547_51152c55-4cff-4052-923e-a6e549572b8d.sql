-- 1. Corrigir status da instância Evolution para viniciushtx@hotmail.com
UPDATE public.kiwify 
SET 
  is_connected = true,
  connected_at = now(),
  disconnected_at = NULL
WHERE email = 'viniciushtx@hotmail.com' 
AND "Nome da instancia da Evolution" = 'testevini1933';

-- 2. Adicionar configurações Evolution faltantes no system_configurations
INSERT INTO public.system_configurations (key, value, description) VALUES
('evolution_api_url', 'https://api.evolution.com/instance', 'URL base da API Evolution para gerenciar instâncias'),
('evolution_qr_url', 'https://api.evolution.com/qrcode', 'URL para obter QR codes das instâncias Evolution'),
('evolution_webhook_url', 'https://webhook.evolution.com/status', 'URL do webhook para receber status das instâncias'),
('evolution_confirm_url', 'https://api.evolution.com/confirm', 'URL para confirmar conexão das instâncias Evolution'),
('evolution_api_key', '', 'Chave de API para autenticação com Evolution')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_at = now();

-- 3. Melhorar função mark_instance_connected para melhor tratamento de estados
CREATE OR REPLACE FUNCTION public.mark_instance_connected(p_user_id uuid, p_instance_name text, p_phone_number text DEFAULT NULL::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_email text;
  corrected_user_id uuid;
  existing_record_count int;
  updated_rows int;
BEGIN
  -- Log início da função
  RAISE NOTICE 'Marcando instância % como conectada para user_id %', p_instance_name, p_user_id;
  
  -- Obter email do usuário autenticado
  SELECT email INTO current_email 
  FROM auth.users 
  WHERE id = auth.uid();
  
  -- Se não há usuário autenticado, usar o p_user_id fornecido
  corrected_user_id := COALESCE(auth.uid(), p_user_id);
  
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
  
  -- Verificar se já existe um registro para este user_id com a instância
  SELECT COUNT(*) INTO existing_record_count
  FROM public.kiwify 
  WHERE user_id = corrected_user_id
  AND ("Nome da instancia da Evolution" = p_instance_name OR "Nome da instancia da Evolution" IS NULL);
  
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
    RAISE NOTICE 'Atualizado % registros existentes para user_id %', updated_rows, corrected_user_id;
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
      ELSE
        RAISE NOTICE 'Atualizado registro existente por email % para user_id %', current_email, corrected_user_id;
      END IF;
    END IF;
  END IF;
  
  RAISE NOTICE 'Função mark_instance_connected concluída para instância %', p_instance_name;
END;
$function$;