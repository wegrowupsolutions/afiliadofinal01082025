-- Adicionar configurações globais para as novas regras de conexão Evolution
INSERT INTO public.system_configurations (key, value, description, updated_by) VALUES 
('evolution_realtime_enabled', 'true', 'Habilitar monitoramento em tempo real das conexões Evolution para todos os usuários', 'aa2bb6a1-ccc5-4fba-aa65-63476ebfd823'),
('evolution_periodic_check_interval', '30000', 'Intervalo em milissegundos para verificações periódicas de status (30000 = 30 segundos)', 'aa2bb6a1-ccc5-4fba-aa65-63476ebfd823'),
('evolution_manual_disconnect_protection', 'true', 'Proteger desconexões manuais contra interferência de verificações automáticas', 'aa2bb6a1-ccc5-4fba-aa65-63476ebfd823'),
('evolution_auto_cleanup_on_disconnect', 'true', 'Limpar automaticamente estados locais quando detectar desconexão', 'aa2bb6a1-ccc5-4fba-aa65-63476ebfd823'),
('evolution_visibility_check_enabled', 'true', 'Verificar status quando a página ficar visível novamente', 'aa2bb6a1-ccc5-4fba-aa65-63476ebfd823')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_at = now(),
  updated_by = EXCLUDED.updated_by;