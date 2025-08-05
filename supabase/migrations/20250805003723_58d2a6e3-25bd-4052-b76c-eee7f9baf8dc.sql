-- Corrigir a tabela evolution_instances para usar o ID correto da tabela kiwify
-- A coluna id deve ser o ID da tabela kiwify (bigint)
-- A coluna user_id deve ser removida pois é redundante

-- Primeiro, vamos alterar a estrutura da tabela
ALTER TABLE public.evolution_instances 
DROP COLUMN IF EXISTS id,
DROP COLUMN IF EXISTS user_id,
ADD COLUMN id bigint NOT NULL REFERENCES public.kiwify(id) ON DELETE CASCADE;

-- Adicionar constraint de chave primária composta
ALTER TABLE public.evolution_instances 
ADD CONSTRAINT evolution_instances_pkey PRIMARY KEY (id, instance_name);

-- Atualizar as políticas RLS para usar a nova estrutura
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.evolution_instances;
DROP POLICY IF EXISTS "Users can create their own instances" ON public.evolution_instances;
DROP POLICY IF EXISTS "Users can delete their own instances" ON public.evolution_instances;
DROP POLICY IF EXISTS "Users can update their own instances" ON public.evolution_instances;
DROP POLICY IF EXISTS "Users can view their own instances" ON public.evolution_instances;

-- Criar novas políticas usando o ID da tabela kiwify
CREATE POLICY "Users can create their own instances" 
ON public.evolution_instances 
FOR INSERT 
WITH CHECK (
  id = (SELECT kiwify.id FROM public.kiwify WHERE kiwify.email = (auth.jwt() ->> 'email'::text) LIMIT 1)
  OR is_admin_email((auth.jwt() ->> 'email'::text))
);

CREATE POLICY "Users can view their own instances" 
ON public.evolution_instances 
FOR SELECT 
USING (
  id = (SELECT kiwify.id FROM public.kiwify WHERE kiwify.email = (auth.jwt() ->> 'email'::text) LIMIT 1)
  OR is_admin_email((auth.jwt() ->> 'email'::text))
);

CREATE POLICY "Users can update their own instances" 
ON public.evolution_instances 
FOR UPDATE 
USING (
  id = (SELECT kiwify.id FROM public.kiwify WHERE kiwify.email = (auth.jwt() ->> 'email'::text) LIMIT 1)
  OR is_admin_email((auth.jwt() ->> 'email'::text))
)
WITH CHECK (
  id = (SELECT kiwify.id FROM public.kiwify WHERE kiwify.email = (auth.jwt() ->> 'email'::text) LIMIT 1)
  OR is_admin_email((auth.jwt() ->> 'email'::text))
);

CREATE POLICY "Users can delete their own instances" 
ON public.evolution_instances 
FOR DELETE 
USING (
  id = (SELECT kiwify.id FROM public.kiwify WHERE kiwify.email = (auth.jwt() ->> 'email'::text) LIMIT 1)
  OR is_admin_email((auth.jwt() ->> 'email'::text))
);