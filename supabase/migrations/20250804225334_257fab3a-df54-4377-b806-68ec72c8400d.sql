-- Remover todas as políticas RLS da tabela evolution_instances
DROP POLICY IF EXISTS "Users can view their own instances" ON evolution_instances;
DROP POLICY IF EXISTS "Users can create their own instances" ON evolution_instances;
DROP POLICY IF EXISTS "Users can update their own instances" ON evolution_instances;
DROP POLICY IF EXISTS "Users can delete their own instances" ON evolution_instances;

-- Alterar o tipo do campo user_id de UUID para TEXT
ALTER TABLE evolution_instances ALTER COLUMN user_id TYPE TEXT;

-- Recriar as políticas RLS usando TEXT ao invés de UUID
CREATE POLICY "Users can view their own instances" ON evolution_instances
FOR SELECT USING (
  user_id = (
    SELECT id::TEXT FROM kiwify 
    WHERE email = (auth.jwt() ->> 'email')
    LIMIT 1
  )
  OR is_admin_email((auth.jwt() ->> 'email'))
);

CREATE POLICY "Users can create their own instances" ON evolution_instances
FOR INSERT WITH CHECK (
  user_id = (
    SELECT id::TEXT FROM kiwify 
    WHERE email = (auth.jwt() ->> 'email')
    LIMIT 1
  )
  OR is_admin_email((auth.jwt() ->> 'email'))
);

CREATE POLICY "Users can update their own instances" ON evolution_instances
FOR UPDATE USING (
  user_id = (
    SELECT id::TEXT FROM kiwify 
    WHERE email = (auth.jwt() ->> 'email')
    LIMIT 1
  )
  OR is_admin_email((auth.jwt() ->> 'email'))
);

CREATE POLICY "Users can delete their own instances" ON evolution_instances
FOR DELETE USING (
  user_id = (
    SELECT id::TEXT FROM kiwify 
    WHERE email = (auth.jwt() ->> 'email')
    LIMIT 1
  )
  OR is_admin_email((auth.jwt() ->> 'email'))
);