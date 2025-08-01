-- Apagar buckets existentes
DELETE FROM storage.buckets WHERE id IN ('user-rodrigo-ead21684', 'user-teste-aa2bb6a1');

-- Função para criar bucket baseado no email do usuário
CREATE OR REPLACE FUNCTION create_user_bucket_by_email(user_email text, user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
    END IF;
    
    RETURN bucket_name;
END;
$$;

-- Função para obter o nome do bucket do usuário atual
CREATE OR REPLACE FUNCTION get_current_user_bucket()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;