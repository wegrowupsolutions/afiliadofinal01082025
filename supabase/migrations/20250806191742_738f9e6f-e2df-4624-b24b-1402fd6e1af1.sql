-- Criar configuração para sincronização automática
INSERT INTO public.system_configurations (key, value, description)
VALUES 
  ('auto_sync_enabled', 'true', 'Habilitar sincronização automática da Evolution'),
  ('auto_sync_interval', '300', 'Intervalo de sincronização automática em segundos (300 = 5 minutos)'),
  ('last_auto_sync', '{}', 'Último resultado da sincronização automática'),
  ('last_auto_sync_error', '{}', 'Último erro da sincronização automática')
ON CONFLICT (key) DO NOTHING;

-- Função para executar sincronização automática via cron
SELECT cron.schedule(
  'auto-sync-evolution',
  '*/5 * * * *', -- A cada 5 minutos
  $$
  SELECT
    net.http_post(
        url:='https://ufcarzzouvxgqljqxdnc.supabase.co/functions/v1/auto-sync-evolution',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmY2FyenpvdXZ4Z3FsanF4ZG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NzU5NTMsImV4cCI6MjA2OTE1MTk1M30.wurxO8lV_TMb4UD6WtPEytMOejzySupgnfSIeNgPg-c"}'::jsonb,
        body:='{"source": "cron", "automatic": true}'::jsonb
    ) as request_id;
  $$
);