import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Check, AlertTriangle, Activity, RefreshCw, ExternalLink, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EndpointResult {
  name: string;
  url: string;
  status: number | null;
  ok: boolean;
  responseTime: number | null;
  contentType: string | null;
  response: any;
  error: string | null;
  timestamp: string;
}

interface TestResults {
  summary: {
    totalEndpoints: number;
    activeEndpoints: number;
    failedEndpoints: number;
    testCompletedAt: string;
  };
  results: EndpointResult[];
}

interface EndpointsStatusCheckerProps {
  endpoints: Record<string, string>;
}

export const EndpointsStatusChecker = ({ endpoints }: EndpointsStatusCheckerProps) => {
  const { toast } = useToast();
  const [testResults, setTestResults] = React.useState<TestResults | null>(null);
  const [copiedEndpoint, setCopiedEndpoint] = React.useState<string | null>(null);
  const [isChecking, setIsChecking] = React.useState(false);
  const [lastCheckTime, setLastCheckTime] = React.useState<string | null>(null);

  const endpointGroups = {
    'Configuração do Bot': [
      { key: 'mensagem', label: 'Enviar Mensagem', afiliado: 'envia_mensagem_afiliado' },
      { key: 'pausaBot', label: 'Pausar Bot', afiliado: 'pausa_bot_afiliado' },
      { key: 'iniciaBot', label: 'Iniciar Bot', afiliado: 'inicia_bot_afiliado' },
      { key: 'confirma', label: 'Confirmar', afiliado: 'confirma_afiliado' }
    ],
    'Configuração Evolution': [
      { key: 'instanciaEvolution', label: 'Instância Evolution', afiliado: 'instancia_evolution_afiliado' },
      { key: 'atualizarQrCode', label: 'Atualizar QR Code', afiliado: 'atualizar_qr_code_afiliado' }
    ]
  };

  const checkAllEndpoints = async () => {
    setIsChecking(true);
    try {
      console.log('Iniciando teste de webhooks...');
      
      const { data: functionData, error: functionError } = await supabase.functions
        .invoke('test-webhook-connections', {
          body: {}
        });

      if (functionError) {
        console.error('Erro ao chamar função de teste:', functionError);
        toast({
          title: "Erro na verificação",
          description: "Não foi possível executar o teste dos webhooks.",
          variant: "destructive"
        });
        return;
      }

      console.log('Resultados do teste:', functionData);
      setTestResults(functionData);
      setLastCheckTime(functionData.summary.testCompletedAt);
      
      const { summary } = functionData;
      const successRate = summary.totalEndpoints > 0 ? 
        Math.round((summary.activeEndpoints / summary.totalEndpoints) * 100) : 0;

      toast({
        title: "Verificação concluída",
        description: `${summary.activeEndpoints}/${summary.totalEndpoints} endpoints ativos (${successRate}%)`,
        variant: summary.activeEndpoints === summary.totalEndpoints ? "default" : "destructive"
      });

    } catch (error) {
      console.error('Erro ao verificar endpoints:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro durante a verificação.",
        variant: "destructive"
      });
    } finally {
      setIsChecking(false);
    }
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

  const getEndpointResult = (endpointName: string): EndpointResult | null => {
    if (!testResults) return null;
    return testResults.results.find(r => r.name === endpointName) || null;
  };

  const getStatusColor = (result: EndpointResult | null) => {
    if (!result) return 'bg-gray-600 text-white';
    if (result.ok) return 'bg-green-600 text-white';
    return 'bg-red-600 text-white';
  };

  const getStatusIcon = (result: EndpointResult | null) => {
    if (!result) return <AlertTriangle className="h-3 w-3" />;
    if (result.ok) return <Activity className="h-3 w-3" />;
    return <AlertTriangle className="h-3 w-3" />;
  };

  const getStatusLabel = (result: EndpointResult | null) => {
    if (!result) return 'Não testado';
    if (result.ok) return `Online (${result.status})`;
    return result.error || 'Offline';
  };

  const formatResponseTime = (responseTime: number | null) => {
    if (!responseTime) return '';
    return `${responseTime}ms`;
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
            <div className={`w-3 h-3 rounded-full ${
              testResults?.summary.activeEndpoints === testResults?.summary.totalEndpoints 
                ? 'bg-green-500' 
                : isChecking 
                ? 'bg-blue-500 animate-pulse' 
                : 'bg-red-500'
            }`}></div>
            Status das Conexões
            {testResults && (
              <Badge variant="outline" className="ml-2">
                {testResults.summary.activeEndpoints}/{testResults.summary.totalEndpoints} ativos
              </Badge>
            )}
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
            {isChecking ? 'Testando...' : 'Testar Webhooks'}
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
                const result = getEndpointResult(endpoint.afiliado);
                
                if (!url) return null;

                return (
                  <div 
                    key={endpoint.key}
                    className={`p-4 rounded-lg border transition-colors ${
                      result?.ok
                        ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20'
                        : result && !result.ok
                        ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20'
                        : isChecking
                        ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20'
                        : 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h5 className="font-medium text-sm">{endpoint.label}</h5>
                          <Badge 
                            className={`text-xs ${getStatusColor(result)}`}
                          >
                            <div className="flex items-center gap-1">
                              {isChecking ? (
                                <RefreshCw className="h-3 w-3 animate-spin" />
                              ) : (
                                getStatusIcon(result)
                              )}
                              {isChecking ? 'Testando...' : getStatusLabel(result)}
                            </div>
                          </Badge>
                          {result?.responseTime && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {formatResponseTime(result.responseTime)}
                            </div>
                          )}
                        </div>
                        
                        <div className="bg-muted/50 p-2 rounded text-xs font-mono break-all mb-2">
                          {url}
                        </div>
                        
                        {result && (
                          <div className="space-y-1 text-xs">
                            {result.status && (
                              <div className="text-muted-foreground">
                                Status HTTP: {result.status}
                              </div>
                            )}
                            {result.contentType && (
                              <div className="text-muted-foreground">
                                Content-Type: {result.contentType}
                              </div>
                            )}
                            {result.error && (
                              <div className="text-red-600 dark:text-red-400">
                                Erro: {result.error}
                              </div>
                            )}
                            {result.response && typeof result.response === 'string' && result.response.length < 100 && (
                              <div className="text-muted-foreground">
                                Resposta: {result.response}
                              </div>
                            )}
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(url, '_blank')}
                          className="h-8 w-8 p-0"
                        >
                          <ExternalLink className="h-3 w-3" />
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
              {lastCheckTime ? (
                `Última verificação: ${new Date(lastCheckTime).toLocaleString('pt-BR')}`
              ) : (
                'Nenhuma verificação realizada'
              )}
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
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                <span>Não testado</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};