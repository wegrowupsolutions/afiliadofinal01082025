-- Função para sincronizar dados do Kiwify com auth.users
CREATE OR REPLACE FUNCTION public.sync_kiwify_user_on_login(user_email text, user_password text)
RETURNS TABLE(user_id uuid, kiwify_data jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
    found_kiwify_record RECORD;
    created_user_id uuid;
    auth_response jsonb;
BEGIN
    -- Buscar registro na tabela kiwify pelo email
    SELECT * INTO found_kiwify_record 
    FROM public.kiwify 
    WHERE email = user_email 
    AND nova_senha IS NOT NULL
    LIMIT 1;
    
    -- Se não encontrou registro com nova_senha, retorna vazio
    IF found_kiwify_record IS NULL THEN
        RETURN;
    END IF;
    
    -- Verificar se já existe usuário no auth.users com este email
    SELECT id INTO created_user_id 
    FROM auth.users 
    WHERE email = user_email;
    
    -- Se usuário já existe, apenas vincular o user_id na kiwify
    IF created_user_id IS NOT NULL THEN
        UPDATE public.kiwify 
        SET user_id = created_user_id,
            senha_alterada = true
        WHERE email = user_email;
        
        -- Criar/atualizar perfil se não existir
        INSERT INTO public.profiles (id, email, full_name)
        VALUES (created_user_id, user_email, found_kiwify_record."Nome")
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            full_name = EXCLUDED.full_name;
    END IF;
    
    -- Retornar dados do usuário e kiwify
    RETURN QUERY
    SELECT 
        COALESCE(created_user_id, found_kiwify_record.user_id) as user_id,
        jsonb_build_object(
            'nome', found_kiwify_record."Nome",
            'email', found_kiwify_record.email,
            'telefone', found_kiwify_record.telefone,
            'nova_senha_definida', (found_kiwify_record.nova_senha IS NOT NULL),
            'senha_alterada', found_kiwify_record.senha_alterada
        ) as kiwify_data;
END;
$function$;

-- Função para atualizar senha na tabela kiwify
CREATE OR REPLACE FUNCTION public.update_kiwify_password(user_email text, new_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
    kiwify_exists boolean;
BEGIN
    -- Verificar se o email existe na tabela kiwify
    SELECT EXISTS(
        SELECT 1 FROM public.kiwify 
        WHERE email = user_email
    ) INTO kiwify_exists;
    
    IF NOT kiwify_exists THEN
        RETURN false;
    END IF;
    
    -- Atualizar a senha na tabela kiwify
    UPDATE public.kiwify 
    SET nova_senha = new_password,
        senha_alterada = true
    WHERE email = user_email;
    
    RETURN true;
END;
$function$;

-- Função para verificar se email existe na kiwify
CREATE OR REPLACE FUNCTION public.check_kiwify_email_exists(user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
    RETURN EXISTS(
        SELECT 1 FROM public.kiwify 
        WHERE email = user_email
    );
END;
$function$;