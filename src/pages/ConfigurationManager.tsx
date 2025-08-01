
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  Settings2, 
  Save, 
  Lock, 
  Wifi,
  Plus,
  Edit,
  Check,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSystemConfigurations } from '@/hooks/useSystemConfigurations';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Configurações de endpoints organizadas por categoria
const endpointGroups = {
  'Configuração do Bot N8N': [
    { id: 'webhook_mensagem', label: 'Enviar Mensagem', key: 'webhook_mensagem', description: 'Endpoint N8N para envio de mensagens' },
    { id: 'webhook_pausa_bot', label: 'Pausar Bot', key: 'webhook_pausa_bot', description: 'Endpoint N8N para pausar o bot' },
    { id: 'webhook_inicia_bot', label: 'Iniciar Bot', key: 'webhook_inicia_bot', description: 'Endpoint N8N para iniciar o bot' },
    { id: 'webhook_confirma', label: 'Confirmar Status', key: 'webhook_confirma', description: 'Endpoint N8N para verificar status da conexão' },
    { id: 'n8n_base_url', label: 'URL Base N8N', key: 'n8n_base_url', description: 'URL base da instância N8N' },
    { id: 'n8n_api_key', label: 'API Key N8N', key: 'n8n_api_key', description: 'Chave de API para autenticação N8N' }
  ],
  'Configuração Evolution API': [
    { id: 'webhook_instancia_evolution', label: 'Criar Instância', key: 'webhook_instancia_evolution', description: 'Endpoint para criar/conectar instância Evolution' },
    { id: 'webhook_atualizar_qr_code', label: 'Atualizar QR Code', key: 'webhook_atualizar_qr_code', description: 'Endpoint para obter/atualizar QR Code' },
    { id: 'evolution_api_url', label: 'URL Evolution API', key: 'evolution_api_url', description: 'URL base da Evolution API' },
    { id: 'evolution_api_key', label: 'API Key Evolution', key: 'evolution_api_key', description: 'Chave de API da Evolution' },
    { id: 'evolution_webhook_url', label: 'Webhook Evolution', key: 'evolution_webhook_url', description: 'URL do webhook para receber eventos' }
  ],
  'Configuração da Agenda': [
    { id: 'webhook_agenda_banho', label: 'Agenda Banho', key: 'webhook_agenda_banho', description: 'Endpoint para agendamento de banho' },
    { id: 'webhook_agenda_vet', label: 'Agenda Veterinário', key: 'webhook_agenda_vet', description: 'Endpoint para agendamento veterinário' },
    { id: 'webhook_agenda_adicionar', label: 'Adicionar Evento', key: 'webhook_agenda_adicionar', description: 'Endpoint para adicionar eventos na agenda' },
    { id: 'webhook_agenda_alterar', label: 'Alterar Evento', key: 'webhook_agenda_alterar', description: 'Endpoint para alterar eventos da agenda' },
    { id: 'webhook_agenda_excluir', label: 'Excluir Evento', key: 'webhook_agenda_excluir', description: 'Endpoint para excluir eventos da agenda' }
  ],
  'Configuração Supabase': [
    { id: 'supabase_url', label: 'URL Supabase', key: 'supabase_url', description: 'URL do projeto Supabase' },
    { id: 'supabase_anon_key', label: 'Anon Key Supabase', key: 'supabase_anon_key', description: 'Chave anônima do Supabase' },
    { id: 'supabase_service_key', label: 'Service Key Supabase', key: 'supabase_service_key', description: 'Chave de serviço do Supabase (admin)' }
  ]
};

const ConfigurationManager = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { configurations, loading, isAdmin, updateConfiguration } = useSystemConfigurations();
  const [localValues, setLocalValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState<any>(null);
  const [newEndpointValue, setNewEndpointValue] = useState('');

  React.useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  // Initialize local values when configurations load
  React.useEffect(() => {
    if (configurations && Object.keys(configurations).length > 0) {
      setLocalValues(configurations);
    }
  }, [configurations]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-16 w-16 border-4 border-t-transparent border-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleGoBack = () => {
    navigate('/dashboard');
  };

  const handleEndpointChange = (key: string, value: string) => {
    setLocalValues(prev => ({ ...prev, [key]: value }));
  };

  const handleEditEndpoint = (endpoint: any) => {
    setSelectedEndpoint(endpoint);
    setNewEndpointValue(localValues[endpoint.key] || '');
    setIsEditDialogOpen(true);
  };

  const handleSaveEndpoint = () => {
    if (selectedEndpoint) {
      handleEndpointChange(selectedEndpoint.key, newEndpointValue);
      setIsEditDialogOpen(false);
      setSelectedEndpoint(null);
      setNewEndpointValue('');
      
      toast({
        title: "Endpoint atualizado",
        description: `${selectedEndpoint.label} foi atualizado localmente.`,
      });
    }
  };

  const handleSaveAll = async () => {
    if (!isAdmin) {
      toast({
        title: "Acesso negado",
        description: "Apenas administradores podem modificar as configurações.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const updates = Object.entries(localValues).filter(([key, value]) => value && value.trim() !== '');
      const results = await Promise.all(
        updates.map(([key, value]) => updateConfiguration(key, value))
      );

      if (results.every(Boolean)) {
        toast({
          title: "✅ Configurações salvas",
          description: "Todas as configurações foram salvas com sucesso.",
        });
        navigate('/dashboard');
      } else {
        toast({
          title: "Erro parcial",
          description: "Algumas configurações não puderam ser salvas.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getConfiguredEndpointsCount = () => {
    return Object.values(localValues).filter(value => value && value.trim() !== '').length;
  };

  const getTotalEndpointsCount = () => {
    return Object.values(endpointGroups).flat().length;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleGoBack} className="shrink-0">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Configurações de Endpoints</h1>
              <p className="text-muted-foreground mt-1">Configure os endpoints do sistema e integrações</p>
            </div>
          </div>
        </div>

        {/* Dashboard de Status - Layout Aprimorado */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-8">
          {/* Status Principal */}
          <div className="xl:col-span-3">
            <Card className="h-full overflow-hidden border-border/50 shadow-lg">
              <div className="bg-gradient-to-br from-primary/5 via-primary/3 to-transparent p-1">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="w-10 h-10 bg-primary/15 rounded-xl flex items-center justify-center">
                      <Settings2 className="h-5 w-5 text-primary" />
                    </div>
                    Status das Configurações
                  </CardTitle>
                  <CardDescription className="text-base">
                    Visão geral das integrações e endpoints do sistema
                  </CardDescription>
                </CardHeader>
              </div>

              <CardContent className="p-6">
                {/* Métricas Principais */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center p-4 bg-gradient-to-br from-background to-muted/20 rounded-xl border border-border/30">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {getConfiguredEndpointsCount()}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">
                      Endpoints Ativos
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-br from-background to-muted/20 rounded-xl border border-border/30">
                    <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-2">
                      {getTotalEndpointsCount() - getConfiguredEndpointsCount()}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">
                      Pendentes
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-br from-background to-muted/20 rounded-xl border border-border/30">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                      {Math.round((getConfiguredEndpointsCount() / getTotalEndpointsCount()) * 100)}%
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">
                      Progresso Total
                    </div>
                  </div>
                </div>

                {/* Barra de Progresso */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Configuração Global</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        getConfiguredEndpointsCount() === getTotalEndpointsCount() 
                          ? 'bg-green-500' 
                          : 'bg-amber-500'
                      }`}></div>
                      <span className="text-sm font-semibold">
                        {getConfiguredEndpointsCount() === getTotalEndpointsCount() 
                          ? 'Completo' 
                          : 'Em Progresso'
                        }
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-primary via-primary-foreground to-primary h-3 rounded-full transition-all duration-700 ease-out shadow-lg" 
                      style={{ 
                        width: `${(getConfiguredEndpointsCount() / getTotalEndpointsCount()) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>

                {/* Status das Integrações */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20 rounded-lg border border-green-200/50 dark:border-green-800/30">
                    <div className="flex items-center gap-3 mb-2">
                      <Wifi className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="font-medium text-green-700 dark:text-green-300">Sistema Online</span>
                    </div>
                    <p className="text-xs text-green-600/80 dark:text-green-400/80">
                      Todos os serviços estão operacionais
                    </p>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 rounded-lg border border-blue-200/50 dark:border-blue-800/30">
                    <div className="flex items-center gap-3 mb-2">
                      <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="font-medium text-blue-700 dark:text-blue-300">Última Sync</span>
                    </div>
                    <p className="text-xs text-blue-600/80 dark:text-blue-400/80">
                      {new Date().toLocaleString('pt-BR', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Painel de Ações */}
          <div>
            <Card className="h-full border-border/50 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 p-1">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="w-8 h-8 bg-secondary/20 rounded-lg flex items-center justify-center">
                      <Save className="h-4 w-4 text-secondary-foreground" />
                    </div>
                    Ações
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Gerenciar configurações
                  </CardDescription>
                </CardHeader>
              </div>
              
              <CardContent className="p-6 space-y-6">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Save className="h-10 w-10 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    Sincronize todas as alterações feitas nos endpoints com o sistema
                  </p>
                </div>
                
                <Button 
                  size="lg" 
                  className="w-full h-12 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-200" 
                  onClick={handleSaveAll}
                  disabled={saving || !isAdmin}
                >
                  {saving ? (
                    <>
                      <div className="mr-3 h-5 w-5 border-2 border-t-transparent border-current rounded-full animate-spin"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-3 h-5 w-5" />
                      Salvar Configurações
                    </>
                  )}
                </Button>

                {!isAdmin && (
                  <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 rounded-lg">
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                      <Lock className="h-4 w-4" />
                      <span className="text-xs font-medium">Acesso Restrito</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {!isAdmin && (
          <Alert className="mb-6 border-amber-200 bg-amber-50">
            <Lock className="h-4 w-4" />
            <AlertDescription className="text-amber-800">
              Apenas administradores autorizados podem modificar essas configurações.
              Essas configurações são globais e afetam todos os usuários da plataforma.
            </AlertDescription>
          </Alert>
        )}

        {/* Seções de Configuração de Endpoints */}
        <div className="space-y-8">
          {Object.entries(endpointGroups).map(([groupTitle, endpoints]) => (
            <Card key={groupTitle} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-muted/50 to-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Settings2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{groupTitle}</CardTitle>
                      <CardDescription className="mt-1">
                        {endpoints.filter(endpoint => localValues[endpoint.key]?.trim()).length} de {endpoints.length} endpoints configurados
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-background/80 px-3 py-1.5 rounded-full text-sm font-medium">
                    <div className={`w-2 h-2 rounded-full ${
                      endpoints.filter(endpoint => localValues[endpoint.key]?.trim()).length === endpoints.length
                        ? 'bg-green-500' 
                        : endpoints.filter(endpoint => localValues[endpoint.key]?.trim()).length > 0
                        ? 'bg-amber-500'
                        : 'bg-gray-400'
                    }`}></div>
                    <span className="text-muted-foreground">
                      {Math.round((endpoints.filter(endpoint => localValues[endpoint.key]?.trim()).length / endpoints.length) * 100)}%
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {endpoints.map((endpoint) => (
                    <Card 
                      key={endpoint.id} 
                      className={`border-2 transition-all duration-200 hover:shadow-md ${
                        localValues[endpoint.key]?.trim() 
                          ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20' 
                          : 'border-muted hover:border-muted-foreground/20'
                      }`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-base font-medium leading-tight">
                            {endpoint.label}
                          </CardTitle>
                          {localValues[endpoint.key]?.trim() ? (
                            <div className="flex items-center gap-1 bg-green-600 text-white px-2 py-1 rounded-md text-xs font-medium shrink-0">
                              <Check className="h-3 w-3" />
                              OK
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md text-xs font-medium shrink-0">
                              <AlertTriangle className="h-3 w-3" />
                              Vazio
                            </div>
                          )}
                        </div>
                        <CardDescription className="text-xs leading-relaxed">
                          {endpoint.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="py-3">
                        {localValues[endpoint.key]?.trim() ? (
                          <div className="space-y-2">
                            <p className="text-xs text-muted-foreground font-medium">URL configurada:</p>
                            <p className="font-mono text-xs bg-muted/50 p-2 rounded border text-muted-foreground break-all">
                              {localValues[endpoint.key]}
                            </p>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center mx-auto mb-2">
                              <Settings2 className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Endpoint não configurado
                            </p>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="pt-3">
                        <Button 
                          variant={localValues[endpoint.key]?.trim() ? "outline" : "default"}
                          size="sm" 
                          onClick={() => handleEditEndpoint(endpoint)}
                          disabled={!isAdmin}
                          className="w-full"
                        >
                          <Edit className="mr-2 h-3 w-3" />
                          {localValues[endpoint.key]?.trim() ? 'Editar URL' : 'Configurar'}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Edit Endpoint Dialog - Melhorado */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader className="space-y-3">
              <DialogTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Edit className="h-4 w-4 text-primary" />
                </div>
                Configurar Endpoint
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed">
                {selectedEndpoint?.description}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="endpoint-url" className="text-sm font-medium">
                    URL do Endpoint
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    {selectedEndpoint?.label}
                  </span>
                </div>
                <Input
                  id="endpoint-url"
                  value={newEndpointValue}
                  onChange={(e) => setNewEndpointValue(e.target.value)}
                  placeholder="https://exemplo.com/webhook/endpoint"
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Insira a URL completa do webhook para este endpoint
                </p>
              </div>
              
              {newEndpointValue && (
                <div className="bg-muted/50 p-3 rounded-lg border">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Preview:</p>
                  <p className="font-mono text-xs break-all">
                    {newEndpointValue}
                  </p>
                </div>
              )}
            </div>
            
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveEndpoint}
                disabled={!newEndpointValue.trim()}
              >
                <Check className="mr-2 h-4 w-4" />
                Salvar Endpoint
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ConfigurationManager;
