import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { RefreshCw } from 'lucide-react';

const SyncTestButton: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSync = async () => {
    setLoading(true);
    try {
      console.log('🔄 Executando sincronização manual...');
      
      const { data, error } = await supabase.functions.invoke('sync-evolution-kiwify', {
        body: {}
      });

      if (error) {
        console.error('❌ Erro na sincronização:', error);
        toast({
          title: "Erro na Sincronização",
          description: error.message,
          variant: "destructive",
        });
      } else {
        console.log('✅ Sincronização executada:', data);
        toast({
          title: "Sincronização Concluída",
          description: `${data.synced_count}/${data.total_instances} instâncias sincronizadas`,
        });
        
        // Recarregar a página para atualizar o estado
        window.location.reload();
      }
    } catch (error) {
      console.error('❌ Erro:', error);
      toast({
        title: "Erro",
        description: "Falha ao executar sincronização",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSync}
      disabled={loading}
      variant="outline"
      size="sm"
      className="mb-4"
    >
      <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
      {loading ? 'Sincronizando...' : 'Sincronizar Manualmente'}
    </Button>
  );
};

export default SyncTestButton;