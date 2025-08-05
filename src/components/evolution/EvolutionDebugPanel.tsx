import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSystemConfigurations } from '@/hooks/useSystemConfigurations';
import { Settings, TestTube, Database, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const EvolutionDebugPanel = () => {
  const { configurations, isAdmin } = useSystemConfigurations();
  const { toast } = useToast();
  const [isTestingWebhooks, setIsTestingWebhooks] = React.useState(false);
  const [webhookResults, setWebhookResults] = React.useState<{[key: string]: 'success' | 'error' | 'testing'}>({});

  const testWebhookEndpoint = async (url: string, name: string) => {
    setWebhookResults(prev => ({ ...prev, [name]: 'testing' }));
    
    try {
      // Teste simples de conectividade
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ test: true }),
      });

      console.log(`🧪 Teste ${name}:`, response.status);
      
      setWebhookResults(prev => ({ 
        ...prev, 
        [name]: response.status < 500 ? 'success' : 'error' 
      }));
      
      return response.status;
    } catch (error) {
      console.error(`❌ Erro no teste ${name}:`, error);
      setWebhookResults(prev => ({ ...prev, [name]: 'error' }));
      return 0;
    }
  };

  const testAllWebhooks = async () => {
    setIsTestingWebhooks(true);
    setWebhookResults({});
    
    const webhooks = [
      { 
        name: 'Instância Evolution', 
        url: configurations['webhook_instancia_evolution'] 
      },
      { 
        name: 'Atualizar QR Code', 
        url: configurations['webhook_atualizar_qr_code'] 
      },
      { 
        name: 'Confirmar Conexão', 
        url: configurations['webhook_confirma'] 
      },
      { 
        name: 'Enviar Mensagem', 
        url: configurations['webhook_mensagem'] 
      }
    ];

    let successCount = 0;
    
    for (const webhook of webhooks) {
      if (webhook.url) {
        const status = await testWebhookEndpoint(webhook.url, webhook.name);
        if (status > 0 && status < 500) successCount++;
      }
    }
    
    setIsTestingWebhooks(false);
    
    toast({
      title: "Teste de Webhooks Concluído",
      description: `${successCount}/${webhooks.filter(w => w.url).length} webhooks responderam.`,
      variant: successCount === webhooks.filter(w => w.url).length ? "default" : "destructive"
    });
  };

  const syncUserInstances = async () => {
    try {
      const { data, error } = await supabase.rpc('sync_unlinked_instances');
      
      if (error) {
        console.error('Erro na sincronização:', error);
        toast({
          title: "Erro na sincronização",
          description: "Não foi possível sincronizar as instâncias.",
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Sincronização concluída",
        description: `${data || 0} instâncias foram sincronizadas.`,
      });
    } catch (error) {
      console.error('Erro na sincronização:', error);
      toast({
        title: "Erro na sincronização",
        description: "Ocorreu um erro ao sincronizar as instâncias.",
        variant: "destructive"
      });
    }
  };

  const debugInfo = {
    'Webhook Instância Evolution': configurations['webhook_instancia_evolution'],
    'Webhook Atualizar QR Code': configurations['webhook_atualizar_qr_code'],
    'Webhook Confirmar': configurations['webhook_confirma'],
    'Webhook Mensagem': configurations['webhook_mensagem'],
    'Evolution API URL': configurations['evolution_api_url'],
    'Evolution API Key': configurations['evolution_api_key'] ? '***configurada***' : '⚠️ não configurada'
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Debug & Testes - Evolution
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Informações de Debug */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Database className="h-4 w-4" />
            Configurações Atuais
          </h4>
          <div className="space-y-2">
            {Object.entries(debugInfo).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center p-2 bg-muted/50 rounded text-sm">
                <span className="font-mono text-xs">{key}:</span>
                <span className={`font-mono text-xs ${value?.includes('⚠️') ? 'text-amber-600' : 'text-muted-foreground'}`}>
                  {value || '❌ não configurado'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Teste de Webhooks */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            Teste de Conectividade
          </h4>
          <div className="space-y-3">
            <Button 
              onClick={testAllWebhooks}
              disabled={isTestingWebhooks}
              variant="outline"
              className="w-full"
            >
              {isTestingWebhooks ? 'Testando Webhooks...' : 'Testar Todos os Webhooks'}
            </Button>
            
            {Object.keys(webhookResults).length > 0 && (
              <div className="space-y-2">
                {Object.entries(webhookResults).map(([name, status]) => (
                  <div key={name} className="flex justify-between items-center p-2 bg-muted/50 rounded text-sm">
                    <span>{name}</span>
                    <Badge variant={
                      status === 'success' ? 'default' : 
                      status === 'error' ? 'destructive' : 
                      'secondary'
                    }>
                      {status === 'testing' ? 'Testando...' : 
                       status === 'success' ? 'Conectado' : 'Erro'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ferramentas Admin */}
        {isAdmin && (
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Ferramentas de Admin
            </h4>
            <Button 
              onClick={syncUserInstances}
              variant="outline"
              className="w-full"
            >
              Sincronizar User IDs das Instâncias
            </Button>
          </div>
        )}

        {/* Logs de Debug */}
        <div className="text-xs text-muted-foreground p-3 bg-muted/30 rounded font-mono">
          <p>💡 Dica: Abra o console do navegador (F12) para ver logs detalhados das operações.</p>
          <p>🔍 Verifique as mensagens que começam com 🚀, 📍, ✅ ou ❌</p>
        </div>
      </CardContent>
    </Card>
  );
};