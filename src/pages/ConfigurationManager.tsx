import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { Loader2, Shield } from 'lucide-react';
import { EndpointsStatusChecker } from '@/components/configuration/EndpointsStatusChecker';

// Default webhook base URL
const DEFAULT_WEBHOOK_BASE = "https://webhook.serverwegrowup.com.br/webhook";

// Default endpoints específicos para afiliados
const DEFAULT_ENDPOINTS = {
  envia_mensagem: `${DEFAULT_WEBHOOK_BASE}/envia_mensagem_afiliado`,
  pausa_bot: `${DEFAULT_WEBHOOK_BASE}/pausa_bot_afiliado`,
  inicia_bot: `${DEFAULT_WEBHOOK_BASE}/inicia_bot_afiliado`,
  instancia_evolution: `${DEFAULT_WEBHOOK_BASE}/instancia_evolution_afiliado`,
  atualizar_qr_code: `${DEFAULT_WEBHOOK_BASE}/atualizar_qr_code_afiliado`,
  confirma: `${DEFAULT_WEBHOOK_BASE}/confirma_afiliado`,
  config_agent: `${DEFAULT_WEBHOOK_BASE}/config_agent_afiliado`,
  envia_rag: `${DEFAULT_WEBHOOK_BASE}/envia_rag_afiliado`,
  cria_usuario: `${DEFAULT_WEBHOOK_BASE}/cria_usuario_afiliado`,
  edita_usuario: `${DEFAULT_WEBHOOK_BASE}/edita_usuario_afiliado`,
  exclui_usuario: `${DEFAULT_WEBHOOK_BASE}/exclui_usuario_afiliado`
};

// Default endpoints configuration (usando versões afiliado)
const defaultEndpoints = {
  mensagem: DEFAULT_ENDPOINTS.envia_mensagem,
  pausaBot: DEFAULT_ENDPOINTS.pausa_bot,
  iniciaBot: DEFAULT_ENDPOINTS.inicia_bot,
  agenda: `${DEFAULT_WEBHOOK_BASE}/agenda_afiliado`,
  agendaBanho: `${DEFAULT_WEBHOOK_BASE}/agenda/banho_afiliado`,
  agendaVet: `${DEFAULT_WEBHOOK_BASE}/agenda/vet_afiliado`,
  agendaAlterar: `${DEFAULT_WEBHOOK_BASE}/agenda/alterar_afiliado`,
  agendaAdicionarBanho: `${DEFAULT_WEBHOOK_BASE}/agenda/adicionar/banho_afiliado`,
  agendaAdicionarVet: `${DEFAULT_WEBHOOK_BASE}/agenda/adicionar/vet_afiliado`,
  agendaAlterarBanho: `${DEFAULT_WEBHOOK_BASE}/agenda/alterar/banho_afiliado`,
  agendaAlterarVet: `${DEFAULT_WEBHOOK_BASE}/agenda/alterar/vet_afiliado`,
  agendaAdicionar: `${DEFAULT_WEBHOOK_BASE}/agenda/adicionar_afiliado`,
  agendaExcluir: `${DEFAULT_WEBHOOK_BASE}/agenda/excluir_afiliado`,
  agendaExcluirBanho: `${DEFAULT_WEBHOOK_BASE}/agenda/excluir/banho_afiliado`,
  agendaExcluirVet: `${DEFAULT_WEBHOOK_BASE}/agenda/excluir/vet_afiliado`,
  enviaRag: DEFAULT_ENDPOINTS.envia_rag,
  excluirArquivoRag: `${DEFAULT_WEBHOOK_BASE}/excluir-arquivo-rag_afiliado`,
  excluirRag: `${DEFAULT_WEBHOOK_BASE}/excluir-rag_afiliado`,
  instanciaEvolution: DEFAULT_ENDPOINTS.instancia_evolution,
  atualizarQrCode: DEFAULT_ENDPOINTS.atualizar_qr_code,
  confirma: DEFAULT_ENDPOINTS.confirma,
};

const endpointGroups = {
  'Configuração do Bot': [
    { id: 'mensagem', label: 'Enviar Mensagem', key: 'mensagem' },
    { id: 'pausaBot', label: 'Pausar Bot', key: 'pausaBot' },
    { id: 'iniciaBot', label: 'Iniciar Bot', key: 'iniciaBot' },
    { id: 'confirma', label: 'Confirmar', key: 'confirma' }
  ],
  'Configuração Evolution': [
    { id: 'instanciaEvolution', label: 'Instância Evolution', key: 'instanciaEvolution' },
    { id: 'atualizarQrCode', label: 'Atualizar QR Code', key: 'atualizarQrCode' }
  ]
};

const ConfigurationManager = () => {
  const { isAdmin, loading } = useIsAdmin();
  const [endpoints, setEndpoints] = React.useState(() => {
    const savedEndpoints = localStorage.getItem('webhookEndpoints');
    return savedEndpoints ? JSON.parse(savedEndpoints) : defaultEndpoints;
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect non-admins to dashboard
  React.useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/dashboard');
    }
  }, [isAdmin, loading, navigate]);

  const handleEndpointChange = (key: string, value: string) => {
    setEndpoints(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    localStorage.setItem('webhookEndpoints', JSON.stringify(endpoints));
    toast({
      title: "Configurações salvas",
      description: "As configurações foram salvas com sucesso.",
    });
    navigate('/dashboard');
  };

  // Show loading spinner while checking admin status
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Show access denied for non-admins
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <Shield className="h-16 w-16 text-destructive" />
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Acesso Negado</h1>
            <p className="text-muted-foreground">Você não tem permissão para acessar esta página.</p>
            <p className="text-sm text-muted-foreground mt-2">Apenas administradores podem gerenciar configurações do sistema.</p>
          </div>
          <Button onClick={() => navigate('/dashboard')} variant="outline">
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">Configurações do Sistema</h1>
          <Button onClick={handleSave} variant="default">
            Salvar Alterações
          </Button>
        </div>

        <div className="grid gap-6">
          {/* Status das Conexões */}
          <EndpointsStatusChecker endpoints={endpoints} />
          
          {/* Configuração dos Endpoints */}
          {Object.entries(endpointGroups).map(([groupTitle, fields]) => (
            <Card key={groupTitle} className="w-full bg-card border-border">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4 text-card-foreground">{groupTitle}</h3>
                <div className="space-y-4">
                  {fields.map((field) => (
                    <div key={field.id} className="space-y-2">
                      <Label htmlFor={field.id} className="text-foreground">{field.label}</Label>
                      <Input
                        id={field.id}
                        value={endpoints[field.key as keyof typeof endpoints]}
                        onChange={(e) => handleEndpointChange(field.key, e.target.value)}
                        className="w-full font-mono text-sm bg-background text-foreground border-input"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConfigurationManager;