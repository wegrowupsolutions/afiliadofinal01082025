import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dumbbell } from 'lucide-react';

const AcademiaCard = () => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate('/academia');
  };
  
  return (
    <Card className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white" onClick={handleClick}>
      <CardHeader className="pb-2 bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <Dumbbell className="h-6 w-6" />
          Academia
        </CardTitle>
        <CardDescription className="text-orange-100">
          Treinos e exercícios
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="mb-4 flex justify-center">
          <div className="bg-orange-100 dark:bg-orange-900/30 p-6 rounded-full">
            <Dumbbell className="h-14 w-14 text-orange-500 dark:text-orange-400 animate-bounce" />
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-center">
          Gerencie treinos, exercícios e progresso dos alunos.
        </p>
      </CardContent>
      <CardFooter className="bg-gray-50 dark:bg-gray-700/50 rounded-b-lg border-t dark:border-gray-700 flex justify-center py-3">
        <Badge variant="outline" className="bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-800/50">
          Acessar academia
        </Badge>
      </CardFooter>
    </Card>
  );
};

export default AcademiaCard;