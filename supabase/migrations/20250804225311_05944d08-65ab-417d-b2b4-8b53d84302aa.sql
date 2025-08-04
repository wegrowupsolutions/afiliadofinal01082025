-- Alterar o tipo do campo user_id de UUID para TEXT para aceitar IDs da tabela kiwify
ALTER TABLE evolution_instances ALTER COLUMN user_id TYPE TEXT;