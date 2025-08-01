
import React from 'react';
import { MessageSquare } from 'lucide-react';

const NoSelectedChat = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
      <MessageSquare size={64} className="mb-4 opacity-50" />
      <h3 className="text-xl font-medium mb-2">Selecione uma conversa</h3>
      <p className="text-sm">Escolha uma conversa para começar a interagir</p>
    </div>
  );
};

export default NoSelectedChat;
