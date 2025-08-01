
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import PauseDurationDialog from '@/components/PauseDurationDialog';

interface ChatBotActionsProps {
  selectedPhoneNumber: string;
  selectedChat: string | null;
  isLoading: Record<string, boolean>;
}

const ChatBotActions = ({ selectedPhoneNumber, selectedChat, isLoading }: ChatBotActionsProps) => {
  const [pauseDialogOpen, setPauseDialogOpen] = useState(false);
  const { toast } = useToast();

  const openPauseDialog = (phoneNumber: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPauseDialogOpen(true);
  };

  const closePauseDialog = () => {
    setPauseDialogOpen(false);
  };

  const pauseBot = async (phoneNumber: string, duration: number | null) => {
    try {
      const response = await fetch('https://webhook.n8nlabz.com.br/webhook/pausa_bot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phoneNumber,
          duration,
          unit: 'seconds'
        }),
      });
      
      if (!response.ok) {
        throw new Error('Erro ao pausar o bot');
      }
      
      toast({
        title: "Bot pausado",
        description: duration ? `O bot foi pausado para ${phoneNumber} por ${duration} segundos` : `O bot não foi pausado para ${phoneNumber}`,
      });
      
      closePauseDialog();
    } catch (error) {
      console.error('Erro ao pausar bot:', error);
      toast({
        title: "Erro ao pausar bot",
        description: "Ocorreu um erro ao tentar pausar o bot.",
        variant: "destructive"
      });
    }
  };

  const startBot = async (phoneNumber: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch('https://webhook.n8nlabz.com.br/webhook/inicia_bot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });
      
      if (!response.ok) {
        throw new Error('Erro ao iniciar o bot');
      }
      
      toast({
        title: "Bot iniciado",
        description: `O bot foi iniciado para ${phoneNumber}`,
      });
    } catch (error) {
      console.error('Erro ao iniciar bot:', error);
      toast({
        title: "Erro ao iniciar bot",
        description: "Ocorreu um erro ao tentar iniciar o bot.",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <PauseDurationDialog 
        isOpen={pauseDialogOpen}
        onClose={closePauseDialog}
        onConfirm={(duration) => pauseBot(selectedPhoneNumber, duration)}
        phoneNumber={selectedPhoneNumber}
      />
    </>
  );
};

export default ChatBotActions;
