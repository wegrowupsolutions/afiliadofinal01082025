import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSystemConfigurations } from '@/hooks/useSystemConfigurations';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook global que aplica as regras de conexão Evolution para todos os usuários
 * Este hook deve ser usado no AuthContext ou App.tsx para garantir que as regras
 * sejam aplicadas automaticamente para todos os usuários da plataforma
 */
export function useGlobalEvolutionRules() {
  const { user } = useAuth();
  const { configurations } = useSystemConfigurations();

  useEffect(() => {
    if (!user?.id) return;

    // Verificar se as regras globais estão habilitadas
    const globalRulesEnabled = configurations.evolution_realtime_enabled !== 'false';
    const autoSyncEnabled = configurations.auto_sync_enabled !== 'false';
    
    if (!globalRulesEnabled) {
      console.log('🔧 Regras globais Evolution desabilitadas via configuração');
      return;
    }

    console.log('🌍 Aplicando regras globais Evolution para todos os usuários');

    // Configurar listener global para eventos de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('👤 Usuário logado - aplicando regras globais Evolution');
          
          // Verificar se o usuário tem instância conectada
          try {
            const { data: kiwifyData } = await supabase
              .from('kiwify')
              .select('is_connected, "Nome da instancia da Evolution", user_id')
              .eq('user_id', session.user.id)
              .eq('is_connected', true)
              .maybeSingle();

            // Se não tem instância conectada, sincronizar dados Evolution
            if (!kiwifyData && autoSyncEnabled) {
              console.log('🔄 Executando sincronização automática para novo usuário');
              await supabase.functions.invoke('sync-evolution-kiwify', {
                body: {
                  automatic: true,
                  user_id: session.user.id,
                  user_email: session.user.email,
                  source: 'global_rules'
                }
              });
            }
          } catch (error) {
            console.error('❌ Erro ao aplicar regras globais:', error);
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id, configurations.evolution_realtime_enabled, configurations.auto_sync_enabled]);

  // Retornar configurações globais para outros componentes usarem
  return {
    realtimeEnabled: configurations.evolution_realtime_enabled !== 'false',
    autoSyncEnabled: configurations.auto_sync_enabled !== 'false',
    periodicCheckInterval: parseInt(configurations.evolution_periodic_check_interval || '30000'),
    manualDisconnectProtection: configurations.evolution_manual_disconnect_protection !== 'false',
    autoCleanupOnDisconnect: configurations.evolution_auto_cleanup_on_disconnect !== 'false',
    visibilityCheckEnabled: configurations.evolution_visibility_check_enabled !== 'false'
  };
}