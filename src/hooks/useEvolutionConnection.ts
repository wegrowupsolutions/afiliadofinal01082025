import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

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
  const isManualDisconnection = useRef(false);

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
    console.log('🔄 Marcando desconexão manual');
    isManualDisconnection.current = true;
    setConnectionStatus({ isConnected: false });
    
    // Reset flag after 5 seconds to allow normal operation
    setTimeout(() => {
      isManualDisconnection.current = false;
      console.log('🔄 Flag de desconexão manual resetada');
    }, 5000);
  };

  // Set up realtime subscription for connection updates
  useEffect(() => {
    if (!user?.id) return;

    console.log('🔄 Configurando subscription realtime para conexões Evolution');

    const channel = supabase
      .channel('evolution_connection_updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'kiwify',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        console.log('🔄 Atualização realtime da conexão Evolution:', payload);
        
        // Ignorar atualizações se estamos em processo de desconexão manual
        if (isManualDisconnection.current) {
          console.log('🔄 Ignorando atualização realtime devido à desconexão manual');
          return;
        }
        
        const newData = payload.new as any;
        const oldData = payload.old as any;
        const eventType = payload.eventType;

        if (eventType === 'UPDATE' || eventType === 'INSERT') {
          if (newData?.is_connected) {
            console.log('✅ Conexão estabelecida via realtime');
            setConnectionStatus({
              isConnected: true,
              instanceName: newData['Nome da instancia da Evolution'],
              phoneNumber: newData.remojid,
              connectedAt: newData.connected_at
            });
          } else {
            console.log('❌ Conexão perdida via realtime');
            setConnectionStatus({ isConnected: false });
          }
        } else if (eventType === 'DELETE') {
          console.log('🗑️ Registro removido via realtime');
          setConnectionStatus({ isConnected: false });
        }
      })
      .subscribe();

    // Check initial status
    checkConnectionStatus();

    // Refresh status when page becomes visible (helps catch disconnections)
    const handleVisibilityChange = () => {
      if (!document.hidden && !isManualDisconnection.current) {
        console.log('📱 Página ficou visível, verificando status da conexão...');
        setTimeout(checkConnectionStatus, 1000);
      }
    };

    // Refresh status periodically to catch disconnections from Evolution API
    const interval = setInterval(() => {
      if (!isManualDisconnection.current) {
        console.log('⏰ Verificação periódica do status da conexão');
        checkConnectionStatus();
      }
    }, 30000); // Check every 30 seconds

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      console.log('🔄 Removendo subscription realtime');
      supabase.removeChannel(channel);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, [user?.id]);

  return {
    connectionStatus,
    loading,
    refreshStatus: checkConnectionStatus,
    markManualDisconnection
  };
}