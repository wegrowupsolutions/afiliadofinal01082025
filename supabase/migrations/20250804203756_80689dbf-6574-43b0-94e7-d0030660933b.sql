-- Adicionar RLS na tabela kiwify
ALTER TABLE public.kiwify ENABLE ROW LEVEL SECURITY;

-- Adicionar coluna user_id na tabela kiwify para vincular a um usuário
ALTER TABLE public.kiwify ADD COLUMN user_id uuid REFERENCES auth.users(id);

-- Criar políticas RLS para kiwify
CREATE POLICY "Users can view their own kiwify data" 
ON public.kiwify 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own kiwify data" 
ON public.kiwify 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own kiwify data" 
ON public.kiwify 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own kiwify data" 
ON public.kiwify 
FOR DELETE 
USING (auth.uid() = user_id);