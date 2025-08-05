-- Habilitar RLS na tabela kiwify
ALTER TABLE public.kiwify ENABLE ROW LEVEL SECURITY;

-- Criar policies para a tabela kiwify usando user_id
CREATE POLICY "Users can view their own kiwify data" 
ON public.kiwify 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own kiwify data" 
ON public.kiwify 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own kiwify data" 
ON public.kiwify 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Policy especial para webhooks externos poderem inserir/atualizar
CREATE POLICY "Allow webhook updates for kiwify data" 
ON public.kiwify 
FOR ALL 
USING (true);

-- Corrigir função mark_instance_connected com SET search_path
CREATE OR REPLACE FUNCTION public.mark_instance_connected(p_user_id uuid, p_instance_name text, p_phone_number text DEFAULT NULL::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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

-- Corrigir função get_user_by_phone_number com SET search_path
CREATE OR REPLACE FUNCTION public.get_user_by_phone_number(phone_number text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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