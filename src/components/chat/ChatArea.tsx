
import React from 'react';
import { ChatMessage, Conversation } from '@/types/chat';
import ChatConversationHeader from './ChatConversationHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import NoSelectedChat from './NoSelectedChat';

interface ChatAreaProps {
  selectedChat: string | null;
  selectedConversation: Conversation | undefined;
  messages: ChatMessage[];
  loading: boolean;
}

const ChatArea = ({ selectedChat, selectedConversation, messages, loading }: ChatAreaProps) => {
  if (!selectedChat) {
    return <NoSelectedChat />;
  }

  return (
    <>
      <ChatConversationHeader selectedConversation={selectedConversation} />
      <MessageList messages={messages} loading={loading} />
      <MessageInput 
        selectedChat={selectedChat}
        selectedConversation={selectedConversation}
      />
    </>
  );
};

export default ChatArea;

