-- Transferir dados da tabela profiles para a tabela kiwify
INSERT INTO public.kiwify (email, "Nome", telefone, created_at)
SELECT 
  email,
  full_name,
  phone,
  created_at
FROM public.profiles
WHERE email IS NOT NULL
ON CONFLICT DO NOTHING;