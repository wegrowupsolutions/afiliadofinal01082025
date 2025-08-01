
import React, { useRef, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from '@/types/chat';
import MessageItem from './MessageItem';

interface MessageListProps {
  messages: ChatMessage[];
  loading: boolean;
}

const MessageList = ({ messages, loading }: MessageListProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  // Scroll to the bottom whenever messages change
  useEffect(() => {
    if (messages.length > 0 && lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <ScrollArea className="flex-1 p-4" scrollAreaRef={scrollAreaRef}>
      {loading ? (
        <div className="text-center py-10">
          <p>Carregando mensagens...</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <MessageSquare className="mx-auto mb-2 h-12 w-12 opacity-30" />
          <p>Nenhuma mensagem encontrada</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={`msg-${index}`}
              ref={index === messages.length - 1 ? lastMessageRef : undefined}
            >
              <MessageItem message={message} index={index} />
            </div>
          ))}
        </div>
      )}
    </ScrollArea>
  );
};

export default MessageList;
