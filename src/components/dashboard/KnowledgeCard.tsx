
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database } from 'lucide-react';

const KnowledgeCard = () => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate('/knowledge');
  };
  
  return (
    <Card className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white" onClick={handleClick}>
      <CardHeader className="pb-2 bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <Database className="h-6 w-6" />
          Gerenciador de Conhecimento
        </CardTitle>
        <CardDescription className="text-amber-100">
          Documentos e arquivos
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="mb-4 flex justify-center">
          <div className="bg-amber-100 dark:bg-amber-900/30 p-6 rounded-full">
            <Database className="h-14 w-14 text-amber-500 dark:text-amber-400 animate-bounce" />
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-center">
          Gerencie documentos e arquivos da base de conhecimento.
        </p>
      </CardContent>
      <CardFooter className="bg-gray-50 dark:bg-gray-700/50 rounded-b-lg border-t dark:border-gray-700 flex justify-center py-3">
        <Badge variant="outline" className="bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-800/50">
          Acessar gerenciador
        </Badge>
      </CardFooter>
    </Card>
  );
};

export default KnowledgeCard;
