import React, { useState } from 'react';
import { RefreshCw, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ManualSyncButtonProps {
  instanceName?: string;
  onSyncComplete?: () => void;
}

export function ManualSyncButton({ instanceName, onSyncComplete }: ManualSyncButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleManualSync = async () => {
    setIsLoading(true);
    
    try {
      console.log('🔄 Iniciando sincronização manual...');
      
      // Primeiro tentar sincronizar dados Evolution
      const syncResponse = await supabase.functions.invoke('sync-evolution-kiwify');
      
      if (syncResponse.error) {
        console.error('❌ Erro na sincronização Evolution:', syncResponse.error);
        toast({
          title: "Erro na sincronização",
          description: "Não foi possível sincronizar com a Evolution API. Tente novamente.",
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Sincronização Evolution concluída:', syncResponse.data);

      // Se fornecido nome da instância, verificar status específico
      if (instanceName) {
        try {
          const response = await fetch('https://webhook.serverwegrowup.com.br/webhook/confirma_afiliado', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              instanceName: instanceName.trim() 
            }),
          });
          
          if (response.ok) {
            const responseData = await response.json();
            console.log('📊 Status da instância:', responseData);
            
            if (responseData?.respond === "positivo") {
              toast({
                title: "Conexão confirmada!",
                description: "A instância está conectada e sincronizada.",
              });
            } else {
              toast({
                title: "Instância não conectada",
                description: "A instância ainda não está conectada ao WhatsApp.",
                variant: "destructive"
              });
            }
          }
        } catch (error) {
          console.error('Erro ao verificar status da instância:', error);
        }
      } else {
        toast({
          title: "Sincronização concluída",
          description: "Dados foram sincronizados com a Evolution API.",
        });
      }
      
      onSyncComplete?.();
      
    } catch (error) {
      console.error('❌ Erro na sincronização manual:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro durante a sincronização.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleManualSync}
      disabled={isLoading}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      {isLoading ? (
        <RefreshCw className="h-4 w-4 animate-spin" />
      ) : (
        <Zap className="h-4 w-4" />
      )}
      {isLoading ? 'Sincronizando...' : 'Forçar Sincronização'}
    </Button>
  );
}