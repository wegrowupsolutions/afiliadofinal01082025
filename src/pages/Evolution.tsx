import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Link, PawPrint, Plus, QrCode, Loader2, RefreshCw, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useEvolutionApi } from '@/hooks/useEvolutionApi';
import { EvolutionEndpointsStatus } from '@/components/evolution/EvolutionEndpointsStatus';

const Evolution = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Use our custom Evolution API hook
  const {
    createInstance,
    updateQrCode: updateQrCodeApi,
    checkConnectionStatus: checkStatus,
    isConnecting,
    connectionStatus,
    setConnectionStatus,
    endpoints
  } = useEvolutionApi();
  
  const [instanceName, setInstanceName] = useState('');
  const [webhookPath, setWebhookPath] = useState('');
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [confirmationStatus, setConfirmationStatus] = useState<'waiting' | 'confirmed' | 'failed' | null>(null);
  const statusCheckIntervalRef = useRef<number | null>(null);
  const retryCountRef = useRef<number>(0);
  const maxRetries = 3;
  
  // Debug: Mostrar endpoints configurados
  useEffect(() => {
    console.log('Evolution endpoints configurados:', endpoints);
  }, [endpoints]);
  
  useEffect(() => {
    return () => {
      if (statusCheckIntervalRef.current !== null) {
        clearInterval(statusCheckIntervalRef.current);
      }
    };
  }, []);
  
  const checkConnectionStatus = async () => {
    try {
      console.log('Verificando status da conexão para:', instanceName);
      const isConnected = await checkStatus(instanceName);
      
      if (isConnected) {
        console.log('Conexão confirmada - parando interval');
        if (statusCheckIntervalRef.current !== null) {
          clearInterval(statusCheckIntervalRef.current);
          statusCheckIntervalRef.current = null;
        }
        setConfirmationStatus('confirmed');
        retryCountRef.current = 0;
        toast({
          title: "Conexão estabelecida!",
          description: "Seu WhatsApp foi conectado com sucesso.",
          variant: "default" 
        });
      } else {
        retryCountRef.current += 1;
        console.log(`Tentativa de conexão ${retryCountRef.current} de ${maxRetries}`);
        
        if (retryCountRef.current >= maxRetries) {
          console.log('Máximo de tentativas atingido - atualizando QR code');
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
          updateQrCode(); // Atualizar QR code automaticamente
        } else {
          console.log(`Tentando novamente... (${retryCountRef.current}/${maxRetries})`);
          toast({
            title: "Tentando novamente",
            description: `Tentativa ${retryCountRef.current} de ${maxRetries}`,
            variant: "default"
          });
        }
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
      console.log('Atualizando QR code para instância:', instanceName);
      const blob = await updateQrCodeApi(instanceName);
      
      if (blob) {
        const qrCodeUrl = URL.createObjectURL(blob);
        setQrCodeData(qrCodeUrl);
        setConfirmationStatus('waiting');
        retryCountRef.current = 0;
        console.log('QR code atualizado com sucesso');
        
        if (statusCheckIntervalRef.current !== null) {
          clearInterval(statusCheckIntervalRef.current);
        }
        
        console.log('Iniciando novo polling interval');
        statusCheckIntervalRef.current = window.setInterval(() => {
          checkConnectionStatus();
        }, 10000);
        
        toast({
          title: "QR Code atualizado",
          description: "Escaneie o novo QR code para conectar seu WhatsApp.",
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar QR code:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o QR code.",
        variant: "destructive"
      });
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

    if (!webhookPath.trim()) {
      toast({
        title: "Caminho do webhook obrigatório",
        description: "Por favor, informe o caminho do webhook.",
        variant: "destructive"
      });
      return;
    }

    setQrCodeData(null);
    setConfirmationStatus(null);
    retryCountRef.current = 0;
    
    try {
      console.log('Criando instância:', { instanceName, webhookPath });
      const blob = await createInstance(instanceName, webhookPath);
      
      if (blob) {
        const qrCodeUrl = URL.createObjectURL(blob);
        setQrCodeData(qrCodeUrl);
        setConfirmationStatus('waiting');
        
        if (statusCheckIntervalRef.current !== null) {
          clearInterval(statusCheckIntervalRef.current);
        }
        
        console.log('Iniciando interval de verificação de status');
        statusCheckIntervalRef.current = window.setInterval(() => {
          checkConnectionStatus();
        }, 10000);
        
        toast({
          title: "Instância criada!",
          description: "Escaneie o QR code para conectar seu WhatsApp.",
        });
      }
    } catch (error) {
      console.error('Erro ao criar instância:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a instância. Tente novamente.",
        variant: "destructive"
      });
      setConfirmationStatus(null);
    }
  };

  const handleTryAgain = () => {
    setQrCodeData(null);
    setConfirmationStatus(null);
    retryCountRef.current = 0;
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
            <PawPrint className="h-8 w-8 text-petshop-gold" />
            <h1 className="text-2xl font-bold">Pet Paradise</h1>
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
        
        {/* Status dos Endpoints */}
        <div className="mb-6">
          <EvolutionEndpointsStatus />
        </div>
        
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
                        disabled={isConnecting}
                      >
                        {isConnecting ? (
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
                    <div className="space-y-2">
                      <Label htmlFor="webhook-path">Caminho do Webhook</Label>
                      <Input 
                        id="webhook-path" 
                        placeholder="Ex: /webhook/atendimento" 
                        className="dark:bg-gray-700"
                        value={webhookPath}
                        onChange={(e) => setWebhookPath(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      onClick={handleCreateInstance}
                      className="w-full bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
                      disabled={isConnecting}
                    >
                      {isConnecting ? (
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
