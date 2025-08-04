-- Atualizar dados dos administradores na tabela kiwify
-- Definir senha padrão e marcar senha_alterada como true para admins

UPDATE public.kiwify 
SET 
  nova_senha = 'admin123',
  senha_alterada = true
WHERE email IN (
  'teste@gmail.com',
  'rodrigo@gmail.com', 
  'viniciushtx@gmail.com',
  'rfreitasdc@gmail.com'
);