import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Check, AlertTriangle, Activity, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EndpointStatus {
  url: string;
  status: 'checking' | 'online' | 'offline' | 'unknown';
  responseTime?: number;
  error?: string;
}

interface EndpointsStatusCheckerProps {
  endpoints: Record<string, string>;
}

export const EndpointsStatusChecker = ({ endpoints }: EndpointsStatusCheckerProps) => {
  const { toast } = useToast();
  const [endpointStatuses, setEndpointStatuses] = React.useState<Record<string, EndpointStatus>>({});
  const [copiedEndpoint, setCopiedEndpoint] = React.useState<string | null>(null);
  const [isChecking, setIsChecking] = React.useState(false);

  const endpointGroups = {
    'Configuração do Bot': [
      { key: 'mensagem', label: 'Enviar Mensagem' },
      { key: 'pausaBot', label: 'Pausar Bot' },
      { key: 'iniciaBot', label: 'Iniciar Bot' },
      { key: 'confirma', label: 'Confirmar' }
    ],
    'Configuração Evolution': [
      { key: 'instanciaEvolution', label: 'Instância Evolution' },
      { key: 'atualizarQrCode', label: 'Atualizar QR Code' }
    ]
  };

  const checkEndpoint = async (url: string): Promise<EndpointStatus> => {
    const startTime = Date.now();
    
    try {
      // Use AbortController para timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout

      const response = await fetch(url, {
        method: 'HEAD',
        mode: 'no-cors', // Para evitar problemas de CORS
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      return {
        url,
        status: 'online',
        responseTime
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          url,
          status: 'offline',
          responseTime,
          error: 'Timeout (>10s)'
        };
      }

      // No modo no-cors, mesmo que o endpoint esteja funcionando, 
      // pode retornar erro devido ao CORS, então consideramos como online
      return {
        url,
        status: 'unknown',
        responseTime,
        error: 'Verificação limitada (CORS)'
      };
    }
  };

  const checkAllEndpoints = async () => {
    setIsChecking(true);
    const relevantEndpoints = Object.entries(endpoints).filter(([key]) => 
      ['mensagem', 'pausaBot', 'iniciaBot', 'confirma', 'instanciaEvolution', 'atualizarQrCode'].includes(key)
    );

    const statusPromises = relevantEndpoints.map(async ([key, url]) => {
      setEndpointStatuses(prev => ({
        ...prev,
        [key]: { url, status: 'checking' }
      }));

      const status = await checkEndpoint(url);
      return [key, status] as [string, EndpointStatus];
    });

    const results = await Promise.all(statusPromises);
    
    const newStatuses = results.reduce((acc, [key, status]) => {
      acc[key] = status;
      return acc;
    }, {} as Record<string, EndpointStatus>);

    setEndpointStatuses(newStatuses);
    setIsChecking(false);

    toast({
      title: "Verificação concluída",
      description: `${results.length} endpoints verificados.`,
    });
  };

  const copyToClipboard = async (text: string, endpointKey: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedEndpoint(endpointKey);
      toast({
        title: "URL copiada!",
        description: "Endpoint copiado para a área de transferência.",
      });
      setTimeout(() => setCopiedEndpoint(null), 2000);
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o endpoint.",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: EndpointStatus['status']) => {
    switch (status) {
      case 'online':
        return 'bg-green-600 text-white';
      case 'offline':
        return 'bg-red-600 text-white';
      case 'checking':
        return 'bg-blue-600 text-white';
      case 'unknown':
        return 'bg-yellow-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const getStatusIcon = (status: EndpointStatus['status']) => {
    switch (status) {
      case 'online':
        return <Activity className="h-3 w-3" />;
      case 'offline':
        return <AlertTriangle className="h-3 w-3" />;
      case 'checking':
        return <RefreshCw className="h-3 w-3 animate-spin" />;
      case 'unknown':
        return <AlertTriangle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: EndpointStatus['status']) => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'offline':
        return 'Offline';
      case 'checking':
        return 'Verificando...';
      case 'unknown':
        return 'Indeterminado';
      default:
        return 'Não verificado';
    }
  };

  React.useEffect(() => {
    // Verificar automaticamente ao carregar o componente
    checkAllEndpoints();
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            Status das Conexões
          </CardTitle>
          <Button
            onClick={checkAllEndpoints}
            disabled={isChecking}
            size="sm"
            variant="outline"
          >
            {isChecking ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Verificar Novamente
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(endpointGroups).map(([groupTitle, groupEndpoints]) => (
          <div key={groupTitle} className="space-y-3">
            <h4 className="font-semibold text-sm text-muted-foreground border-b pb-2">
              {groupTitle}
            </h4>
            <div className="space-y-3">
              {groupEndpoints.map((endpoint) => {
                const url = endpoints[endpoint.key];
                const status = endpointStatuses[endpoint.key];
                
                if (!url) return null;

                return (
                  <div 
                    key={endpoint.key}
                    className={`p-4 rounded-lg border ${
                      status?.status === 'online' 
                        ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20'
                        : status?.status === 'offline'
                        ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20'
                        : status?.status === 'checking'
                        ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20'
                        : 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-medium text-sm">{endpoint.label}</h5>
                          <Badge 
                            className={`text-xs ${getStatusColor(status?.status || 'unknown')}`}
                          >
                            <div className="flex items-center gap-1">
                              {getStatusIcon(status?.status || 'unknown')}
                              {getStatusLabel(status?.status || 'unknown')}
                            </div>
                          </Badge>
                          {status?.responseTime && (
                            <span className="text-xs text-muted-foreground">
                              ({status.responseTime}ms)
                            </span>
                          )}
                        </div>
                        <div className="bg-muted/50 p-2 rounded text-xs font-mono break-all mb-2">
                          {url}
                        </div>
                        {status?.error && (
                          <div className="text-xs text-muted-foreground">
                            Erro: {status.error}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(url, endpoint.key)}
                          className="h-8 w-8 p-0"
                        >
                          {copiedEndpoint === endpoint.key ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Última verificação: {new Date().toLocaleTimeString('pt-BR')}
            </span>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Online</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Offline</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>Indeterminado</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};