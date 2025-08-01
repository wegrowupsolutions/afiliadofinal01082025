import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSystemConfigurations } from '@/hooks/useSystemConfigurations';

export const useEvolutionApi = () => {
  const { configurations } = useSystemConfigurations();
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'failed'>('idle');

  const getEndpoint = (type: 'instance' | 'qr_code' | 'confirm') => {
    switch (type) {
      case 'instance':
        return configurations['webhook_instancia_evolution'] || 'https://webhook.serverwegrowup.com.br/webhook/instancia-evolution-afiliado';
      case 'qr_code':
        return configurations['webhook_atualizar_qr_code'] || 'https://webhook.serverwegrowup.com.br/webhook/atualizar-qr-code-afiliado';
      case 'confirm':
        return configurations['webhook_confirma'] || 'https://webhook.serverwegrowup.com.br/webhook/pop-up';
      default:
        throw new Error(`Tipo de endpoint inválido: ${type}`);
    }
  };

  const createInstance = async (instanceName: string, webhookPath: string): Promise<Blob | null> => {
    try {
      setIsConnecting(true);
      console.log('Criando instância Evolution:', { instanceName, webhookPath });
      
      const endpoint = getEndpoint('instance');
      console.log('Usando endpoint:', endpoint);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          instanceName: instanceName.trim(),
          webhookPath: webhookPath.trim()
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const blob = await response.blob();
      console.log('QR Code recebido, tipo:', blob.type);
      
      // Salvar no Supabase
      const { error } = await supabase.rpc('mark_instance_connected', {
        p_user_id: (await supabase.auth.getUser()).data.user?.id || '',
        p_instance_name: instanceName.trim(),
        p_phone_number: null
      });

      if (error) {
        console.error('Erro ao salvar instância no Supabase:', error);
      }

      setConnectionStatus('connecting');
      return blob;
    } catch (error) {
      console.error('Erro ao criar instância:', error);
      setConnectionStatus('failed');
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const updateQrCode = async (instanceName: string): Promise<Blob | null> => {
    try {
      setIsConnecting(true);
      console.log('Atualizando QR Code para instância:', instanceName);
      
      const endpoint = getEndpoint('qr_code');
      console.log('Usando endpoint:', endpoint);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          instanceName: instanceName.trim() 
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const blob = await response.blob();
      console.log('QR Code atualizado, tipo:', blob.type);
      
      setConnectionStatus('connecting');
      return blob;
    } catch (error) {
      console.error('Erro ao atualizar QR Code:', error);
      setConnectionStatus('failed');
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const checkConnectionStatus = async (instanceName: string): Promise<boolean> => {
    try {
      console.log('Verificando status da conexão para:', instanceName);
      
      const endpoint = getEndpoint('confirm');
      console.log('Usando endpoint:', endpoint);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          instanceName: instanceName.trim() 
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const responseText = await response.text();
      console.log('Resposta do status:', responseText);
      
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Erro ao parsear resposta JSON:', parseError);
        return false;
      }

      if (responseData && responseData.respond === "positivo") {
        console.log('Conexão confirmada!');
        setConnectionStatus('connected');
        
        // Atualizar status no Supabase
        const { error } = await supabase.rpc('mark_instance_connected', {
          p_user_id: (await supabase.auth.getUser()).data.user?.id || '',
          p_instance_name: instanceName.trim(),
          p_phone_number: responseData.phone_number || null
        });

        if (error) {
          console.error('Erro ao atualizar status no Supabase:', error);
        }

        return true;
      } else if (responseData && responseData.respond === "negativo") {
        console.log('Conexão ainda não estabelecida');
        return false;
      }

      console.log('Resposta inesperada:', responseData);
      return false;
    } catch (error) {
      console.error('Erro ao verificar status da conexão:', error);
      return false;
    }
  };

  const getInstanceStatus = async (instanceName: string) => {
    try {
      const { data, error } = await supabase
        .from('evolution_instances')
        .select('*')
        .eq('instance_name', instanceName.trim())
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Erro ao buscar status da instância:', error);
        return null;
      }

      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Erro ao verificar status da instância:', error);
      return null;
    }
  };

  return {
    createInstance,
    updateQrCode,
    checkConnectionStatus,
    getInstanceStatus,
    isConnecting,
    connectionStatus,
    setConnectionStatus,
    // Expor endpoints para debug
    endpoints: {
      instance: getEndpoint('instance'),
      qr_code: getEndpoint('qr_code'),
      confirm: getEndpoint('confirm')
    }
  };
};