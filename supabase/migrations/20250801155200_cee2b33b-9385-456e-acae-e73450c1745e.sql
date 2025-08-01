-- Criar buckets dinâmicos para cada usuário se não existirem
-- Função para criar bucket dinâmico por usuário
CREATE OR REPLACE FUNCTION create_user_bucket_if_not_exists(user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    bucket_name text;
    bucket_exists boolean;
BEGIN
    -- Gerar nome do bucket baseado no ID do usuário
    bucket_name := 'user-' || substring(user_id::text from 1 for 8);
    
    -- Verificar se o bucket já existe
    SELECT EXISTS(
        SELECT 1 FROM storage.buckets 
        WHERE id = bucket_name
    ) INTO bucket_exists;
    
    -- Criar o bucket se não existir
    IF NOT bucket_exists THEN
        INSERT INTO storage.buckets (id, name, public)
        VALUES (bucket_name, bucket_name, true);
        
        -- Criar políticas de acesso para o bucket
        EXECUTE format('
            CREATE POLICY "Users can view their own files %s" ON storage.objects
            FOR SELECT USING (
                bucket_id = %L AND 
                auth.uid()::text = split_part(name, ''/'', 1)
            )', bucket_name, bucket_name);
            
        EXECUTE format('
            CREATE POLICY "Users can upload their own files %s" ON storage.objects
            FOR INSERT WITH CHECK (
                bucket_id = %L AND 
                auth.uid()::text = split_part(name, ''/'', 1)
            )', bucket_name, bucket_name);
            
        EXECUTE format('
            CREATE POLICY "Users can update their own files %s" ON storage.objects
            FOR UPDATE USING (
                bucket_id = %L AND 
                auth.uid()::text = split_part(name, ''/'', 1)
            )', bucket_name, bucket_name);
            
        EXECUTE format('
            CREATE POLICY "Users can delete their own files %s" ON storage.objects
            FOR DELETE USING (
                bucket_id = %L AND 
                auth.uid()::text = split_part(name, ''/'', 1)
            )', bucket_name, bucket_name);
    END IF;
    
    RETURN bucket_name;
END;
$$;