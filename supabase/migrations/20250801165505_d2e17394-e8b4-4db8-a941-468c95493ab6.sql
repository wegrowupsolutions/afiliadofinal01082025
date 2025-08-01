-- Corrigir função para verificar se um email é de administrador
CREATE OR REPLACE FUNCTION public.is_admin_email(email_to_check text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT email_to_check IN (
    'teste@gmail.com',
    'rodrigo@gmail.com', 
    'viniciushtx@gmail.com',
    'rfreitasdc@gmail.com'
  );
$$;

-- Corrigir função para verificar se o usuário atual é administrador
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT public.is_admin_email((auth.jwt() ->> 'email'::text));
$$;