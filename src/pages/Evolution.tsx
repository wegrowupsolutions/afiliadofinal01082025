import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Link, Bot, Plus, QrCode, Loader2, RefreshCw, Check, List } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Evolution = () => {
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [instanceName, setInstanceName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [confirmationStatus, setConfirmationStatus] = useState<'waiting' | 'confirmed' | 'failed' | null>(null);
  const [userInstances, setUserInstances] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showInstancesList, setShowInstancesList] = useState(false);
  const statusCheckIntervalRef = useRef<number | null>(null);
  const retryCountRef = useRef<number>(0);
  const maxRetries = 3;
  
  useEffect(() => {
    if (user) {
      loadUserInstances();
    }
    return () => {
      if (statusCheckIntervalRef.current !== null) {
        clearInterval(statusCheckIntervalRef.current);
      }
    };
  }, [user]);

  const loadUserInstances = async () => {
    if (!user?.email) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('manage-evolution-instance', {
        body: { 
          action: 'list',
          userEmail: user.email
        }
      });

      if (error) throw error;
      
      setUserInstances(data.instances || []);
      setUserProfile(data.user || null);
      
      console.log('Loaded user profile:', data.user);
      console.log('Loaded instances:', data.instances?.length || 0);
    } catch (error) {
      console.error('Error loading user instances:', error);
      toast({
        title: "Erro ao carregar instâncias",
        description: "Não foi possível carregar suas instâncias.",
        variant: "destructive"
      });
    }
  };
  
  const checkConnectionStatus = async () => {
    try {
      console.log('Checking connection status for:', instanceName);
      const response = await fetch('https://webhook.serverwegrowup.com.br/webhook/confirma_afiliado', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          instanceName: instanceName.trim(),
          userEmail: user?.email // Enviar email do usuário
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
            
            // Marcar instância como conectada no banco
            if (user?.email) {
              await supabase.functions.invoke('manage-evolution-instance', {
                body: { 
                  action: 'connect', 
                  instanceName: instanceName.trim(),
                  phoneNumber: responseData.phoneNumber || null,
                  userEmail: user.email
                }
              });
            }
            
            setConfirmationStatus('confirmed');
            retryCountRef.current = 0;
            loadUserInstances(); // Recarregar lista de instâncias
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
              retryCountRef.current = 0;
              toast({
                title: "Falha na conexão",
                description: "Não foi possível conectar após várias tentativas. Obtendo novo QR code...",
                variant: "destructive"
              });
              updateQrCode();
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
  
  const updateQrCode = async () => {
    try {
      setIsLoading(true);
      console.log('Updating QR code for instance:', instanceName);
      const response = await fetch('https://webhook.serverwegrowup.com.br/webhook/atualizar_qr_code_afiliado', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          instanceName: instanceName.trim(),
          userEmail: user?.email // Enviar email do usuário
        }),
      });
      
      console.log('QR code update response status:', response.status);
      
      if (response.ok) {
        const blob = await response.blob();
        console.log('Received blob content type:', blob.type);
        
        const qrCodeUrl = URL.createObjectURL(blob);
        setQrCodeData(qrCodeUrl);
        setConfirmationStatus('waiting');
        retryCountRef.current = 0;
        console.log('QR code updated successfully');
        
        if (statusCheckIntervalRef.current !== null) {
          clearInterval(statusCheckIntervalRef.current);
        }
        
        console.log('Starting new polling interval');
        statusCheckIntervalRef.current = window.setInterval(() => {
          checkConnectionStatus();
        }, 10000);
        
        toast({
          title: "QR Code atualizado",
          description: "Escaneie o novo QR code para conectar seu WhatsApp.",
        });
      } else {
        const errorText = await response.text();
        console.error('Falha ao atualizar QR code:', errorText);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o QR code. Tente novamente.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar QR code:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o QR code.",
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

    if (!user?.email) {
      toast({
        title: "Erro de autenticação",
        description: "Usuário não autenticado.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setQrCodeData(null);
    setConfirmationStatus(null);
    retryCountRef.current = 0;
    
    try {
      console.log('Creating instance with name:', instanceName);
      
      // Criar instância no banco primeiro
      const { error: createError } = await supabase.functions.invoke('manage-evolution-instance', {
        body: { 
          action: 'create', 
          instanceName: instanceName.trim(),
          userEmail: user.email
        }
      });

      if (createError) {
        throw new Error('Erro ao criar instância no banco: ' + createError.message);
      }

      // Depois criar no webhook
      const response = await fetch('https://webhook.serverwegrowup.com.br/webhook/instancia_evolution_afiliado', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          instanceName: instanceName.trim(),
          userEmail: user?.email // Enviar email do usuário
        }),
      });
      
      console.log('Create instance response status:', response.status);
      
      if (response.ok) {
        const blob = await response.blob();
        console.log('Received blob content type:', blob.type);
        
        const qrCodeUrl = URL.createObjectURL(blob);
        setQrCodeData(qrCodeUrl);
        setConfirmationStatus('waiting');
        
        if (statusCheckIntervalRef.current !== null) {
          clearInterval(statusCheckIntervalRef.current);
        }
        
        console.log('Starting status checking interval');
        statusCheckIntervalRef.current = window.setInterval(() => {
          checkConnectionStatus();
        }, 10000);
        
        loadUserInstances(); // Recarregar lista de instâncias
        toast({
          title: "Instância criada!",
          description: "Escaneie o QR code para conectar seu WhatsApp.",
        });
      } else {
        const errorText = await response.text();
        console.error('Falha ao criar instância:', errorText);
        throw new Error('Falha ao criar instância');
      }
    } catch (error) {
      console.error('Erro ao criar instância:', error);
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
    retryCountRef.current = 0;
    setShowInstancesList(false);
    if (statusCheckIntervalRef.current !== null) {
      clearInterval(statusCheckIntervalRef.current);
      statusCheckIntervalRef.current = null;
    }
  };

  const disconnectInstance = async (instance: any) => {
    if (!user?.email) return;
    
    try {
      await supabase.functions.invoke('manage-evolution-instance', {
        body: { 
          action: 'disconnect', 
          instanceName: instance.instance_name,
          userEmail: user.email
        }
      });
      
      loadUserInstances();
      toast({
        title: "Instância desconectada",
        description: `Instância ${instance.instance_name} foi desconectada.`,
      });
    } catch (error) {
      console.error('Error disconnecting instance:', error);
      toast({
        title: "Erro",
        description: "Não foi possível desconectar a instância.",
        variant: "destructive"
      });
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
            <h1 className="text-2xl font-bold">Afiliado IA</h1>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-white/10 text-white border-0 px-3 py-1">
              {userProfile?.name || user?.user_metadata?.name || user?.email}
            </Badge>
            {userProfile?.phone && (
              <Badge variant="outline" className="bg-white/10 text-white border-0 px-2 py-1 text-xs">
                📞 {userProfile.phone}
              </Badge>
            )}
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
          <Button
            variant="outline"
            onClick={() => setShowInstancesList(!showInstancesList)}
            className="flex items-center gap-2"
          >
            <List className="h-4 w-4" />
            {showInstancesList ? 'Ocultar' : 'Ver'} Instâncias
          </Button>
        </div>
        
        {showInstancesList && (
          <Card className="mb-6 dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <List className="h-5 w-5" />
                Instâncias de {userProfile?.name || user?.email}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userProfile && (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="font-semibold text-sm text-gray-600 dark:text-gray-300 mb-2">Informações do Perfil</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div><span className="font-medium">Nome:</span> {userProfile.name}</div>
                    <div><span className="font-medium">Email:</span> {userProfile.email}</div>
                    {userProfile.phone && (
                      <div><span className="font-medium">Telefone:</span> {userProfile.phone}</div>
                    )}
                  </div>
                </div>
              )}
              
              {userInstances.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-300 text-center py-4">
                  Nenhuma instância encontrada.
                </p>
              ) : (
                <div className="space-y-3">{userInstances.map((instance) => (
                    <div
                      key={instance.id}
                      className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-600"
                    >
                      <div>
                        <h4 className="font-semibold">{instance.instance_name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Status: {instance.is_connected ? 'Conectada' : 'Desconectada'}
                        </p>
                        {instance.phone_number && (
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Telefone: {instance.phone_number}
                          </p>
                        )}
                        {instance.connected_at && (
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Conectada em: {new Date(instance.connected_at).toLocaleString('pt-BR')}
                          </p>
                        )}
                        {instance.profiles && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Usuário: {instance.profiles.full_name || instance.profiles.email}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Badge
                          variant={instance.is_connected ? "default" : "secondary"}
                          className={instance.is_connected ? "bg-green-500" : "bg-red-500"}
                        >
                          {instance.is_connected ? 'Conectada' : 'Desconectada'}
                        </Badge>
                        {instance.is_connected && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => disconnectInstance(instance)}
                          >
                            Desconectar
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="max-w-xl mx-auto">
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
        </div>
      </main>
    </div>
  );
};

export default Evolution;