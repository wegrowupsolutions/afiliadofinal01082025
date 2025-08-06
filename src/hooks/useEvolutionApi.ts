import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSystemConfigurations } from '@/hooks/useSystemConfigurations';

export const useEvolutionApi = () => {
  const { configurations } = useSystemConfigurations();
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'failed'>('idle');

  const getEvolutionEndpoint = (type: 'instance' | 'qr_code' | 'confirm') => {
    console.log('🔗 Obtendo endpoint Evolution para:', type);
    console.log('📋 Configurações disponíveis:', {
      webhook_instancia_evolution: configurations['webhook_instancia_evolution'],
      webhook_atualizar_qr_code: configurations['webhook_atualizar_qr_code'],
      webhook_confirma: configurations['webhook_confirma']
    });
    
    switch (type) {
      case 'instance':
        const instanceUrl = configurations['webhook_instancia_evolution'] || 'https://webhook.serverwegrowup.com.br/webhook/instancia_evolution_afiliado';
        console.log('✅ Endpoint instance:', instanceUrl);
        return instanceUrl;
      case 'qr_code':
        const qrUrl = configurations['webhook_atualizar_qr_code'] || 'https://webhook.serverwegrowup.com.br/webhook/atualizar_qr_code_afiliado';
        console.log('✅ Endpoint qr_code:', qrUrl);
        return qrUrl;
      case 'confirm':
        const confirmUrl = configurations['webhook_confirma'] || 'https://webhook.serverwegrowup.com.br/webhook/confirma_afiliado';
        console.log('✅ Endpoint confirm:', confirmUrl);
        return confirmUrl;
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
      const webhookUrl = configurations['webhook_mensagem'] || 'https://webhook.serverwegrowup.com.br/webhook/envia_mensagem_afiliado';
      
      console.log('🚀 Criando instância Evolution');
      console.log('📍 Endpoint:', endpoint);
      console.log('🔗 Webhook URL:', webhookUrl);
      console.log('📝 Nome da instância:', instanceName.trim());
      
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
      
      const endpoint = getEvolutionEndpoint('qr_code');
      console.log('🔄 Atualizando QR Code');
      console.log('📍 Endpoint:', endpoint);
      console.log('📝 Nome da instância:', instanceName.trim());
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: getHeaders(),
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

  // Função para salvar dados completos da conexão na tabela kiwify
  const saveConnectionData = async (instanceName: string, userId?: string) => {
    try {
      console.log('🔄 Salvando dados completos da conexão para:', instanceName);
      
      if (!userId) {
        console.error('❌ User ID não disponível para salvar dados');
        return;
      }

      // 1. Buscar dados completos da instância conectada
      const instanceData = await checkConnectionState(instanceName);
      console.log('📊 Dados da instância obtidos:', instanceData);
      
      // 2. Extrair número do WhatsApp e outros dados
      const phoneNumber = instanceData?.instance?.owner || 
                         instanceData?.instance?.profileName || 
                         instanceData?.owner ||
                         instanceData?.profileName ||
                         null;
      
      console.log('📞 Número extraído:', phoneNumber);
      
      // 3. Salvar/atualizar na tabela kiwify
      const updateData = {
        user_id: userId,
        'Nome da instancia da Evolution': instanceName,
        is_connected: true,
        connected_at: new Date().toISOString(),
        remojid: phoneNumber, // Usando a coluna existente para phone number
        evolution_raw_data: instanceData, // Salvar JSON completo para referência
        evolution_last_sync: new Date().toISOString()
      };

      console.log('💾 Dados para salvar:', updateData);

      const { data, error } = await supabase
        .from('kiwify')
        .upsert(updateData, {
          onConflict: 'user_id'
        });
        
      if (error) {
        console.error('❌ Erro ao salvar dados completos:', error);
      } else {
        console.log('✅ Dados completos salvos no Supabase com sucesso');
        console.log('📊 Resposta da atualização:', data);
        
        // Sincronizar dados Evolution após salvamento
        try {
          console.log('🔄 Iniciando sincronização de dados Evolution...');
          const syncResponse = await supabase.functions.invoke('sync-evolution-kiwify');
          
          if (syncResponse.error) {
            console.error('⚠️ Erro na sincronização Evolution:', syncResponse.error);
          } else {
            console.log('✅ Dados Evolution sincronizados:', syncResponse.data);
          }
        } catch (syncError) {
          console.error('⚠️ Falha ao sincronizar dados Evolution:', syncError);
        }
      }
    } catch (error) {
      console.error('💥 Erro geral ao salvar dados da conexão:', error);
    }
  };

  const checkConnectionStatus = async (instanceName: string): Promise<boolean> => {
    try {
      console.log('Verificando status da conexão para:', instanceName);
      
      const endpoint = getEvolutionEndpoint('confirm');
      console.log('🔍 Verificando status da conexão');
      console.log('📍 Endpoint:', endpoint);
      console.log('📝 Nome da instância:', instanceName.trim());
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: getHeaders(),
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

      // Evolution API retorna diferentes formatos dependendo do status
      // Verificar resposta "positivo" do webhook
      if (responseData && (
        responseData.respond === "positivo" ||
        responseData.state === "open" || 
        responseData.status === "open" || 
        responseData.instance?.state === "open"
      )) {
        console.log('Conexão confirmada!');
        setConnectionStatus('connected');
        
        // Obter user_id atual
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) {
          console.error('Erro ao obter usuário:', userError);
          return true; // Continuar mesmo com erro de usuário
        }

        // NOVO: Buscar dados completos da instância e salvar na tabela kiwify
        await saveConnectionData(instanceName.trim(), userData.user?.id);

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

  // Buscar todas as instâncias
  const fetchInstances = async () => {
    try {
      const response = await fetch('https://evolution.serverwegrowup.com.br/instance/fetchInstances', {
        method: 'GET',
        headers: {
          'apikey': '066327121bd64f8356c26e9edfa1799d'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar instâncias:', error);
      throw error;
    }
  };

  // Verificar estado da conexão
  const checkConnectionState = async (instanceName: string) => {
    try {
      const response = await fetch(`https://evolution.serverwegrowup.com.br/instance/connectionState/${instanceName}`, {
        method: 'GET',
        headers: {
          'apikey': '066327121bd64f8356c26e9edfa1799d'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro ao verificar estado da conexão:', error);
      throw error;
    }
  };

  // Fazer logout da instância
  const logoutInstance = async (instanceName: string) => {
    try {
      const response = await fetch(`https://evolution.serverwegrowup.com.br/instance/logout/${instanceName}`, {
        method: 'DELETE',
        headers: {
          'apikey': '066327121bd64f8356c26e9edfa1799d'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro ao fazer logout da instância:', error);
      throw error;
    }
  };

  // Deletar instância
  const deleteInstance = async (instanceName: string) => {
    try {
      const response = await fetch(`https://evolution.serverwegrowup.com.br/instance/delete/${instanceName}`, {
        method: 'DELETE',
        headers: {
          'apikey': '066327121bd64f8356c26e9edfa1799d'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro ao deletar instância:', error);
      throw error;
    }
  };

  return {
    createInstance,
    updateQrCode,
    checkConnectionStatus,
    getInstanceStatus,
    fetchInstances,
    checkConnectionState,
    logoutInstance,
    deleteInstance,
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