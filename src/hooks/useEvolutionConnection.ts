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
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const { user } = useAuth();
  const { configurations } = useSystemConfigurations();
  const isManualDisconnection = useRef(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const lastCheckTime = useRef<number>(0);

  // Configurações globais com fallbacks
  const realtimeEnabled = configurations.evolution_realtime_enabled !== 'false';
  const periodicCheckInterval = parseInt(configurations.evolution_periodic_check_interval || '30000');
  const manualDisconnectProtection = configurations.evolution_manual_disconnect_protection !== 'false';
  const autoCleanupOnDisconnect = configurations.evolution_auto_cleanup_on_disconnect !== 'false';
  const visibilityCheckEnabled = configurations.evolution_visibility_check_enabled !== 'false';

  // Debounced check connection status
  const debouncedCheckConnectionStatus = async (source = 'unknown') => {
    const now = Date.now();
    const timeSinceLastCheck = now - lastCheckTime.current;
    
    // Skip if less than 2 seconds since last check and not manual
    if (timeSinceLastCheck < 2000 && source !== 'manual') {
      console.log(`⏩ Pulando verificação de conexão (debounce ${timeSinceLastCheck}ms) - source: ${source}`);
      return;
    }
    
    // Clear existing debounce timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    
    // Set debounce for automatic checks
    if (source !== 'manual') {
      debounceTimer.current = setTimeout(() => {
        checkConnectionStatusInternal(source);
      }, 2000);
      return;
    }
    
    // Execute immediately for manual checks
    await checkConnectionStatusInternal(source);
  };

  // Internal check connection status
  const checkConnectionStatusInternal = async (source = 'unknown') => {
    if (!user?.id || isDisconnecting) {
      setLoading(false);
      return;
    }

    lastCheckTime.current = Date.now();

    try {
      console.log(`🔍 [${source}] Verificando status da conexão Evolution - timestamp: ${new Date().toISOString()}`);
      
      // Check if we're in manual disconnection mode
      if (manualDisconnectProtection && isManualDisconnection.current) {
        console.log(`🛡️ [${source}] Bloqueado por proteção de desconexão manual`);
        return;
      }
      
      const { data, error } = await supabase
        .from('kiwify')
        .select('is_connected, "Nome da instancia da Evolution", remojid, connected_at, disconnected_at')
        .eq('user_id', user.id)
        .eq('is_connected', true)
        .maybeSingle();

      if (error) {
        console.error(`❌ [${source}] Erro ao verificar status da conexão:`, error);
        if (!isManualDisconnection.current) {
          setConnectionStatus({ isConnected: false });
        }
        return;
      }

      const currentLocalState = connectionStatus.isConnected;
      const dbState = !!data;
      
      // Log state comparison
      console.log(`📊 [${source}] Estado local: ${currentLocalState}, Estado DB: ${dbState}, Manual: ${isManualDisconnection.current}`);

      if (data) {
        console.log(`✅ [${source}] Instância conectada encontrada:`, {
          name: data['Nome da instancia da Evolution'],
          phone: data.remojid,
          connected_at: data.connected_at,
          disconnected_at: data.disconnected_at
        });
        
        if (!isManualDisconnection.current) {
          setConnectionStatus({
            isConnected: true,
            instanceName: data['Nome da instancia da Evolution'],
            phoneNumber: data.remojid,
            connectedAt: data.connected_at
          });
        } else {
          console.log(`🛡️ [${source}] Estado local mantido devido à proteção manual`);
        }
      } else {
        console.log(`ℹ️ [${source}] Nenhuma instância conectada encontrada`);
        if (!isManualDisconnection.current && !isDisconnecting) {
          setConnectionStatus({ isConnected: false });
        } else {
          console.log(`🛡️ [${source}] Estado local mantido devido à proteção manual ou processo de desconexão`);
        }
      }
    } catch (error) {
      console.error(`❌ [${source}] Erro ao verificar conexão:`, error);
      if (!isManualDisconnection.current) {
        setConnectionStatus({ isConnected: false });
      }
    } finally {
      setLoading(false);
    }
  };

  // Public check function
  const checkConnectionStatus = () => debouncedCheckConnectionStatus('manual');

  // Function to mark manual disconnection with enhanced protection
  const markManualDisconnection = () => {
    if (!manualDisconnectProtection) return;
    
    console.log('🔄 Marcando desconexão manual (proteção global ativada) - timestamp:', new Date().toISOString());
    isManualDisconnection.current = true;
    setIsDisconnecting(true);
    
    // Clear any pending debounce timers
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    
    if (autoCleanupOnDisconnect) {
      console.log('🧹 Limpando estado local devido à desconexão manual');
      setConnectionStatus({ isConnected: false });
    }
    
    // Enhanced timeout for manual disconnection protection (15 seconds)
    setTimeout(() => {
      isManualDisconnection.current = false;
      setIsDisconnecting(false);
      console.log('🔄 Flag de desconexão manual resetada após 15s - timestamp:', new Date().toISOString());
    }, 15000);
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
    debouncedCheckConnectionStatus('initial');

    // Refresh status when page becomes visible (global rule)
    let visibilityHandler: (() => void) | null = null;
    if (visibilityCheckEnabled) {
      visibilityHandler = () => {
        if (!document.hidden && (!manualDisconnectProtection || !isManualDisconnection.current)) {
          console.log('📱 Página ficou visível, verificando status da conexão (regra global)...');
          setTimeout(() => debouncedCheckConnectionStatus('visibility'), 1000);
        }
      };
      document.addEventListener('visibilitychange', visibilityHandler);
    }

    // Refresh status periodically (global interval configuration)
    const interval = setInterval(() => {
      if (!manualDisconnectProtection || !isManualDisconnection.current) {
        console.log(`⏰ Verificação periódica do status da conexão (intervalo global: ${periodicCheckInterval}ms)`);
        debouncedCheckConnectionStatus('periodic');
      }
    }, periodicCheckInterval);

    return () => {
      console.log('🔄 Removendo subscription realtime e limpando timers');
      supabase.removeChannel(channel);
      if (visibilityHandler) {
        document.removeEventListener('visibilitychange', visibilityHandler);
      }
      clearInterval(interval);
      
      // Clean up debounce timer
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
        debounceTimer.current = null;
      }
    };
  }, [user?.id, realtimeEnabled, periodicCheckInterval, manualDisconnectProtection, autoCleanupOnDisconnect, visibilityCheckEnabled]);

  return {
    connectionStatus,
    loading,
    refreshStatus: checkConnectionStatus,
    markManualDisconnection
  };
}