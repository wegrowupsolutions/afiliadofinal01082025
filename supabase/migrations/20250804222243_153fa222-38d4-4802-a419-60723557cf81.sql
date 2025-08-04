-- Criar tabela para configurações de agente
CREATE TABLE public.agent_configurations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  configuration_data jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.agent_configurations ENABLE ROW LEVEL SECURITY;

-- Criar políticas de RLS
CREATE POLICY "Users can view their own configurations" 
ON public.agent_configurations 
FOR SELECT 
USING (auth.uid()::text = user_id::text OR EXISTS (
  SELECT 1 FROM public.kiwify k 
  WHERE k.email = (auth.jwt() ->> 'email'::text) 
  AND k.email = (
    SELECT email FROM public.kiwify k2 
    WHERE k2.id::text = user_id::text 
    LIMIT 1
  )
));

CREATE POLICY "Users can create their own configurations" 
ON public.agent_configurations 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id::text OR EXISTS (
  SELECT 1 FROM public.kiwify k 
  WHERE k.email = (auth.jwt() ->> 'email'::text)
));

CREATE POLICY "Users can update their own configurations" 
ON public.agent_configurations 
FOR UPDATE 
USING (auth.uid()::text = user_id::text OR EXISTS (
  SELECT 1 FROM public.kiwify k 
  WHERE k.email = (auth.jwt() ->> 'email'::text) 
  AND k.email = (
    SELECT email FROM public.kiwify k2 
    WHERE k2.id::text = user_id::text 
    LIMIT 1
  )
));

CREATE POLICY "Users can delete their own configurations" 
ON public.agent_configurations 
FOR DELETE 
USING (auth.uid()::text = user_id::text OR EXISTS (
  SELECT 1 FROM public.kiwify k 
  WHERE k.email = (auth.jwt() ->> 'email'::text) 
  AND k.email = (
    SELECT email FROM public.kiwify k2 
    WHERE k2.id::text = user_id::text 
    LIMIT 1
  )
));

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_agent_configurations_updated_at
BEFORE UPDATE ON public.agent_configurations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();