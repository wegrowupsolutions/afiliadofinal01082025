import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings2, Bot } from 'lucide-react';

const AgentConfigCard = () => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate('/agent-configuration');
  };
  
  return (
    <Card 
      className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white" 
      onClick={handleClick}
    >
      <CardHeader className="pb-2 bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-6 w-6" />
          Configuração do Agente
        </CardTitle>
        <CardDescription className="text-emerald-100">
          Personalize seu agente IA
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="mb-4 flex justify-center">
          <div className="bg-emerald-100 dark:bg-emerald-900/30 p-6 rounded-full">
            <Bot className="h-14 w-14 text-emerald-500 dark:text-emerald-400 animate-pulse" />
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-center">
          Configure e personalize seu agente IA para atender suas necessidades específicas.
        </p>
      </CardContent>
      <CardFooter className="bg-gray-50 dark:bg-gray-700/50 rounded-b-lg border-t dark:border-gray-700 flex justify-center py-3">
        <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-800/50">
          Configurar agente
        </Badge>
      </CardFooter>
    </Card>
  );
};

export default AgentConfigCard;