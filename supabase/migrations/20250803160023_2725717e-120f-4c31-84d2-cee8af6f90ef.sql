-- Corrigir função auto_assign_user_to_lead com search_path seguro
CREATE OR REPLACE FUNCTION public.auto_assign_user_to_lead()
RETURNS TRIGGER AS $$
DECLARE
    target_user_id uuid;
    phone_from_remotejid text;
BEGIN
    -- Prioridade 1: Se há um usuário autenticado, usar sempre o auth.uid()
    IF auth.uid() IS NOT NULL THEN
        NEW.user_id := auth.uid();
    -- Prioridade 2: Se não há usuário autenticado, tentar encontrar por telefone
    ELSE
        -- Extrai o número de telefone do remotejid (formato: 5511999999999@s.whatsapp.net)
        phone_from_remotejid := split_part(NEW.remotejid, '@', 1);
        
        -- Busca o usuário que possui esse número conectado na instância
        SELECT public.get_user_by_phone_number(phone_from_remotejid) INTO target_user_id;
        
        -- Se encontrou um usuário, associa o lead a ele
        IF target_user_id IS NOT NULL THEN
            NEW.user_id := target_user_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';