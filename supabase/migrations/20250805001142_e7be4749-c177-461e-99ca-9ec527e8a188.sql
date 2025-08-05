-- Corrigir problema de replica identity para permitir UPDATEs
ALTER TABLE public.evolution_instances REPLICA IDENTITY FULL;

-- Corrigir as políticas RLS para permitir operações corretas
DROP POLICY IF EXISTS "Users can create their own instances" ON public.evolution_instances;
DROP POLICY IF EXISTS "Users can update their own instances" ON public.evolution_instances;

-- Criar nova política para INSERT que funciona com Kiwify users
CREATE POLICY "Users can create their own instances" 
ON public.evolution_instances 
FOR INSERT 
WITH CHECK (
  user_id = (
    SELECT id::text 
    FROM public.kiwify 
    WHERE email = (auth.jwt() ->> 'email')
    LIMIT 1
  )
  OR is_admin_email((auth.jwt() ->> 'email'))
);

-- Criar nova política para UPDATE que funciona com Kiwify users  
CREATE POLICY "Users can update their own instances"
ON public.evolution_instances
FOR UPDATE
USING (
  user_id = (
    SELECT id::text 
    FROM public.kiwify 
    WHERE email = (auth.jwt() ->> 'email')
    LIMIT 1
  )
  OR is_admin_email((auth.jwt() ->> 'email'))
);