-- Implementar segregação por instância da Evolution
-- Adicionar colunas instance_id às tabelas de mensagens e leads

-- 1. Adicionar coluna instance_id à tabela afiliado_mensagens
ALTER TABLE public.afiliado_mensagens 
ADD COLUMN IF NOT EXISTS instance_id text;

-- 2. Adicionar coluna instance_id à tabela afiliado_base_leads
ALTER TABLE public.afiliado_base_leads 
ADD COLUMN IF NOT EXISTS instance_id text;

-- 3. Criar função para obter user_id e instance_id baseado no telefone
CREATE OR REPLACE FUNCTION public.get_user_instance_by_phone_number(phone_number text)
RETURNS TABLE(user_id uuid, instance_id text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
    found_user_id uuid;
    found_instance_id text;
BEGIN
    -- Prioridade 1: Se há usuário autenticado, usar sempre suas instâncias
    IF auth.uid() IS NOT NULL THEN
        SELECT k.user_id, k.evolution_instance_id 
        INTO found_user_id, found_instance_id
        FROM public.kiwify k
        WHERE k.user_id = auth.uid()
        AND k.is_connected = true
        LIMIT 1;
        
        IF found_user_id IS NOT NULL THEN
            RETURN QUERY SELECT found_user_id, found_instance_id;
            RETURN;
        END IF;
    END IF;
    
    -- Prioridade 2: Buscar por remojid (phone_number) na tabela kiwify
    SELECT k.user_id, k.evolution_instance_id 
    INTO found_user_id, found_instance_id
    FROM public.kiwify k
    WHERE k.remojid = phone_number
    AND k.is_connected = true
    LIMIT 1;
    
    IF found_user_id IS NOT NULL THEN
        RETURN QUERY SELECT found_user_id, found_instance_id;
        RETURN;
    END IF;
    
    -- Prioridade 3: Fallback - qualquer usuário conectado (temporário)
    SELECT k.user_id, k.evolution_instance_id 
    INTO found_user_id, found_instance_id
    FROM public.kiwify k
    WHERE k.is_connected = true
    AND k.user_id IS NOT NULL
    AND k.evolution_instance_id IS NOT NULL
    LIMIT 1;
    
    RETURN QUERY SELECT found_user_id, found_instance_id;
END;
$function$;

-- 4. Atualizar trigger para mensagens
CREATE OR REPLACE FUNCTION public.auto_assign_user_to_message_by_phone()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
    target_user_id uuid;
    target_instance_id text;
    phone_from_remotejid text;
    user_instance_data RECORD;
BEGIN
    -- Extrai o número de telefone do remotejid (formato: 5511999999999@s.whatsapp.net)
    phone_from_remotejid := split_part(NEW.remotejid, '@', 1);
    
    -- Busca o usuário e instância que possui esse número ou está autenticado
    SELECT * INTO user_instance_data 
    FROM public.get_user_instance_by_phone_number(phone_from_remotejid);
    
    target_user_id := user_instance_data.user_id;
    target_instance_id := user_instance_data.instance_id;
    
    -- Se encontrou usuário e instância, associa a mensagem
    IF target_user_id IS NOT NULL THEN
        NEW.user_id := target_user_id;
        NEW.instance_id := target_instance_id;
    END IF;
    
    RETURN NEW;
END;
$function$;

-- 5. Atualizar trigger para leads
CREATE OR REPLACE FUNCTION public.auto_assign_user_to_lead_by_phone()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
    target_user_id uuid;
    target_instance_id text;
    phone_from_remotejid text;
    user_instance_data RECORD;
BEGIN
    -- Extrai o número de telefone do remotejid (formato: 5511999999999@s.whatsapp.net)
    phone_from_remotejid := split_part(NEW.remotejid, '@', 1);
    
    -- Busca o usuário e instância que possui esse número ou está autenticado
    SELECT * INTO user_instance_data 
    FROM public.get_user_instance_by_phone_number(phone_from_remotejid);
    
    target_user_id := user_instance_data.user_id;
    target_instance_id := user_instance_data.instance_id;
    
    -- Se encontrou usuário e instância, associa o lead
    IF target_user_id IS NOT NULL THEN
        NEW.user_id := target_user_id;
        NEW.instance_id := target_instance_id;
    END IF;
    
    RETURN NEW;
END;
$function$;

-- 6. Associar mensagens existentes às instâncias corretas
UPDATE public.afiliado_mensagens 
SET 
    user_id = k.user_id,
    instance_id = k.evolution_instance_id
FROM public.kiwify k
WHERE k.is_connected = true
AND k.user_id IS NOT NULL
AND k.evolution_instance_id IS NOT NULL
AND afiliado_mensagens.user_id IS NULL;

-- 7. Associar leads existentes às instâncias corretas
UPDATE public.afiliado_base_leads 
SET 
    user_id = k.user_id,
    instance_id = k.evolution_instance_id
FROM public.kiwify k
WHERE k.is_connected = true
AND k.user_id IS NOT NULL
AND k.evolution_instance_id IS NOT NULL
AND afiliado_base_leads.user_id IS NULL;

-- 8. Atualizar políticas RLS para afiliado_mensagens para incluir instance_id
DROP POLICY IF EXISTS "Users can view their own messages" ON public.afiliado_mensagens;
CREATE POLICY "Users can view their own messages" 
ON public.afiliado_mensagens 
FOR SELECT 
USING (
    auth.uid() = user_id 
    AND (
        instance_id IS NULL 
        OR instance_id IN (
            SELECT evolution_instance_id 
            FROM public.kiwify 
            WHERE user_id = auth.uid() 
            AND is_connected = true
        )
    )
);

DROP POLICY IF EXISTS "Users can create their own messages" ON public.afiliado_mensagens;
CREATE POLICY "Users can create their own messages" 
ON public.afiliado_mensagens 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own messages" ON public.afiliado_mensagens;
CREATE POLICY "Users can update their own messages" 
ON public.afiliado_mensagens 
FOR UPDATE 
USING (
    auth.uid() = user_id 
    AND (
        instance_id IS NULL 
        OR instance_id IN (
            SELECT evolution_instance_id 
            FROM public.kiwify 
            WHERE user_id = auth.uid() 
            AND is_connected = true
        )
    )
);

DROP POLICY IF EXISTS "Users can delete their own messages" ON public.afiliado_mensagens;
CREATE POLICY "Users can delete their own messages" 
ON public.afiliado_mensagens 
FOR DELETE 
USING (
    auth.uid() = user_id 
    AND (
        instance_id IS NULL 
        OR instance_id IN (
            SELECT evolution_instance_id 
            FROM public.kiwify 
            WHERE user_id = auth.uid() 
            AND is_connected = true
        )
    )
);

-- 9. Atualizar políticas RLS para afiliado_base_leads para incluir instance_id
DROP POLICY IF EXISTS "Users can view their own leads" ON public.afiliado_base_leads;
CREATE POLICY "Users can view their own leads" 
ON public.afiliado_base_leads 
FOR SELECT 
USING (
    auth.uid() = user_id 
    AND (
        instance_id IS NULL 
        OR instance_id IN (
            SELECT evolution_instance_id 
            FROM public.kiwify 
            WHERE user_id = auth.uid() 
            AND is_connected = true
        )
    )
);

DROP POLICY IF EXISTS "Users can create their own leads" ON public.afiliado_base_leads;
CREATE POLICY "Users can create their own leads" 
ON public.afiliado_base_leads 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own leads" ON public.afiliado_base_leads;
CREATE POLICY "Users can update their own leads" 
ON public.afiliado_base_leads 
FOR UPDATE 
USING (
    auth.uid() = user_id 
    AND (
        instance_id IS NULL 
        OR instance_id IN (
            SELECT evolution_instance_id 
            FROM public.kiwify 
            WHERE user_id = auth.uid() 
            AND is_connected = true
        )
    )
);

DROP POLICY IF EXISTS "Users can delete their own leads" ON public.afiliado_base_leads;
CREATE POLICY "Users can delete their own leads" 
ON public.afiliado_base_leads 
FOR DELETE 
USING (
    auth.uid() = user_id 
    AND (
        instance_id IS NULL 
        OR instance_id IN (
            SELECT evolution_instance_id 
            FROM public.kiwify 
            WHERE user_id = auth.uid() 
            AND is_connected = true
        )
    )
);