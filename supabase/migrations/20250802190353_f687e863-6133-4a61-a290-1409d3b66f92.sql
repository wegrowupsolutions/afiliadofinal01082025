-- Função para encontrar o usuário baseado no número de telefone da instância
CREATE OR REPLACE FUNCTION public.get_user_by_phone_number(input_phone_number text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    found_user_id uuid;
BEGIN
    -- Busca o user_id na tabela evolution_instances baseado no phone_number
    SELECT user_id INTO found_user_id
    FROM public.evolution_instances
    WHERE phone_number = input_phone_number
    AND is_connected = true
    LIMIT 1;
    
    RETURN found_user_id;
END;
$$;

-- Função para associar leads automaticamente ao usuário correto
CREATE OR REPLACE FUNCTION public.auto_assign_user_to_lead_by_phone()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    target_user_id uuid;
    phone_from_remotejid text;
BEGIN
    -- Extrai o número de telefone do remotejid (formato: 5511999999999@s.whatsapp.net)
    phone_from_remotejid := split_part(NEW.remotejid, '@', 1);
    
    -- Busca o usuário que possui esse número conectado na instância
    SELECT get_user_by_phone_number(phone_from_remotejid) INTO target_user_id;
    
    -- Se encontrou um usuário, associa o lead a ele
    IF target_user_id IS NOT NULL THEN
        NEW.user_id := target_user_id;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Função para associar mensagens automaticamente ao usuário correto
CREATE OR REPLACE FUNCTION public.auto_assign_user_to_message_by_phone()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    target_user_id uuid;
    phone_from_remotejid text;
BEGIN
    -- Extrai o número de telefone do remotejid (formato: 5511999999999@s.whatsapp.net)
    phone_from_remotejid := split_part(NEW.remotejid, '@', 1);
    
    -- Busca o usuário que possui esse número conectado na instância
    SELECT get_user_by_phone_number(phone_from_remotejid) INTO target_user_id;
    
    -- Se encontrou um usuário, associa a mensagem a ele
    IF target_user_id IS NOT NULL THEN
        NEW.user_id := target_user_id;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Remove triggers antigos se existirem
DROP TRIGGER IF EXISTS auto_assign_user_to_lead_trigger ON public.afiliado_base_leads;
DROP TRIGGER IF EXISTS auto_assign_user_to_message_trigger ON public.afiliado_mensagens;

-- Cria trigger para afiliado_base_leads
CREATE TRIGGER auto_assign_user_to_lead_trigger
    BEFORE INSERT ON public.afiliado_base_leads
    FOR EACH ROW
    WHEN (NEW.user_id IS NULL)
    EXECUTE FUNCTION public.auto_assign_user_to_lead_by_phone();

-- Cria trigger para afiliado_mensagens
CREATE TRIGGER auto_assign_user_to_message_trigger
    BEFORE INSERT ON public.afiliado_mensagens
    FOR EACH ROW
    WHEN (NEW.user_id IS NULL)
    EXECUTE FUNCTION public.auto_assign_user_to_message_by_phone();

-- Atualiza registros existentes sem user_id
UPDATE public.afiliado_base_leads 
SET user_id = public.get_user_by_phone_number(split_part(remotejid, '@', 1))
WHERE user_id IS NULL
AND public.get_user_by_phone_number(split_part(remotejid, '@', 1)) IS NOT NULL;

UPDATE public.afiliado_mensagens 
SET user_id = public.get_user_by_phone_number(split_part(remotejid, '@', 1))
WHERE user_id IS NULL
AND public.get_user_by_phone_number(split_part(remotejid, '@', 1)) IS NOT NULL;