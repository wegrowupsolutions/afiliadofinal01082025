-- Definir campos como NULL para a instância testevini1350/0608
UPDATE kiwify 
SET 
  is_connected = NULL,
  connected_at = NULL,
  disconnected_at = NULL,
  evolution_instance_id = NULL,
  evolution_profile_name = NULL,
  evolution_profile_picture_url = NULL,
  evolution_profile_status = NULL,
  evolution_server_url = NULL,
  evolution_api_key = NULL,
  evolution_integration_data = NULL,
  evolution_raw_data = NULL,
  evolution_last_sync = NULL,
  remojid = NULL,
  evo_instance = NULL
WHERE "Nome da instancia da Evolution" = 'testevini1350/0608';

-- Verificar os dados após a atualização
SELECT 
  email, 
  "Nome da instancia da Evolution", 
  is_connected,
  connected_at,
  evolution_instance_id,
  evolution_profile_status
FROM kiwify 
WHERE "Nome da instancia da Evolution" = 'testevini1350/0608';