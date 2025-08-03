
import React from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import ConversationList from './ConversationList';
import ChatArea from './ChatArea';
import ClientInfoPanel from './ClientInfoPanel';
import { Conversation, ChatMessage } from '@/types/chat';

interface ChatLayoutProps {
  conversations: Conversation[];
  selectedChat: string | null;
  setSelectedChat: (id: string) => void;
  isLoading: Record<string, boolean>;
  openPauseDialog: (phoneNumber: string, e: React.MouseEvent) => void;
  startBot: (phoneNumber: string, e: React.MouseEvent) => void;
  loading: boolean;
  messages: ChatMessage[];
  handleNewMessage: (message: ChatMessage) => void;
  selectedConversation?: Conversation;
  markConversationRead: (sessionId: string) => void;
}

const ChatLayout = ({
  conversations,
  selectedChat,
  setSelectedChat,
  isLoading,
  openPauseDialog,
  startBot,
  loading,
  messages,
  handleNewMessage,
  selectedConversation,
  markConversationRead
}: ChatLayoutProps) => {
  
  const handleSelectChat = (id: string) => {
    console.log(`Selecting chat with ID: ${id}`);
    setSelectedChat(id);
    markConversationRead(id);
  };
  
  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      <ResizablePanel defaultSize={25} minSize={20} maxSize={30} className="bg-white dark:bg-gray-800">
        <ConversationList 
          conversations={conversations} 
          selectedChat={selectedChat}
          setSelectedChat={handleSelectChat}
          isLoading={isLoading}
          openPauseDialog={openPauseDialog}
          startBot={startBot}
          loading={loading}
        />
      </ResizablePanel>

      <ResizableHandle withHandle />

      <ResizablePanel defaultSize={50} minSize={40} className="bg-gray-50 dark:bg-gray-900 flex flex-col">
        <ChatArea 
          selectedChat={selectedChat}
          selectedConversation={selectedConversation}
          messages={messages}
          loading={loading}
        />
      </ResizablePanel>

      <ResizableHandle withHandle />

      <ResizablePanel defaultSize={25} minSize={20} maxSize={30} className="bg-white dark:bg-gray-800">
        <ClientInfoPanel 
          selectedChat={selectedChat}
          selectedConversation={selectedConversation}
        />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default ChatLayout;
