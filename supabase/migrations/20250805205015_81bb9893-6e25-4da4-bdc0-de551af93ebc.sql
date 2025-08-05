-- Corrigir a função mark_instance_connected para resolver o problema do ON CONFLICT
CREATE OR REPLACE FUNCTION public.mark_instance_connected(p_user_id uuid, p_instance_name text, p_phone_number text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_email text;
  corrected_user_id uuid;
  existing_record_count int;
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
  
  -- Verificar se já existe um registro para este user_id
  SELECT COUNT(*) INTO existing_record_count
  FROM public.kiwify 
  WHERE user_id = corrected_user_id;
  
  IF existing_record_count > 0 THEN
    -- Atualizar registro existente
    UPDATE public.kiwify 
    SET 
      "Nome da instancia da Evolution" = p_instance_name,
      remojid = COALESCE(p_phone_number, remojid),
      is_connected = true,
      connected_at = now(),
      disconnected_at = NULL
    WHERE user_id = corrected_user_id;
  ELSE
    -- Inserir novo registro
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
    );
  END IF;
  
  -- Se não houve UPDATE nem INSERT por user_id, tentar por email
  IF NOT FOUND AND current_email IS NOT NULL AND existing_record_count = 0 THEN
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
$function$