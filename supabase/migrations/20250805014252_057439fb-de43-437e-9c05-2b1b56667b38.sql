-- Corrigir o search_path das funções para melhorar a segurança
CREATE OR REPLACE FUNCTION public.get_user_id_by_email(user_email text)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT id FROM public.profiles WHERE email = user_email LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.get_current_user_email()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT email FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$function$;

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