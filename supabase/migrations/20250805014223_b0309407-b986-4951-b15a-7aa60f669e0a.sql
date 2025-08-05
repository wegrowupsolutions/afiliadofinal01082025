-- Ajustar a tabela evolution_instances para melhor integração com profiles
-- Tornar user_id obrigatório (não nulo) para garantir que toda instância tenha um usuário
ALTER TABLE public.evolution_instances 
ALTER COLUMN user_id SET NOT NULL;

-- Criar índice único para evitar múltiplas instâncias com o mesmo nome por usuário
CREATE UNIQUE INDEX IF NOT EXISTS idx_evolution_instances_user_instance 
ON public.evolution_instances(user_id, instance_name);

-- Criar função para obter o user_id a partir do email
CREATE OR REPLACE FUNCTION public.get_user_id_by_email(user_email text)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT id FROM public.profiles WHERE email = user_email LIMIT 1;
$function$;

-- Criar função para obter informações do usuário atual
CREATE OR REPLACE FUNCTION public.get_current_user_email()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT email FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$function$;

-- Atualizar políticas RLS para evolution_instances para usar profiles
DROP POLICY IF EXISTS "Users can create their own instances" ON public.evolution_instances;
DROP POLICY IF EXISTS "Users can view their own instances" ON public.evolution_instances;
DROP POLICY IF EXISTS "Users can update their own instances" ON public.evolution_instances;
DROP POLICY IF EXISTS "Users can delete their own instances" ON public.evolution_instances;

-- Criar novas políticas RLS baseadas no profiles
CREATE POLICY "Users can create their own instances" 
ON public.evolution_instances 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own instances" 
ON public.evolution_instances 
FOR SELECT 
USING (auth.uid() = user_id OR is_current_user_admin());

CREATE POLICY "Users can update their own instances" 
ON public.evolution_instances 
FOR UPDATE 
USING (auth.uid() = user_id OR is_current_user_admin())
WITH CHECK (auth.uid() = user_id OR is_current_user_admin());

CREATE POLICY "Users can delete their own instances" 
ON public.evolution_instances 
FOR DELETE 
USING (auth.uid() = user_id OR is_current_user_admin());

-- Atualizar a função mark_instance_connected para usar o user_id correto
CREATE OR REPLACE FUNCTION public.mark_instance_connected(p_user_email text, p_instance_name text, p_phone_number text DEFAULT NULL::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  target_user_id uuid;
BEGIN
  -- Buscar o user_id baseado no email
  SELECT id INTO target_user_id 
  FROM public.profiles 
  WHERE email = p_user_email 
  LIMIT 1;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuário com email % não encontrado', p_user_email;
  END IF;
  
  INSERT INTO public.evolution_instances (
    user_id, 
    instance_name, 
    phone_number, 
    is_connected, 
    connected_at
  )
  VALUES (
    target_user_id, 
    p_instance_name, 
    p_phone_number, 
    true, 
    now()
  )
  ON CONFLICT (user_id, instance_name) 
  DO UPDATE SET
    phone_number = EXCLUDED.phone_number,
    is_connected = true,
    connected_at = now(),
    disconnected_at = NULL,
    updated_at = now();
END;
$function$;

-- Criar função para verificar se o usuário já tem uma instância conectada
CREATE OR REPLACE FUNCTION public.get_user_connected_instance(p_user_email text)
RETURNS TABLE(
  instance_name text,
  phone_number text,
  is_connected boolean,
  connected_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT ei.instance_name, ei.phone_number, ei.is_connected, ei.connected_at
  FROM public.evolution_instances ei
  JOIN public.profiles p ON p.id = ei.user_id
  WHERE p.email = p_user_email 
    AND ei.is_connected = true
  ORDER BY ei.connected_at DESC
  LIMIT 1;
$function$;