import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useSystemConfigurations } from '@/hooks/useSystemConfigurations';

interface ConnectionStatus {
  isConnected: boolean;
  instanceName?: string;
  phoneNumber?: string;
  connectedAt?: string;
}

export function useEvolutionConnection() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isConnected: false
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { configurations } = useSystemConfigurations();
  const isManualDisconnection = useRef(false);

  // Configurações globais com fallbacks
  const realtimeEnabled = configurations.evolution_realtime_enabled !== 'false';
  const periodicCheckInterval = parseInt(configurations.evolution_periodic_check_interval || '30000');
  const manualDisconnectProtection = configurations.evolution_manual_disconnect_protection !== 'false';
  const autoCleanupOnDisconnect = configurations.evolution_auto_cleanup_on_disconnect !== 'false';
  const visibilityCheckEnabled = configurations.evolution_visibility_check_enabled !== 'false';

  // Check initial connection status
  const checkConnectionStatus = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      console.log('🔍 Verificando status inicial da conexão Evolution');
      
      const { data, error } = await supabase
        .from('kiwify')
        .select('is_connected, "Nome da instancia da Evolution", remojid, connected_at')
        .eq('user_id', user.id)
        .eq('is_connected', true)
        .maybeSingle();

      if (error) {
        console.error('❌ Erro ao verificar status da conexão:', error);
        setConnectionStatus({ isConnected: false });
        return;
      }

      if (data) {
        console.log('✅ Instância conectada encontrada:', data);
        if (!isManualDisconnection.current) {
          setConnectionStatus({
            isConnected: true,
            instanceName: data['Nome da instancia da Evolution'],
            phoneNumber: data.remojid,
            connectedAt: data.connected_at
          });
        }
      } else {
        console.log('ℹ️ Nenhuma instância conectada encontrada');
        if (!isManualDisconnection.current) {
          setConnectionStatus({ isConnected: false });
        }
      }
    } catch (error) {
      console.error('❌ Erro ao verificar conexão:', error);
      if (!isManualDisconnection.current) {
        setConnectionStatus({ isConnected: false });
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to mark manual disconnection
  const markManualDisconnection = () => {
    if (!manualDisconnectProtection) return;
    
    console.log('🔄 Marcando desconexão manual (proteção global ativada)');
    isManualDisconnection.current = true;
    
    if (autoCleanupOnDisconnect) {
      setConnectionStatus({ isConnected: false });
    }
    
    // Reset flag after 5 seconds to allow normal operation
    setTimeout(() => {
      isManualDisconnection.current = false;
      console.log('🔄 Flag de desconexão manual resetada');
    }, 5000);
  };

  // Set up realtime subscription for connection updates
  useEffect(() => {
    if (!user?.id || !realtimeEnabled) return;

    console.log('🔄 Configurando subscription realtime para conexões Evolution (aplicando regras globais)');

    const channel = supabase
      .channel('evolution_connection_updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'kiwify',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        console.log('🔄 Atualização realtime da conexão Evolution:', payload);
        
        // Ignorar atualizações se estamos em processo de desconexão manual (regra global)
        if (manualDisconnectProtection && isManualDisconnection.current) {
          console.log('🔄 Ignorando atualização realtime devido à desconexão manual (proteção global)');
          return;
        }
        
        const newData = payload.new as any;
        const oldData = payload.old as any;
        const eventType = payload.eventType;

        if (eventType === 'UPDATE' || eventType === 'INSERT') {
          if (newData?.is_connected) {
            console.log('✅ Conexão estabelecida via realtime (regras globais aplicadas)');
            setConnectionStatus({
              isConnected: true,
              instanceName: newData['Nome da instancia da Evolution'],
              phoneNumber: newData.remojid,
              connectedAt: newData.connected_at
            });
          } else if (autoCleanupOnDisconnect) {
            console.log('❌ Conexão perdida via realtime (limpeza automática ativada)');
            setConnectionStatus({ isConnected: false });
          }
        } else if (eventType === 'DELETE' && autoCleanupOnDisconnect) {
          console.log('🗑️ Registro removido via realtime (limpeza automática ativada)');
          setConnectionStatus({ isConnected: false });
        }
      })
      .subscribe();

    // Check initial status
    checkConnectionStatus();

    // Refresh status when page becomes visible (global rule)
    let visibilityHandler: (() => void) | null = null;
    if (visibilityCheckEnabled) {
      visibilityHandler = () => {
        if (!document.hidden && (!manualDisconnectProtection || !isManualDisconnection.current)) {
          console.log('📱 Página ficou visível, verificando status da conexão (regra global)...');
          setTimeout(checkConnectionStatus, 1000);
        }
      };
      document.addEventListener('visibilitychange', visibilityHandler);
    }

    // Refresh status periodically (global interval configuration)
    const interval = setInterval(() => {
      if (!manualDisconnectProtection || !isManualDisconnection.current) {
        console.log(`⏰ Verificação periódica do status da conexão (intervalo global: ${periodicCheckInterval}ms)`);
        checkConnectionStatus();
      }
    }, periodicCheckInterval);

    return () => {
      console.log('🔄 Removendo subscription realtime');
      supabase.removeChannel(channel);
      if (visibilityHandler) {
        document.removeEventListener('visibilitychange', visibilityHandler);
      }
      clearInterval(interval);
    };
  }, [user?.id, realtimeEnabled, periodicCheckInterval, manualDisconnectProtection, autoCleanupOnDisconnect, visibilityCheckEnabled]);

  return {
    connectionStatus,
    loading,
    refreshStatus: checkConnectionStatus,
    markManualDisconnection
  };
}