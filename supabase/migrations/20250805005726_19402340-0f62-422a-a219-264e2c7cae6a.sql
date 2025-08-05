-- Primeiro, vamos atualizar as mensagens existentes do usuário teste@gmail.com
-- para vincular ao ID 8 da tabela kiwify
UPDATE public.afiliado_mensagens 
SET user_id = '8'::uuid 
WHERE user_id IS NULL;

-- Criar trigger para auto-atribuir user_id baseado no usuário kiwify autenticado
CREATE OR REPLACE FUNCTION public.auto_assign_kiwify_user_to_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    kiwify_user_id bigint;
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
    
    -- Se encontrou, atribuir o ID como user_id
    IF kiwify_user_id IS NOT NULL THEN
        NEW.user_id := kiwify_user_id::uuid;
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