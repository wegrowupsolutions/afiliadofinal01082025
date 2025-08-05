-- Primeiro remover todas as políticas que dependem das colunas
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.evolution_instances;
DROP POLICY IF EXISTS "Users can create their own instances" ON public.evolution_instances;
DROP POLICY IF EXISTS "Users can delete their own instances" ON public.evolution_instances;
DROP POLICY IF EXISTS "Users can update their own instances" ON public.evolution_instances;
DROP POLICY IF EXISTS "Users can view their own instances" ON public.evolution_instances;

-- Agora podemos alterar a estrutura da tabela
ALTER TABLE public.evolution_instances 
DROP COLUMN IF EXISTS id CASCADE,
DROP COLUMN IF EXISTS user_id CASCADE;

-- Adicionar nova coluna id como chave estrangeira para kiwify
ALTER TABLE public.evolution_instances 
ADD COLUMN id bigint NOT NULL REFERENCES public.kiwify(id) ON DELETE CASCADE;

-- Criar constraint de chave primária composta
ALTER TABLE public.evolution_instances 
ADD CONSTRAINT evolution_instances_pkey PRIMARY KEY (id, instance_name);

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