-- Primeiro remover todas as políticas
DROP POLICY "Users can view their own kiwify data" ON public.kiwify;
DROP POLICY "Users can insert their own kiwify data" ON public.kiwify;
DROP POLICY "Users can update their own kiwify data" ON public.kiwify;
DROP POLICY "Users can delete their own kiwify data" ON public.kiwify;

-- Agora remover a coluna user_id
ALTER TABLE public.kiwify DROP COLUMN user_id;

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