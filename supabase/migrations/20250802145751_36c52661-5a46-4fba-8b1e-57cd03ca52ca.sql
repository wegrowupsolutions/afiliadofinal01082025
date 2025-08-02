-- Atualizar leads existentes para o usuário atual (teste@gmail.com)
UPDATE afiliado_base_leads 
SET user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'teste@gmail.com'
  LIMIT 1
)
WHERE user_id IS NOT NULL;