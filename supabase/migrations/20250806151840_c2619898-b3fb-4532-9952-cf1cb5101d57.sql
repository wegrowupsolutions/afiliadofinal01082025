-- Corrigir associação de mensagens e leads aos usuários corretos
-- Baseado nos números de telefone das instâncias Evolution

-- 1. Atualizar afiliado_mensagens associando ao usuário correto baseado no número de telefone
UPDATE public.afiliado_mensagens 
SET user_id = k.user_id
FROM public.kiwify k
WHERE afiliado_mensagens.user_id IS NULL
AND k.remojid IS NOT NULL
AND k.user_id IS NOT NULL
AND split_part(afiliado_mensagens.remotejid, '@', 1) = k.remojid;

-- 2. Para casos onde remojid na kiwify é null, mas temos instância conectada, 
-- usar a função get_user_by_phone_number que busca por telefone
UPDATE public.afiliado_mensagens 
SET user_id = public.get_user_by_phone_number(split_part(remotejid, '@', 1))
WHERE user_id IS NULL
AND remotejid IS NOT NULL
AND public.get_user_by_phone_number(split_part(remotejid, '@', 1)) IS NOT NULL;

-- 3. Atualizar afiliado_base_leads da mesma forma
UPDATE public.afiliado_base_leads 
SET user_id = k.user_id
FROM public.kiwify k
WHERE afiliado_base_leads.user_id IS NULL
AND k.remojid IS NOT NULL
AND k.user_id IS NOT NULL
AND split_part(afiliado_base_leads.remotejid, '@', 1) = k.remojid;

-- 4. Para leads sem associação, usar também a função de busca por telefone
UPDATE public.afiliado_base_leads 
SET user_id = public.get_user_by_phone_number(split_part(remotejid, '@', 1))
WHERE user_id IS NULL
AND remotejid IS NOT NULL
AND public.get_user_by_phone_number(split_part(remotejid, '@', 1)) IS NOT NULL;

-- 5. Verificar se os triggers automáticos estão funcionando
-- Vamos garantir que o trigger existe e está ativo para afiliado_mensagens
DROP TRIGGER IF EXISTS auto_assign_user_to_message_trigger ON public.afiliado_mensagens;
CREATE TRIGGER auto_assign_user_to_message_trigger
  BEFORE INSERT ON public.afiliado_mensagens
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_user_to_message_by_phone();

-- 6. Mesmo trigger para afiliado_base_leads
DROP TRIGGER IF EXISTS auto_assign_user_to_lead_trigger ON public.afiliado_base_leads;
CREATE TRIGGER auto_assign_user_to_lead_trigger
  BEFORE INSERT ON public.afiliado_base_leads
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_user_to_lead_by_phone();