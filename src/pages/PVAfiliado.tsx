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
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 px-4 py-2">
              🚀 LANCE EXCLUSIVO - 70% OFF
            </Badge>
            
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Transforme Sua Estratégia de Vendas com 
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> IA Avançada</span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-gray-300 mb-8 leading-relaxed">
              A única plataforma que combina <strong>Inteligência Artificial</strong>, <strong>WhatsApp Business</strong> e 
              <strong> Sistema de Afiliados</strong> para multiplicar seus resultados em até <strong>340%</strong>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-4 text-lg font-semibold shadow-2xl transform hover:scale-105 transition-all duration-300"
                onClick={() => window.open('https://pay.kiwify.com.br/N2nYkko', '_blank')}
              >
                <Zap className="mr-2 h-5 w-5" />
                QUERO ACESSO AGORA
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="border-white text-white hover:bg-white hover:text-slate-900 px-8 py-4 text-lg font-semibold"
              >
                <PlayCircle className="mr-2 h-5 w-5" />
                Ver Demonstração
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl lg:text-4xl font-bold text-white mb-2">{stat.number}</div>
                  <div className="text-gray-400 text-sm lg:text-base">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-slate-800/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-12">
              Você Está Perdendo <span className="text-red-400">Milhares de Reais</span> Todos os Meses...
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card className="bg-slate-700/50 border-slate-600 p-6">
                <CardContent className="p-0 text-center">
                  <div className="text-red-400 mb-4">
                    <Clock className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">Tempo Perdido</h3>
                  <p className="text-gray-300">Horas respondendo manualmente cada lead enquanto seus concorrentes vendem no automático</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-700/50 border-slate-600 p-6">
                <CardContent className="p-0 text-center">
                  <div className="text-red-400 mb-4">
                    <TrendingUp className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">Leads Frios</h3>
                  <p className="text-gray-300">90% dos leads esfriam em 5 minutos. Você consegue responder todos nesse tempo?</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-700/50 border-slate-600 p-6">
                <CardContent className="p-0 text-center">
                  <div className="text-red-400 mb-4">
                    <Target className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">Vendas Perdidas</h3>
                  <p className="text-gray-300">Sem qualificação automática, você fecha apenas 2-5% dos seus leads</p>
                </CardContent>
              </Card>
            </div>

            <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-lg p-6 border border-red-500/30">
              <p className="text-xl text-white font-semibold">
                <strong>RESULTADO:</strong> Enquanto você luta para acompanhar manualmente, seus concorrentes estão faturando 
                <span className="text-yellow-400"> 10x mais</span> com automação inteligente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
                A Solução Que Vai <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">Multiplicar Seus Resultados</span>
              </h2>
              <p className="text-xl text-gray-300">
                Apresentamos o <strong>Afiliado IA</strong> - A plataforma mais avançada do mercado
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
              <div>
                <h3 className="text-2xl lg:text-3xl font-bold text-white mb-6">
                  🤖 Atendimento com IA que Nunca Dorme
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-green-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-white font-semibold">Resposta Instantânea 24/7</p>
                      <p className="text-gray-300">Sua IA responde leads em menos de 3 segundos, qualquer hora do dia</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-green-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-white font-semibold">Qualificação Automática</p>
                      <p className="text-gray-300">Identifica leads quentes e agenda automaticamente com você</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-green-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-white font-semibold">Follow-up Inteligente</p>
                      <p className="text-gray-300">Nutre leads frios até estarem prontos para comprar</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <Card className="bg-gradient-to-br from-slate-700 to-slate-800 border-slate-600">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <Smartphone className="h-8 w-8 text-green-400" />
                    <span className="text-white font-semibold">WhatsApp Business</span>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-green-500 text-white p-3 rounded-lg text-sm">
                      Olá! Vi que você tem interesse em aumentar suas vendas. Posso te ajudar com algumas perguntas? 😊
                    </div>
                    <div className="bg-slate-600 text-white p-3 rounded-lg text-sm ml-8">
                      Sim, quero saber mais!
                    </div>
                    <div className="bg-green-500 text-white p-3 rounded-lg text-sm">
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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="bg-slate-700/50 border-slate-600 hover:bg-slate-700/70 transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6">
                    <div className="text-blue-400 mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-3">{feature.title}</h3>
                    <p className="text-gray-300">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-slate-800/50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-white text-center mb-16">
              Resultados Reais de Quem Já Está <span className="text-green-400">Faturando Mais</span>
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="bg-slate-700/50 border-slate-600">
                  <CardContent className="p-6">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-300 mb-4 italic">"{testimonial.content}"</p>
                    <div>
                      <p className="text-white font-semibold">{testimonial.name}</p>
                      <p className="text-gray-400 text-sm">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Urgency Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-lg p-8 border border-red-500/30 mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                ⚡ OFERTA LIMITADA - Apenas 48 Horas ⚡
              </h2>
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="text-left">
                    <p className="text-gray-300 line-through text-xl mb-2">De: R$ 997,00/mês</p>
                    <p className="text-4xl font-bold text-green-400 mb-4">Por: R$ 297,00/mês</p>
                    <Badge className="bg-red-500 text-white">70% OFF - Economia de R$ 700</Badge>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="text-white">Setup Completo GRÁTIS (R$ 500)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="text-white">Treinamento VIP GRÁTIS (R$ 300)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="text-white">Suporte Priority GRÁTIS (R$ 200)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Form */}
      <section id="cta-form" className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Comece Agora e Veja Resultados em 7 Dias
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Cadastre-se e ganhe acesso imediato + bônus exclusivos
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  type="email"
                  placeholder="Seu melhor e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 px-6 py-4 text-lg bg-white border-0"
                />
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  size="lg"
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-4 text-lg"
                >
                  {isSubmitting ? (
                    "Processando..."
                  ) : (
                    <>
                      QUERO ACESSO AGORA
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-8 flex items-center justify-center gap-4 text-blue-100">
              <Shield className="h-5 w-5" />
              <span className="text-sm">Seus dados estão 100% seguros conosco</span>
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