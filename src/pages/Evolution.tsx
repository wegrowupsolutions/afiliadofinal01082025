import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Link, Bot, Plus, QrCode, Loader2, RefreshCw, Check, Unplug } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useEvolutionApi } from '@/hooks/useEvolutionApi';
import { useEvolutionConnection } from '@/hooks/useEvolutionConnection';


const Evolution = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [instanceName, setInstanceName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [confirmationStatus, setConfirmationStatus] = useState<'waiting' | 'confirmed' | 'failed' | null>(null);
  const [connectedInstance, setConnectedInstance] = useState<{instance_name: string, phone_number?: string} | null>(null);
  const [showActiveConnectionMessage, setShowActiveConnectionMessage] = useState(false);
  const statusCheckIntervalRef = useRef<number | null>(null);
  const retryCountRef = useRef<number>(0);
  const maxRetries = 3;
  
  // Usar hooks para APIs e conexão
  const { 
    createInstance: createEvolutionInstance, 
    updateQrCode: updateEvolutionQrCode, 
    checkConnectionStatus: checkEvolutionConnectionStatus 
  } = useEvolutionApi();
  
  const { connectionStatus, loading: connectionLoading, refreshStatus, markManualDisconnection } = useEvolutionConnection();
  
  // Forçar verificação quando página carrega ou usuário muda
  useEffect(() => {
    if (user?.id && refreshStatus) {
      console.log('🔄 Forçando verificação de status na página Evolution');
      refreshStatus();
    }
  }, [user?.id, refreshStatus]);
  
  // Atualizar estado baseado na conexão realtime
  useEffect(() => {
    if (connectionStatus.isConnected && connectionStatus.instanceName) {
      console.log('✅ Conexão detectada via realtime:', connectionStatus);
      setConnectedInstance({
        instance_name: connectionStatus.instanceName,
        phone_number: connectionStatus.phoneNumber
      });
      
      // Se estava esperando confirmação, marcar como confirmado
      if (confirmationStatus === 'waiting') {
        setConfirmationStatus('confirmed');
        
        // Clear any existing interval
        if (statusCheckIntervalRef.current !== null) {
          clearInterval(statusCheckIntervalRef.current);
          statusCheckIntervalRef.current = null;
        }
        
        toast({
          title: "Conexão estabelecida!",
          description: "Seu WhatsApp foi conectado com sucesso via realtime.",
        });
      }
      
      // Mostrar mensagem se usuário retornou à página
      const hasVisitedBefore = sessionStorage.getItem('visitedEvolution');
      if (hasVisitedBefore && !qrCodeData) {
        setShowActiveConnectionMessage(true);
        setTimeout(() => {
          setShowActiveConnectionMessage(false);
        }, 5000);
      }
      sessionStorage.setItem('visitedEvolution', 'true');
    } else if (!connectionStatus.isConnected) {
      console.log('ℹ️ Nenhuma conexão ativa detectada');
      setConnectedInstance(null);
      
      // Se estava em modo conectado mas agora perdeu conexão, limpar states
      if (connectedInstance) {
        console.log('🔄 Limpando estados devido à perda de conexão');
        setConfirmationStatus(null);
        setQrCodeData(null);
        setShowActiveConnectionMessage(false);
        
        // Limpar interval se ativo
        if (statusCheckIntervalRef.current !== null) {
          clearInterval(statusCheckIntervalRef.current);
          statusCheckIntervalRef.current = null;
        }
        
        toast({
          title: "Conexão perdida",
          description: "Sua instância foi desconectada. Você pode criar uma nova conexão.",
          variant: "destructive"
        });
      }
    }
  }, [connectionStatus, confirmationStatus, qrCodeData, toast, connectedInstance]);
  
  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (statusCheckIntervalRef.current !== null) {
        clearInterval(statusCheckIntervalRef.current);
      }
    };
  }, []);
  
  const checkConnectionStatus = async () => {
    try {
      console.log('Checking connection status for:', instanceName);
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
        const responseText = await response.text();
        console.log('Connection status response:', responseText);
        
        let responseData;
        
        try {
          responseData = JSON.parse(responseText);
          console.log('Parsed response data:', responseData);
        } catch (parseError) {
          console.error('Error parsing response JSON:', parseError);
          toast({
            title: "Erro no formato da resposta",
            description: "Não foi possível processar a resposta do servidor.",
            variant: "destructive"
          });
          return;
        }
        
        if (responseData && typeof responseData.respond === 'string') {
          const status = responseData.respond;
          console.log('Response status value:', status);
          
          if (status === "positivo") {
            console.log('Connection confirmed - stopping interval');
            if (statusCheckIntervalRef.current !== null) {
              clearInterval(statusCheckIntervalRef.current);
              statusCheckIntervalRef.current = null;
            }
            setConfirmationStatus('confirmed');
            retryCountRef.current = 0; // Reset retry counter on success
            
            // Salvar dados no Supabase
            try {
              console.log('Salvando dados da instância no Supabase...');
              const { error } = await supabase.rpc('mark_instance_connected', {
                p_user_id: user?.id,
                p_instance_name: instanceName.trim(),
                p_phone_number: null // Será atualizado posteriormente se disponível
              });
              
              if (error) {
                console.error('Erro ao salvar dados no Supabase:', error);
                toast({
                  title: "Aviso",
                  description: "Conexão estabelecida, mas houve um problema ao salvar os dados.",
                  variant: "destructive"
                });
              } else {
                console.log('Dados salvos com sucesso no Supabase');
                
                // Sincronizar dados Evolution após conexão bem-sucedida
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
                  // Não falhar o fluxo principal se sync falhar
                }
                
                // Atualizar estado local para mostrar instância conectada
                setConnectedInstance({
                  instance_name: instanceName.trim(),
                  phone_number: undefined
                });
              }
            } catch (error) {
              console.error('Erro ao chamar RPC mark_instance_connected:', error);
            }
            
            toast({
              title: "Conexão estabelecida!",
              description: "Seu WhatsApp foi conectado com sucesso.",
              variant: "default" 
            });
          } else if (status === "negativo") {
            retryCountRef.current += 1;
            console.log(`Connection failed - attempt ${retryCountRef.current} of ${maxRetries}`);
            
            if (retryCountRef.current >= maxRetries) {
              console.log('Maximum retry attempts reached - updating QR code');
              if (statusCheckIntervalRef.current !== null) {
                clearInterval(statusCheckIntervalRef.current);
                statusCheckIntervalRef.current = null;
              }
              setConfirmationStatus('failed');
              retryCountRef.current = 0; // Reset retry counter
              toast({
                title: "Falha na conexão",
                description: "Não foi possível conectar após várias tentativas. Obtendo novo QR code...",
                variant: "destructive"
              });
              handleUpdateQrCode(); // Automatically get a new QR code
            } else {
              console.log(`Retrying... (${retryCountRef.current}/${maxRetries})`);
              toast({
                title: "Tentando novamente",
                description: `Tentativa ${retryCountRef.current} de ${maxRetries}`,
                variant: "default"
              });
            }
          } else {
            console.log('Unknown status value:', status);
            toast({
              title: "Status desconhecido",
              description: "Recebemos uma resposta inesperada do servidor.",
              variant: "destructive"
            });
          }
        } else {
          console.log('Response does not have a valid respond property:', responseData);
          toast({
            title: "Formato inesperado",
            description: "A resposta do servidor não está no formato esperado.",
            variant: "destructive"
          });
        }
      } else {
        console.error('Erro ao verificar status:', await response.text());
        toast({
          title: "Erro na verificação",
          description: "Não foi possível verificar o status da conexão.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao verificar status da conexão:', error);
      toast({
        title: "Erro de conexão",
        description: "Ocorreu um erro ao verificar o status da conexão.",
        variant: "destructive"
      });
    }
  };
  
  const handleUpdateQrCode = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Atualizando QR code usando useEvolutionApi:', instanceName.trim());
      
      const blob = await updateEvolutionQrCode(instanceName.trim());
      
      if (blob) {
        const qrCodeUrl = URL.createObjectURL(blob);
        setQrCodeData(qrCodeUrl);
        setConfirmationStatus('waiting');
        retryCountRef.current = 0;
        
        if (statusCheckIntervalRef.current !== null) {
          clearInterval(statusCheckIntervalRef.current);
        }
        
        console.log('✅ Reiniciando verificação de status');
        statusCheckIntervalRef.current = window.setInterval(async () => {
          try {
            const isConnected = await checkEvolutionConnectionStatus(instanceName.trim());
            if (isConnected) {
              clearInterval(statusCheckIntervalRef.current!);
              statusCheckIntervalRef.current = null;
              setConfirmationStatus('confirmed');
              setConnectedInstance({
                instance_name: instanceName.trim(),
                phone_number: undefined
              });
              
              toast({
                title: "Conexão estabelecida!",
                description: "Seu WhatsApp foi conectado com sucesso.",
              });
            }
          } catch (error) {
            console.error('Erro na verificação de status:', error);
          }
        }, 10000);
        
        toast({
          title: "QR Code atualizado",
          description: "Escaneie o novo QR code para conectar seu WhatsApp.",
        });
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar QR code:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o QR code. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCreateInstance = async () => {
    if (!instanceName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, informe um nome para a instância.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setQrCodeData(null);
    setConfirmationStatus(null);
    retryCountRef.current = 0;
    
    try {
      console.log('🚀 Criando instância usando useEvolutionApi:', instanceName.trim());
      const blob = await createEvolutionInstance(instanceName.trim());
      
      if (blob) {
        const qrCodeUrl = URL.createObjectURL(blob);
        setQrCodeData(qrCodeUrl);
        setConfirmationStatus('waiting');
        
        if (statusCheckIntervalRef.current !== null) {
          clearInterval(statusCheckIntervalRef.current);
        }
        
        console.log('✅ Iniciando verificação de status a cada 10 segundos');
        statusCheckIntervalRef.current = window.setInterval(async () => {
          try {
            const isConnected = await checkEvolutionConnectionStatus(instanceName.trim());
            if (isConnected) {
              clearInterval(statusCheckIntervalRef.current!);
              statusCheckIntervalRef.current = null;
              setConfirmationStatus('confirmed');
              setConnectedInstance({
                instance_name: instanceName.trim(),
                phone_number: undefined
              });
              
              toast({
                title: "Conexão estabelecida!",
                description: "Seu WhatsApp foi conectado com sucesso.",
              });
            }
          } catch (error) {
            console.error('Erro na verificação de status:', error);
          }
        }, 10000);
        
        toast({
          title: "Instância criada!",
          description: "Escaneie o QR code para conectar seu WhatsApp.",
        });
      }
    } catch (error) {
      console.error('❌ Erro ao criar instância:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a instância. Tente novamente.",
        variant: "destructive"
      });
      setConfirmationStatus(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryAgain = () => {
    setIsLoading(true);
    setQrCodeData(null);
    setConfirmationStatus(null);
    retryCountRef.current = 0; // Reset retry counter
    handleCreateInstance();
  };

  const resetQrCode = () => {
    setQrCodeData(null);
    setConfirmationStatus(null);
    retryCountRef.current = 0; // Reset retry counter
    if (statusCheckIntervalRef.current !== null) {
      clearInterval(statusCheckIntervalRef.current);
      statusCheckIntervalRef.current = null;
    }
  };

  const handleDisconnectInstance = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      console.log('🔌 Iniciando processo de desconexão...');
      
      // Marcar desconexão manual para evitar interferência do hook realtime
      if (markManualDisconnection) {
        markManualDisconnection();
      }
      // Tentar identificar instância para limpar na Evolution API
      let instanceNameToDelete = connectionStatus.instanceName || connectedInstance?.instance_name;
      
      console.log('🔍 Nome da instância a ser desconectada:', instanceNameToDelete);
      
      // Se não tem nome da instância no status, buscar no banco
      if (!instanceNameToDelete) {
        console.log('🔍 Buscando nome da instância no banco...');
        const { data: kiwifyData } = await supabase
          .from('kiwify')
          .select('"Nome da instancia da Evolution"')
          .eq('user_id', user.id)
          .maybeSingle();
          
        instanceNameToDelete = kiwifyData?.['Nome da instancia da Evolution'];
        console.log('📊 Nome da instância encontrado no banco:', instanceNameToDelete);
      }

      // Chamar Evolution API se temos nome da instância
      if (instanceNameToDelete) {
        try {
          console.log('🔌 Calling Evolution API to logout/delete instance:', instanceNameToDelete);
          await supabase.functions.invoke('evolution-logout-delete', {
            body: { instanceName: instanceNameToDelete }
          });
          console.log('✅ Evolution API cleanup completed');
        } catch (error) {
          console.log('⚠️ Evolution API error (continuing with Supabase):', error);
          // Continuar mesmo se Evolution falhar
        }
      } else {
        console.log('⚠️ Nenhuma instância encontrada para deletar da Evolution API');
      }
      
      console.log('💾 Atualizando dados no Supabase...');
      
      // Atualizar dados no Supabase
      const { error } = await supabase
        .from('kiwify')
        .update({
          "Nome da instancia da Evolution": null,
          remojid: null,
          evo_instance: null,
          is_connected: false,
          connected_at: null,
          disconnected_at: new Date().toISOString(),
          evolution_instance_id: null,
          evolution_profile_name: null,
          evolution_profile_picture_url: null,
          evolution_profile_status: null,
          evolution_server_url: null,
          evolution_api_key: null,
          evolution_integration_data: null,
          evolution_raw_data: null,
          evolution_last_sync: null
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Erro ao desconectar instância:', error);
        toast({
          title: "Erro ao desconectar",
          description: "Não foi possível desconectar a instância. Tente novamente.",
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Dados atualizados no Supabase com sucesso');

      // Limpar estados locais IMEDIATAMENTE
      setConnectedInstance(null);
      setQrCodeData(null);
      setConfirmationStatus(null);
      setShowActiveConnectionMessage(false);
      setInstanceName('');
      
      // Limpar interval se ativo
      if (statusCheckIntervalRef.current !== null) {
        clearInterval(statusCheckIntervalRef.current);
        statusCheckIntervalRef.current = null;
      }

      console.log('🧹 Estados locais limpos');

      toast({
        title: "Instância desconectada",
        description: "Sua instância foi desconectada com sucesso. Você pode criar uma nova conexão.",
      });

    } catch (error) {
      console.error('💥 Erro ao desconectar:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado ao desconectar.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <header className="bg-petshop-blue dark:bg-gray-800 text-white shadow-md transition-colors duration-300">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/dashboard')}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Bot className="h-8 w-8 text-petshop-gold" />
            <h1 className="text-2xl font-bold">Afiliado AI</h1>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-white/10 text-white border-0 px-3 py-1">
              {user?.user_metadata?.name || user?.email}
            </Badge>
            <ThemeToggle />
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800 dark:text-white">
            <Link className="h-6 w-6 text-blue-500 dark:text-blue-400" />
            Conectar Evolution
          </h2>
        </div>
        
        {/* Mensagem de conexão ativa quando usuário retorna */}
        {showActiveConnectionMessage && connectedInstance && (
          <div className="max-w-xl mx-auto mb-6">
            <Card className="border-2 border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 shadow-lg animate-pulse">
              <CardContent className="pt-6">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800/50 rounded-full flex items-center justify-center mx-auto">
                    <Bot className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                    🔗 Conexão Ativa Detectada!
                  </h3>
                  <p className="text-blue-700 dark:text-blue-300 text-sm">
                    Sua instância <span className="font-semibold">{connectedInstance.instance_name}</span> está ativa e funcionando.
                  </p>
                  <Button 
                    onClick={() => setShowActiveConnectionMessage(false)}
                    variant="outline"
                    size="sm"
                    className="border-blue-300 text-blue-600 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-400 dark:hover:bg-blue-800/30"
                  >
                    Entendi
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        <div className="max-w-xl mx-auto">
          {(connectedInstance || connectionStatus.isConnected) && !qrCodeData && confirmationStatus !== 'confirmed' && (
            <Card className="dark:bg-gray-800 shadow-lg border-green-100 dark:border-green-900/30 mb-6">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                    <Check className="h-10 w-10 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white">Instância Conectada</h3>
                   <p className="text-gray-600 dark:text-gray-300">
                     Você já possui uma instância <span className="font-semibold">{connectedInstance?.instance_name || connectionStatus.instanceName}</span> conectada
                     {(connectedInstance?.phone_number || connectionStatus.phoneNumber) && (
                       <span> ao número <span className="font-semibold">{connectedInstance?.phone_number || connectionStatus.phoneNumber}</span></span>
                     )}.
                   </p>
                   <div className="flex gap-3 justify-center">
                    <Button 
                      onClick={() => navigate('/chats')}
                      variant="default"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Ir para Conversas
                    </Button>
                    <Button 
                      onClick={handleDisconnectInstance}
                      disabled={isLoading}
                      variant="destructive"
                      className="px-6 py-2"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Unplug className="h-4 w-4 mr-2" />
                      )}
                      Desconectar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Só mostrar o card de criação se não há instância conectada */}
          {!connectedInstance && !connectionStatus.isConnected && (
            <Card className="dark:bg-gray-800 shadow-lg border-green-100 dark:border-green-900/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  {qrCodeData ? (
                    <QrCode className="h-5 w-5" />
                  ) : (
                    <Plus className="h-5 w-5" />
                  )}
                  {qrCodeData ? "Conectar WhatsApp" : "Criar Nova Instância"}
                </CardTitle>
              </CardHeader>
            <CardContent className="space-y-6">
              {qrCodeData ? (
                <div className="space-y-6 text-center">
                  {confirmationStatus === 'waiting' ? (
                    <>
                      <div className="bg-white p-4 rounded-md inline-block mx-auto">
                        <img 
                          src={qrCodeData} 
                          alt="QR Code para conectar WhatsApp" 
                          className="mx-auto max-w-full h-auto"
                          style={{ maxHeight: '250px' }}
                        />
                      </div>
                      
                      <div className="space-y-2 text-center">
                        <h3 className="font-medium text-lg">Conecte seu WhatsApp</h3>
                        <ol className="text-sm text-gray-600 dark:text-gray-300 space-y-2 text-left list-decimal pl-5">
                          <li>Abra o WhatsApp no seu celular</li>
                          <li>Toque em Menu ou Configurações e selecione Aparelhos conectados</li>
                          <li>Toque em Conectar um aparelho</li>
                          <li>Escaneie o código QR</li>
                        </ol>
                        
                        <div className="mt-4 flex items-center justify-center space-x-2 text-amber-600 dark:text-amber-400">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>
                            Aguardando conexão
                            {retryCountRef.current > 0 ? ` (Tentativa ${retryCountRef.current}/${maxRetries})` : '...'}
                          </span>
                         </div>
                       </div>
                     </>
                   ) : confirmationStatus === 'confirmed' ? (
                    <div className="p-6 text-center">
                      <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="h-10 w-10 text-green-600 dark:text-green-400" />
                      </div>
                      <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Conectado com Sucesso!</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Seu WhatsApp foi conectado à instância <span className="font-semibold">{instanceName}</span>.
                      </p>
                      <Button 
                        onClick={() => navigate('/dashboard')}
                        variant="default"
                        className="mt-4"
                      >
                        Voltar ao Dashboard
                      </Button>
                    </div>
                  ) : confirmationStatus === 'failed' ? (
                    <div className="p-6 text-center">
                      <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Falha na Conexão</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Não foi possível conectar o WhatsApp à instância <span className="font-semibold">{instanceName}</span> após várias tentativas.
                      </p>
                      <Button 
                        onClick={handleTryAgain}
                        variant="default"
                        className="mt-4 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <span className="flex items-center justify-center">
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processando...
                          </span>
                        ) : (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Tentar Novamente
                          </>
                        )}
                      </Button>
                    </div>
                  ) : null}
                  
                  {confirmationStatus !== 'confirmed' && confirmationStatus !== 'failed' && (
                    <Button 
                      onClick={resetQrCode}
                      variant="outline"
                      className="mt-4"
                    >
                      Voltar
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor="instance-name">Nome da Instância</Label>
                      <Input 
                        id="instance-name" 
                        placeholder="Ex: Atendimento Principal" 
                        className="dark:bg-gray-700"
                        value={instanceName}
                        onChange={(e) => setInstanceName(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      onClick={handleCreateInstance}
                      className="w-full bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="flex items-center justify-center">
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Criando...
                        </span>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Criar Instância
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Evolution;
