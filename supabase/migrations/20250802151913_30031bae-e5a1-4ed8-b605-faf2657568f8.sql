-- Garantir que a coluna user_id seja NOT NULL para máxima segurança
-- Isso impede que leads sejam criados sem associação a um usuário

ALTER TABLE afiliado_base_leads 
ALTER COLUMN user_id SET NOT NULL;

-- Adicionar constraint para garantir que user_id sempre existe
ALTER TABLE afiliado_base_leads 
ADD CONSTRAINT afiliado_base_leads_user_id_check 
CHECK (user_id IS NOT NULL);

-- Adicionar índice para performance nas consultas filtradas por user_id
CREATE INDEX IF NOT EXISTS idx_afiliado_base_leads_user_id 
ON afiliado_base_leads(user_id);