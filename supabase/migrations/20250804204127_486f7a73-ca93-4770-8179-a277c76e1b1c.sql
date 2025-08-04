-- Remover a coluna user_id que criamos anteriormente
ALTER TABLE public.kiwify DROP COLUMN user_id;

-- Atualizar as políticas RLS para usar email ao invés de user_id
DROP POLICY IF EXISTS "Users can view their own kiwify data" ON public.kiwify;
DROP POLICY IF EXISTS "Users can insert their own kiwify data" ON public.kiwify;
DROP POLICY IF EXISTS "Users can update their own kiwify data" ON public.kiwify;
DROP POLICY IF EXISTS "Users can delete their own kiwify data" ON public.kiwify;

-- Criar novas políticas usando email
CREATE POLICY "Users can view their own kiwify data" 
ON public.kiwify 
FOR SELECT 
USING (email = (auth.jwt() ->> 'email'));

CREATE POLICY "Users can insert their own kiwify data" 
ON public.kiwify 
FOR INSERT 
WITH CHECK (email = (auth.jwt() ->> 'email'));

CREATE POLICY "Users can update their own kiwify data" 
ON public.kiwify 
FOR UPDATE 
USING (email = (auth.jwt() ->> 'email'));

CREATE POLICY "Users can delete their own kiwify data" 
ON public.kiwify 
FOR DELETE 
USING (email = (auth.jwt() ->> 'email'));