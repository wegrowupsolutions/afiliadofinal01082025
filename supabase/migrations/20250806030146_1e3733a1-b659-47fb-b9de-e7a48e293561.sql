-- Adicionar novas colunas à tabela kiwify para dados da Evolution API
ALTER TABLE public.kiwify ADD COLUMN IF NOT EXISTS evolution_instance_id VARCHAR;
ALTER TABLE public.kiwify ADD COLUMN IF NOT EXISTS evolution_profile_name VARCHAR;
ALTER TABLE public.kiwify ADD COLUMN IF NOT EXISTS evolution_profile_picture_url VARCHAR;
ALTER TABLE public.kiwify ADD COLUMN IF NOT EXISTS evolution_profile_status TEXT;
ALTER TABLE public.kiwify ADD COLUMN IF NOT EXISTS evolution_server_url VARCHAR;
ALTER TABLE public.kiwify ADD COLUMN IF NOT EXISTS evolution_api_key VARCHAR;
ALTER TABLE public.kiwify ADD COLUMN IF NOT EXISTS evolution_integration_data JSONB;
ALTER TABLE public.kiwify ADD COLUMN IF NOT EXISTS evolution_raw_data JSONB;
ALTER TABLE public.kiwify ADD COLUMN IF NOT EXISTS evolution_last_sync TIMESTAMP WITH TIME ZONE;

-- Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_kiwify_evolution_instance_id ON public.kiwify(evolution_instance_id);
CREATE INDEX IF NOT EXISTS idx_kiwify_evolution_last_sync ON public.kiwify(evolution_last_sync);