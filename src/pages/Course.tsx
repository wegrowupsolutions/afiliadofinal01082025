import React, { useState } from 'react';
import { ArrowLeft, Play, CheckCircle, Clock, Book } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import VideoModal from '@/components/VideoModal';
import plataformaBackground from '@/assets/plataforma-background.jpg';

const Course = () => {
  const navigate = useNavigate();
  const { courseSlug } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<{ videoId: string; title: string } | null>(null);

  // Dados dos cursos
  const courseData: Record<string, any> = {
    'plataforma-completa': {
      title: "Plataforma Completa",
      description: "Aprenda a usar todas as funcionalidades da plataforma",
      image: plataformaBackground,
      modules: [
        {
          id: 1,
          title: "Bem vindos",
          description: "Introdução à plataforma e primeiros passos",
          lessons: [
            { id: 1, title: "Bem vindos", duration: "10:00", videoId: "dQw4w9WgXcQ", completed: false }
          ]
        },
        {
          id: 2,
          title: "Métricas",
          description: "Como acompanhar e analisar as métricas da plataforma",
          lessons: [
            { id: 1, title: "Métricas", duration: "12:00", videoId: "dQw4w9WgXcQ", completed: false }
          ]
        },
        {
          id: 3,
          title: "Chat",
          description: "Utilizando o sistema de chat inteligente",
          lessons: [
            { id: 1, title: "Chat", duration: "15:00", videoId: "dQw4w9WgXcQ", completed: false }
          ]
        },
        {
          id: 4,
          title: "Gerenciamento de conhecimento",
          description: "Organizando e gerenciando a base de conhecimento",
          lessons: [
            { id: 1, title: "Gerenciamento de conhecimento", duration: "18:00", videoId: "dQw4w9WgXcQ", completed: false }
          ]
        },
        {
          id: 5,
          title: "Leads",
          description: "Como gerenciar e organizar seus leads",
          lessons: [
            { id: 1, title: "Leads", duration: "14:00", videoId: "dQw4w9WgXcQ", completed: false }
          ]
        },
        {
          id: 6,
          title: "Conectar Whatsapp",
          description: "Integração e configuração do WhatsApp",
          lessons: [
            { id: 1, title: "Conectar Whatsapp", duration: "20:00", videoId: "dQw4w9WgXcQ", completed: false }
          ]
        },
        {
          id: 7,
          title: "Configuração do Agente",
          description: "Como configurar e personalizar seu agente de IA",
          lessons: [
            { id: 1, title: "Configuração do Agente", duration: "16:00", videoId: "dQw4w9WgXcQ", completed: false }
          ]
        }
      ]
    },
    'trafego-facebook-ads': {
      title: "Tráfego Pago - Facebook Ads",
      description: "Domine as estratégias de tráfego pago no Facebook",
      image: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=800&h=400&fit=crop",
      modules: [
        {
          id: 1,
          title: "Fundamentos do Facebook Ads",
          description: "Base teórica e conceitos essenciais",
          lessons: [
            { id: 1, title: "Introdução ao Facebook Ads", duration: "10:30", videoId: "dQw4w9WgXcQ", completed: false },
            { id: 2, title: "Estrutura de Campanhas", duration: "8:20", videoId: "dQw4w9WgXcQ", completed: false },
            { id: 3, title: "Tipos de Objetivos", duration: "7:45", videoId: "dQw4w9WgXcQ", completed: false }
          ]
        },
        {
          id: 2,
          title: "Pixel e Configurações",
          description: "Instalação e configuração do Pixel",
          lessons: [
            { id: 1, title: "Instalação do Pixel", duration: "9:15", videoId: "dQw4w9WgXcQ", completed: false },
            { id: 2, title: "Eventos Personalizados", duration: "11:50", videoId: "dQw4w9WgXcQ", completed: false },
            { id: 3, title: "Verificação e Testes", duration: "6:30", videoId: "dQw4w9WgXcQ", completed: false }
          ]
        },
        {
          id: 3,
          title: "Segmentação de Audiências",
          description: "Como criar e otimizar audiências",
          lessons: [
            { id: 1, title: "Audiências Salvas", duration: "12:20", videoId: "dQw4w9WgXcQ", completed: false },
            { id: 2, title: "Audiências Similares", duration: "10:10", videoId: "dQw4w9WgXcQ", completed: false },
            { id: 3, title: "Retargeting Avançado", duration: "14:40", videoId: "dQw4w9WgXcQ", completed: false }
          ]
        },
        {
          id: 4,
          title: "Criação de Anúncios",
          description: "Design e copywriting para conversão",
          lessons: [
            { id: 1, title: "Criação de Criativos", duration: "15:30", videoId: "dQw4w9WgXcQ", completed: false },
            { id: 2, title: "Copy que Converte", duration: "13:20", videoId: "dQw4w9WgXcQ", completed: false },
            { id: 3, title: "Testes A/B", duration: "11:45", videoId: "dQw4w9WgXcQ", completed: false }
          ]
        },
        {
          id: 5,
          title: "Otimização e Escalabilidade",
          description: "Como otimizar e escalar campanhas",
          lessons: [
            { id: 1, title: "Análise de Métricas", duration: "16:15", videoId: "dQw4w9WgXcQ", completed: false },
            { id: 2, title: "Estratégias de Escalabilidade", duration: "14:50", videoId: "dQw4w9WgXcQ", completed: false },
            { id: 3, title: "Troubleshooting", duration: "12:30", videoId: "dQw4w9WgXcQ", completed: false }
          ]
        },
        {
          id: 6,
          title: "Casos Práticos",
          description: "Exemplos reais e estudos de caso",
          lessons: [
            { id: 1, title: "E-commerce", duration: "18:20", videoId: "dQw4w9WgXcQ", completed: false },
            { id: 2, title: "Infoprodutos", duration: "16:10", videoId: "dQw4w9WgXcQ", completed: false },
            { id: 3, title: "Serviços Locais", duration: "14:40", videoId: "dQw4w9WgXcQ", completed: false }
          ]
        }
      ]
    }
  };

  const currentCourse = courseSlug ? courseData[courseSlug] : null;

  if (!currentCourse) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-foreground">Curso não encontrado</h1>
          <Button onClick={() => navigate('/academia')}>
            Voltar para Academia
          </Button>
        </div>
      </div>
    );
  }

  const handleVideoClick = (videoId: string, title: string) => {
    setSelectedVideo({ videoId, title });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVideo(null);
  };

  const totalLessons = currentCourse.modules.reduce((total: number, module: any) => total + module.lessons.length, 0);

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
                onClick={() => navigate('/academia')}
                className="flex items-center text-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{currentCourse.title}</h1>
                <p className="text-gray-600 dark:text-gray-400">{currentCourse.description}</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Course Banner */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src={currentCourse.image} 
          alt={currentCourse.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-3xl font-bold mb-2">{currentCourse.title}</h2>
            <div className="flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <Book className="h-5 w-5" />
                <span>{currentCourse.modules.length} módulos</span>
              </div>
              <div className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                <span>{totalLessons} aulas</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Módulos do Curso
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Acesse cada módulo e assista às aulas na ordem recomendada
          </p>
        </div>

        {/* Modules */}
        <Accordion type="multiple" className="space-y-4">
          {currentCourse.modules.map((module: any) => (
            <AccordionItem key={module.id} value={`module-${module.id}`} className="border rounded-lg">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center justify-between w-full mr-4">
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-foreground">{module.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{module.description}</p>
                  </div>
                  <Badge variant="secondary">
                    {module.lessons.length} aulas
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <div className="space-y-3">
                  {module.lessons.map((lesson: any) => (
                    <Card 
                      key={lesson.id}
                      className="cursor-pointer hover:shadow-md transition-all duration-200"
                      onClick={() => handleVideoClick(lesson.videoId, lesson.title)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg">
                              <Play className="h-4 w-4 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                              <h4 className="font-medium text-foreground">{lesson.title}</h4>
                              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                <Clock className="h-3 w-3" />
                                <span>{lesson.duration}</span>
                              </div>
                            </div>
                          </div>
                          {lesson.completed && (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <VideoModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          videoId={selectedVideo.videoId}
          title={selectedVideo.title}
        />
      )}
    </div>
  );
};

export default Course;