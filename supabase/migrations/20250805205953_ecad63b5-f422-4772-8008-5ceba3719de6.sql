-- Remover a função incorreta que usa evolution_instances
DROP FUNCTION IF EXISTS public.mark_instance_connected(text, text, text);

-- Verificar que a função correta permanece (a que usa UUID e tabela kiwify)
-- Esta função já existe e está funcionando corretamente