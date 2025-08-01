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
import { ArrowLeft, Settings2, Plus, Trash2 } from 'lucide-react';
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
          const parsedData = JSON.parse(data.prompt);
          setPromptData({ ...promptData, ...parsedData });
        } catch (e) {
          console.error('Erro ao parsear prompt existente:', e);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateCompletionPercentage = () => {
    const totalFields = 16; // Total de campos obrigatórios
    let filledFields = 0;

    // Contexto (5 campos)
    if (promptData.contexto.cenarioEspecifico) filledFields++;
    if (promptData.contexto.problemaResolver) filledFields++;
    if (promptData.contexto.resultadoEsperado) filledFields++;
    if (promptData.contexto.publicoAlvo) filledFields++;
    if (promptData.contexto.ambiente) filledFields++;

    // Personalidade (4 campos)
    if (promptData.personalidade.tomVoz) filledFields++;
    if (promptData.personalidade.nivelLinguagem) filledFields++;
    if (promptData.personalidade.caracteristicasPersonalidade) filledFields++;
    if (promptData.personalidade.conhecimentosEspecificos) filledFields++;

    // Diretrizes (5 campos)
    if (promptData.diretrizes.politicasImportantes) filledFields++;
    if (promptData.diretrizes.limitesAtuacao) filledFields++;
    if (promptData.diretrizes.restricoesLegais) filledFields++;
    if (promptData.diretrizes.procedimentosObrigatorios) filledFields++;
    if (promptData.diretrizes.informacoesConfidenciais) filledFields++;

    // Outros campos (3 campos)
    if (promptData.estruturaConversa) filledFields++;
    if (promptData.faq) filledFields++;

    setCompletionPercentage(Math.round((filledFields / totalFields) * 100));
  };

  const generateMarkdownPrompt = (): string => {
    const links = promptData.linksPromocao.filter(link => link.link.trim() !== '');
    
    return `# Configuração do Agente IA

## 1. CONTEXTO
${promptData.contexto.cenarioEspecifico || '[Descreva aqui o cenário específico onde o agente será utilizado]'}

### Problema a ser Resolvido
${promptData.contexto.problemaResolver || '[Qual é o problema que precisa ser resolvido?]'}

### Resultado Esperado
${promptData.contexto.resultadoEsperado || '[Qual é o resultado esperado?]'}

### Público-Alvo
${promptData.contexto.publicoAlvo || '[Quem é o público-alvo?]'}

### Ambiente/Situação
${promptData.contexto.ambiente || '[Em qual ambiente/situação será utilizado?]'}

## 2. PERSONALIDADE
[Configure o comportamento e características do agente]

### Tom de Voz
${promptData.personalidade.tomVoz || '[Ex: formal, informal, amigável, profissional]'}

### Nível de Linguagem
${promptData.personalidade.nivelLinguagem || '[Ex: técnico, simples, acadêmico, coloquial]'}

### Características de Personalidade
${promptData.personalidade.caracteristicasPersonalidade || '[Descreva as características específicas de personalidade que o agente deve ter]'}

### Conhecimentos Específicos
${promptData.personalidade.conhecimentosEspecificos || '[Liste os conhecimentos específicos necessários para o agente]'}

## 3. DIRETRIZES
[Regras e restrições do negócio]

### Políticas Importantes
${promptData.diretrizes.politicasImportantes || '[Liste as políticas importantes que o agente deve seguir]'}

### Limites de Atuação
${promptData.diretrizes.limitesAtuacao || '[Defina os limites de atuação do agente]'}

### Restrições Legais ou Éticas
${promptData.diretrizes.restricoesLegais || '[Liste as restrições legais ou éticas]'}

### Procedimentos Obrigatórios
${promptData.diretrizes.procedimentosObrigatorios || '[Descreva os procedimentos obrigatórios que o agente deve seguir]'}

### Informações Confidenciais ou Sensíveis (Opcional)
${promptData.diretrizes.informacoesConfidenciais || '[Liste informações que o agente deve tratar com confidencialidade]'}

## 4. ESTRUTURA DA CONVERSA
[Passo a passo do raciocínio]

${promptData.estruturaConversa || `1. Primeiro passo
   - Subtarefas
   - Considerações importantes

2. Segundo passo
   - Subtarefas
   - Considerações importantes

[Continue com os passos necessários]`}

## 5. FAQ
[Perguntas frequentes e respostas]

${promptData.faq || `P1: [Pergunta frequente 1]
R1: [Resposta detalhada]

P2: [Pergunta frequente 2]
R2: [Resposta detalhada]

[Continue com mais perguntas relevantes]`}

## 6. EXEMPLOS DE USO
[Interações práticas e modelos]

${promptData.exemplosUso || `Exemplo 1:
- Situação: [Descreva a situação]
- Diálogo modelo: [Mostre a conversa]
- Resultado esperado: [O que deve acontecer]

Exemplo 2:
- Situação: [Descreva a situação]
- Diálogo modelo: [Mostre a conversa]
- Resultado esperado: [O que deve acontecer]`}

## 7. MÉTRICAS DE SUCESSO
[Como medir o desempenho]

### Indicadores de Qualidade
${promptData.metricasSucesso.indicadoresQualidade || '[Defina os indicadores de qualidade para avaliar o desempenho do agente]'}

### Métricas de Desempenho
${promptData.metricasSucesso.metricasDesempenho || '[Liste as métricas de desempenho (tempo de resposta, precisão, etc.)]'}

### Critérios de Avaliação
${promptData.metricasSucesso.criteriosAvaliacao || '[Descreva os critérios de avaliação para determinar o sucesso]'}

## 8. LINKS DE DIVULGAÇÃO
[Links para divulgação do produto]

${links.length > 0 ? links.map((link, index) => `### Link ${index + 1}
- **URL:** ${link.link}
- **Descrição:** ${link.descricao}
`).join('\n') : '[Nenhum link configurado]'}

---
*Configuração gerada automaticamente - ${new Date().toLocaleString('pt-BR')}*`;
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const markdownPrompt = generateMarkdownPrompt();
      const dataToSave = JSON.stringify(promptData);

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          prompt: dataToSave
        });

      if (error) {
        console.error('Erro ao salvar:', error);
        toast.error('Erro ao salvar configuração');
        return;
      }

      toast.success('Configuração salva com sucesso!');
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="flex items-center gap-3">
            <Settings2 className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Configuração do Agente
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Configure e personalize seu agente IA para atender suas necessidades específicas
              </p>
            </div>
          </div>
          <div className="ml-auto text-sm text-primary font-medium bg-primary/10 px-3 py-1 rounded-full">
            {completionPercentage}% completo
          </div>
        </div>

        {/* Progress Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <Settings2 className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Progresso da Configuração</h3>
              <span className="text-sm text-muted-foreground ml-auto">
                {completionPercentage}% completo
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        {/* Configuration Form */}
        <Card>
          <CardContent className="p-6">
            <Accordion type="single" collapsible className="space-y-4">
              {/* 1. Contexto */}
              <AccordionItem value="contexto" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                      1
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold">Contexto</h3>
                      <p className="text-sm text-muted-foreground">
                        Define o cenário e objetivo do agente
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 space-y-4">
                  <div>
                    <Label htmlFor="cenario">Cenário Específico</Label>
                    <Textarea
                      id="cenario"
                      placeholder="Descreva aqui o cenário específico onde o agente será utilizado..."
                      value={promptData.contexto.cenarioEspecifico}
                      onChange={(e) => setPromptData({
                        ...promptData,
                        contexto: { ...promptData.contexto, cenarioEspecifico: e.target.value }
                      })}
                      className="mt-1"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Contextualize o ambiente onde o agente vai atuar
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="problema">Problema a ser Resolvido</Label>
                    <Textarea
                      id="problema"
                      placeholder="Qual é o problema que precisa ser resolvido?"
                      value={promptData.contexto.problemaResolver}
                      onChange={(e) => setPromptData({
                        ...promptData,
                        contexto: { ...promptData.contexto, problemaResolver: e.target.value }
                      })}
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="resultado">Resultado Esperado</Label>
                      <Textarea
                        id="resultado"
                        placeholder="Qual é o resultado esperado?"
                        value={promptData.contexto.resultadoEsperado}
                        onChange={(e) => setPromptData({
                          ...promptData,
                          contexto: { ...promptData.contexto, resultadoEsperado: e.target.value }
                        })}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="publico">Público-Alvo</Label>
                      <Textarea
                        id="publico"
                        placeholder="Quem é o público-alvo?"
                        value={promptData.contexto.publicoAlvo}
                        onChange={(e) => setPromptData({
                          ...promptData,
                          contexto: { ...promptData.contexto, publicoAlvo: e.target.value }
                        })}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="ambiente">Ambiente/Situação</Label>
                    <Textarea
                      id="ambiente"
                      placeholder="Em qual ambiente/situação será utilizado?"
                      value={promptData.contexto.ambiente}
                      onChange={(e) => setPromptData({
                        ...promptData,
                        contexto: { ...promptData.contexto, ambiente: e.target.value }
                      })}
                      className="mt-1"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* 2. Personalidade */}
              <AccordionItem value="personalidade" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                      2
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold">Personalidade</h3>
                      <p className="text-sm text-muted-foreground">
                        Configure o comportamento e características
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tomVoz">Tom de Voz</Label>
                      <Input
                        id="tomVoz"
                        placeholder="Ex: formal, informal, amigável, profissional"
                        value={promptData.personalidade.tomVoz}
                        onChange={(e) => setPromptData({
                          ...promptData,
                          personalidade: { ...promptData.personalidade, tomVoz: e.target.value }
                        })}
                        className="mt-1"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Como o agente deve se comunicar
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="nivelLinguagem">Nível de Linguagem</Label>
                      <Input
                        id="nivelLinguagem"
                        placeholder="Ex: técnico, simples, acadêmico, coloquial"
                        value={promptData.personalidade.nivelLinguagem}
                        onChange={(e) => setPromptData({
                          ...promptData,
                          personalidade: { ...promptData.personalidade, nivelLinguagem: e.target.value }
                        })}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="caracteristicas">Características de Personalidade</Label>
                    <Textarea
                      id="caracteristicas"
                      placeholder="Descreva as características específicas de personalidade que o agente deve ter..."
                      value={promptData.personalidade.caracteristicasPersonalidade}
                      onChange={(e) => setPromptData({
                        ...promptData,
                        personalidade: { ...promptData.personalidade, caracteristicasPersonalidade: e.target.value }
                      })}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="conhecimentos">Conhecimentos Específicos</Label>
                    <Textarea
                      id="conhecimentos"
                      placeholder="Liste os conhecimentos específicos necessários para o agente..."
                      value={promptData.personalidade.conhecimentosEspecificos}
                      onChange={(e) => setPromptData({
                        ...promptData,
                        personalidade: { ...promptData.personalidade, conhecimentosEspecificos: e.target.value }
                      })}
                      className="mt-1"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* 3. Diretrizes */}
              <AccordionItem value="diretrizes" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                      3
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold">Diretrizes</h3>
                      <p className="text-sm text-muted-foreground">
                        Regras e restrições do negócio
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 space-y-4">
                  <div>
                    <Label htmlFor="politicas">Políticas Importantes</Label>
                    <Textarea
                      id="politicas"
                      placeholder="Liste as políticas importantes que o agente deve seguir..."
                      value={promptData.diretrizes.politicasImportantes}
                      onChange={(e) => setPromptData({
                        ...promptData,
                        diretrizes: { ...promptData.diretrizes, politicasImportantes: e.target.value }
                      })}
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="limites">Limites de Atuação</Label>
                      <Textarea
                        id="limites"
                        placeholder="Defina os limites de atuação do agente..."
                        value={promptData.diretrizes.limitesAtuacao}
                        onChange={(e) => setPromptData({
                          ...promptData,
                          diretrizes: { ...promptData.diretrizes, limitesAtuacao: e.target.value }
                        })}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="restricoes">Restrições Legais ou Éticas</Label>
                      <Textarea
                        id="restricoes"
                        placeholder="Liste as restrições legais ou éticas..."
                        value={promptData.diretrizes.restricoesLegais}
                        onChange={(e) => setPromptData({
                          ...promptData,
                          diretrizes: { ...promptData.diretrizes, restricoesLegais: e.target.value }
                        })}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="procedimentos">Procedimentos Obrigatórios</Label>
                    <Textarea
                      id="procedimentos"
                      placeholder="Descreva os procedimentos obrigatórios que o agente deve seguir..."
                      value={promptData.diretrizes.procedimentosObrigatorios}
                      onChange={(e) => setPromptData({
                        ...promptData,
                        diretrizes: { ...promptData.diretrizes, procedimentosObrigatorios: e.target.value }
                      })}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="confidenciais">Informações Confidenciais ou Sensíveis (Opcional)</Label>
                    <Textarea
                      id="confidenciais"
                      placeholder="Liste informações que o agente deve tratar com confidencialidade..."
                      value={promptData.diretrizes.informacoesConfidenciais}
                      onChange={(e) => setPromptData({
                        ...promptData,
                        diretrizes: { ...promptData.diretrizes, informacoesConfidenciais: e.target.value }
                      })}
                      className="mt-1"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* 4. Estrutura da Conversa */}
              <AccordionItem value="estrutura" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                      4
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold">Estrutura da Conversa</h3>
                      <p className="text-sm text-muted-foreground">
                        Passo a passo do raciocínio
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  <div>
                    <Label htmlFor="estrutura">Passo a Passo do Raciocínio</Label>
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
                      className="mt-1 min-h-[150px]"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Defina como o agente deve estruturar suas respostas e raciocínio
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* 5. FAQ */}
              <AccordionItem value="faq" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                      5
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold">FAQ</h3>
                      <p className="text-sm text-muted-foreground">
                        Perguntas frequentes e respostas
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  <div>
                    <Label htmlFor="faq">Perguntas e Respostas Frequentes</Label>
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
                      className="mt-1 min-h-[150px]"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Inclua as perguntas mais comuns que os usuários podem fazer
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* 6. Exemplos de Uso */}
              <AccordionItem value="exemplos" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                      6
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold">Exemplos de Uso</h3>
                      <p className="text-sm text-muted-foreground">
                        Interações práticas e modelos
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  <div>
                    <Label htmlFor="exemplos">Exemplos Práticos de Interações</Label>
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
                      className="mt-1 min-h-[150px]"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Demonstre como o agente deve se comportar em situações específicas
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* 7. Métricas de Sucesso */}
              <AccordionItem value="metricas" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                      7
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold">Métricas de Sucesso</h3>
                      <p className="text-sm text-muted-foreground">
                        Como medir o desempenho
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 space-y-4">
                  <div>
                    <Label htmlFor="indicadores">Indicadores de Qualidade</Label>
                    <Textarea
                      id="indicadores"
                      placeholder="Defina os indicadores de qualidade para avaliar o desempenho do agente..."
                      value={promptData.metricasSucesso.indicadoresQualidade}
                      onChange={(e) => setPromptData({
                        ...promptData,
                        metricasSucesso: { ...promptData.metricasSucesso, indicadoresQualidade: e.target.value }
                      })}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="metricas">Métricas de Desempenho</Label>
                    <Textarea
                      id="metricas"
                      placeholder="Liste as métricas de desempenho (tempo de resposta, precisão, etc.)..."
                      value={promptData.metricasSucesso.metricasDesempenho}
                      onChange={(e) => setPromptData({
                        ...promptData,
                        metricasSucesso: { ...promptData.metricasSucesso, metricasDesempenho: e.target.value }
                      })}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="criterios">Critérios de Avaliação</Label>
                    <Textarea
                      id="criterios"
                      placeholder="Descreva os critérios de avaliação para determinar o sucesso..."
                      value={promptData.metricasSucesso.criteriosAvaliacao}
                      onChange={(e) => setPromptData({
                        ...promptData,
                        metricasSucesso: { ...promptData.metricasSucesso, criteriosAvaliacao: e.target.value }
                      })}
                      className="mt-1"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* 8. Links de Divulgação */}
              <AccordionItem value="links" className="border rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
                      8
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold">Links de Divulgação</h3>
                      <p className="text-sm text-muted-foreground">
                        Links para divulgação do produto
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 space-y-4">
                  {promptData.linksPromocao.map((link, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">
                          Link {index + 1} {index === 0 && <span className="text-red-500">*</span>}
                        </Label>
                        {promptData.linksPromocao.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removePromotionLink(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div>
                        <Input
                          placeholder="https://exemplo.com"
                          value={link.link}
                          onChange={(e) => updatePromotionLink(index, 'link', e.target.value)}
                        />
                        {index === 0 && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Link principal obrigatório
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <Input
                          placeholder="Descrição do link"
                          value={link.descricao}
                          onChange={(e) => updatePromotionLink(index, 'descricao', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addPromotionLink}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar novo link
                  </Button>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Save Button */}
            <div className="mt-8 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard')}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="min-w-[120px]"
              >
                {isSaving ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Salvando...
                  </div>
                ) : (
                  'Salvar Configuração'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AgentConfiguration;