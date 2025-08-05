import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Phone, Calendar, Trash2, RefreshCw, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface ConnectedInstance {
  id: number;
  instanceName: string;
  phoneNumber?: string;
  connectedAt: string;
  email: string;
  isConnected: boolean;
}

export const ConnectedInstancesList = () => {
  const [instances, setInstances] = useState<ConnectedInstance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchConnectedInstances = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('kiwify')
        .select('id, "Nome da instancia da Evolution", remojid, connected_at, email, is_connected')
        .eq('user_id', user?.id)
        .not('"Nome da instancia da Evolution"', 'is', null)
        .order('connected_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar instâncias:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as instâncias conectadas.",
          variant: "destructive"
        });
        return;
      }

      const formattedInstances = (data || []).map(item => ({
        id: item.id,
        instanceName: item["Nome da instancia da Evolution"] || '',
        phoneNumber: item.remojid,
        connectedAt: item.connected_at || '',
        email: item.email || '',
        isConnected: item.is_connected || false
      }));

      setInstances(formattedInstances);
      console.log('📱 Instâncias encontradas:', formattedInstances);
    } catch (error) {
      console.error('Erro ao buscar instâncias:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao carregar as instâncias.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectInstance = async (instanceId: number, instanceName: string) => {
    try {
      const { error } = await supabase
        .from('kiwify')
        .update({ 
          is_connected: false, 
          disconnected_at: new Date().toISOString() 
        })
        .eq('id', instanceId);

      if (error) {
        console.error('Erro ao desconectar instância:', error);
        toast({
          title: "Erro",
          description: "Não foi possível desconectar a instância.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Instância desconectada",
        description: `A instância ${instanceName} foi desconectada com sucesso.`,
      });

      // Recarregar lista
      fetchConnectedInstances();
    } catch (error) {
      console.error('Erro ao desconectar instância:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao desconectar a instância.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchConnectedInstances();
    }
  }, [user?.id]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Carregando instâncias...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Instâncias Conectadas ({instances.length})
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchConnectedInstances}
            className="h-8"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {instances.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma instância conectada ainda.</p>
            <p className="text-sm">Crie uma nova instância para começar.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {instances.map((instance) => (
              <div
                key={instance.id}
                className={`p-4 rounded-lg border ${
                  instance.isConnected
                    ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20'
                    : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm truncate">
                        {instance.instanceName}
                      </h4>
                      <Badge 
                        variant={instance.isConnected ? "default" : "secondary"}
                        className={`text-xs ${
                          instance.isConnected
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-600 text-white'
                        }`}
                      >
                        {instance.isConnected ? 'Conectada' : 'Desconectada'}
                      </Badge>
                    </div>
                    
                    {instance.phoneNumber && (
                      <div className="flex items-center gap-1 mb-1">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {instance.phoneNumber}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {instance.connectedAt 
                          ? new Date(instance.connectedAt).toLocaleString('pt-BR')
                          : 'Data não disponível'
                        }
                      </span>
                    </div>
                  </div>
                  
                  {instance.isConnected && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => disconnectInstance(instance.id, instance.instanceName)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};