import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Clock, CheckCircle, AlertCircle, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SyncStatus {
  lastSync?: string;
  lastError?: string;
  totalSynced?: number;
  totalUsers?: number;
  connectedInstances?: number;
}

const SyncStatusCard = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const { toast } = useToast();

  const fetchSyncStatus = async () => {
    try {
      // Buscar último status de sincronização
      const { data: lastSync } = await supabase
        .from('system_configurations')
        .select('value')
        .eq('key', 'last_auto_sync')
        .single();

      // Buscar último erro
      const { data: lastError } = await supabase
        .from('system_configurations')
        .select('value')
        .eq('key', 'last_auto_sync_error')
        .single();

      // Buscar estatísticas de usuários
      const { data: kiwifyStats } = await supabase
        .from('kiwify')
        .select('user_id, is_connected, evolution_last_sync')
        .not('user_id', 'is', null);

      const totalUsers = kiwifyStats?.length || 0;
      const connectedInstances = kiwifyStats?.filter(u => u.is_connected)?.length || 0;
      const totalSynced = kiwifyStats?.filter(u => u.evolution_last_sync)?.length || 0;

      setSyncStatus({
        lastSync: lastSync?.value ? JSON.parse(lastSync.value).timestamp : null,
        lastError: lastError?.value ? JSON.parse(lastError.value).timestamp : null,
        totalUsers,
        connectedInstances,
        totalSynced
      });
    } catch (error) {
      console.error('Erro ao buscar status de sincronização:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerManualSync = async () => {
    setIsManualSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('auto-sync-evolution');
      
      if (error) {
        throw error;
      }

      toast({
        title: "Sincronização manual iniciada",
        description: "A sincronização foi executada com sucesso.",
      });

      // Atualizar status após alguns segundos
      setTimeout(fetchSyncStatus, 3000);
    } catch (error) {
      console.error('Erro na sincronização manual:', error);
      toast({
        title: "Erro na sincronização",
        description: "Não foi possível executar a sincronização manual.",
        variant: "destructive",
      });
    } finally {
      setIsManualSyncing(false);
    }
  };

  useEffect(() => {
    fetchSyncStatus();
    
    // Atualizar status a cada 5 minutos
    const interval = setInterval(fetchSyncStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatLastSync = (timestamp: string) => {
    if (!timestamp) return 'Nunca';
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR');
  };

  const getSyncStatusBadge = () => {
    if (syncStatus.lastError && (!syncStatus.lastSync || syncStatus.lastError > syncStatus.lastSync)) {
      return <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" />Erro</Badge>;
    }
    if (syncStatus.lastSync) {
      return <Badge variant="default" className="gap-1"><CheckCircle className="h-3 w-3" />Ativo</Badge>;
    }
    return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Aguardando</Badge>;
  };

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white">
      <CardHeader className="pb-2 bg-gradient-to-r from-blue-400 to-cyan-500 dark:from-blue-500 dark:to-cyan-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Status da Sincronização
          </div>
          {getSyncStatusBadge()}
        </CardTitle>
        <CardDescription className="text-blue-100">
          Monitoramento da sincronização Evolution
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{syncStatus.totalUsers}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center justify-center gap-1">
                <Users className="h-3 w-3" />
                Usuários
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{syncStatus.connectedInstances}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Conectados</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{syncStatus.totalSynced}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Sincronizados</div>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Última sincronização:</span>
              <span className="font-medium">{formatLastSync(syncStatus.lastSync!)}</span>
            </div>
            {syncStatus.lastError && (
              <div className="flex justify-between text-red-600 dark:text-red-400">
                <span>Último erro:</span>
                <span className="font-medium">{formatLastSync(syncStatus.lastError)}</span>
              </div>
            )}
          </div>

          <Button 
            onClick={triggerManualSync}
            disabled={isManualSyncing}
            className="w-full"
            variant="outline"
          >
            {isManualSyncing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Sincronizando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Sincronizar Agora
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SyncStatusCard;