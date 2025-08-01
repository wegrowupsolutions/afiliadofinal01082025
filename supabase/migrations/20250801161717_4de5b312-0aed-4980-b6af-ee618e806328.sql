-- Criar política de storage para permitir que usuários vejam seus próprios arquivos
CREATE POLICY "Users can view their own files in user buckets" ON storage.objects
FOR SELECT USING (
  bucket_id LIKE 'user-%' AND 
  split_part(name, '/', 1) = auth.uid()::text
);

-- Criar política para permitir upload de arquivos
CREATE POLICY "Users can upload to their own folder in user buckets" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id LIKE 'user-%' AND 
  split_part(name, '/', 1) = auth.uid()::text
);

-- Criar política para permitir update de arquivos
CREATE POLICY "Users can update their own files in user buckets" ON storage.objects
FOR UPDATE USING (
  bucket_id LIKE 'user-%' AND 
  split_part(name, '/', 1) = auth.uid()::text
);

-- Criar política para permitir delete de arquivos
CREATE POLICY "Users can delete their own files in user buckets" ON storage.objects
FOR DELETE USING (
  bucket_id LIKE 'user-%' AND 
  split_part(name, '/', 1) = auth.uid()::text
);