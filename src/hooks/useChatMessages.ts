
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ChatMessage, AfiliadoMensagem } from '@/types/chat';
import { parseMessage } from '@/utils/chatUtils';

export function useChatMessages(selectedChat: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      setLoading(true);
      console.log(`Fetching messages for conversation: ${conversationId}`);
      
      const { data: historyData, error: historyError } = await supabase
        .from('n8n_chat_histories')
        .select('*')
        .eq('session_id', conversationId)
        .order('id', { ascending: true });
      
      if (historyError) {
        console.error('Error fetching chat history:', historyError);
        throw historyError;
      }
      
      console.log(`Fetched ${historyData?.length || 0} history records`);
      console.log('Sample record:', historyData && historyData.length > 0 ? historyData[0] : 'No records');
      
      let allMessages: ChatMessage[] = [];
      
      if (historyData && historyData.length > 0) {
        historyData.forEach((chatMsg: any, index: number) => {
          console.log(`Processing message ${index + 1} with id: ${chatMsg.id}`);
          
          try {
            let messageContent = '';
            let role = 'user';
            
            if (chatMsg.message) {
              const messageData = typeof chatMsg.message === 'string' 
                ? JSON.parse(chatMsg.message) 
                : chatMsg.message;
              
              if (messageData.content) {
                messageContent = messageData.content;
              } else if (messageData.text) {
                messageContent = messageData.text;
              } else if (typeof messageData === 'string') {
                messageContent = messageData;
              }
              
              // Determinar o papel baseado no conteúdo ou outras propriedades
              if (messageData.role) {
                role = messageData.role;
              } else if (messageData.sender) {
                role = messageData.sender === 'bot' ? 'assistant' : 'user';
              }
            }
            
            if (messageContent) {
              const timestamp = chatMsg.hora || chatMsg.created_at || new Date().toISOString();
              
              allMessages.push({
                role,
                content: messageContent,
                timestamp,
                type: 'text'
              });
            }
          } catch (error) {
            console.error('Error parsing message:', error, chatMsg);
          }
        });
        
        setMessages(allMessages);
        console.log("Fetched and processed messages:", allMessages.length);
      } else {
        console.log("No messages found for this conversation");
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Erro ao carregar mensagens",
        description: "Ocorreu um erro ao carregar as mensagens.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Set up subscription for real-time message updates for the current chat
  useEffect(() => {
    if (!selectedChat) return;
    
    console.log(`Setting up realtime listener for n8n chat messages: ${selectedChat}`);
    
    const subscription = supabase
      .channel(`n8n_chat_messages_${selectedChat}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'n8n_chat_histories',
          filter: `session_id=eq.${selectedChat}`
        }, 
        (payload) => {
          console.log('🔥 NEW N8N MESSAGE VIA REALTIME:', payload);
          console.log('🔥 Payload new:', payload.new);
          console.log('🔥 Selected chat:', selectedChat);
          
          // Process the new message
          const chatMsg = payload.new as any;
          console.log('🔥 Message session_id:', chatMsg.session_id);
          console.log('🔥 Message hora:', chatMsg.hora);
          console.log('🔥 Message data:', chatMsg.message);
          
          try {
            let messageContent = '';
            let role = 'user';
            
            if (chatMsg.message) {
              const messageData = typeof chatMsg.message === 'string' 
                ? JSON.parse(chatMsg.message) 
                : chatMsg.message;
              
              if (messageData.content) {
                messageContent = messageData.content;
              } else if (messageData.text) {
                messageContent = messageData.text;
              } else if (typeof messageData === 'string') {
                messageContent = messageData;
              }
              
              if (messageData.role) {
                role = messageData.role;
              } else if (messageData.sender) {
                role = messageData.sender === 'bot' ? 'assistant' : 'user';
              }
            }
            
            if (messageContent) {
              const timestamp = chatMsg.hora || chatMsg.created_at || new Date().toISOString();
              
              const newMessage: ChatMessage = {
                role,
                content: messageContent,
                timestamp,
                type: 'text'
              };
              
              console.log("🔥 Adding new message from realtime:", newMessage);
              setMessages(prevMessages => {
                console.log('🔥 Previous messages count:', prevMessages.length);
                const updated = [...prevMessages, newMessage];
                console.log('🔥 Updated messages count:', updated.length);
                return updated;
              });
            } else {
              console.log('🔥 No valid message content found');
            }
          } catch (error) {
            console.error('🔥 Error processing realtime message:', error);
          }
        }
      )
      .subscribe((status) => {
        console.log('🔥 N8N Subscription status:', status);
      });
    
    console.log(`N8N Realtime subscription created for chat: ${selectedChat}`);
      
    return () => {
      console.log(`Cleaning up N8N realtime subscription for chat: ${selectedChat}`);
      subscription.unsubscribe();
    };
  }, [selectedChat]);

  // Fetch messages when selected chat changes
  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat);
    } else {
      setMessages([]);
      setLoading(false);
    }
  }, [selectedChat, fetchMessages]);

  const handleNewMessage = (message: ChatMessage) => {
    console.log("Adding new message to local state:", message);
    setMessages(currentMessages => [...currentMessages, message]);
  };

  return { messages, loading, handleNewMessage, fetchMessages };
}
