-- Atualizar manualmente a instância do usuário viniciushtx@hotmail.com se ela existir
-- Primeira verificação: se existe instância testevini1350/0608
UPDATE kiwify 
SET 
  "Nome da instancia da Evolution" = 'testevini1350/0608',
  evolution_last_sync = now()
WHERE email = 'viniciushtx@hotmail.com' 
AND "Nome da instancia da Evolution" IS NULL;

-- Verificar se a atualização foi feita
SELECT email, "Nome da instancia da Evolution", is_connected 
FROM kiwify 
WHERE email = 'viniciushtx@hotmail.com';