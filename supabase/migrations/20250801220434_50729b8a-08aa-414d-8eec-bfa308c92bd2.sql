-- Fix remaining functions that don't have proper search_path

CREATE OR REPLACE FUNCTION public.invalidate_previous_sessions(user_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.active_sessions 
  SET is_active = false
  WHERE user_id = user_uuid
    AND is_active = true;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Inserir perfil apenas se o email não existir
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (email) DO NOTHING;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_user_bucket_if_not_exists(user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    bucket_name text;
    bucket_exists boolean;
BEGIN
    -- Gerar nome do bucket baseado no ID do usuário
    bucket_name := 'user-' || substring(user_id::text from 1 for 8);
    
    -- Verificar se o bucket já existe
    SELECT EXISTS(
        SELECT 1 FROM storage.buckets 
        WHERE id = bucket_name
    ) INTO bucket_exists;
    
    -- Criar o bucket se não existir
    IF NOT bucket_exists THEN
        INSERT INTO storage.buckets (id, name, public)
        VALUES (bucket_name, bucket_name, true);
        
        -- Criar políticas de acesso para o bucket
        EXECUTE format('
            CREATE POLICY "Users can view their own files %s" ON storage.objects
            FOR SELECT USING (
                bucket_id = %L AND 
                auth.uid()::text = split_part(name, ''/'', 1)
            )', bucket_name, bucket_name);
            
        EXECUTE format('
            CREATE POLICY "Users can upload their own files %s" ON storage.objects
            FOR INSERT WITH CHECK (
                bucket_id = %L AND 
                auth.uid()::text = split_part(name, ''/'', 1)
            )', bucket_name, bucket_name);
            
        EXECUTE format('
            CREATE POLICY "Users can update their own files %s" ON storage.objects
            FOR UPDATE USING (
                bucket_id = %L AND 
                auth.uid()::text = split_part(name, ''/'', 1)
            )', bucket_name, bucket_name);
            
        EXECUTE format('
            CREATE POLICY "Users can delete their own files %s" ON storage.objects
            FOR DELETE USING (
                bucket_id = %L AND 
                auth.uid()::text = split_part(name, ''/'', 1)
            )', bucket_name, bucket_name);
    END IF;
    
    RETURN bucket_name;
END;
$function$;

CREATE OR REPLACE FUNCTION public.mark_instance_connected(p_user_id uuid, p_instance_name text, p_phone_number text DEFAULT NULL::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.evolution_instances (
    user_id, 
    instance_name, 
    phone_number, 
    is_connected, 
    connected_at
  )
  VALUES (
    p_user_id, 
    p_instance_name, 
    p_phone_number, 
    true, 
    now()
  )
  ON CONFLICT (user_id, instance_name) 
  DO UPDATE SET
    phone_number = EXCLUDED.phone_number,
    is_connected = true,
    connected_at = now(),
    disconnected_at = NULL,
    updated_at = now();
END;
$function$;