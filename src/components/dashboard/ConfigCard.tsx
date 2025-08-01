
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings2 } from 'lucide-react';

const ConfigCard = () => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate('/configuration');
  };
  
  return (
    <Card 
      className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white" 
      onClick={handleClick}
    >
      <CardHeader className="pb-2 bg-gradient-to-r from-slate-500 to-slate-600 dark:from-slate-600 dark:to-slate-700 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="h-6 w-6" />
          Configurações
        </CardTitle>
        <CardDescription className="text-slate-100">
          Gerenciamento de endpoints
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="mb-4 flex justify-center">
          <div className="bg-slate-100 dark:bg-slate-900/30 p-6 rounded-full">
            <Settings2 className="h-14 w-14 text-slate-500 dark:text-slate-400 animate-spin-slow" />
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-center">
          Configure os endpoints do sistema e integrações.
        </p>
      </CardContent>
      <CardFooter className="bg-gray-50 dark:bg-gray-700/50 rounded-b-lg border-t dark:border-gray-700 flex justify-center py-3">
        <Badge variant="outline" className="bg-slate-50 dark:bg-slate-900/30 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50">
          Gerenciar configurações
        </Badge>
      </CardFooter>
    </Card>
  );
};

export default ConfigCard;
