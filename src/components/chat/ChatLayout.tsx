
import React from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import ConversationList from './ConversationList';
import ChatArea from './ChatArea';
import ClientInfoPanel from './ClientInfoPanel';
import { MobileChatLayout } from './MobileChatLayout';
import { useIsMobile } from '@/hooks/use-mobile';
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

const ChatLayout = (props: ChatLayoutProps) => {
  const isMobile = useIsMobile();
  
  const handleSelectChat = (id: string) => {
    console.log(`Selecting chat with ID: ${id}`);
    props.setSelectedChat(id);
    props.markConversationRead(id);
  };

  // Use mobile layout on small screens
  if (isMobile) {
    return <MobileChatLayout {...props} setSelectedChat={handleSelectChat} />;
  }
  
  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      <ResizablePanel defaultSize={25} minSize={20} maxSize={30} className="bg-card">
        <ConversationList 
          conversations={props.conversations} 
          selectedChat={props.selectedChat}
          setSelectedChat={handleSelectChat}
          isLoading={props.isLoading}
          openPauseDialog={props.openPauseDialog}
          startBot={props.startBot}
          loading={props.loading}
        />
      </ResizablePanel>

      <ResizableHandle withHandle />

      <ResizablePanel defaultSize={50} minSize={40} className="bg-muted/30 flex flex-col">
        <ChatArea 
          selectedChat={props.selectedChat}
          selectedConversation={props.selectedConversation}
          messages={props.messages}
          loading={props.loading}
        />
      </ResizablePanel>

      <ResizableHandle withHandle />

      <ResizablePanel defaultSize={25} minSize={20} maxSize={30} className="bg-card">
        <ClientInfoPanel 
          selectedChat={props.selectedChat}
          selectedConversation={props.selectedConversation}
        />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default ChatLayout;
