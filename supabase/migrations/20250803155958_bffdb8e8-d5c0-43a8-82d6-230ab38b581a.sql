-- Adicionar coluna user_id à tabela afiliado_base_leads
ALTER TABLE public.afiliado_base_leads 
ADD COLUMN user_id uuid;

-- Atualizar leads existentes com user_id baseado nas mensagens
UPDATE public.afiliado_base_leads 
SET user_id = (
  SELECT user_id 
  FROM public.afiliado_mensagens 
  WHERE afiliado_mensagens.remotejid = afiliado_base_leads.remotejid 
  LIMIT 1
)
WHERE user_id IS NULL;

-- Adicionar trigger para auto-atribuir user_id aos novos leads
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
        SELECT get_user_by_phone_number(phone_from_remotejid) INTO target_user_id;
        
        -- Se encontrou um usuário, associa o lead a ele
        IF target_user_id IS NOT NULL THEN
            NEW.user_id := target_user_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para novos leads
DROP TRIGGER IF EXISTS auto_assign_user_to_lead_trigger ON public.afiliado_base_leads;
CREATE TRIGGER auto_assign_user_to_lead_trigger
    BEFORE INSERT ON public.afiliado_base_leads
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_assign_user_to_lead();

-- Atualizar políticas RLS para usar user_id diretamente
DROP POLICY IF EXISTS "Users can view leads they have messages with" ON public.afiliado_base_leads;
DROP POLICY IF EXISTS "Users can create leads they have messages with" ON public.afiliado_base_leads;
DROP POLICY IF EXISTS "Users can update leads they have messages with" ON public.afiliado_base_leads;
DROP POLICY IF EXISTS "Users can delete leads they have messages with" ON public.afiliado_base_leads;

-- Criar novas políticas RLS baseadas em user_id
CREATE POLICY "Users can view their own leads" 
ON public.afiliado_base_leads 
FOR SELECT 
USING (auth.uid() = user_id OR is_current_user_admin());

CREATE POLICY "Users can create their own leads" 
ON public.afiliado_base_leads 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR is_current_user_admin());

CREATE POLICY "Users can update their own leads" 
ON public.afiliado_base_leads 
FOR UPDATE 
USING (auth.uid() = user_id OR is_current_user_admin());

CREATE POLICY "Users can delete their own leads" 
ON public.afiliado_base_leads 
FOR DELETE 
USING (auth.uid() = user_id OR is_current_user_admin());