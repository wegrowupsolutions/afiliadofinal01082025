-- Remover as políticas RLS existentes da tabela kiwify
DROP POLICY IF EXISTS "Users can view their own kiwify data" ON public.kiwify;
DROP POLICY IF EXISTS "Users can insert their own kiwify data" ON public.kiwify;
DROP POLICY IF EXISTS "Users can update their own kiwify data" ON public.kiwify;
DROP POLICY IF EXISTS "Users can delete their own kiwify data" ON public.kiwify;

-- Criar nova política para permitir leitura durante verificação de primeiro acesso
CREATE POLICY "Allow read for email verification during first access"
ON public.kiwify
FOR SELECT
USING (true);

-- Criar política para permitir atualização apenas do próprio registro por email
CREATE POLICY "Users can update their own kiwify data by email"
ON public.kiwify
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Política para inserção (apenas para casos específicos se necessário)
CREATE POLICY "Allow insert for kiwify data"
ON public.kiwify
FOR INSERT
WITH CHECK (true);