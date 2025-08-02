import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowLeft, Settings2, Plus, Trash2, Bot, CheckCircle2, Circle, Save, Info, Sparkles, MessageSquare, Target, Users, Lightbulb, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface PromptData {
  contexto: {
    cenarioEspecifico: string;
    problemaResolver: string;
    resultadoEsperado: string;
    publicoAlvo: string;
    ambiente: string;
  };
  personalidade: {
    tomVoz: string;
    nivelLinguagem: string;
    caracteristicasPersonalidade: string;
    conhecimentosEspecificos: string;
  };
  diretrizes: {
    politicasImportantes: string;
    limitesAtuacao: string;
    restricoesLegais: string;
    procedimentosObrigatorios: string;
    informacoesConfidenciais: string;
  };
  estruturaConversa: string;
  faq: string;
  exemplosUso: string;
  metricasSucesso: {
    indicadoresQualidade: string;
    metricasDesempenho: string;
    criteriosAvaliacao: string;
  };
  linksPromocao: Array<{ link: string; descricao: string }>;
}

const AgentConfiguration = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [expandedSection, setExpandedSection] = useState<string>('contexto');

  const [promptData, setPromptData] = useState<PromptData>({
    contexto: {
      cenarioEspecifico: '',
      problemaResolver: '',
      resultadoEsperado: '',
      publicoAlvo: '',
      ambiente: ''
    },
    personalidade: {
      tomVoz: '',
      nivelLinguagem: '',
      caracteristicasPersonalidade: '',
      conhecimentosEspecificos: ''
    },
    diretrizes: {
      politicasImportantes: '',
      limitesAtuacao: '',
      restricoesLegais: '',
      procedimentosObrigatorios: '',
      informacoesConfidenciais: ''
    },
    estruturaConversa: '',
    faq: '',
    exemplosUso: '',
    metricasSucesso: {
      indicadoresQualidade: '',
      metricasDesempenho: '',
      criteriosAvaliacao: ''
    },
    linksPromocao: [{ link: '', descricao: '' }]
  });

  const sections = [
    { 
      id: 'contexto', 
      title: 'Contexto', 
      description: 'Define o cenário e objetivo do agente', 
      icon: Target, 
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50/50 to-transparent dark:from-blue-950/20'
    },
    { 
      id: 'personalidade', 
      title: 'Personalidade', 
      description: 'Configure o comportamento e características', 
      icon: Bot, 
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-50/50 to-transparent dark:from-purple-950/20'
    },
    { 
      id: 'diretrizes', 
      title: 'Diretrizes', 
      description: 'Regras e restrições do negócio', 
      icon: Shield, 
      color: 'from-green-500 to-green-600',
      bgColor: 'from-green-50/50 to-transparent dark:from-green-950/20'
    },
    { 
      id: 'estrutura', 
      title: 'Estrutura da Conversa', 
      description: 'Passo a passo do raciocínio', 
      icon: MessageSquare, 
      color: 'from-orange-500 to-orange-600',
      bgColor: 'from-orange-50/50 to-transparent dark:from-orange-950/20'
    },
    { 
      id: 'faq', 
      title: 'FAQ', 
      description: 'Perguntas frequentes e respostas', 
      icon: Info, 
      color: 'from-cyan-500 to-cyan-600',
      bgColor: 'from-cyan-50/50 to-transparent dark:from-cyan-950/20'
    },
    { 
      id: 'exemplos', 
      title: 'Exemplos de Uso', 
      description: 'Interações práticas e modelos', 
      icon: Sparkles, 
      color: 'from-pink-500 to-pink-600',
      bgColor: 'from-pink-50/50 to-transparent dark:from-pink-950/20'
    },
    { 
      id: 'metricas', 
      title: 'Métricas de Sucesso', 
      description: 'Como medir o desempenho', 
      icon: CheckCircle2, 
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'from-emerald-50/50 to-transparent dark:from-emerald-950/20'
    },
    { 
      id: 'links', 
      title: 'Links de Divulgação', 
      description: 'Links para divulgação do produto', 
      icon: Plus, 
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'from-indigo-50/50 to-transparent dark:from-indigo-950/20'
    }
  ];

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    loadExistingPrompt();
  }, [user, navigate]);

  useEffect(() => {
    calculateCompletionPercentage();
  }, [promptData]);

  // Auto-save functionality
  useEffect(() => {
    const autoSaveTimer = setTimeout(() => {
      if (completionPercentage > 0 && !isSaving) {
        handleAutoSave();
      }
    }, 10000); // Auto-save after 10 seconds of inactivity

    return () => clearTimeout(autoSaveTimer);
  }, [promptData, completionPercentage, isSaving]);

  const loadExistingPrompt = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('prompt')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar prompt:', error);
        return;
      }

      if (data?.prompt) {
        try {
          // Tenta primeiro carregar como JSON (dados antigos)
          const parsedData = JSON.parse(data.prompt);
          setPromptData({ ...promptData, ...parsedData });
        } catch (e) {
          // Se não for JSON, assume que já é markdown e deixa os campos vazios para nova edição
          console.log('Prompt já salvo em markdown, iniciando edição nova');
        }
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateCompletionPercentage = () => {
    const totalFields = 16;
    let filledFields = 0;

    if (promptData.contexto.cenarioEspecifico) filledFields++;
    if (promptData.contexto.problemaResolver) filledFields++;
    if (promptData.contexto.resultadoEsperado) filledFields++;
    if (promptData.contexto.publicoAlvo) filledFields++;
    if (promptData.contexto.ambiente) filledFields++;

    if (promptData.personalidade.tomVoz) filledFields++;
    if (promptData.personalidade.nivelLinguagem) filledFields++;
    if (promptData.personalidade.caracteristicasPersonalidade) filledFields++;
    if (promptData.personalidade.conhecimentosEspecificos) filledFields++;

    if (promptData.diretrizes.politicasImportantes) filledFields++;
    if (promptData.diretrizes.limitesAtuacao) filledFields++;
    if (promptData.diretrizes.restricoesLegais) filledFields++;
    if (promptData.diretrizes.procedimentosObrigatorios) filledFields++;
    if (promptData.diretrizes.informacoesConfidenciais) filledFields++;

    if (promptData.estruturaConversa) filledFields++;
    if (promptData.faq) filledFields++;

    setCompletionPercentage(Math.round((filledFields / totalFields) * 100));
  };

  const generateMarkdownPrompt = (): string => {
    return `Haja como um especialista em engenharia de prompts com base na técnica COT (Chain of Thought) e me ajude a criar um prompt de engenharia seguindo o framework abaixo:

## 1. CONTEXTO
[Descreva aqui o cenário específico e objetivo do prompt]
${promptData.contexto.cenarioEspecifico || '- Qual é o problema que precisa ser resolvido?'}
${promptData.contexto.problemaResolver || '- Qual é o resultado esperado?'}
${promptData.contexto.resultadoEsperado || '- Quem é o público-alvo?'}
${promptData.contexto.publicoAlvo || '- Em qual ambiente/situação será utilizado?'}
${promptData.contexto.ambiente || ''}

## 2. PERSONALIDADE
[Defina o comportamento e características do agente]
- Tom de voz (formal/informal): ${promptData.personalidade.tomVoz || '[Não definido]'}
- Nível de linguagem: ${promptData.personalidade.nivelLinguagem || '[Não definido]'}
- Características de personalidade específicas: ${promptData.personalidade.caracteristicasPersonalidade || '[Não definido]'}
- Conhecimentos específicos necessários: ${promptData.personalidade.conhecimentosEspecificos || '[Não definido]'}

## 3. DIRETRIZES
[Liste as regras e restrições do negócio]
- Políticas importantes: ${promptData.diretrizes.politicasImportantes || '[Não definido]'}
- Limites de atuação: ${promptData.diretrizes.limitesAtuacao || '[Não definido]'}
- Restrições legais ou éticas: ${promptData.diretrizes.restricoesLegais || '[Não definido]'}
- Procedimentos obrigatórios: ${promptData.diretrizes.procedimentosObrigatorios || '[Não definido]'}
- Informações confidenciais ou sensíveis: ${promptData.diretrizes.informacoesConfidenciais || '[Não definido]'}

## 4. ESTRUTURA DA CONVERSA
[Detalhe o passo a passo do raciocínio]
${promptData.estruturaConversa || `1. Primeiro passo
- Subtarefas
- Considerações importantes
2. Segundo passo
- Subtarefas
- Considerações importantes
[Continue com os passos necessários]`}

## 5. FAQ
[Liste as perguntas frequentes e suas respostas]
${promptData.faq || `P1: [Pergunta frequente 1]
R1: [Resposta detalhada]
P2: [Pergunta frequente 2]
R2: [Resposta detalhada]
[Continue com mais perguntas relevantes]`}

## 6. EXEMPLOS DE USO
[Forneça exemplos práticos de interações]
${promptData.exemplosUso || `Exemplo 1:
- Situação
- Diálogo modelo
- Resultado esperado
Exemplo 2:
- Situação
- Diálogo modelo
- Resultado esperado`}

## 7. MÉTRICAS DE SUCESSO
[Defina como medir o sucesso do prompt]
- Indicadores de qualidade: ${promptData.metricasSucesso.indicadoresQualidade || '[Não definido]'}
- Métricas de desempenho: ${promptData.metricasSucesso.metricasDesempenho || '[Não definido]'}
- Critérios de avaliação: ${promptData.metricasSucesso.criteriosAvaliacao || '[Não definido]'}

${promptData.linksPromocao.filter(link => link.link.trim() !== '').length > 0 ? `
## 8. LINKS DE DIVULGAÇÃO
${promptData.linksPromocao.filter(link => link.link.trim() !== '').map((link, index) => `
Link ${index + 1}: ${link.link}
Descrição: ${link.descricao || 'Sem descrição'}
`).join('')}` : ''}

---

Com base nas informações acima, gere um prompt completo que atenda aos requisitos especificados. Gere no formato markdown.

Data e hora atual:
{{ (() => { const nowNoTimeZone = new Date(); const now = nowNoTimeZone; const daysOfWeek = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']; const today = new Date(); const totimeZone = today.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }); const tomorrow = new Date(now.setDate(now.getDate() + 1)); const dayAfterTomorrow = new Date(now.setDate(now.getDate() + 1)); const nextWeekSameDay = new Date(today); nextWeekSameDay.setDate(today.getDate() + 7); return \`A hora atual é \${new Intl.DateTimeFormat('pt-BR', {    hour: '2-digit',    minute: '2-digit',    timeZone: 'America/Sao_Paulo'  }).format(today)} e a data é \${today.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Sao_Paulo' })}, hoje o dia da semana é \${daysOfWeek[today.getDay()]}. A próxima \${daysOfWeek[today.getDay()]} será dia \${nextWeekSameDay.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}.  Amanhã é \${daysOfWeek[tomorrow.getDay()]} dia \${tomorrow.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}. Depois de amanhã é \${daysOfWeek[dayAfterTomorrow.getDay()]} dia \${dayAfterTomorrow.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}.\`; })() }}, use isso!`;
  };

  const handleAutoSave = async () => {
    if (!user) return;

    try {
      const markdownPrompt = generateMarkdownPrompt();
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          prompt: markdownPrompt
        });

      if (!error) {
        setLastSaved(new Date());
      }
    } catch (error) {
      console.error('Erro no auto-save:', error);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const markdownPrompt = generateMarkdownPrompt();

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          prompt: markdownPrompt
        });

      if (error) {
        console.error('Erro ao salvar:', error);
        toast.error('Erro ao salvar configuração');
        return;
      }

      setLastSaved(new Date());
      toast.success('Configuração salva com sucesso!', {
        description: 'Seu agente foi configurado e está pronto para uso.'
      });
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      toast.error('Erro ao salvar configuração');
    } finally {
      setSaving(false);
    }
  };

  const addPromotionLink = () => {
    setPromptData({
      ...promptData,
      linksPromocao: [...promptData.linksPromocao, { link: '', descricao: '' }]
    });
  };

  const removePromotionLink = (index: number) => {
    const newLinks = promptData.linksPromocao.filter((_, i) => i !== index);
    setPromptData({
      ...promptData,
      linksPromocao: newLinks.length > 0 ? newLinks : [{ link: '', descricao: '' }]
    });
  };

  const updatePromotionLink = (index: number, field: 'link' | 'descricao', value: string) => {
    const newLinks = [...promptData.linksPromocao];
    newLinks[index][field] = value;
    setPromptData({
      ...promptData,
      linksPromocao: newLinks
    });
  };

  const getSectionCompletion = (sectionId: string) => {
    switch (sectionId) {
      case 'contexto':
        return Object.values(promptData.contexto).filter(v => v.trim() !== '').length / 5;
      case 'personalidade':
        return Object.values(promptData.personalidade).filter(v => v.trim() !== '').length / 4;
      case 'diretrizes':
        return Object.values(promptData.diretrizes).filter(v => v.trim() !== '').length / 5;
      case 'estrutura':
        return promptData.estruturaConversa.trim() !== '' ? 1 : 0;
      case 'faq':
        return promptData.faq.trim() !== '' ? 1 : 0;
      case 'exemplos':
        return promptData.exemplosUso.trim() !== '' ? 1 : 0;
      case 'metricas':
        return Object.values(promptData.metricasSucesso).filter(v => v.trim() !== '').length / 3;
      case 'links':
        return promptData.linksPromocao.filter(link => link.link.trim() !== '').length > 0 ? 1 : 0;
      default:
        return 0;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground animate-pulse">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        {/* Sticky Header */}
        <div className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/dashboard')}
                  className="text-muted-foreground hover:text-foreground transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="h-6 w-px bg-border"></div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-foreground">
                      Configuração do Agente
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      Configure e personalize seu agente IA
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {lastSaved && (
                  <div className="text-xs text-muted-foreground animate-fade-in">
                    Salvo automaticamente: {lastSaved.toLocaleTimeString('pt-BR')}
                  </div>
                )}
                <Badge variant="secondary" className="bg-primary/10 text-primary font-medium px-3 py-1 animate-scale-in">
                  {completionPercentage}% completo
                </Badge>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-md transition-all duration-200 hover:shadow-lg"
                >
                  {isSaving ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Salvando...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      Salvar
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Progress Overview */}
          <Card className="mb-8 border-0 shadow-xl bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 animate-fade-in">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Progresso da Configuração</h3>
                  <p className="text-muted-foreground">Complete todas as seções para otimizar seu agente</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary mb-1 animate-scale-in">{completionPercentage}%</div>
                  <div className="text-sm text-muted-foreground">
                    {Math.round((completionPercentage / 100) * 16)} de 16 campos
                  </div>
                </div>
              </div>
              
              <Progress value={completionPercentage} className="h-3 mb-6 transition-all duration-500" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {sections.slice(0, 4).map((section, index) => {
                  const completion = getSectionCompletion(section.id);
                  const isComplete = completion === 1;
                  return (
                    <div 
                      key={section.id} 
                      className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-gray-800 border hover:shadow-md transition-all duration-200 cursor-pointer animate-fade-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                      onClick={() => setExpandedSection(section.id)}
                    >
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${section.color} text-white shadow-sm`}>
                        <section.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{section.title}</div>
                        <div className="flex items-center gap-2 mt-1">
                          {isComplete ? (
                            <CheckCircle2 className="h-3 w-3 text-green-500 animate-scale-in" />
                          ) : (
                            <Circle className="h-3 w-3 text-gray-400" />
                          )}
                          <span className="text-xs text-muted-foreground">
                            {isComplete ? 'Completo' : 'Pendente'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Configuration Form */}
          <Card className="border-0 shadow-xl overflow-hidden animate-fade-in">
            <CardContent className="p-0">
              <Accordion 
                type="single" 
                collapsible 
                value={expandedSection}
                onValueChange={setExpandedSection}
                className="space-y-0"
              >
                {/* 1. Contexto */}
                <AccordionItem value="contexto" className="border-b-0">
                  <AccordionTrigger className="px-8 py-6 hover:no-underline hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200">
                    <div className="flex items-center gap-4 w-full">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${sections[0].color} text-white shadow-lg`}>
                        <Target className="h-5 w-5" />
                      </div>
                      <div className="text-left flex-1">
                        <h3 className="text-lg font-semibold">Contexto</h3>
                        <p className="text-sm text-muted-foreground">
                          Define o cenário e objetivo do agente
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress value={getSectionCompletion('contexto') * 100} className="w-16 h-2" />
                        {getSectionCompletion('contexto') === 1 && (
                          <CheckCircle2 className="h-5 w-5 text-green-500 animate-scale-in" />
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-8 pb-8 pt-0">
                    <div className={`space-y-6 bg-gradient-to-br ${sections[0].bgColor} rounded-xl p-6 border border-gray-100 dark:border-gray-700`}>
                      <div className="space-y-3">
                        <Label htmlFor="cenario" className="text-base font-medium flex items-center gap-2">
                          Cenário Específico
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Descreva o contexto onde o agente será utilizado</p>
                            </TooltipContent>
                          </Tooltip>
                        </Label>
                        <Textarea
                          id="cenario"
                          placeholder="Descreva aqui o cenário específico onde o agente será utilizado..."
                          value={promptData.contexto.cenarioEspecifico}
                          onChange={(e) => setPromptData({
                            ...promptData,
                            contexto: { ...promptData.contexto, cenarioEspecifico: e.target.value }
                          })}
                          className="min-h-[120px] resize-none border-0 bg-white dark:bg-gray-800 shadow-sm focus:shadow-md transition-all duration-200"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="problema" className="text-base font-medium">Problema a ser Resolvido</Label>
                        <Textarea
                          id="problema"
                          placeholder="Qual é o problema que precisa ser resolvido?"
                          value={promptData.contexto.problemaResolver}
                          onChange={(e) => setPromptData({
                            ...promptData,
                            contexto: { ...promptData.contexto, problemaResolver: e.target.value }
                          })}
                          className="min-h-[100px] resize-none border-0 bg-white dark:bg-gray-800 shadow-sm focus:shadow-md transition-all duration-200"
                        />
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label htmlFor="resultado" className="text-base font-medium">Resultado Esperado</Label>
                          <Textarea
                            id="resultado"
                            placeholder="Qual é o resultado esperado?"
                            value={promptData.contexto.resultadoEsperado}
                            onChange={(e) => setPromptData({
                              ...promptData,
                              contexto: { ...promptData.contexto, resultadoEsperado: e.target.value }
                            })}
                            className="min-h-[100px] resize-none border-0 bg-white dark:bg-gray-800 shadow-sm focus:shadow-md transition-all duration-200"
                          />
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="publico" className="text-base font-medium">Público-Alvo</Label>
                          <Textarea
                            id="publico"
                            placeholder="Quem é o público-alvo?"
                            value={promptData.contexto.publicoAlvo}
                            onChange={(e) => setPromptData({
                              ...promptData,
                              contexto: { ...promptData.contexto, publicoAlvo: e.target.value }
                            })}
                            className="min-h-[100px] resize-none border-0 bg-white dark:bg-gray-800 shadow-sm focus:shadow-md transition-all duration-200"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="ambiente" className="text-base font-medium">Ambiente/Situação</Label>
                        <Textarea
                          id="ambiente"
                          placeholder="Em qual ambiente/situação será utilizado?"
                          value={promptData.contexto.ambiente}
                          onChange={(e) => setPromptData({
                            ...promptData,
                            contexto: { ...promptData.contexto, ambiente: e.target.value }
                          })}
                          className="min-h-[100px] resize-none border-0 bg-white dark:bg-gray-800 shadow-sm focus:shadow-md transition-all duration-200"
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* 2. Personalidade */}
                <AccordionItem value="personalidade" className="border-b-0">
                  <AccordionTrigger className="px-8 py-6 hover:no-underline hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200">
                    <div className="flex items-center gap-4 w-full">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${sections[1].color} text-white shadow-lg`}>
                        <Bot className="h-5 w-5" />
                      </div>
                      <div className="text-left flex-1">
                        <h3 className="text-lg font-semibold">Personalidade</h3>
                        <p className="text-sm text-muted-foreground">
                          Configure o comportamento e características
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress value={getSectionCompletion('personalidade') * 100} className="w-16 h-2" />
                        {getSectionCompletion('personalidade') === 1 && (
                          <CheckCircle2 className="h-5 w-5 text-green-500 animate-scale-in" />
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-8 pb-8 pt-0">
                    <div className={`space-y-6 bg-gradient-to-br ${sections[1].bgColor} rounded-xl p-6 border border-gray-100 dark:border-gray-700`}>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label htmlFor="tomVoz" className="text-base font-medium">Tom de Voz</Label>
                          <Input
                            id="tomVoz"
                            placeholder="Ex: formal, informal, amigável, profissional"
                            value={promptData.personalidade.tomVoz}
                            onChange={(e) => setPromptData({
                              ...promptData,
                              personalidade: { ...promptData.personalidade, tomVoz: e.target.value }
                            })}
                            className="border-0 bg-white dark:bg-gray-800 shadow-sm focus:shadow-md transition-all duration-200"
                          />
                          <p className="text-sm text-muted-foreground">
                            Como o agente deve se comunicar
                          </p>
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="nivelLinguagem" className="text-base font-medium">Nível de Linguagem</Label>
                          <Input
                            id="nivelLinguagem"
                            placeholder="Ex: técnico, simples, acadêmico, coloquial"
                            value={promptData.personalidade.nivelLinguagem}
                            onChange={(e) => setPromptData({
                              ...promptData,
                              personalidade: { ...promptData.personalidade, nivelLinguagem: e.target.value }
                            })}
                            className="border-0 bg-white dark:bg-gray-800 shadow-sm focus:shadow-md transition-all duration-200"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="caracteristicas" className="text-base font-medium">Características de Personalidade</Label>
                        <Textarea
                          id="caracteristicas"
                          placeholder="Descreva as características específicas de personalidade que o agente deve ter..."
                          value={promptData.personalidade.caracteristicasPersonalidade}
                          onChange={(e) => setPromptData({
                            ...promptData,
                            personalidade: { ...promptData.personalidade, caracteristicasPersonalidade: e.target.value }
                          })}
                          className="min-h-[120px] resize-none border-0 bg-white dark:bg-gray-800 shadow-sm focus:shadow-md transition-all duration-200"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="conhecimentos" className="text-base font-medium">Conhecimentos Específicos</Label>
                        <Textarea
                          id="conhecimentos"
                          placeholder="Liste os conhecimentos específicos necessários para o agente..."
                          value={promptData.personalidade.conhecimentosEspecificos}
                          onChange={(e) => setPromptData({
                            ...promptData,
                            personalidade: { ...promptData.personalidade, conhecimentosEspecificos: e.target.value }
                          })}
                          className="min-h-[120px] resize-none border-0 bg-white dark:bg-gray-800 shadow-sm focus:shadow-md transition-all duration-200"
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* 3. Diretrizes */}
                <AccordionItem value="diretrizes" className="border-b-0">
                  <AccordionTrigger className="px-8 py-6 hover:no-underline hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200">
                    <div className="flex items-center gap-4 w-full">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${sections[2].color} text-white shadow-lg`}>
                        <Shield className="h-5 w-5" />
                      </div>
                      <div className="text-left flex-1">
                        <h3 className="text-lg font-semibold">Diretrizes</h3>
                        <p className="text-sm text-muted-foreground">
                          Regras e restrições do negócio
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress value={getSectionCompletion('diretrizes') * 100} className="w-16 h-2" />
                        {getSectionCompletion('diretrizes') === 1 && (
                          <CheckCircle2 className="h-5 w-5 text-green-500 animate-scale-in" />
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-8 pb-8 pt-0">
                    <div className={`space-y-6 bg-gradient-to-br ${sections[2].bgColor} rounded-xl p-6 border border-gray-100 dark:border-gray-700`}>
                      <div className="space-y-3">
                        <Label htmlFor="politicas" className="text-base font-medium">Políticas Importantes</Label>
                        <Textarea
                          id="politicas"
                          placeholder="Liste as políticas importantes que o agente deve seguir..."
                          value={promptData.diretrizes.politicasImportantes}
                          onChange={(e) => setPromptData({
                            ...promptData,
                            diretrizes: { ...promptData.diretrizes, politicasImportantes: e.target.value }
                          })}
                          className="min-h-[120px] resize-none border-0 bg-white dark:bg-gray-800 shadow-sm focus:shadow-md transition-all duration-200"
                        />
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label htmlFor="limites" className="text-base font-medium">Limites de Atuação</Label>
                          <Textarea
                            id="limites"
                            placeholder="Defina os limites de atuação do agente..."
                            value={promptData.diretrizes.limitesAtuacao}
                            onChange={(e) => setPromptData({
                              ...promptData,
                              diretrizes: { ...promptData.diretrizes, limitesAtuacao: e.target.value }
                            })}
                            className="min-h-[100px] resize-none border-0 bg-white dark:bg-gray-800 shadow-sm focus:shadow-md transition-all duration-200"
                          />
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="restricoes" className="text-base font-medium">Restrições Legais ou Éticas</Label>
                          <Textarea
                            id="restricoes"
                            placeholder="Liste as restrições legais ou éticas..."
                            value={promptData.diretrizes.restricoesLegais}
                            onChange={(e) => setPromptData({
                              ...promptData,
                              diretrizes: { ...promptData.diretrizes, restricoesLegais: e.target.value }
                            })}
                            className="min-h-[100px] resize-none border-0 bg-white dark:bg-gray-800 shadow-sm focus:shadow-md transition-all duration-200"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="procedimentos" className="text-base font-medium">Procedimentos Obrigatórios</Label>
                        <Textarea
                          id="procedimentos"
                          placeholder="Descreva os procedimentos obrigatórios que o agente deve seguir..."
                          value={promptData.diretrizes.procedimentosObrigatorios}
                          onChange={(e) => setPromptData({
                            ...promptData,
                            diretrizes: { ...promptData.diretrizes, procedimentosObrigatorios: e.target.value }
                          })}
                          className="min-h-[120px] resize-none border-0 bg-white dark:bg-gray-800 shadow-sm focus:shadow-md transition-all duration-200"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="confidenciais" className="text-base font-medium">Informações Confidenciais ou Sensíveis (Opcional)</Label>
                        <Textarea
                          id="confidenciais"
                          placeholder="Liste informações que o agente deve tratar com confidencialidade..."
                          value={promptData.diretrizes.informacoesConfidenciais}
                          onChange={(e) => setPromptData({
                            ...promptData,
                            diretrizes: { ...promptData.diretrizes, informacoesConfidenciais: e.target.value }
                          })}
                          className="min-h-[100px] resize-none border-0 bg-white dark:bg-gray-800 shadow-sm focus:shadow-md transition-all duration-200"
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* 4. Estrutura da Conversa */}
                <AccordionItem value="estrutura" className="border-b-0">
                  <AccordionTrigger className="px-8 py-6 hover:no-underline hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200">
                    <div className="flex items-center gap-4 w-full">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${sections[3].color} text-white shadow-lg`}>
                        <MessageSquare className="h-5 w-5" />
                      </div>
                      <div className="text-left flex-1">
                        <h3 className="text-lg font-semibold">Estrutura da Conversa</h3>
                        <p className="text-sm text-muted-foreground">
                          Passo a passo do raciocínio
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress value={getSectionCompletion('estrutura') * 100} className="w-16 h-2" />
                        {getSectionCompletion('estrutura') === 1 && (
                          <CheckCircle2 className="h-5 w-5 text-green-500 animate-scale-in" />
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-8 pb-8 pt-0">
                    <div className={`space-y-6 bg-gradient-to-br ${sections[3].bgColor} rounded-xl p-6 border border-gray-100 dark:border-gray-700`}>
                      <div className="space-y-3">
                        <Label htmlFor="estrutura" className="text-base font-medium flex items-center gap-2">
                          Passo a Passo do Raciocínio
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Defina como o agente deve estruturar suas respostas</p>
                            </TooltipContent>
                          </Tooltip>
                        </Label>
                        <Textarea
                          id="estrutura"
                          placeholder="Detalhe o passo a passo do raciocínio do agente:

1. Primeiro passo
   - Subtarefas
   - Considerações importantes

2. Segundo passo
   - Subtarefas
   - Considerações importantes

[Continue com os passos necessários]"
                          value={promptData.estruturaConversa}
                          onChange={(e) => setPromptData({
                            ...promptData,
                            estruturaConversa: e.target.value
                          })}
                          className="min-h-[200px] resize-none border-0 bg-white dark:bg-gray-800 shadow-sm focus:shadow-md transition-all duration-200"
                        />
                        <p className="text-sm text-muted-foreground">
                          Defina como o agente deve estruturar suas respostas e raciocínio
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* 5. FAQ */}
                <AccordionItem value="faq" className="border-b-0">
                  <AccordionTrigger className="px-8 py-6 hover:no-underline hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200">
                    <div className="flex items-center gap-4 w-full">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${sections[4].color} text-white shadow-lg`}>
                        <Info className="h-5 w-5" />
                      </div>
                      <div className="text-left flex-1">
                        <h3 className="text-lg font-semibold">FAQ</h3>
                        <p className="text-sm text-muted-foreground">
                          Perguntas frequentes e respostas
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress value={getSectionCompletion('faq') * 100} className="w-16 h-2" />
                        {getSectionCompletion('faq') === 1 && (
                          <CheckCircle2 className="h-5 w-5 text-green-500 animate-scale-in" />
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-8 pb-8 pt-0">
                    <div className={`space-y-6 bg-gradient-to-br ${sections[4].bgColor} rounded-xl p-6 border border-gray-100 dark:border-gray-700`}>
                      <div className="space-y-3">
                        <Label htmlFor="faq" className="text-base font-medium">Perguntas e Respostas Frequentes</Label>
                        <Textarea
                          id="faq"
                          placeholder="Liste as perguntas frequentes e suas respostas:

P1: [Pergunta frequente 1]
R1: [Resposta detalhada]

P2: [Pergunta frequente 2]
R2: [Resposta detalhada]

[Continue com mais perguntas relevantes]"
                          value={promptData.faq}
                          onChange={(e) => setPromptData({
                            ...promptData,
                            faq: e.target.value
                          })}
                          className="min-h-[200px] resize-none border-0 bg-white dark:bg-gray-800 shadow-sm focus:shadow-md transition-all duration-200"
                        />
                        <p className="text-sm text-muted-foreground">
                          Inclua as perguntas mais comuns que os usuários podem fazer
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* 6. Exemplos de Uso */}
                <AccordionItem value="exemplos" className="border-b-0">
                  <AccordionTrigger className="px-8 py-6 hover:no-underline hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200">
                    <div className="flex items-center gap-4 w-full">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${sections[5].color} text-white shadow-lg`}>
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <div className="text-left flex-1">
                        <h3 className="text-lg font-semibold">Exemplos de Uso</h3>
                        <p className="text-sm text-muted-foreground">
                          Interações práticas e modelos
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress value={getSectionCompletion('exemplos') * 100} className="w-16 h-2" />
                        {getSectionCompletion('exemplos') === 1 && (
                          <CheckCircle2 className="h-5 w-5 text-green-500 animate-scale-in" />
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-8 pb-8 pt-0">
                    <div className={`space-y-6 bg-gradient-to-br ${sections[5].bgColor} rounded-xl p-6 border border-gray-100 dark:border-gray-700`}>
                      <div className="space-y-3">
                        <Label htmlFor="exemplos" className="text-base font-medium">Exemplos Práticos de Interações</Label>
                        <Textarea
                          id="exemplos"
                          placeholder="Forneça exemplos práticos de interações:

Exemplo 1:
- Situação: [Descreva a situação]
- Diálogo modelo: [Mostre a conversa]
- Resultado esperado: [O que deve acontecer]

Exemplo 2:
- Situação: [Descreva a situação]
- Diálogo modelo: [Mostre a conversa]
- Resultado esperado: [O que deve acontecer]"
                          value={promptData.exemplosUso}
                          onChange={(e) => setPromptData({
                            ...promptData,
                            exemplosUso: e.target.value
                          })}
                          className="min-h-[200px] resize-none border-0 bg-white dark:bg-gray-800 shadow-sm focus:shadow-md transition-all duration-200"
                        />
                        <p className="text-sm text-muted-foreground">
                          Demonstre como o agente deve se comportar em situações específicas
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* 7. Métricas de Sucesso */}
                <AccordionItem value="metricas" className="border-b-0">
                  <AccordionTrigger className="px-8 py-6 hover:no-underline hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200">
                    <div className="flex items-center gap-4 w-full">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${sections[6].color} text-white shadow-lg`}>
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div className="text-left flex-1">
                        <h3 className="text-lg font-semibold">Métricas de Sucesso</h3>
                        <p className="text-sm text-muted-foreground">
                          Como medir o desempenho
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress value={getSectionCompletion('metricas') * 100} className="w-16 h-2" />
                        {getSectionCompletion('metricas') === 1 && (
                          <CheckCircle2 className="h-5 w-5 text-green-500 animate-scale-in" />
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-8 pb-8 pt-0">
                    <div className={`space-y-6 bg-gradient-to-br ${sections[6].bgColor} rounded-xl p-6 border border-gray-100 dark:border-gray-700`}>
                      <div className="space-y-3">
                        <Label htmlFor="indicadores" className="text-base font-medium">Indicadores de Qualidade</Label>
                        <Textarea
                          id="indicadores"
                          placeholder="Defina os indicadores de qualidade para avaliar o desempenho do agente..."
                          value={promptData.metricasSucesso.indicadoresQualidade}
                          onChange={(e) => setPromptData({
                            ...promptData,
                            metricasSucesso: { ...promptData.metricasSucesso, indicadoresQualidade: e.target.value }
                          })}
                          className="min-h-[100px] resize-none border-0 bg-white dark:bg-gray-800 shadow-sm focus:shadow-md transition-all duration-200"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="metricasDesempenho" className="text-base font-medium">Métricas de Desempenho</Label>
                        <Textarea
                          id="metricasDesempenho"
                          placeholder="Liste as métricas de desempenho (tempo de resposta, precisão, etc.)..."
                          value={promptData.metricasSucesso.metricasDesempenho}
                          onChange={(e) => setPromptData({
                            ...promptData,
                            metricasSucesso: { ...promptData.metricasSucesso, metricasDesempenho: e.target.value }
                          })}
                          className="min-h-[100px] resize-none border-0 bg-white dark:bg-gray-800 shadow-sm focus:shadow-md transition-all duration-200"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="criterios" className="text-base font-medium">Critérios de Avaliação</Label>
                        <Textarea
                          id="criterios"
                          placeholder="Descreva os critérios de avaliação para determinar o sucesso..."
                          value={promptData.metricasSucesso.criteriosAvaliacao}
                          onChange={(e) => setPromptData({
                            ...promptData,
                            metricasSucesso: { ...promptData.metricasSucesso, criteriosAvaliacao: e.target.value }
                          })}
                          className="min-h-[100px] resize-none border-0 bg-white dark:bg-gray-800 shadow-sm focus:shadow-md transition-all duration-200"
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* 8. Links de Divulgação */}
                <AccordionItem value="links" className="border-b-0">
                  <AccordionTrigger className="px-8 py-6 hover:no-underline hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200">
                    <div className="flex items-center gap-4 w-full">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${sections[7].color} text-white shadow-lg`}>
                        <Plus className="h-5 w-5" />
                      </div>
                      <div className="text-left flex-1">
                        <h3 className="text-lg font-semibold">Links de Divulgação</h3>
                        <p className="text-sm text-muted-foreground">
                          Links para divulgação do produto
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress value={getSectionCompletion('links') * 100} className="w-16 h-2" />
                        {getSectionCompletion('links') === 1 && (
                          <CheckCircle2 className="h-5 w-5 text-green-500 animate-scale-in" />
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-8 pb-8 pt-0">
                    <div className={`space-y-6 bg-gradient-to-br ${sections[7].bgColor} rounded-xl p-6 border border-gray-100 dark:border-gray-700`}>
                      {promptData.linksPromocao.map((link, index) => (
                        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-3 border shadow-sm">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium flex items-center gap-2">
                              Link {index + 1} 
                              {index === 0 && <span className="text-red-500">*</span>}
                              <Badge variant="outline" className="text-xs">
                                {index === 0 ? 'Principal' : 'Adicional'}
                              </Badge>
                            </Label>
                            {promptData.linksPromocao.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removePromotionLink(index)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          
                          <div>
                            <Label htmlFor={`link-${index}`} className="text-sm text-muted-foreground">URL do Link</Label>
                            <Input
                              id={`link-${index}`}
                              placeholder="https://exemplo.com"
                              value={link.link}
                              onChange={(e) => updatePromotionLink(index, 'link', e.target.value)}
                              className="border-0 bg-gray-50 dark:bg-gray-700 shadow-sm focus:shadow-md transition-all duration-200"
                            />
                            {index === 0 && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Link principal obrigatório para divulgação
                              </p>
                            )}
                          </div>
                          
                          <div>
                            <Label htmlFor={`desc-${index}`} className="text-sm text-muted-foreground">Descrição</Label>
                            <Input
                              id={`desc-${index}`}
                              placeholder="Descrição do link"
                              value={link.descricao}
                              onChange={(e) => updatePromotionLink(index, 'descricao', e.target.value)}
                              className="border-0 bg-gray-50 dark:bg-gray-700 shadow-sm focus:shadow-md transition-all duration-200"
                            />
                          </div>
                        </div>
                      ))}
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addPromotionLink}
                        className="w-full border-dashed border-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar novo link
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>

              </Accordion>

              {/* Save Button Fixed */}
              <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t p-6 mt-8">
                <div className="flex justify-between items-center max-w-6xl mx-auto">
                  <div className="text-sm text-muted-foreground">
                    {lastSaved ? (
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        Salvo em: {lastSaved.toLocaleTimeString('pt-BR')}
                      </span>
                    ) : (
                      'Faça alterações para salvar automaticamente'
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => navigate('/dashboard')}
                      className="hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-md transition-all duration-200 hover:shadow-lg min-w-[140px]"
                    >
                      {isSaving ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Salvando...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Save className="h-4 w-4" />
                          Salvar Configuração
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default AgentConfiguration;