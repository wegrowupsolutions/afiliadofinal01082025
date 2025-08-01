-- Fix the last remaining functions with missing search_path

CREATE OR REPLACE FUNCTION public.create_user_bucket_by_email(user_email text, user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    bucket_name text;
    bucket_exists boolean;
    clean_email text;
BEGIN
    -- Limpar email para usar como nome do bucket (remover caracteres especiais)
    clean_email := lower(regexp_replace(user_email, '[^a-zA-Z0-9]', '-', 'g'));
    clean_email := regexp_replace(clean_email, '-+', '-', 'g');
    clean_email := trim(clean_email, '-');
    
    -- Gerar nome do bucket baseado no email
    bucket_name := 'user-' || clean_email;
    
    -- Verificar se o bucket já existe
    SELECT EXISTS(
        SELECT 1 FROM storage.buckets 
        WHERE id = bucket_name
    ) INTO bucket_exists;
    
    -- Criar o bucket se não existir
    IF NOT bucket_exists THEN
        INSERT INTO storage.buckets (id, name, public)
        VALUES (bucket_name, bucket_name, true);
        
        -- Criar políticas específicas para este bucket
        EXECUTE format('
            CREATE POLICY "User %s can view own files" ON storage.objects
            FOR SELECT USING (
                bucket_id = %L AND 
                (storage.foldername(name))[1] = %L
            )', bucket_name, bucket_name, user_id::text);
            
        EXECUTE format('
            CREATE POLICY "User %s can upload own files" ON storage.objects
            FOR INSERT WITH CHECK (
                bucket_id = %L AND 
                (storage.foldername(name))[1] = %L
            )', bucket_name, bucket_name, user_id::text);
            
        EXECUTE format('
            CREATE POLICY "User %s can update own files" ON storage.objects
            FOR UPDATE USING (
                bucket_id = %L AND 
                (storage.foldername(name))[1] = %L
            )', bucket_name, bucket_name, user_id::text);
            
        EXECUTE format('
            CREATE POLICY "User %s can delete own files" ON storage.objects
            FOR DELETE USING (
                bucket_id = %L AND 
                (storage.foldername(name))[1] = %L
            )', bucket_name, bucket_name, user_id::text);
    END IF;
    
    RETURN bucket_name;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_current_user_bucket()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    user_email text;
    clean_email text;
    bucket_name text;
BEGIN
    -- Obter email do usuário atual
    SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
    
    IF user_email IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Limpar email para usar como nome do bucket
    clean_email := lower(regexp_replace(user_email, '[^a-zA-Z0-9]', '-', 'g'));
    clean_email := regexp_replace(clean_email, '-+', '-', 'g');
    clean_email := trim(clean_email, '-');
    
    bucket_name := 'user-' || clean_email;
    
    RETURN bucket_name;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_user_bucket_simple(user_email text, user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    bucket_name text;
    bucket_exists boolean;
    clean_email text;
BEGIN
    -- Limpar email para usar como nome do bucket
    clean_email := lower(regexp_replace(user_email, '[^a-zA-Z0-9]', '-', 'g'));
    clean_email := regexp_replace(clean_email, '-+', '-', 'g');
    clean_email := trim(clean_email, '-');
    
    -- Gerar nome do bucket baseado no email
    bucket_name := 'user-' || clean_email;
    
    -- Verificar se o bucket já existe
    SELECT EXISTS(
        SELECT 1 FROM storage.buckets 
        WHERE id = bucket_name
    ) INTO bucket_exists;
    
    -- Criar o bucket se não existir
    IF NOT bucket_exists THEN
        INSERT INTO storage.buckets (id, name, public)
        VALUES (bucket_name, bucket_name, true);
    END IF;
    
    RETURN bucket_name;
END;
$function$;