
import React from 'react';
import { User } from 'lucide-react';
import { Card } from '@/components/ui/card';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Conversation } from '@/types/chat';

interface ClientInfoPanelProps {
  selectedChat: string | null;
  selectedConversation: Conversation | undefined;
}

const ClientInfoPanel = ({ selectedChat, selectedConversation }: ClientInfoPanelProps) => {
  if (!selectedChat) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
        <User size={64} className="mb-4 opacity-50" />
        <h3 className="text-xl font-medium mb-2">Informações do Cliente</h3>
        <p className="text-sm text-center px-4">Selecione uma conversa para ver as informações do cliente</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="text-center p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="w-24 h-24 rounded-full bg-green-200 dark:bg-green-800 flex items-center justify-center text-4xl mx-auto mb-4">
          {selectedConversation?.avatar}
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{selectedConversation?.name}</h2>
        <p className="text-gray-500 dark:text-gray-400">{selectedConversation?.phone}</p>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4">
          <div className="mt-4 space-y-4">
            <Card className="p-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Telefone</h3>
              <p>{selectedConversation?.phone}</p>
            </Card>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default ClientInfoPanel;
