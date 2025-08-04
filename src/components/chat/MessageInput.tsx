
import React, { useState, useRef } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Conversation } from '@/types/chat';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MessageInputProps {
  selectedChat: string | null;
  selectedConversation?: Conversation;
}

const MessageInput = ({ selectedChat, selectedConversation }: MessageInputProps) => {
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  const lastMessageTime = useRef<number>(0);
  const messageCount = useRef<number>(0);
  const messageCountResetTime = useRef<number>(Date.now());

  // Security: Input validation and sanitization
  const validateAndSanitizeInput = (input: string): string | null => {
    // Remove potentially dangerous characters and patterns
    const sanitized = input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim();
    
    // Validate length (max 1000 characters)
    if (sanitized.length === 0) return null;
    if (sanitized.length > 1000) {
      toast({
        title: 'Mensagem muito longa',
        description: 'A mensagem deve ter no máximo 1000 caracteres.',
        variant: 'destructive',
      });
      return null;
    }
    
    // Check for spam patterns
    const spamPatterns = [
      /(.)\1{10,}/, // Repeated characters
      /^[A-Z\s!]{20,}$/, // All caps
      /(https?:\/\/[^\s]+){3,}/, // Multiple URLs
    ];
    
    for (const pattern of spamPatterns) {
      if (pattern.test(sanitized)) {
        toast({
          title: 'Mensagem rejeitada',
          description: 'A mensagem contém padrões suspeitos de spam.',
          variant: 'destructive',
        });
        return null;
      }
    }
    
    return sanitized;
  };

  // Security: Rate limiting
  const checkRateLimit = (): boolean => {
    const now = Date.now();
    const oneMinute = 60 * 1000;
    const fiveMinutes = 5 * 60 * 1000;
    
    // Reset counter every 5 minutes
    if (now - messageCountResetTime.current > fiveMinutes) {
      messageCount.current = 0;
      messageCountResetTime.current = now;
    }
    
    // Check if too many messages in 5 minutes (max 10)
    if (messageCount.current >= 10) {
      toast({
        title: 'Limite de mensagens atingido',
        description: 'Aguarde alguns minutos antes de enviar mais mensagens.',
        variant: 'destructive',
      });
      return false;
    }
    
    // Check if too fast (min 3 seconds between messages)
    if (now - lastMessageTime.current < 3000) {
      toast({
        title: 'Envio muito rápido',
        description: 'Aguarde alguns segundos antes de enviar outra mensagem.',
        variant: 'destructive',
      });
      return false;
    }
    
    return true;
  };

  // Security: Verify user authentication
  const verifyUserAuth = async (): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: 'Não autenticado',
          description: 'Você precisa estar logado para enviar mensagens.',
          variant: 'destructive',
        });
        return false;
      }
      return true;
    } catch (error) {
      console.error('Auth verification error:', error);
      return false;
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChat || !selectedConversation?.phone) return;
    
    // Security: Verify authentication first
    const isAuthenticated = await verifyUserAuth();
    if (!isAuthenticated) return;
    
    // Security: Validate and sanitize input
    const sanitizedMessage = validateAndSanitizeInput(newMessage);
    if (!sanitizedMessage) return;
    
    // Security: Check rate limits
    if (!checkRateLimit()) return;
    
    try {
      setIsSending(true);
      
      // Update rate limiting counters
      lastMessageTime.current = Date.now();
      messageCount.current += 1;
      
      // Add CSRF token to headers
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      const response = await fetch('https://webhook.serverwegrowup.com.br/webhook/envia_mensagem_afiliado', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: sanitizedMessage,
          phoneNumber: selectedConversation.phone,
          timestamp: Date.now(), // Add timestamp for request verification
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Webhook error:', errorData);
        throw new Error(`Falha ao enviar mensagem: ${response.status}`);
      }
      
      // Log successful message send for monitoring
      console.log('Message sent successfully:', {
        phoneNumber: selectedConversation.phone,
        messageLength: sanitizedMessage.length,
        timestamp: new Date().toISOString(),
      });
      
      setNewMessage('');
      
      toast({
        title: 'Mensagem enviada',
        description: 'Sua mensagem foi enviada com sucesso.',
      });
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Revert rate limiting counters on error
      messageCount.current = Math.max(0, messageCount.current - 1);
      
      toast({
        title: 'Erro ao enviar mensagem',
        description: error instanceof Error 
          ? error.message 
          : 'Não foi possível enviar sua mensagem. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Digite uma mensagem"
          className="flex-1"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={isSending}
        />
        <Button 
          type="submit" 
          size="icon" 
          className="bg-green-500 hover:bg-green-600 text-white"
          disabled={isSending}
        >
          <Send size={18} />
        </Button>
      </div>
    </form>
  );
};

export default MessageInput;

