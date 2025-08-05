-- Corrigir a função sync_kiwify_user_on_login para criar auth.users corretamente
CREATE OR REPLACE FUNCTION public.sync_kiwify_user_on_login(user_email text, user_password text)
RETURNS TABLE(user_id uuid, kiwify_data jsonb, should_create_account boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    found_kiwify_record RECORD;
    existing_auth_user_id uuid;
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
    SELECT id INTO existing_auth_user_id 
    FROM auth.users 
    WHERE email = user_email;
    
    -- Se usuário já existe no auth.users, apenas vincular o user_id na kiwify
    IF existing_auth_user_id IS NOT NULL THEN
        UPDATE public.kiwify 
        SET user_id = existing_auth_user_id,
            senha_alterada = true
        WHERE email = user_email;
        
        -- Criar/atualizar perfil se não existir
        INSERT INTO public.profiles (id, email, full_name)
        VALUES (existing_auth_user_id, user_email, found_kiwify_record."Nome")
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            full_name = EXCLUDED.full_name;
            
        -- Retornar indicando que não precisa criar conta
        RETURN QUERY
        SELECT 
            existing_auth_user_id as user_id,
            jsonb_build_object(
                'nome', found_kiwify_record."Nome",
                'email', found_kiwify_record.email,
                'telefone', found_kiwify_record.telefone,
                'nova_senha_definida', (found_kiwify_record.nova_senha IS NOT NULL),
                'senha_alterada', found_kiwify_record.senha_alterada
            ) as kiwify_data,
            false as should_create_account;
    ELSE
        -- Se usuário não existe, retornar indicando que precisa criar conta
        RETURN QUERY
        SELECT 
            found_kiwify_record.user_id as user_id,
            jsonb_build_object(
                'nome', found_kiwify_record."Nome",
                'email', found_kiwify_record.email,
                'telefone', found_kiwify_record.telefone,
                'nova_senha_definida', (found_kiwify_record.nova_senha IS NOT NULL),
                'senha_alterada', found_kiwify_record.senha_alterada
            ) as kiwify_data,
            true as should_create_account;
    END IF;
END;
$function$;

-- Criar função para atualizar kiwify após criação do usuário
CREATE OR REPLACE FUNCTION public.update_kiwify_after_auth_creation(user_email text, auth_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- Atualizar kiwify com o user_id do auth.users
    UPDATE public.kiwify 
    SET user_id = auth_user_id,
        senha_alterada = true
    WHERE email = user_email;
    
    -- Criar perfil
    INSERT INTO public.profiles (id, email, full_name)
    SELECT auth_user_id, user_email, "Nome"
    FROM public.kiwify 
    WHERE email = user_email
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name;
END;
$function$;