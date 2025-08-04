-- Adicionar coluna prompt na tabela kiwify
ALTER TABLE public.kiwify ADD COLUMN prompt text;

-- Remover coluna prompt da tabela profiles
ALTER TABLE public.profiles DROP COLUMN prompt;