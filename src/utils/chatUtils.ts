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
    const timestamp = afiliadoMsg.timestamp ? extractHourFromTimestamp(afiliadoMsg.timestamp) : '';
    
    if (afiliadoMsg.conversation_history) {
      try {
        const conversation = JSON.parse(afiliadoMsg.conversation_history);
        
        if (Array.isArray(conversation)) {
          conversation.forEach((msg: any) => {
            if (msg.role && msg.content) {
              parsedMessages.push({
                role: msg.role,
                content: msg.content,
                timestamp: timestamp
              });
            }
          });
        } else if (conversation.role && conversation.content) {
          parsedMessages.push({
            role: conversation.role,
            content: conversation.content,
            timestamp: timestamp
          });
        }
      } catch (e) {
        // Se não conseguir fazer parse como JSON, trata como texto simples
        parsedMessages.push({
          role: 'unknown',
          content: afiliadoMsg.conversation_history,
          timestamp: timestamp
        });
      }
    }
  } catch (error) {
    console.error('Error parsing message:', error, afiliadoMsg);
  }
  
  return parsedMessages;
};