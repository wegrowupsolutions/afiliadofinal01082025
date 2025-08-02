import React from 'react';
import { ArrowLeft, Clock, BookOpen, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ThemeToggle';
import plataformaBackground from '@/assets/plataforma-background.jpg';

const Academia = () => {
  const navigate = useNavigate();

  const courses = [
    {
      id: 1,
      title: "Plataforma Completa",
      description: "Aprenda a usar todas as funcionalidades da plataforma",
      image: plataformaBackground,
      totalModules: 7,
      totalLessons: 7,
      category: "Plataforma",
      slug: "plataforma-completa"
    },
    {
      id: 2,
      title: "Tráfego Pago - Facebook Ads",
      description: "Domine as estratégias de tráfego pago no Facebook",
      image: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=400&h=250&fit=crop",
      totalModules: 6,
      totalLessons: 18,
      category: "Marketing",
      slug: "trafego-facebook-ads"
    }
  ];

  const handleCourseClick = (courseSlug: string) => {
    navigate(`/academia/${courseSlug}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Academia</h1>
                <p className="text-gray-600 dark:text-gray-400">Vídeos explicativos da plataforma</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Escolha um curso para começar
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Selecione um curso e acesse todos os módulos e aulas organizados
          </p>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {courses.map((course) => (
            <Card 
              key={course.id} 
              className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 overflow-hidden"
              onClick={() => handleCourseClick(course.slug)}
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={course.image} 
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3">
                  <Badge variant="secondary" className="bg-black/70 text-white border-0">
                    {course.category}
                  </Badge>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-xl">{course.title}</CardTitle>
                <p className="text-gray-600 dark:text-gray-300">
                  {course.description}
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{course.totalModules} módulos</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{course.totalLessons} aulas</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-lg p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Precisa de ajuda personalizada?</h3>
            <p className="mb-6">Nossa equipe está pronta para te ajudar a aproveitar ao máximo a plataforma</p>
            <Button
              variant="secondary" 
              size="lg"
              className="bg-white text-red-600 hover:bg-gray-100"
            >
              Entrar em contato
            </Button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Academia;