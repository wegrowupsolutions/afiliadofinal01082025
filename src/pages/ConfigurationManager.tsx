
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

// Default webhook base URL
const DEFAULT_WEBHOOK_BASE = "https://webhook.n8nlabz.com.br/webhook";

// Default endpoints configuration
const defaultEndpoints = {
  mensagem: `${DEFAULT_WEBHOOK_BASE}/envia_mensagem`,
  pausaBot: `${DEFAULT_WEBHOOK_BASE}/pausa_bot`,
  iniciaBot: `${DEFAULT_WEBHOOK_BASE}/inicia_bot`,
  agenda: `${DEFAULT_WEBHOOK_BASE}/agenda`,
  agendaBanho: `${DEFAULT_WEBHOOK_BASE}/agenda/banho`,
  agendaVet: `${DEFAULT_WEBHOOK_BASE}/agenda/vet`,
  agendaAlterar: `${DEFAULT_WEBHOOK_BASE}/agenda/alterar`,
  agendaAdicionarBanho: `${DEFAULT_WEBHOOK_BASE}/agenda/adicionar/banho`,
  agendaAdicionarVet: `${DEFAULT_WEBHOOK_BASE}/agenda/adicionar/vet`,
  agendaAlterarBanho: `${DEFAULT_WEBHOOK_BASE}/agenda/alterar/banho`,
  agendaAlterarVet: `${DEFAULT_WEBHOOK_BASE}/agenda/alterar/vet`,
  agendaAdicionar: `${DEFAULT_WEBHOOK_BASE}/agenda/adicionar`,
  agendaExcluir: `${DEFAULT_WEBHOOK_BASE}/agenda/excluir`,
  agendaExcluirBanho: `${DEFAULT_WEBHOOK_BASE}/agenda/excluir/banho`,
  agendaExcluirVet: `${DEFAULT_WEBHOOK_BASE}/agenda/excluir/vet`,
  enviaRag: `${DEFAULT_WEBHOOK_BASE}/envia_rag`,
  excluirArquivoRag: `${DEFAULT_WEBHOOK_BASE}/excluir-arquivo-rag`,
  excluirRag: `${DEFAULT_WEBHOOK_BASE}/excluir-rag`,
  instanciaEvolution: `${DEFAULT_WEBHOOK_BASE}/instanciaevolution`,
  atualizarQrCode: `${DEFAULT_WEBHOOK_BASE}/atualizar-qr-code`,
  confirma: `${DEFAULT_WEBHOOK_BASE}/confirma`,
};

const endpointGroups = {
  'Configuração Supabase': [
    { id: 'supabaseUrl', label: 'URL do Supabase', value: import.meta.env.VITE_SUPABASE_URL || '', readOnly: true },
    { id: 'supabaseKey', label: 'Chave Anônima do Supabase', value: import.meta.env.VITE_SUPABASE_ANON_KEY || '', readOnly: true }
  ],
  'Configuração da Agenda': [
    { id: 'agenda', label: 'URL Base da Agenda', key: 'agenda' },
    { id: 'agendaBanho', label: 'URL Agenda Banho', key: 'agendaBanho' },
    { id: 'agendaVet', label: 'URL Agenda Veterinário', key: 'agendaVet' },
    { id: 'agendaAdicionar', label: 'Adicionar Evento (Geral)', key: 'agendaAdicionar' },
    { id: 'agendaAdicionarBanho', label: 'Adicionar Evento Banho', key: 'agendaAdicionarBanho' },
    { id: 'agendaAdicionarVet', label: 'Adicionar Evento Veterinário', key: 'agendaAdicionarVet' },
    { id: 'agendaAlterar', label: 'Alterar Evento (Geral)', key: 'agendaAlterar' },
    { id: 'agendaAlterarBanho', label: 'Alterar Evento Banho', key: 'agendaAlterarBanho' },
    { id: 'agendaAlterarVet', label: 'Alterar Evento Veterinário', key: 'agendaAlterarVet' },
    { id: 'agendaExcluir', label: 'Excluir Evento (Geral)', key: 'agendaExcluir' },
    { id: 'agendaExcluirBanho', label: 'Excluir Evento Banho', key: 'agendaExcluirBanho' },
    { id: 'agendaExcluirVet', label: 'Excluir Evento Veterinário', key: 'agendaExcluirVet' }
  ],
  'Configuração do Bot': [
    { id: 'mensagem', label: 'Enviar Mensagem', key: 'mensagem' },
    { id: 'pausaBot', label: 'Pausar Bot', key: 'pausaBot' },
    { id: 'iniciaBot', label: 'Iniciar Bot', key: 'iniciaBot' },
    { id: 'confirma', label: 'Confirmar', key: 'confirma' }
  ],
  'Configuração RAG': [
    { id: 'enviaRag', label: 'Enviar RAG', key: 'enviaRag' },
    { id: 'excluirArquivoRag', label: 'Excluir Arquivo RAG', key: 'excluirArquivoRag' },
    { id: 'excluirRag', label: 'Excluir RAG', key: 'excluirRag' }
  ],
  'Configuração Evolution': [
    { id: 'instanciaEvolution', label: 'Instância Evolution', key: 'instanciaEvolution' },
    { id: 'atualizarQrCode', label: 'Atualizar QR Code', key: 'atualizarQrCode' }
  ]
};

const ConfigurationManager = () => {
  const [endpoints, setEndpoints] = React.useState(() => {
    const savedEndpoints = localStorage.getItem('webhookEndpoints');
    return savedEndpoints ? JSON.parse(savedEndpoints) : defaultEndpoints;
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Configurações do Sistema</h1>
        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
          Salvar Alterações
        </Button>
      </div>

      <div className="grid gap-6">
        {Object.entries(endpointGroups).map(([groupTitle, fields]) => (
          <Card key={groupTitle} className="w-full">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">{groupTitle}</h3>
              <div className="space-y-4">
                {fields.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <Label htmlFor={field.id}>{field.label}</Label>
                    <Input
                      id={field.id}
                      value={field.readOnly ? field.value : endpoints[field.key as keyof typeof endpoints]}
                      onChange={field.readOnly ? undefined : (e) => handleEndpointChange(field.key, e.target.value)}
                      readOnly={field.readOnly}
                      className="w-full font-mono text-sm"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ConfigurationManager;
