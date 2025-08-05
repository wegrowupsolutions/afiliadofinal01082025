
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
        .from('afiliado_mensagens' as any)
        .select('*')
        .eq('remotejid', conversationId)
        .order('id', { ascending: true });
      
      if (historyError) {
        console.error('Error fetching chat history:', historyError);
        throw historyError;
      }
      
      console.log(`Fetched ${historyData?.length || 0} history records`);
      console.log('Sample record:', historyData && historyData.length > 0 ? historyData[0] : 'No records');
      
      let allMessages: ChatMessage[] = [];
      
      if (historyData && historyData.length > 0) {
        historyData.forEach((afiliadoMsg: any) => {
          console.log(`Processing message with timestamp: ${afiliadoMsg.timestamp}`);
          const parsedMessages = parseMessage(afiliadoMsg);
          if (parsedMessages.length > 0) {
            allMessages = [...allMessages, ...parsedMessages];
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
    
    console.log(`Setting up realtime listener for specific chat messages: ${selectedChat}`);
    
    const subscription = supabase
      .channel(`chat_messages_${selectedChat}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'afiliado_mensagens',
          filter: `remotejid=eq.${selectedChat}`
        }, 
        (payload) => {
          console.log('🔥 NEW MESSAGE VIA REALTIME:', payload);
          console.log('🔥 Payload new:', payload.new);
          console.log('🔥 Selected chat:', selectedChat);
          
          // Process the new message
          const afiliadoMsg = payload.new as any;
          console.log('🔥 Message remotejid:', afiliadoMsg.remotejid);
          console.log('🔥 Message timestamp:', afiliadoMsg.timestamp);
          console.log('🔥 Message conversation_history:', afiliadoMsg.conversation_history);
          
          const newMessages = parseMessage(afiliadoMsg);
          console.log('🔥 Parsed messages:', newMessages);
          
          if (newMessages.length > 0) {
            console.log("🔥 Adding new messages from realtime:", newMessages);
            setMessages(prevMessages => {
              console.log('🔥 Previous messages count:', prevMessages.length);
              const updated = [...prevMessages, ...newMessages];
              console.log('🔥 Updated messages count:', updated.length);
              return updated;
            });
          } else {
            console.log('🔥 No messages parsed from realtime data');
          }
        }
      )
      .subscribe((status) => {
        console.log('🔥 Subscription status:', status);
      });
    
    console.log(`Realtime subscription created for chat: ${selectedChat}`);
      
    return () => {
      console.log(`Cleaning up realtime subscription for chat: ${selectedChat}`);
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
