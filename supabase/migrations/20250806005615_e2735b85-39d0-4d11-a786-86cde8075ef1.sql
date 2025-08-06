-- Corrigir configuração do webhook confirma
UPDATE public.system_configurations 
SET value = 'https://webhook.serverwegrowup.com.br/webhook/confirma_afiliado'
WHERE key = 'webhook_confirma';

-- Adicionar configuração para webhook de eventos de conexão
INSERT INTO public.system_configurations (key, value, description)
VALUES (
  'webhook_connection_events', 
  'https://webhook.serverwegrowup.com.br/webhook/evolution_connection_events',
  'Webhook dedicado para processar eventos de conexão da Evolution API'
) ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  description = EXCLUDED.description;