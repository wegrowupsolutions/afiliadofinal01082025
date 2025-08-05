-- Adicionar campos necessários na tabela kiwify para consolidar dados da evolution_instances
ALTER TABLE public.kiwify 
ADD COLUMN IF NOT EXISTS is_connected boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS connected_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS disconnected_at timestamp with time zone;

-- Remover função existente e criar nova para trabalhar com tabela kiwify
DROP FUNCTION IF EXISTS public.get_user_by_phone_number(text);

CREATE OR REPLACE FUNCTION public.get_user_by_phone_number(phone_number text)
RETURNS uuid AS $$
DECLARE
    found_user_id uuid;
BEGIN
    -- Busca o user_id na tabela kiwify baseado no remojid (phone_number)
    SELECT id::uuid INTO found_user_id
    FROM public.kiwify
    WHERE remojid = phone_number
    AND is_connected = true
    LIMIT 1;
    
    RETURN found_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atualizar função mark_instance_connected para trabalhar com tabela kiwify
CREATE OR REPLACE FUNCTION public.mark_instance_connected(
  p_user_id uuid,
  p_instance_name text,
  p_phone_number text DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  UPDATE public.kiwify 
  SET 
    is_connected = true,
    connected_at = now(),
    disconnected_at = NULL,
    remojid = COALESCE(p_phone_number, remojid),
    "Nome da instancia da Evolution" = COALESCE(p_instance_name, "Nome da instancia da Evolution")
  WHERE id::text = p_user_id::text;
  
  -- Se não existir registro, criar um novo
  IF NOT FOUND THEN
    INSERT INTO public.kiwify (id, is_connected, connected_at, remojid, "Nome da instancia da Evolution")
    VALUES (p_user_id::bigint, true, now(), p_phone_number, p_instance_name);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;