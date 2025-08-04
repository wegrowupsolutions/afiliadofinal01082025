-- Remover registros duplicados da tabela kiwify
-- Manter apenas o registro mais recente para cada email

DELETE FROM public.kiwify 
WHERE id NOT IN (
  SELECT MAX(id) 
  FROM public.kiwify 
  GROUP BY email
);