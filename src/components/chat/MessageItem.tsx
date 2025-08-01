
import React from 'react';
import { PawPrint, User } from 'lucide-react';
import { ChatMessage } from '@/types/chat';

interface MessageItemProps {
  message: ChatMessage;
  index: number;
}

const MessageItem = ({ message, index }: MessageItemProps) => {
  if (!message.content) return null;
  
  // Determine if the message was sent by a client (should be on left)
  const isClientMessage = message.role === 'user' || message.role === 'human' || message.type === 'human';
  
  // Messages sent by agent/assistant should appear on the right with green bubbles
  const isAgentMessage = message.role === 'assistant' || 
                         message.type === 'ai' || 
                         !isClientMessage;
  
  return (
    <div
      key={`message-${index}`}
      className={`flex ${isAgentMessage ? 'justify-end' : 'justify-start'}`}
    >
      {isClientMessage && (
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center mr-2">
          <User size={16} className="text-gray-700 dark:text-gray-300" />
        </div>
      )}
      
      <div 
        className={`max-w-[70%] rounded-lg p-3 shadow ${
          isClientMessage 
            ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-tr-none' 
            : 'bg-green-500 text-white rounded-tl-none'
        }`}
      >
        <p className="break-words whitespace-pre-wrap">{message.content}</p>
        <p className={`text-xs mt-1 text-right ${
          isClientMessage 
            ? 'text-gray-500 dark:text-gray-400' 
            : 'text-green-100'
        }`}>
          {message.timestamp}
        </p>
      </div>
      
      {isAgentMessage && (
        <div className="w-8 h-8 rounded-full bg-green-200 dark:bg-green-700 flex items-center justify-center ml-2">
          <PawPrint size={16} className="text-green-700 dark:text-green-200" />
        </div>
      )}
    </div>
  );
};

export default MessageItem;
