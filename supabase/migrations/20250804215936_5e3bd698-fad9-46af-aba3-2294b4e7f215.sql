-- Inserir usuários administradores na tabela kiwify
INSERT INTO public.kiwify (email, nova_senha, "Nome") 
VALUES 
  ('teste@gmail.com', '123456789', 'Administrador Teste'),
  ('rfreitasdc@gmail.com', '123456789', 'Administrador RF')
ON CONFLICT (email) DO UPDATE SET
  nova_senha = EXCLUDED.nova_senha,
  "Nome" = EXCLUDED."Nome";