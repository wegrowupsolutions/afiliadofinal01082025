
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
        .from('afiliado_mensagens' as any)
        .select('*')
        .eq('remotejid', sessionId)
        .order('id', { ascending: false })
        .limit(1);
      
      if (historyError) throw historyError;
      
      if (historyData && historyData.length > 0) {
        const afiliadoMsg = historyData[0] as any;
        
        setConversations(currentConversations => {
          return currentConversations.map(conv => {
            if (conv.id === sessionId) {
              let lastMessageContent = '';
              
              if (afiliadoMsg.conversation_history) {
                try {
                  const conversation = JSON.parse(afiliadoMsg.conversation_history);
                  if (Array.isArray(conversation) && conversation.length > 0) {
                    const lastMsg = conversation[conversation.length - 1];
                    lastMessageContent = lastMsg?.content || '';
                  } else if (conversation.content) {
                    lastMessageContent = conversation.content;
                  }
                } catch (e) {
                  lastMessageContent = afiliadoMsg.conversation_history;
                }
              }
              
              const messageDate = afiliadoMsg.timestamp 
                ? new Date(afiliadoMsg.timestamp) 
                : new Date();
                
              return {
                ...conv,
                lastMessage: lastMessageContent,
                time: formatMessageTime(messageDate),
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
      
      const { data: chatHistoryData, error: chatHistoryError } = await supabase
        .from('afiliado_mensagens' as any)
        .select('remotejid')
        .order('id', { ascending: false });
      
      if (chatHistoryError) throw chatHistoryError;
      
      if (!chatHistoryData || chatHistoryData.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }
      
      const uniqueSessionIds = Array.from(new Set(
        chatHistoryData.map((item: any) => item.remotejid)
      ));
      
      const { data: clientsData, error: clientsError } = await supabase
        .from('afiliado_base_leads')
        .select('*')
        .in('remotejid', uniqueSessionIds)
        .not('name', 'is', null);
      
      if (clientsError) throw clientsError;
      
      if (clientsData && clientsData.length > 0) {
        const conversationsData: Conversation[] = clientsData.map((lead: AfiliadoBaseLead) => {
          return {
            id: lead.remotejid,
            name: lead.name || 'Cliente sem nome',
            lastMessage: 'Carregando...',
            time: 'Recente',
            unread: 0,
            avatar: '👤',
            phone: lead.remotejid.replace('@s.whatsapp.net', ''),
            email: 'Não informado',
            petName: 'Não informado',
            petType: 'Não informado',
            petBreed: 'Não informado',
            sessionId: lead.remotejid
          };
        });
        
        for (const conversation of conversationsData) {
          const { data: historyData, error: historyError } = await supabase
            .from('afiliado_mensagens' as any)
            .select('*')
            .eq('remotejid', conversation.sessionId)
            .order('id', { ascending: false })
            .limit(1);
          
          if (!historyError && historyData && historyData.length > 0) {
            const afiliadoMsg = historyData[0] as any;
            
            let lastMessageContent = '';
            if (afiliadoMsg.conversation_history) {
              try {
                const conversation = JSON.parse(afiliadoMsg.conversation_history);
                if (Array.isArray(conversation) && conversation.length > 0) {
                  const lastMsg = conversation[conversation.length - 1];
                  lastMessageContent = lastMsg?.content || '';
                } else if (conversation.content) {
                  lastMessageContent = conversation.content;
                }
              } catch (e) {
                lastMessageContent = afiliadoMsg.conversation_history;
              }
            }
            
            conversation.lastMessage = lastMessageContent;
            
            const messageDate = afiliadoMsg.timestamp 
              ? new Date(afiliadoMsg.timestamp) 
              : new Date();
            
            conversation.time = formatMessageTime(messageDate);
          }
        }
        
        setConversations(conversationsData);
      } else {
        setConversations([]);
      }
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
