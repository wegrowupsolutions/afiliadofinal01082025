-- Atualizar as mensagens existentes para vincular ao usuário ID 8
-- Convertendo o ID 8 para string UUID como está sendo usado na tabela
UPDATE public.afiliado_mensagens 
SET user_id = '00000000-0000-0000-0000-000000000008'::uuid 
WHERE user_id IS NULL;

-- Criar função para auto-atribuir user_id baseado no usuário kiwify autenticado
CREATE OR REPLACE FUNCTION public.auto_assign_kiwify_user_to_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    kiwify_user_id bigint;
    formatted_user_id uuid;
BEGIN
    -- Se já tem user_id definido, manter
    IF NEW.user_id IS NOT NULL THEN
        RETURN NEW;
    END IF;
    
    -- Buscar o ID do usuário kiwify baseado no email autenticado
    SELECT id INTO kiwify_user_id
    FROM public.kiwify
    WHERE email = (auth.jwt() ->> 'email'::text)
    LIMIT 1;
    
    -- Se encontrou, converter o ID para UUID format
    IF kiwify_user_id IS NOT NULL THEN
        -- Converte o ID bigint para UUID format (usando padding com zeros)
        formatted_user_id := ('00000000-0000-0000-0000-' || lpad(kiwify_user_id::text, 12, '0'))::uuid;
        NEW.user_id := formatted_user_id;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Criar trigger na tabela afiliado_mensagens
DROP TRIGGER IF EXISTS assign_kiwify_user_to_message ON public.afiliado_mensagens;
CREATE TRIGGER assign_kiwify_user_to_message
    BEFORE INSERT ON public.afiliado_mensagens
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_assign_kiwify_user_to_message();