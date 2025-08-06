-- Ajustar campos específicos para a instância testevini1350/0608
UPDATE kiwify 
SET 
  "Nome da instancia da Evolution" = NULL,
  is_connected = false
WHERE "Nome da instancia da Evolution" = 'testevini1350/0608';

-- Verificar os dados após a atualização
SELECT 
  email, 
  "Nome da instancia da Evolution", 
  is_connected,
  connected_at,
  disconnected_at
FROM kiwify 
WHERE email = 'viniciushtx@hotmail.com';