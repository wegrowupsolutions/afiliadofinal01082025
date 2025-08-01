import { ChatMessage, AfiliadoMensagem, Conversation } from '@/types/chat';

export const extractHourFromTimestamp = (timestamp: string): string => {
  try {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } catch (error) {
    console.error('Error parsing timestamp:', error);
    return '';
  }
};

export const formatMessageTime = (date: Date): string => {
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  } else if (diffInDays === 1) {
    return 'Ontem';
  } else if (diffInDays < 7) {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return days[date.getDay()];
  } else {
    return date.toLocaleDateString('pt-BR');
  }
};

export const parseMessage = (afiliadoMsg: AfiliadoMensagem): ChatMessage[] => {
  const parsedMessages: ChatMessage[] = [];
  
  try {
    console.log('🔥 parseMessage called with:', afiliadoMsg);
    const timestamp = afiliadoMsg.timestamp ? extractHourFromTimestamp(afiliadoMsg.timestamp) : '';
    console.log('🔥 Extracted timestamp:', timestamp);
    
    if (afiliadoMsg.conversation_history) {
      console.log('🔥 conversation_history exists:', afiliadoMsg.conversation_history);
      try {
        const conversation = JSON.parse(afiliadoMsg.conversation_history);
        console.log('🔥 Parsed conversation:', conversation);
        
        if (Array.isArray(conversation)) {
          console.log('🔥 Conversation is array with length:', conversation.length);
          conversation.forEach((msg: any, index: number) => {
            console.log(`🔥 Processing message ${index}:`, msg);
            if (msg.role && msg.content) {
              const chatMessage = {
                role: msg.role,
                content: msg.content,
                timestamp: timestamp
              };
              console.log('🔥 Adding message to parsed:', chatMessage);
              parsedMessages.push(chatMessage);
            } else {
              console.log('🔥 Message missing role or content:', msg);
            }
          });
        } else if (conversation.role && conversation.content) {
          console.log('🔥 Conversation is single object');
          const chatMessage = {
            role: conversation.role,
            content: conversation.content,
            timestamp: timestamp
          };
          console.log('🔥 Adding single message to parsed:', chatMessage);
          parsedMessages.push(chatMessage);
        } else {
          console.log('🔥 Conversation object invalid structure:', conversation);
        }
      } catch (e) {
        // Se não conseguir fazer parse como JSON, trata como texto simples
        console.log('🔥 JSON parse failed, treating as plain text:', e);
        parsedMessages.push({
          role: 'unknown',
          content: afiliadoMsg.conversation_history,
          timestamp: timestamp
        });
      }
    } else {
      console.log('🔥 No conversation_history found');
    }
  } catch (error) {
    console.error('🔥 Error parsing message:', error, afiliadoMsg);
  }
  
  console.log('🔥 parseMessage returning:', parsedMessages);
  return parsedMessages;
};