
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Search, Pause, Play } from 'lucide-react';
import { Conversation } from '@/types/chat';

interface ConversationListProps {
  conversations: Conversation[];
  selectedChat: string | null;
  setSelectedChat: (id: string) => void;
  isLoading: Record<string, boolean>;
  openPauseDialog: (phoneNumber: string, e: React.MouseEvent) => void;
  startBot: (phoneNumber: string, e: React.MouseEvent) => void;
  loading: boolean;
}

const ConversationList = ({
  conversations,
  selectedChat,
  setSelectedChat,
  isLoading,
  openPauseDialog,
  startBot,
  loading
}: ConversationListProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConversations = conversations.filter(
    conv => conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 bg-green-50 dark:bg-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
          <Input
            placeholder="Buscar conversas"
            className="pl-10 bg-white dark:bg-gray-600 border-gray-200 dark:border-gray-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="p-4 text-center">
            <p>Carregando conversas...</p>
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <div key={conv.id} className="border-b border-gray-200 dark:border-gray-700">
              <div
                className={`flex items-center p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  selectedChat === conv.id ? 'bg-green-50 dark:bg-gray-700' : ''
                }`}
                onClick={() => setSelectedChat(conv.id)}
              >
                <div className="w-12 h-12 rounded-full bg-green-200 dark:bg-green-800 flex items-center justify-center text-2xl mr-3">
                  {conv.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium truncate">{conv.name}</h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 whitespace-nowrap">
                      {conv.time}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {conv.lastMessage}
                  </p>
                  
                  <div className="flex space-x-2 mt-2">
                    <Button
                      variant="danger"
                      size="xs"
                      className="rounded-full px-3 flex items-center gap-1"
                      onClick={(e) => openPauseDialog(conv.phone, e)}
                      disabled={isLoading[`pause-${conv.phone}`]}
                    >
                      {isLoading[`pause-${conv.phone}`] ? (
                        <span className="h-3 w-3 border-2 border-t-transparent border-current rounded-full animate-spin" />
                      ) : (
                        <>
                          <Pause className="h-3 w-3" />
                          <span>Pausar</span>
                        </>
                      )}
                    </Button>
                    <Button
                      variant="success"
                      size="xs"
                      className="rounded-full px-3 flex items-center gap-1"
                      onClick={(e) => startBot(conv.phone, e)}
                      disabled={isLoading[`start-${conv.phone}`]}
                    >
                      {isLoading[`start-${conv.phone}`] ? (
                        <span className="h-3 w-3 border-2 border-t-transparent border-current rounded-full animate-spin" />
                      ) : (
                        <>
                          <Play className="h-3 w-3" />
                          <span>Ativar</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                {conv.unread > 0 && (
                  <div className="ml-2 bg-green-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {conv.unread}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </ScrollArea>
    </div>
  );
};

export default ConversationList;
