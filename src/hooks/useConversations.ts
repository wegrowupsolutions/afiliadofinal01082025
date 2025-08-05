
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Conversation, AfiliadoMensagem, Client, AfiliadoBaseLead } from '@/types/chat';
import { formatMessageTime } from '@/utils/chatUtils';

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const updateConversationLastMessage = async (sessionId: string) => {
    try {
      const { data: historyData, error: historyError } = await supabase
        .from('n8n_chat_histories')
        .select('*')
        .eq('session_id', sessionId)
        .order('id', { ascending: false })
        .limit(1);
      
      if (historyError) throw historyError;
      
      if (historyData && historyData.length > 0) {
        const chatMsg = historyData[0] as any;
        
        setConversations(currentConversations => {
          return currentConversations.map(conv => {
            if (conv.id === sessionId) {
              let lastMessageContent = 'Sem mensagem';
              
              if (chatMsg.message) {
                try {
                  const messageData = typeof chatMsg.message === 'string' 
                    ? JSON.parse(chatMsg.message) 
                    : chatMsg.message;
                  
                  if (messageData.content) {
                    lastMessageContent = messageData.content;
                  } else if (messageData.text) {
                    lastMessageContent = messageData.text;
                  } else if (typeof messageData === 'string') {
                    lastMessageContent = messageData;
                  }
                } catch (e) {
                  lastMessageContent = typeof chatMsg.message === 'string' 
                    ? chatMsg.message 
                    : 'Mensagem inválida';
                }
              }
              
              const messageDate = chatMsg.hora || chatMsg.created_at || new Date();
                
              return {
                ...conv,
                lastMessage: lastMessageContent || 'Sem mensagem',
                time: formatMessageTime(new Date(messageDate)),
                unread: conv.unread + 1
              };
            }
            return conv;
          });
        });
      }
    } catch (error) {
      console.error('Error updating conversation last message:', error);
    }
  };

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      
      // Buscar sessões únicas da tabela n8n_chat_histories
      const { data: chatHistoryData, error: chatHistoryError } = await supabase
        .from('n8n_chat_histories')
        .select('session_id')
        .order('id', { ascending: false });
      
      if (chatHistoryError) throw chatHistoryError;
      
      if (!chatHistoryData || chatHistoryData.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }
      
      const uniqueSessionIds = Array.from(new Set(
        chatHistoryData.map((item: any) => item.session_id)
      ));
      
      // Criar conversas baseadas nas sessões encontradas
      const conversationsData: Conversation[] = uniqueSessionIds.map((sessionId: any) => {
        return {
          id: sessionId,
          name: `Chat ${sessionId.substring(0, 8)}...`,
          lastMessage: 'Carregando...',
          time: 'Recente',
          unread: 0,
          avatar: '🤖',
          phone: sessionId,
          email: 'Não informado',
          petName: 'Não informado',
          petType: 'Não informado',
          petBreed: 'Não informado',
          sessionId: sessionId
        };
      });
      
      // Buscar a última mensagem para cada conversa
      for (const conversation of conversationsData) {
        const { data: historyData, error: historyError } = await supabase
          .from('n8n_chat_histories')
          .select('*')
          .eq('session_id', conversation.sessionId)
          .order('id', { ascending: false })
          .limit(1);
        
        if (!historyError && historyData && historyData.length > 0) {
          const chatMsg = historyData[0] as any;
          
          let lastMessageContent = 'Sem mensagem';
          if (chatMsg.message) {
            try {
              const messageData = typeof chatMsg.message === 'string' 
                ? JSON.parse(chatMsg.message) 
                : chatMsg.message;
              
              if (messageData.content) {
                lastMessageContent = messageData.content;
              } else if (messageData.text) {
                lastMessageContent = messageData.text;
              } else if (typeof messageData === 'string') {
                lastMessageContent = messageData;
              }
            } catch (e) {
              lastMessageContent = typeof chatMsg.message === 'string' 
                ? chatMsg.message 
                : 'Mensagem inválida';
            }
          }
          
          conversation.lastMessage = lastMessageContent || 'Sem mensagem';
          
          const messageDate = chatMsg.hora || chatMsg.created_at || new Date();
          conversation.time = formatMessageTime(new Date(messageDate));
        }
      }
      
      setConversations(conversationsData);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Erro ao carregar conversas",
        description: "Ocorreu um erro ao carregar as conversas.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Initial fetch
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    setConversations,
    loading,
    updateConversationLastMessage,
    fetchConversations
  };
}
