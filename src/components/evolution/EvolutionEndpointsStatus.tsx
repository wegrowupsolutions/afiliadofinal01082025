import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSystemConfigurations } from '@/hooks/useSystemConfigurations';
import { Copy, Check, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const EvolutionEndpointsStatus = () => {
  const { configurations, isAdmin } = useSystemConfigurations();
  const { toast } = useToast();
  const [copiedEndpoint, setCopiedEndpoint] = React.useState<string | null>(null);

  const evolutionEndpoints = [
    {
      key: 'webhook_instancia_evolution',
      label: 'Instância Evolution',
      description: 'Endpoint para criar instâncias no Evolution API'
    },
    {
      key: 'webhook_atualizar_qr_code',
      label: 'Atualizar QR Code',
      description: 'Endpoint para obter/atualizar QR codes'
    },
    {
      key: 'webhook_confirma',
      label: 'Confirmar Conexão',
      description: 'Endpoint para verificar status da conexão'
    }
  ];

  const copyToClipboard = async (text: string, endpointKey: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedEndpoint(endpointKey);
      toast({
        title: "Endpoint copiado!",
        description: "URL copiada para a área de transferência.",
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

  const testEndpoint = async (url: string, endpointLabel: string) => {
    try {
      toast({
        title: "Testando endpoint...",
        description: `Verificando conectividade com ${endpointLabel}`,
      });

      const response = await fetch(url, {
        method: 'HEAD',
        mode: 'no-cors' // Para evitar problemas de CORS no teste
      });

      toast({
        title: "Endpoint testado",
        description: `${endpointLabel} está acessível.`,
      });
    } catch (error) {
      toast({
        title: "Erro no teste",
        description: `Não foi possível acessar ${endpointLabel}.`,
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          Status dos Endpoints Evolution
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {evolutionEndpoints.map((endpoint) => {
          const url = configurations[endpoint.key];
          const isConfigured = url && url.trim() !== '';
          
          return (
            <div 
              key={endpoint.key}
              className={`p-4 rounded-lg border ${
                isConfigured 
                  ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20' 
                  : 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{endpoint.label}</h4>
                    <Badge 
                      variant={isConfigured ? "default" : "secondary"}
                      className={`text-xs ${
                        isConfigured 
                          ? 'bg-green-600 text-white' 
                          : 'bg-amber-600 text-white'
                      }`}
                    >
                      {isConfigured ? 'Configurado' : 'Não configurado'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {endpoint.description}
                  </p>
                  {isConfigured ? (
                    <div className="bg-muted/50 p-2 rounded text-xs font-mono break-all">
                      {url}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 text-xs">
                      <AlertTriangle className="h-3 w-3" />
                      <span>Endpoint não configurado</span>
                    </div>
                  )}
                </div>
                
                {isConfigured && (
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
                      onClick={() => testEndpoint(url, endpoint.label)}
                      className="h-8 px-2 text-xs"
                    >
                      Testar
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Endpoints configurados: {evolutionEndpoints.filter(e => configurations[e.key]?.trim()).length}/{evolutionEndpoints.length}
            </span>
            {isAdmin && (
              <Badge variant="outline" className="text-xs">
                Admin - Pode editar configurações
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};