-- Manter as políticas usando email, mas vamos ajustar para usar id nas operações
-- As políticas RLS ainda precisam usar email para identificar o usuário
-- pois não temos como mapear auth.uid() diretamente para o id da tabela kiwify

-- Não preciso alterar as políticas, elas estão corretas usando email
-- O que vou fazer é ajustar o código para buscar pelo email e trabalhar com o id