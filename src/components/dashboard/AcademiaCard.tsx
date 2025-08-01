import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play } from 'lucide-react';

const AcademiaCard = () => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate('/academia');
  };
  
  return (
    <Card className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white" onClick={handleClick}>
      <CardHeader className="pb-2 bg-gradient-to-r from-red-600 to-red-700 dark:from-red-700 dark:to-red-800 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <Play className="h-6 w-6" />
          Academia
        </CardTitle>
        <CardDescription className="text-red-100">
          Vídeos explicativos
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="mb-4 flex justify-center">
          <div className="bg-red-100 dark:bg-red-900/30 p-6 rounded-full">
            <Play className="h-14 w-14 text-red-600 dark:text-red-400 animate-bounce" />
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-center">
          Assista vídeos explicativos sobre cada funcionalidade da plataforma.
        </p>
      </CardContent>
      <CardFooter className="bg-gray-50 dark:bg-gray-700/50 rounded-b-lg border-t dark:border-gray-700 flex justify-center py-3">
        <Badge variant="outline" className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-800/50">
          Assistir vídeos
        </Badge>
      </CardFooter>
    </Card>
  );
};

export default AcademiaCard;