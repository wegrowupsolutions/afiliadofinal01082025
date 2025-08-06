-- Primeiro, atualizar mensagens existentes com instance_id correto
UPDATE public.afiliado_mensagens 
SET instance_id = user_instance_data.instance_id,
    user_id = COALESCE(user_instance_data.user_id, afiliado_mensagens.user_id)
FROM (
    SELECT 
        split_part(am.remotejid, '@', 1) as phone_from_remotejid,
        am.id as message_id,
        ui.user_id,
        ui.instance_id
    FROM public.afiliado_mensagens am
    CROSS JOIN LATERAL public.get_user_instance_by_phone_number(split_part(am.remotejid, '@', 1)) as ui
    WHERE am.instance_id IS NULL
) as user_instance_data
WHERE afiliado_mensagens.id = user_instance_data.message_id;

-- Atualizar leads existentes com instance_id correto  
UPDATE public.afiliado_base_leads 
SET instance_id = user_instance_data.instance_id,
    user_id = COALESCE(user_instance_data.user_id, afiliado_base_leads.user_id)
FROM (
    SELECT 
        split_part(abl.remotejid, '@', 1) as phone_from_remotejid,
        abl.id as lead_id,
        ui.user_id,
        ui.instance_id
    FROM public.afiliado_base_leads abl
    CROSS JOIN LATERAL public.get_user_instance_by_phone_number(split_part(abl.remotejid, '@', 1)) as ui
    WHERE abl.instance_id IS NULL
) as user_instance_data
WHERE afiliado_base_leads.id = user_instance_data.lead_id;

-- Recriar trigger para mensagens (DROP se existir e CREATE novo)
DROP TRIGGER IF EXISTS trigger_auto_assign_user_to_message ON public.afiliado_mensagens;

CREATE TRIGGER trigger_auto_assign_user_to_message
    BEFORE INSERT ON public.afiliado_mensagens
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_assign_user_to_message_by_phone();

-- Recriar trigger para leads (DROP se existir e CREATE novo)
DROP TRIGGER IF EXISTS trigger_auto_assign_user_to_lead ON public.afiliado_base_leads;

CREATE TRIGGER trigger_auto_assign_user_to_lead
    BEFORE INSERT ON public.afiliado_base_leads
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_assign_user_to_lead_by_phone();