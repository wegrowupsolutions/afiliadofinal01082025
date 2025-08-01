
import React from 'react';
import { PawPrint, User } from 'lucide-react';
import { ChatMessage } from '@/types/chat';

interface MessageItemProps {
  message: ChatMessage;
  index: number;
}

const MessageItem = ({ message, index }: MessageItemProps) => {
  if (!message.content) return null;
  
  // Determine if the message was sent by a human/client user
  const isHuman = message.role === 'human' || message.type === 'human';
  
  // Messages sent from the dashboard (staff/assistant) should appear on the right with green bubbles
  const isDashboardSent = message.role === 'assistant' || 
                          message.type === 'ai' || 
                          (!isHuman && message.role !== 'human');
  
  return (
    <div
      key={`message-${index}`}
      className={`flex ${isDashboardSent ? 'justify-end' : 'justify-start'}`}
    >
      {!isDashboardSent && (
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center mr-2">
          <User size={16} className="text-gray-700 dark:text-gray-300" />
        </div>
      )}
      
      <div 
        className={`max-w-[70%] rounded-lg p-3 shadow ${
          !isDashboardSent 
            ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-tr-none' 
            : 'bg-green-500 text-white rounded-tl-none'
        }`}
      >
        <p className="break-words whitespace-pre-wrap">{message.content}</p>
        <p className={`text-xs mt-1 text-right ${
          !isDashboardSent 
            ? 'text-gray-500 dark:text-gray-400' 
            : 'text-green-100'
        }`}>
          {message.timestamp}
        </p>
      </div>
      
      {isDashboardSent && (
        <div className="w-8 h-8 rounded-full bg-green-200 dark:bg-green-700 flex items-center justify-center ml-2">
          <PawPrint size={16} className="text-green-700 dark:text-green-200" />
        </div>
      )}
    </div>
  );
};

export default MessageItem;
