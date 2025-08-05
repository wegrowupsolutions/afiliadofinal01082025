-- Criar função para sincronizar user_ids de instâncias sem user_id associado
CREATE OR REPLACE FUNCTION public.sync_unlinked_instances()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    synced_count INTEGER := 0;
    instance_record RECORD;
    matched_user_id UUID;
BEGIN
    -- Log início da sincronização
    RAISE NOTICE 'Iniciando sincronização de instâncias sem user_id';
    
    -- Buscar todas as instâncias conectadas sem user_id
    FOR instance_record IN 
        SELECT k.id, k.email, k."Nome da instancia da Evolution", k.is_connected
        FROM public.kiwify k
        WHERE k.user_id IS NULL 
        AND k.email IS NOT NULL
        AND k."Nome da instancia da Evolution" IS NOT NULL
    LOOP
        -- Buscar user_id correspondente na tabela profiles
        SELECT p.id INTO matched_user_id
        FROM public.profiles p
        WHERE p.email = instance_record.email
        LIMIT 1;
        
        -- Se encontrou o user_id, atualizar a instância
        IF matched_user_id IS NOT NULL THEN
            UPDATE public.kiwify 
            SET user_id = matched_user_id
            WHERE id = instance_record.id;
            
            synced_count := synced_count + 1;
            
            RAISE NOTICE 'Sincronizada instância % para usuário % (email: %)', 
                instance_record."Nome da instancia da Evolution",
                matched_user_id,
                instance_record.email;
        ELSE
            RAISE NOTICE 'Usuário não encontrado para email: %', instance_record.email;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Sincronização concluída. Total de instâncias sincronizadas: %', synced_count;
    RETURN synced_count;
END;
$$;

-- Executar a sincronização
SELECT public.sync_unlinked_instances();