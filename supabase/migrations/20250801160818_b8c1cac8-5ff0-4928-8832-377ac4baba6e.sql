-- Primeiro, vamos criar uma função simplificada que não precisa de privilégios de superusuário
CREATE OR REPLACE FUNCTION public.create_user_bucket_simple(user_email text, user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
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