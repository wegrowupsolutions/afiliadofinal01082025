import React, { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, MessageSquare } from 'lucide-react';
import ConversationList from './ConversationList';
import ChatArea from './ChatArea';
import ClientInfoPanel from './ClientInfoPanel';
import { Conversation, ChatMessage } from '@/types/chat';

interface MobileChatLayoutProps {
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

export const MobileChatLayout = (props: MobileChatLayoutProps) => {
  const [conversationsOpen, setConversationsOpen] = useState(false);
  const [clientInfoOpen, setClientInfoOpen] = useState(false);
  
  const handleSelectChat = (id: string) => {
    console.log(`Selecting chat with ID: ${id}`);
    props.setSelectedChat(id);
    props.markConversationRead(id);
    setConversationsOpen(false); // Close conversations panel on mobile
  };

  return (
    <div className="flex flex-col h-full">
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <Sheet open={conversationsOpen} onOpenChange={setConversationsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-80">
            <ConversationList 
              conversations={props.conversations} 
              selectedChat={props.selectedChat}
              setSelectedChat={handleSelectChat}
              isLoading={props.isLoading}
              openPauseDialog={props.openPauseDialog}
              startBot={props.startBot}
              loading={props.loading}
            />
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <span className="font-medium">
            {props.selectedConversation ? 
              `Chat com ${props.selectedConversation.name || 'Cliente'}` : 
              'Conversas'
            }
          </span>
        </div>

        {props.selectedChat && (
          <Sheet open={clientInfoOpen} onOpenChange={setClientInfoOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                Info
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0 w-80">
              <ClientInfoPanel 
                selectedChat={props.selectedChat}
                selectedConversation={props.selectedConversation}
              />
            </SheetContent>
          </Sheet>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden">
        <ChatArea 
          selectedChat={props.selectedChat}
          selectedConversation={props.selectedConversation}
          messages={props.messages}
          loading={props.loading}
        />
      </div>
    </div>
  );
};