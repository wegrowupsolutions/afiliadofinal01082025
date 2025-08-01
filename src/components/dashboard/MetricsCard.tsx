
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart } from 'lucide-react';

const MetricsCard = () => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate('/metrics');
  };
  
  return (
    <Card className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white" onClick={handleClick}>
      <CardHeader className="pb-2 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-700 dark:to-blue-800 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <LineChart className="h-6 w-6" />
          Métricas
        </CardTitle>
        <CardDescription className="text-blue-100">
          Estatísticas e indicadores
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="mb-4 flex justify-center">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-6 rounded-full relative">
            <LineChart className="h-14 w-14 text-blue-500 dark:text-blue-400" />
            <div className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-pulse">
              110
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-center">
            <LineChart className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-1" />
            <span className="text-sm text-gray-600 dark:text-gray-300">Análise de indicadores disponível</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 dark:bg-gray-700/50 rounded-b-lg border-t dark:border-gray-700 flex justify-center py-3">
        <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/50">
          Acessar dashboard de métricas
        </Badge>
      </CardFooter>
    </Card>
  );
};

export default MetricsCard;
