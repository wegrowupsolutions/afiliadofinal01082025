
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';

const ScheduleCard = () => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate('/schedule');
  };
  
  return (
    <Card className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white" onClick={handleClick}>
      <CardHeader className="pb-2 bg-gradient-to-r from-pink-500 to-pink-600 dark:from-pink-600 dark:to-pink-700 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-6 w-6" />
          Agenda
        </CardTitle>
        <CardDescription className="text-pink-100">
          Gerenciamento de compromissos
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="mb-4 flex justify-center">
          <div className="bg-pink-100 dark:bg-pink-900/30 p-6 rounded-full">
            <Calendar className="h-14 w-14 text-pink-500 dark:text-pink-400 animate-pulse" />
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-center">
          Consulte e gerencie a agenda de atendimentos e compromissos.
        </p>
      </CardContent>
      <CardFooter className="bg-gray-50 dark:bg-gray-700/50 rounded-b-lg border-t dark:border-gray-700 flex justify-center py-3">
        <Badge variant="outline" className="bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-300 hover:bg-pink-100 dark:hover:bg-pink-800/50">
          Acessar agenda
        </Badge>
      </CardFooter>
    </Card>
  );
};

export default ScheduleCard;
