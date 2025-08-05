import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSystemConfigurations } from '@/hooks/useSystemConfigurations';

export const useEvolutionApi = () => {
  const { configurations } = useSystemConfigurations();
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'failed'>('idle');

  const getEvolutionEndpoint = (type: 'instance' | 'qr_code' | 'confirm') => {
    const baseUrl = configurations['evolution_api_url'] || 'https://evolution-api.serverwegrowup.com.br';
    const apiKey = configurations['evolution_api_key'];
    
    if (!apiKey) {
      console.warn('Evolution API Key não configurada');
    }
    
    switch (type) {
      case 'instance':
        return 'https://webhook.serverwegrowup.com.br/webhook/instancia_evolution_afiliado';
      case 'qr_code':
        return 'https://webhook.serverwegrowup.com.br/webhook/atualizar-qr-code-afiliado';
      case 'confirm':
        return 'https://webhook.serverwegrowup.com.br/webhook/confirma_afiliado';
      default:
        throw new Error(`Tipo de endpoint inválido: ${type}`);
    }
  };

  const getHeaders = () => {
    const apiKey = configurations['evolution_api_key'];
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
      headers['apikey'] = apiKey;
    }
    
    return headers;
  };

  const createInstance = async (instanceName: string): Promise<Blob | null> => {
    try {
      setIsConnecting(true);
      console.log('Criando instância Evolution:', { instanceName });
      
      const endpoint = getEvolutionEndpoint('instance');
      const webhookUrl = 'https://webhook.serverwegrowup.com.br/webhook/envia_mensagem_afiliado';
      
      console.log('Usando endpoint:', endpoint);
      console.log('Webhook URL:', webhookUrl);
      
      const requestBody = {
        instanceName: instanceName.trim(),
        webhook: webhookUrl.trim(),
        webhook_by_events: false,
        events: [
          "APPLICATION_STARTUP",
          "QRCODE_UPDATED", 
          "CONNECTION_UPDATE",
          "MESSAGES_UPSERT",
          "MESSAGES_UPDATE",
          "SEND_MESSAGE"
        ]
      };
      
      console.log('Request body:', requestBody);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const blob = await response.blob();
      console.log('QR Code recebido, tipo:', blob.type);
      
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
      
      const endpoint = `${getEvolutionEndpoint('qr_code')}/${instanceName.trim()}`;
      console.log('Usando endpoint:', endpoint);
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: getHeaders(),
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
      
      const endpoint = `${getEvolutionEndpoint('confirm')}/${instanceName.trim()}`;
      console.log('Usando endpoint:', endpoint);
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: getHeaders(),
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

      // Evolution API retorna diferentes formatos dependendo do status
      if (responseData && (responseData.state === "open" || responseData.status === "open" || responseData.instance?.state === "open")) {
        console.log('Conexão confirmada!');
        setConnectionStatus('connected');
        
        // Obter user_id atual
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) {
          console.error('Erro ao obter usuário:', userError);
          return true; // Continuar mesmo com erro de usuário
        }

        // Atualizar status no Supabase usando tabela kiwify
        console.log('Salvando instância conectada:', instanceName.trim());
        console.log('User ID:', userData.user?.id);
        console.log('Phone number:', responseData.instance?.owner || responseData.owner);
        
        try {
          const { error } = await supabase.rpc('mark_instance_connected', {
            p_user_id: userData.user?.id || '',
            p_instance_name: instanceName.trim(),
            p_phone_number: responseData.instance?.owner || responseData.owner || null
          });

          if (error) {
            console.error('Erro ao atualizar status no Supabase:', error);
          } else {
            console.log('Instância salva com sucesso no Supabase');
          }
        } catch (rpcError) {
          console.error('Erro na chamada RPC:', rpcError);
        }

        return true;
      } else if (responseData && (responseData.state === "close" || responseData.status === "close" || responseData.instance?.state === "close")) {
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
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('kiwify')
        .select('*')
        .eq('Nome da instancia da Evolution', instanceName.trim())
        .eq('user_id', userId)
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
    // Expor endpoints e configurações para debug
    endpoints: {
      instance: getEvolutionEndpoint('instance'),
      qr_code: getEvolutionEndpoint('qr_code'),
      confirm: getEvolutionEndpoint('confirm')
    },
    configurations: {
      apiUrl: configurations['evolution_api_url'],
      apiKey: configurations['evolution_api_key'] ? '***' : 'não configurada',
      webhookUrl: configurations['evolution_webhook_url']
    }
  };
};