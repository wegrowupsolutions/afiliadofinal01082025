
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
  'Configuração do Bot': [
    { id: 'webhook_mensagem', label: 'Enviar Mensagem', key: 'webhook_mensagem', description: 'Endpoint para envio de mensagens' },
    { id: 'webhook_pausa_bot', label: 'Pausar Bot', key: 'webhook_pausa_bot', description: 'Endpoint para pausar o bot' },
    { id: 'webhook_inicia_bot', label: 'Iniciar Bot', key: 'webhook_inicia_bot', description: 'Endpoint para iniciar o bot' },
    { id: 'webhook_confirma', label: 'Confirmar', key: 'webhook_confirma', description: 'Endpoint para confirmações' }
  ],
  'Configuração Evolution': [
    { id: 'webhook_instancia_evolution', label: 'Instância Evolution', key: 'webhook_instancia_evolution', description: 'Endpoint da instância Evolution' },
    { id: 'webhook_atualizar_qr_code', label: 'Atualizar QR Code', key: 'webhook_atualizar_qr_code', description: 'Endpoint para atualizar QR Code' }
  ],
  'Configuração da Agenda': [
    { id: 'webhook_agenda_banho', label: 'Agenda Banho', key: 'webhook_agenda_banho', description: 'Endpoint para agendamento de banho' },
    { id: 'webhook_agenda_vet', label: 'Agenda Veterinário', key: 'webhook_agenda_vet', description: 'Endpoint para agendamento veterinário' },
    { id: 'webhook_agenda_adicionar', label: 'Adicionar Evento', key: 'webhook_agenda_adicionar', description: 'Endpoint para adicionar eventos' },
    { id: 'webhook_agenda_alterar', label: 'Alterar Evento', key: 'webhook_agenda_alterar', description: 'Endpoint para alterar eventos' },
    { id: 'webhook_agenda_excluir', label: 'Excluir Evento', key: 'webhook_agenda_excluir', description: 'Endpoint para excluir eventos' }
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
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Button variant="outline" onClick={handleGoBack} className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold">Configurações de Endpoints</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings2 className="h-5 w-5 text-primary" />
                  Status das Configurações
                </CardTitle>
                <CardDescription>
                  Visão geral das configurações atuais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-medium">
                        {getConfiguredEndpointsCount()} de {getTotalEndpointsCount()}
                      </h3>
                      <p className="text-muted-foreground">
                        Endpoints configurados
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-green-600 text-sm">
                      <Wifi className="h-4 w-4" />
                      <span>Sincronizado</span>
                    </div>
                  </div>
                  
                  <div className="w-full bg-muted rounded-full h-2 mb-4">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300" 
                      style={{ 
                        width: `${(getConfiguredEndpointsCount() / getTotalEndpointsCount()) * 100}%` 
                      }}
                    ></div>
                  </div>
                  
                  <div className="text-sm space-y-1">
                    <p>
                      <span className="font-medium">Status:</span> {
                        getConfiguredEndpointsCount() === getTotalEndpointsCount() 
                          ? 'Completo' 
                          : 'Parcial'
                      }
                    </p>
                    <p>
                      <span className="font-medium">Última sincronização:</span> {
                        new Date().toLocaleString('pt-BR')
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Save className="h-5 w-5 text-primary" />
                  Salvar Configurações
                </CardTitle>
                <CardDescription>
                  Sincronizar alterações com o sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center p-6">
                <Button 
                  size="lg" 
                  className="w-full" 
                  onClick={handleSaveAll}
                  disabled={saving || !isAdmin}
                >
                  {saving ? (
                    <>
                      <span className="mr-2 h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-5 w-5" />
                      Salvar Todas as Configurações
                    </>
                  )}
                </Button>
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

        <div className="space-y-6">
          {Object.entries(endpointGroups).map(([groupTitle, endpoints]) => (
            <Card key={groupTitle}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings2 className="h-5 w-5 text-primary" />
                  {groupTitle}
                </CardTitle>
                <CardDescription>
                  {endpoints.filter(endpoint => localValues[endpoint.key]?.trim()).length} de {endpoints.length} endpoints configurados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {endpoints.map((endpoint) => (
                    <Card key={endpoint.id} className={`border ${localValues[endpoint.key]?.trim() ? 'border-green-200 bg-green-50/50' : 'border-muted'}`}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex justify-between items-center">
                          <span>{endpoint.label}</span>
                          {localValues[endpoint.key]?.trim() && (
                            <div className="flex items-center gap-1 bg-green-600 text-white px-2 py-1 rounded text-xs">
                              <Check className="h-3 w-3" />
                              Configurado
                            </div>
                          )}
                        </CardTitle>
                        <CardDescription>
                          {endpoint.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="text-sm">
                        {localValues[endpoint.key]?.trim() ? (
                          <p className="font-mono text-xs text-muted-foreground truncate">
                            {localValues[endpoint.key]}
                          </p>
                        ) : (
                          <p className="text-muted-foreground italic">
                            Não configurado
                          </p>
                        )}
                      </CardContent>
                      <CardFooter>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEditEndpoint(endpoint)}
                          disabled={!isAdmin}
                          className="w-full"
                        >
                          <Edit className="mr-2 h-3 w-3" />
                          {localValues[endpoint.key]?.trim() ? 'Editar' : 'Configurar'}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Edit Endpoint Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Configurar Endpoint</DialogTitle>
              <DialogDescription>
                {selectedEndpoint?.description}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="endpoint-url">URL do Endpoint</Label>
                <Input
                  id="endpoint-url"
                  value={newEndpointValue}
                  onChange={(e) => setNewEndpointValue(e.target.value)}
                  placeholder="https://exemplo.com/webhook"
                  className="font-mono text-sm"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveEndpoint}>
                <Check className="mr-2 h-4 w-4" />
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ConfigurationManager;
