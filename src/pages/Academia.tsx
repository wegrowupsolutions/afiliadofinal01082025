import React from 'react';
import { ArrowLeft, Play, MessageSquare, Users, BookOpen, BarChart3, Settings, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Academia = () => {
  const navigate = useNavigate();

  const videoCards = [
    {
      id: 1,
      title: "Dashboard - Visão Geral",
      description: "Aprenda a usar o painel principal da plataforma",
      icon: BarChart3,
      videoId: "dQw4w9WgXcQ", // Placeholder YouTube ID
      duration: "5:30"
    },
    {
      id: 2,
      title: "Gerenciamento de Leads",
      description: "Como gerenciar e organizar seus leads",
      icon: Users,
      videoId: "dQw4w9WgXcQ",
      duration: "8:15"
    },
    {
      id: 3,
      title: "Sistema de Chat",
      description: "Utilizando o chat inteligente com IA",
      icon: MessageSquare,
      videoId: "dQw4w9WgXcQ",
      duration: "6:45"
    },
    {
      id: 4,
      title: "Base de Conhecimento",
      description: "Configurando e organizando documentos",
      icon: BookOpen,
      videoId: "dQw4w9WgXcQ",
      duration: "7:20"
    },
    {
      id: 5,
      title: "Agenda e Compromissos",
      description: "Organizando sua agenda de atendimentos",
      icon: Calendar,
      videoId: "dQw4w9WgXcQ",
      duration: "4:50"
    },
    {
      id: 6,
      title: "Configurações Avançadas",
      description: "Personalizando a plataforma para suas necessidades",
      icon: Settings,
      videoId: "dQw4w9WgXcQ",
      duration: "9:10"
    }
  ];

  const handleVideoClick = (videoId: string, title: string) => {
    // Abrir vídeo do YouTube em nova aba
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Academia</h1>
              <p className="text-gray-600 dark:text-gray-400">Vídeos explicativos da plataforma</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Aprenda a usar todas as funcionalidades
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Assista aos vídeos explicativos para dominar completamente a plataforma
          </p>
        </div>

        {/* Video Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videoCards.map((video) => (
            <Card 
              key={video.id} 
              className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
              onClick={() => handleVideoClick(video.videoId, video.title)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg">
                      <video.icon className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{video.title}</CardTitle>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{video.duration}</p>
                    </div>
                  </div>
                  <div className="bg-red-600 p-2 rounded-full text-white">
                    <Play className="h-4 w-4" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {video.description}
                </p>
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