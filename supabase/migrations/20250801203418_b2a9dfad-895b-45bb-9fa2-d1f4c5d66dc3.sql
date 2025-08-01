-- Enable RLS for afiliado_mensagens table
ALTER TABLE public.afiliado_mensagens ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since it's chat data that should be viewable)
CREATE POLICY "Allow read access to afiliado_mensagens" ON public.afiliado_mensagens
FOR SELECT USING (true);

-- Enable realtime for afiliado_mensagens
ALTER TABLE public.afiliado_mensagens REPLICA IDENTITY FULL;

-- Add table to realtime publication
BEGIN;
  -- Drop publication if exists and recreate
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR ALL TABLES;
COMMIT;