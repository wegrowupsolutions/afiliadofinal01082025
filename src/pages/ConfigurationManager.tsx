
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useSystemConfigurations } from '@/hooks/useSystemConfigurations';
import { Skeleton } from '@/components/ui/skeleton';
import { Lock, Wifi } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const endpointGroups = {
  'Configuração do Bot': [
    { id: 'webhook_mensagem', label: 'Enviar Mensagem', key: 'webhook_mensagem' },
    { id: 'webhook_pausa_bot', label: 'Pausar Bot', key: 'webhook_pausa_bot' },
    { id: 'webhook_inicia_bot', label: 'Iniciar Bot', key: 'webhook_inicia_bot' },
    { id: 'webhook_confirma', label: 'Confirmar', key: 'webhook_confirma' }
  ],
  'Configuração Evolution': [
    { id: 'webhook_instancia_evolution', label: 'Instância Evolution', key: 'webhook_instancia_evolution' },
    { id: 'webhook_atualizar_qr_code', label: 'Atualizar QR Code', key: 'webhook_atualizar_qr_code' }
  ]
};

const ConfigurationManager = () => {
  const { configurations, loading, isAdmin, updateConfiguration } = useSystemConfigurations();
  const [localValues, setLocalValues] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Initialize local values when configurations load
  React.useEffect(() => {
    if (configurations && Object.keys(configurations).length > 0) {
      setLocalValues(configurations);
    }
  }, [configurations]);

  const handleEndpointChange = (key: string, value: string) => {
    setLocalValues(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
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
      const updates = Object.entries(localValues);
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="w-full">
              <CardContent className="pt-6 space-y-4">
                <Skeleton className="h-6 w-48" />
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Configurações do Sistema</h1>
          <div className="flex items-center gap-1 text-green-600 text-sm">
            <Wifi className="h-4 w-4" />
            <span>Sincronizado em tempo real</span>
          </div>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={saving || !isAdmin}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>

      {!isAdmin && (
        <Alert className="mb-6 border-amber-200 bg-amber-50">
          <Lock className="h-4 w-4" />
          <AlertDescription className="text-amber-800">
            Apenas administradores autorizados (viniciushtx@gmail.com, rfreitasdc@gmail.com e teste@gmail.com) podem modificar essas configurações.
            Essas configurações são globais e afetam todos os usuários da plataforma.
          </AlertDescription>
        </Alert>
      )}

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
                      value={localValues[field.key] || ''}
                      onChange={(e) => handleEndpointChange(field.key, e.target.value)}
                      className="w-full font-mono text-sm"
                      disabled={!isAdmin}
                      placeholder={isAdmin ? "Digite o endpoint..." : "Apenas administradores podem editar"}
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
