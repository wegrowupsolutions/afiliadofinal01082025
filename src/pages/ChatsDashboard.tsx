
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import ChatHeader from '@/components/chat/ChatHeader';
import ChatLayout from '@/components/chat/ChatLayout';
import { useConversations } from '@/hooks/useConversations';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';
import { useChatMessages } from '@/hooks/useChatMessages';
import PauseDurationDialog from '@/components/PauseDurationDialog';

const ChatsDashboard = () => {
  const { user, signOut } = useAuth();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState('');
  const [pauseDialogOpen, setPauseDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Use custom hooks for data fetching and state management
  const { 
    conversations, 
    setConversations, 
    loading: conversationsLoading, 
    updateConversationLastMessage, 
    fetchConversations 
  } = useConversations();
  
  const { 
    messages, 
    loading: messagesLoading, 
    handleNewMessage 
  } = useChatMessages(selectedChat);
  
  // Set up real-time listeners for new chat messages
  useRealtimeUpdates({ 
    updateConversationLastMessage, 
    fetchConversations 
  });

  // Find the currently selected conversation
  const selectedConversation = conversations.find(conv => conv.id === selectedChat);

  const openPauseDialog = (phoneNumber: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPhoneNumber(phoneNumber);
    setPauseDialogOpen(true);
  };

  const closePauseDialog = () => {
    setPauseDialogOpen(false);
  };

  const pauseBot = async (duration: number | null) => {
    try {
      setIsLoading(prev => ({ ...prev, [`pause-${selectedPhoneNumber}`]: true }));
      
      const response = await fetch('https://webhook.n8nlabz.com.br/webhook/pausa_bot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phoneNumber: selectedPhoneNumber,
          duration,
          unit: 'seconds'
        }),
      });
      
      if (!response.ok) {
        throw new Error('Erro ao pausar o bot');
      }
      
      toast({
        title: "Bot pausado",
        description: duration ? `Bot pausado com sucesso para ${selectedPhoneNumber} por ${duration} segundos` : `Bot não foi pausado para ${selectedPhoneNumber}`,
      });
      
    } catch (error) {
      console.error('Erro ao pausar bot:', error);
      toast({
        title: "Erro ao pausar bot",
        description: "Ocorreu um erro ao pausar o bot.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(prev => ({ ...prev, [`pause-${selectedPhoneNumber}`]: false }));
      closePauseDialog();
    }
  };

  const startBot = async (phoneNumber: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIsLoading(prev => ({ ...prev, [`start-${phoneNumber}`]: true }));
      
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
        title: "Bot ativado",
        description: `Bot ativado com sucesso para ${phoneNumber}`
      });
    } catch (error) {
      console.error('Erro ao iniciar bot:', error);
      toast({
        title: "Erro ao ativar bot",
        description: "Ocorreu um erro ao ativar o bot.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(prev => ({ ...prev, [`start-${phoneNumber}`]: false }));
    }
  };

  // Mark a conversation as read when selected
  const markConversationRead = (sessionId: string) => {
    setConversations(currentConversations => 
      currentConversations.map(conv => {
        if (conv.id === sessionId) {
          return { ...conv, unread: 0 };
        }
        return conv;
      })
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <ChatHeader signOut={signOut} />
      
      <PauseDurationDialog 
        isOpen={pauseDialogOpen}
        onClose={closePauseDialog}
        onConfirm={pauseBot}
        phoneNumber={selectedPhoneNumber}
      />

      <div className="flex-1 overflow-hidden">
        <ChatLayout 
          conversations={conversations}
          selectedChat={selectedChat}
          setSelectedChat={setSelectedChat}
          isLoading={isLoading}
          openPauseDialog={openPauseDialog}
          startBot={startBot}
          loading={conversationsLoading || messagesLoading}
          messages={messages}
          handleNewMessage={handleNewMessage}
          selectedConversation={selectedConversation}
          markConversationRead={markConversationRead}
        />
      </div>
    </div>
  );
};

export default ChatsDashboard;
