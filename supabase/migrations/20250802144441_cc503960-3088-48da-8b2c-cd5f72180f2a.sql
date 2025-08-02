-- Atualizar registros existentes sem user_id para o usuário atual
-- Substitua 'viniciushtx@gmail.com' pelo seu email real se for diferente
UPDATE afiliado_base_leads 
SET user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'viniciushtx@gmail.com'
  LIMIT 1
)
WHERE user_id IS NULL;