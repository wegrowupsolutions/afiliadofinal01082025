-- Adicionar coluna nova_senha na tabela kiwify
ALTER TABLE public.kiwify ADD COLUMN nova_senha TEXT;

-- Adicionar coluna senha_alterada para controlar se é primeiro acesso
ALTER TABLE public.kiwify ADD COLUMN senha_alterada BOOLEAN DEFAULT FALSE;