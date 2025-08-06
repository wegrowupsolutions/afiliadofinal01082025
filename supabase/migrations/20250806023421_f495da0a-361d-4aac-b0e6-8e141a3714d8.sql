-- Inserir/atualizar configurações da Evolution API
INSERT INTO public.system_configurations (key, value, description)
VALUES 
  ('evolution_api_url', 'https://evolution.serverwegrowup.com.br', 'URL base da Evolution API'),
  ('evolution_api_key', '066327121bd64f8356c26e9edfa1799d', 'Chave de API da Evolution')
ON CONFLICT (key) 
DO UPDATE SET 
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_at = now();