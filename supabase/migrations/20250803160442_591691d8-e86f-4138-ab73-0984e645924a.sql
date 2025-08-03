-- Atualizar registros existentes na tabela afiliado_base_leads para associar ao usuário teste@gmail.com
UPDATE public.afiliado_base_leads 
SET user_id = 'aa2bb6a1-ccc5-4fba-aa65-63476ebfd823'
WHERE user_id IS NULL;