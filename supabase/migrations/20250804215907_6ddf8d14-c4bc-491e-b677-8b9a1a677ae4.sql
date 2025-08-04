-- Inserir usuários administradores na tabela kiwify
INSERT INTO public.kiwify (email, Nova_senha, Nome) 
VALUES 
  ('teste@gmail.com', '123456789', 'Administrador Teste'),
  ('rfreitasdc@gmail.com', '123456789', 'Administrador RF')
ON CONFLICT (email) DO UPDATE SET
  Nova_senha = EXCLUDED.Nova_senha,
  Nome = EXCLUDED.Nome;