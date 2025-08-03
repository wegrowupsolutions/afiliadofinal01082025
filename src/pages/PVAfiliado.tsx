import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Star, 
  TrendingUp, 
  MessageSquare, 
  Users, 
  BarChart3,
  Zap,
  Shield,
  Clock,
  Target,
  PlayCircle,
  ArrowRight,
  Smartphone,
  Bot,
  Brain
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PVAfiliado = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simular envio - aqui você integraria com seu sistema de captura
    setTimeout(() => {
      setIsSubmitting(false);
      // Redirecionar para checkout ou próxima etapa
      alert('Cadastro realizado! Redirecionando...');
    }, 2000);
  };

  const features = [
    {
      icon: <Bot className="h-6 w-6" />,
      title: "IA Conversacional Avançada",
      description: "Atendimento automatizado 24/7 que converte visitantes em clientes qualificados"
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "WhatsApp Business Integrado",
      description: "Conecte diretamente com seus leads através da plataforma mais usada no Brasil"
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Dashboard de Métricas",
      description: "Acompanhe em tempo real: leads, conversões, ROI e performance completa"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "CRM Inteligente",
      description: "Gerencie todos os seus clientes em um só lugar com automação inteligente"
    },
    {
      icon: <Brain className="h-6 w-6" />,
      title: "Base de Conhecimento IA",
      description: "Treine sua IA com seus próprios materiais e estratégias de vendas"
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Sistema de Afiliados",
      description: "Crie sua rede de afiliados e multiplique seus resultados exponencialmente"
    }
  ];

  const testimonials = [
    {
      name: "Carlos Silva",
      role: "Empreendedor Digital",
      content: "Em 30 dias aumentei minha taxa de conversão em 340%. A IA trabalha enquanto eu durmo!",
      rating: 5
    },
    {
      name: "Marina Costa",
      role: "Coach de Negócios",
      content: "Automatizei 90% do meu atendimento e agora foco apenas em fechar vendas. Revolucionário!",
      rating: 5
    },
    {
      name: "Roberto Mendes",
      role: "Consultor de Vendas",
      content: "Meus afiliados agora vendem 3x mais. O sistema é intuitivo e os resultados são imediatos.",
      rating: 5
    }
  ];

  const stats = [
    { number: "10.000+", label: "Leads Qualificados" },
    { number: "95%", label: "Taxa de Satisfação" },
    { number: "340%", label: "Aumento Médio em Vendas" },
    { number: "24/7", label: "Atendimento Automatizado" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
        <div className="relative container mx-auto px-4 py-12 sm:py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 sm:mb-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base">
              🚀 LANCE EXCLUSIVO - 79% OFF
            </Badge>
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
              Transforme Sua Estratégia de Vendas com 
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> IA Avançada</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 mb-6 sm:mb-8 leading-relaxed px-2">
              A única plataforma que combina <strong>Inteligência Artificial</strong>, <strong>WhatsApp Business</strong> e 
              <strong> Sistema de Afiliados</strong> para multiplicar seus resultados em até <strong>340%</strong>
            </p>

            <div className="flex flex-col gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-12 px-4">
              <Button 
                size="lg" 
                className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold shadow-2xl transform hover:scale-105 transition-all duration-300"
                onClick={() => window.open('https://pay.kiwify.com.br/N2nYkko', '_blank')}
              >
                <Zap className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                QUERO ACESSO AGORA
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-slate-900 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold"
                onClick={() => window.open('https://wa.me/5511910362476?text=Ol%C3%A1%20quero%20testar%20o%20agente%20afiliado%20com%20ingtelig%C3%AAncia%20artificial', '_blank')}
              >
                <PlayCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Ver Demonstração
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mt-8 sm:mt-12 lg:mt-16">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2">{stat.number}</div>
                  <div className="text-gray-400 text-xs sm:text-sm lg:text-base">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-slate-800/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-8 sm:mb-12">
              Você Está Perdendo <span className="text-red-400">Milhares de Reais</span> Todos os Meses...
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
              <Card className="bg-slate-700/50 border-slate-600 p-4 sm:p-6">
                <CardContent className="p-0 text-center">
                  <div className="text-red-400 mb-3 sm:mb-4">
                    <Clock className="h-10 w-10 sm:h-12 sm:w-12 mx-auto" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">Tempo Perdido</h3>
                  <p className="text-sm sm:text-base text-gray-300">Horas respondendo manualmente cada lead enquanto seus concorrentes vendem no automático</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-700/50 border-slate-600 p-4 sm:p-6">
                <CardContent className="p-0 text-center">
                  <div className="text-red-400 mb-3 sm:mb-4">
                    <TrendingUp className="h-10 w-10 sm:h-12 sm:w-12 mx-auto" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">Leads Frios</h3>
                  <p className="text-sm sm:text-base text-gray-300">90% dos leads esfriam em 5 minutos. Você consegue responder todos nesse tempo?</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-700/50 border-slate-600 p-4 sm:p-6">
                <CardContent className="p-0 text-center">
                  <div className="text-red-400 mb-3 sm:mb-4">
                    <Target className="h-10 w-10 sm:h-12 sm:w-12 mx-auto" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">Vendas Perdidas</h3>
                  <p className="text-sm sm:text-base text-gray-300">Sem qualificação automática, você fecha apenas 2-5% dos seus leads</p>
                </CardContent>
              </Card>
            </div>

            <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-lg p-4 sm:p-6 border border-red-500/30">
              <p className="text-base sm:text-lg lg:text-xl text-white font-semibold">
                <strong>RESULTADO:</strong> Enquanto você luta para acompanhar manualmente, seus concorrentes estão faturando 
                <span className="text-yellow-400"> 10x mais</span> com automação inteligente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">
                A Solução Que Vai <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">Multiplicar Seus Resultados</span>
              </h2>
              <p className="text-lg sm:text-xl text-gray-300 px-4">
                Apresentamos o <strong>Afiliado IA</strong> - A plataforma mais avançada do mercado
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center mb-12 sm:mb-16 lg:mb-20">
              <div className="order-2 lg:order-1">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-4 sm:mb-6">
                  🤖 Atendimento com IA que Nunca Dorme
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-white font-semibold text-sm sm:text-base">Resposta Instantânea 24/7</p>
                      <p className="text-gray-300 text-sm sm:text-base">Sua IA responde leads em menos de 3 segundos, qualquer hora do dia</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-white font-semibold text-sm sm:text-base">Qualificação Automática</p>
                      <p className="text-gray-300 text-sm sm:text-base">Identifica leads quentes e agenda automaticamente com você</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-white font-semibold text-sm sm:text-base">Follow-up Inteligente</p>
                      <p className="text-gray-300 text-sm sm:text-base">Nutre leads frios até estarem prontos para comprar</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <Card className="bg-gradient-to-br from-slate-700 to-slate-800 border-slate-600 order-1 lg:order-2">
                <CardContent className="p-4 sm:p-6 lg:p-8">
                  <div className="flex items-center gap-3 mb-3 sm:mb-4">
                    <Smartphone className="h-6 w-6 sm:h-8 sm:w-8 text-green-400" />
                    <span className="text-white font-semibold text-sm sm:text-base">WhatsApp Business</span>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="bg-green-500 text-white p-2 sm:p-3 rounded-lg text-xs sm:text-sm">
                      Olá! Vi que você tem interesse em aumentar suas vendas. Posso te ajudar com algumas perguntas? 😊
                    </div>
                    <div className="bg-slate-600 text-white p-2 sm:p-3 rounded-lg text-xs sm:text-sm ml-4 sm:ml-8">
                      Sim, quero saber mais!
                    </div>
                    <div className="bg-green-500 text-white p-2 sm:p-3 rounded-lg text-xs sm:text-sm">
                      Perfeito! Qual é o seu maior desafio em vendas hoje? 
                      1️⃣ Gerar mais leads
                      2️⃣ Converter leads em clientes  
                      3️⃣ Automatizar processos
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="bg-slate-700/50 border-slate-600 hover:bg-slate-700/70 transition-all duration-300 hover:scale-105">
                  <CardContent className="p-4 sm:p-6">
                    <div className="text-blue-400 mb-3 sm:mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">{feature.title}</h3>
                    <p className="text-sm sm:text-base text-gray-300">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 sm:py-16 lg:py-20 bg-slate-800/50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white text-center mb-12 sm:mb-16">
              Resultados Reais de Quem Já Está <span className="text-green-400">Faturando Mais</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="bg-slate-700/50 border-slate-600">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex mb-3 sm:mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-sm sm:text-base text-gray-300 mb-3 sm:mb-4 italic">"{testimonial.content}"</p>
                    <div>
                      <p className="text-white font-semibold text-sm sm:text-base">{testimonial.name}</p>
                      <p className="text-gray-400 text-xs sm:text-sm">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Urgency Section */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-lg p-4 sm:p-6 lg:p-8 border border-red-500/30 mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">
                ⚡ OFERTA LIMITADA - Apenas 48 Horas ⚡
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center">
                <div>
                  <div className="text-center md:text-left">
                    <p className="text-gray-300 line-through text-lg sm:text-xl mb-2">De: R$ 97,00/mês</p>
                    <p className="text-3xl sm:text-4xl font-bold text-green-400 mb-3 sm:mb-4">Por: R$ 19,90/mês</p>
                    <Badge className="bg-red-500 text-white text-sm sm:text-base">79% OFF - Economia de R$ 77,10</Badge>
                  </div>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-2 justify-center md:justify-start">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
                    <span className="text-white text-sm sm:text-base">Setup Completo GRÁTIS (R$ 500)</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center md:justify-start">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
                    <span className="text-white text-sm sm:text-base">Treinamento VIP GRÁTIS (R$ 300)</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center md:justify-start">
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
                    <span className="text-white text-sm sm:text-base">Suporte Priority GRÁTIS (R$ 200)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Form */}
      <section id="cta-form" className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">
              Comece Agora e Veja Resultados em 7 Dias
            </h2>
            <p className="text-lg sm:text-xl text-blue-100 mb-6 sm:mb-8 px-4">
              Cadastre-se e ganhe acesso imediato + bônus exclusivos
            </p>

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div className="flex flex-col gap-3 sm:gap-4">
                <Input
                  type="email"
                  placeholder="Seu melhor e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg bg-white border-0"
                />
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  size="lg"
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg"
                >
                  {isSubmitting ? (
                    "Processando..."
                  ) : (
                    <>
                      QUERO ACESSO AGORA
                      <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                    </>
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-6 sm:mt-8 flex items-center justify-center gap-2 sm:gap-4 text-blue-100">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs sm:text-sm">Seus dados estão 100% seguros conosco</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-900 border-t border-slate-700">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Afiliado IA</h3>
            <p className="text-gray-400 mb-8">
              A plataforma mais avançada para automatizar e multiplicar suas vendas com Inteligência Artificial
            </p>
            
            <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-400 mb-8">
              <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
              <a href="#" className="hover:text-white transition-colors">Política de Privacidade</a>
              <a href="#" className="hover:text-white transition-colors">Suporte</a>
              <a href="#" className="hover:text-white transition-colors">Contato</a>
            </div>
            
            <p className="text-gray-500 text-sm">
              © 2025 Afiliado IA. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PVAfiliado;