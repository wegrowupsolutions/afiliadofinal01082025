-- Apenas inserir configurações da sincronização automática
INSERT INTO public.system_configurations (key, value, description)
VALUES 
  ('auto_sync_enabled', 'true', 'Habilitar sincronização automática da Evolution'),
  ('auto_sync_interval', '300', 'Intervalo de sincronização automática em segundos (300 = 5 minutos)'),
  ('last_auto_sync', '{}', 'Último resultado da sincronização automática'),
  ('last_auto_sync_error', '{}', 'Último erro da sincronização automática')
ON CONFLICT (key) DO NOTHING;