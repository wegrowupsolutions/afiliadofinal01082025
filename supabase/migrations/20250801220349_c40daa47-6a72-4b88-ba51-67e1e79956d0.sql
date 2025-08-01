-- Fix remaining database function security issues by adding proper search_path

-- Update functions that are missing search_path settings
CREATE OR REPLACE FUNCTION public.get_admin_emails()
RETURNS text[]
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  admin_emails_str TEXT;
BEGIN
  SELECT value INTO admin_emails_str 
  FROM public.system_configurations 
  WHERE key = 'admin_emails';
  
  IF admin_emails_str IS NULL THEN
    RETURN ARRAY[]::TEXT[];
  END IF;
  
  RETURN string_to_array(admin_emails_str, ',');
END;
$function$;

CREATE OR REPLACE FUNCTION public.auto_assign_admin_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- Use secure function to check admin emails
    IF public.is_admin_email(NEW.email) THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (NEW.id, 'admin'::app_role)
        ON CONFLICT (user_id, role) DO NOTHING;
    ELSE
        -- For other users, insert default 'user' role
        INSERT INTO public.user_roles (user_id, role)
        VALUES (NEW.id, 'user'::app_role)
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.assign_admin_to_specific_emails()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- Use secure function to get admin emails
    INSERT INTO public.user_roles (user_id, role)
    SELECT au.id, 'admin'::app_role
    FROM auth.users au
    WHERE public.is_admin_email(au.email)
    ON CONFLICT (user_id, role) DO NOTHING;
END;
$function$;

CREATE OR REPLACE FUNCTION public.cleanup_inactive_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.active_sessions 
  SET is_active = false
  WHERE last_activity < (now() - interval '24 hours')
    AND is_active = true;
END;
$function$;