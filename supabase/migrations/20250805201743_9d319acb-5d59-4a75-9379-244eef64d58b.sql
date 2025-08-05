-- Adicionar coluna user_id na tabela kiwify
ALTER TABLE public.kiwify 
ADD COLUMN user_id uuid REFERENCES auth.users(id);

-- Popular user_id baseado no email existente
UPDATE public.kiwify 
SET user_id = p.id 
FROM public.profiles p 
WHERE kiwify.email = p.email;

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_kiwify_user_id ON public.kiwify(user_id);

-- Atualizar função mark_instance_connected para usar user_id corretamente
CREATE OR REPLACE FUNCTION public.mark_instance_connected(p_user_id uuid, p_instance_name text, p_phone_number text DEFAULT NULL::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  UPDATE public.kiwify 
  SET 
    is_connected = true,
    connected_at = now(),
    disconnected_at = NULL,
    remojid = COALESCE(p_phone_number, remojid),
    "Nome da instancia da Evolution" = COALESCE(p_instance_name, "Nome da instancia da Evolution")
  WHERE user_id = p_user_id;
  
  -- Se não existir registro, criar um novo
  IF NOT FOUND THEN
    INSERT INTO public.kiwify (user_id, is_connected, connected_at, remojid, "Nome da instancia da Evolution")
    VALUES (p_user_id, true, now(), p_phone_number, p_instance_name);
  END IF;
END;
$function$;

-- Atualizar função get_user_by_phone_number para usar user_id
CREATE OR REPLACE FUNCTION public.get_user_by_phone_number(phone_number text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    found_user_id uuid;
BEGIN
    -- Busca o user_id na tabela kiwify baseado no remojid (phone_number)
    SELECT user_id INTO found_user_id
    FROM public.kiwify
    WHERE remojid = phone_number
    AND is_connected = true
    LIMIT 1;
    
    RETURN found_user_id;
END;
$function$;