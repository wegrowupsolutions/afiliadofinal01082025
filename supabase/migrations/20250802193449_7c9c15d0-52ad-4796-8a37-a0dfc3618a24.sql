-- Atualizar registros existentes na tabela afiliado_base_leads com os IDs dos usuários
-- Baseado nos emails dos perfis mostrados na imagem

UPDATE public.afiliado_base_leads 
SET user_id = '877bb3bd-2dd1-45c3-a2a1-aa37759de157'
WHERE user_id IS NULL OR user_id = '00000000-0000-0000-0000-000000000000';

-- Se houver leads que precisam ser associados a usuários específicos por email,
-- podemos fazer uma atualização mais específica depois dos testes iniciais