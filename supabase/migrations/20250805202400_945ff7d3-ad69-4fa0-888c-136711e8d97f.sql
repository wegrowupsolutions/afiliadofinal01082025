-- CORREÇÃO URGENTE: Sincronização de user_id entre auth.users e tabela kiwify

-- 1. Corrigir dados existentes na tabela kiwify
-- Sincronizar user_id da kiwify com auth.users baseado no email
UPDATE public.kiwify 
SET user_id = auth_users.id
FROM auth.users auth_users
WHERE kiwify.email = auth_users.email
AND kiwify.user_id != auth_users.id;

-- 2. Atualizar função mark_instance_connected com lógica híbrida
CREATE OR REPLACE FUNCTION public.mark_instance_connected(p_user_id uuid, p_instance_name text, p_phone_number text DEFAULT NULL::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_email text;
  corrected_user_id uuid;
BEGIN
  -- Obter email do usuário autenticado
  SELECT email INTO current_email 
  FROM auth.users 
  WHERE id = auth.uid();
  
  -- Se não há usuário autenticado, usar o p_user_id fornecido
  corrected_user_id := COALESCE(auth.uid(), p_user_id);
  
  -- Primeiro tentar encontrar registro por email e corrigir user_id se necessário
  IF current_email IS NOT NULL THEN
    UPDATE public.kiwify 
    SET user_id = corrected_user_id
    WHERE email = current_email 
    AND user_id != corrected_user_id;
  END IF;
  
  -- Agora atualizar/inserir com user_id correto
  INSERT INTO public.kiwify (
    user_id, 
    email,
    "Nome da instancia da Evolution",
    remojid,
    is_connected, 
    connected_at
  )
  VALUES (
    corrected_user_id,
    current_email,
    p_instance_name, 
    p_phone_number, 
    true, 
    now()
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    "Nome da instancia da Evolution" = EXCLUDED."Nome da instancia da Evolution",
    remojid = COALESCE(EXCLUDED.remojid, kiwify.remojid),
    is_connected = true,
    connected_at = now(),
    disconnected_at = NULL;
  
  -- Se não houve INSERT nem UPDATE por user_id, tentar por email
  IF NOT FOUND AND current_email IS NOT NULL THEN
    UPDATE public.kiwify 
    SET 
      user_id = corrected_user_id,
      "Nome da instancia da Evolution" = p_instance_name,
      remojid = COALESCE(p_phone_number, remojid),
      is_connected = true,
      connected_at = now(),
      disconnected_at = NULL
    WHERE email = current_email;
  END IF;
END;
$function$;

-- 3. Criar função de validação para verificar sincronização
CREATE OR REPLACE FUNCTION public.validate_kiwify_user_sync()
RETURNS TABLE(
  kiwify_email text,
  kiwify_user_id uuid,
  auth_user_id uuid,
  is_synced boolean
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    k.email,
    k.user_id as kiwify_user_id,
    au.id as auth_user_id,
    (k.user_id = au.id) as is_synced
  FROM public.kiwify k
  LEFT JOIN auth.users au ON k.email = au.email
  WHERE k.email IS NOT NULL;
$function$;