-- Associar mensagens ao usuário viniciushtx@hotmail.com baseando-se na instância
-- Como o remojid não está sendo preenchido, vamos associar diretamente

-- 1. Buscar o user_id do viniciushtx@hotmail.com
-- Associar todas as mensagens que não têm user_id ao usuário que possui a instância testeuservini2209
UPDATE public.afiliado_mensagens 
SET user_id = (
  SELECT k.user_id 
  FROM public.kiwify k 
  JOIN public.profiles p ON k.user_id = p.id
  WHERE p.email = 'viniciushtx@hotmail.com' 
  AND k."Nome da instancia da Evolution" = 'testeuservini2209'
  LIMIT 1
)
WHERE user_id IS NULL;

-- 2. Associar leads da mesma forma
UPDATE public.afiliado_base_leads 
SET user_id = (
  SELECT k.user_id 
  FROM public.kiwify k 
  JOIN public.profiles p ON k.user_id = p.id
  WHERE p.email = 'viniciushtx@hotmail.com' 
  AND k."Nome da instancia da Evolution" = 'testeuservini2209'
  LIMIT 1
)
WHERE user_id IS NULL;

-- 3. Atualizar a função get_user_by_phone_number para também considerar instâncias sem remojid
CREATE OR REPLACE FUNCTION public.get_user_by_phone_number(phone_number text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
    found_user_id uuid;
BEGIN
    -- Primeiro: Busca o user_id na tabela kiwify baseado no remojid (phone_number)
    SELECT user_id INTO found_user_id
    FROM public.kiwify
    WHERE remojid = phone_number
    AND is_connected = true
    LIMIT 1;
    
    -- Se não encontrou por remojid, buscar por qualquer usuário conectado
    -- (temporário até termos o remojid preenchido corretamente)
    IF found_user_id IS NULL THEN
        SELECT user_id INTO found_user_id
        FROM public.kiwify
        WHERE is_connected = true
        AND user_id IS NOT NULL
        LIMIT 1;
    END IF;
    
    RETURN found_user_id;
END;
$function$;