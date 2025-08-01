
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare } from 'lucide-react';

const ChatsCard = () => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate('/chats');
  };
  
  return (
    <Card className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white" onClick={handleClick}>
      <CardHeader className="pb-2 bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-6 w-6" />
          Chats
        </CardTitle>
        <CardDescription className="text-green-100">
          Conversas em tempo real
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="mb-4 flex justify-center">
          <div className="bg-green-100 dark:bg-green-900/30 p-6 rounded-full">
            <MessageSquare className="h-14 w-14 text-green-500 dark:text-green-400 animate-pulse" />
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-center">
          Visualize e responda mensagens de WhatsApp em tempo real.
        </p>
      </CardContent>
      <CardFooter className="bg-gray-50 dark:bg-gray-700/50 rounded-b-lg border-t dark:border-gray-700 flex justify-center py-3">
        <Badge variant="outline" className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-800/50">
          Acessar conversas
        </Badge>
      </CardFooter>
    </Card>
  );
};

export default ChatsCard;
