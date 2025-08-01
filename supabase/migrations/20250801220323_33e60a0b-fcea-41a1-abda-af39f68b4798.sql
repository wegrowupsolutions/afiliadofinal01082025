-- Fix Critical RLS Security Issues

-- 1. Enable RLS on afiliado_base_leads table and create proper policies
ALTER TABLE public.afiliado_base_leads ENABLE ROW LEVEL SECURITY;

-- Add user_id column to afiliado_base_leads for proper access control
ALTER TABLE public.afiliado_base_leads 
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create RLS policies for afiliado_base_leads
CREATE POLICY "Users can view their own leads" 
ON public.afiliado_base_leads 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own leads" 
ON public.afiliado_base_leads 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own leads" 
ON public.afiliado_base_leads 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own leads" 
ON public.afiliado_base_leads 
FOR DELETE 
USING (auth.uid() = user_id);

-- Admin policies for afiliado_base_leads
CREATE POLICY "Admins can manage all leads" 
ON public.afiliado_base_leads 
FOR ALL 
USING (public.is_current_user_admin());

-- 2. Fix afiliado_mensagens RLS policies
-- First, drop the overly permissive policy
DROP POLICY IF EXISTS "Allow read access to afiliado_mensagens" ON public.afiliado_mensagens;

-- Add user_id column to afiliado_mensagens for proper access control
ALTER TABLE public.afiliado_mensagens 
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create proper RLS policies for afiliado_mensagens
CREATE POLICY "Users can view their own messages" 
ON public.afiliado_mensagens 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own messages" 
ON public.afiliado_mensagens 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own messages" 
ON public.afiliado_mensagens 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages" 
ON public.afiliado_mensagens 
FOR DELETE 
USING (auth.uid() = user_id);

-- Admin policies for afiliado_mensagens
CREATE POLICY "Admins can manage all messages" 
ON public.afiliado_mensagens 
FOR ALL 
USING (public.is_current_user_admin());

-- 3. Fix database function security by updating search_path
CREATE OR REPLACE FUNCTION public.is_admin_email(email_to_check text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT email_to_check IN (
    'teste@gmail.com',
    'rodrigo@gmail.com', 
    'viniciushtx@gmail.com',
    'rfreitasdc@gmail.com'
  );
$function$;

-- Update other functions to have proper search_path
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT public.has_role(_user_id, 'admin')
$function$;