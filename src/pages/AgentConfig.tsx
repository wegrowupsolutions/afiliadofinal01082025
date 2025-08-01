
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Bot, 
  ArrowLeft, 
  Plus, 
  UserPlus, 
  Trash, 
  PenLine, 
  Check, 
  Info, 
  X 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

// Define agent interfaces
interface Agent {
  id: string;
  name: string;
  company: string;
  industry: string;
  mainProduct: string;
  strategy: string;
  personality: string;
  objective: string;
  thinkingStyle: string;
  isActive: boolean;
}

// Mock data for predefined agents
const predefinedAgents: Agent[] = [
  {
    id: '1',
    name: 'Nina',
    company: 'Pet Paradise',
    industry: 'Pet Shop',
    mainProduct: 'Produtos premium para pets e serviços de banho e tosa',
    strategy: 'Personalizado, prático e voltado para um atendimento premium',
    personality: 'Amigável, amorosa com os pets, detalhista e conhecedora de animais',
    objective: 'Aumentar vendas e satisfação dos clientes',
    thinkingStyle: 'Uma especialista em animais que ama pets',
    isActive: true
  },
  {
    id: '2',
    name: 'Carlos',
    company: 'Tech Solutions',
    industry: 'Tecnologia',
    mainProduct: 'Software e soluções de TI',
    strategy: 'Técnico, objetivo e focado em soluções rápidas',
    personality: 'Analítico, preciso e especialista em tecnologia',
    objective: 'Resolver problemas técnicos e vender soluções B2B',
    thinkingStyle: 'Um engenheiro de software experiente',
    isActive: false
  },
  {
    id: '3',
    name: 'Marina',
    company: 'Bella Moda',
    industry: 'Moda',
    mainProduct: 'Roupas e acessórios femininos',
    strategy: 'Consultivo, focado em estilo e tendências',
    personality: 'Estilosa, atualizada e preocupada com o bem-estar do cliente',
    objective: 'Ajudar clientes a encontrarem seu estilo e aumentar vendas',
    thinkingStyle: 'Uma consultora de moda profissional',
    isActive: false
  }
];

// Form schema for creating/editing agents
const agentFormSchema = z.object({
  industry: z.string().min(3, {
    message: "O nicho/indústria deve ter pelo menos 3 caracteres.",
  }),
  company: z.string().min(2, {
    message: "O nome da empresa deve ter pelo menos 2 caracteres.",
  }),
  mainProduct: z.string().min(5, {
    message: "A descrição do produto/serviço deve ter pelo menos 5 caracteres.",
  }),
  strategy: z.string().min(10, {
    message: "A estratégia deve ter pelo menos 10 caracteres.",
  }),
  name: z.string().min(2, {
    message: "O nome do agente deve ter pelo menos 2 caracteres.",
  }),
  personality: z.string().min(10, {
    message: "A descrição da personalidade deve ter pelo menos 10 caracteres.",
  }),
  objective: z.string().min(10, {
    message: "O objetivo deve ter pelo menos 10 caracteres.",
  }),
  thinkingStyle: z.string().min(5, {
    message: "O estilo de pensamento deve ter pelo menos 5 caracteres.",
  }),
});

type AgentFormValues = z.infer<typeof agentFormSchema>;

const AgentConfig = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [agents, setAgents] = useState<Agent[]>(predefinedAgents);
  const [isNewAgentDialogOpen, setIsNewAgentDialogOpen] = useState(false);
  const [isAgentDetailsOpen, setIsAgentDetailsOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: {
      industry: "",
      company: "",
      mainProduct: "",
      strategy: "",
      name: "",
      personality: "",
      objective: "",
      thinkingStyle: "",
    },
  });

  React.useEffect(() => {
    if (!isLoading && !user) {
      navigate('/');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-16 w-16 border-4 border-t-transparent border-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleGoBack = () => {
    navigate('/dashboard');
  };

  const sendAgentDataToWebhook = async (agentData: AgentFormValues) => {
    try {
      const response = await fetch('https://webhook.n8nlabz.com.br/webhook/config_agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agentData),
      });
      
      if (!response.ok) {
        throw new Error('Falha ao enviar dados do agente para o webhook');
      }
      
      console.log('Dados do agente enviados com sucesso para o webhook');
      return true;
    } catch (error) {
      console.error('Erro ao enviar dados para o webhook:', error);
      toast({
        title: "Erro ao sincronizar agente",
        description: "Os dados foram salvos localmente, mas houve um problema ao sincronizar com o sistema externo.",
        variant: "destructive"
      });
      return false;
    }
  };

  const handleCreateAgent = async (data: AgentFormValues) => {
    setIsSubmitting(true);
    
    const newAgent: Agent = {
      id: Date.now().toString(),
      name: data.name,
      company: data.company,
      industry: data.industry,
      mainProduct: data.mainProduct,
      strategy: data.strategy,
      personality: data.personality,
      objective: data.objective,
      thinkingStyle: data.thinkingStyle,
      isActive: false
    };

    // Send data to webhook
    await sendAgentDataToWebhook(data);
    
    // Update local state regardless of webhook success
    setAgents([...agents, newAgent]);
    setIsNewAgentDialogOpen(false);
    form.reset();
    setIsSubmitting(false);
    
    toast({
      title: "Agente criado com sucesso!",
      description: `O agente ${data.name} foi adicionado à sua lista.`,
    });
  };

  const handleSelectAgent = (agent: Agent) => {
    // Set all agents to inactive
    const updatedAgents = agents.map(a => ({
      ...a,
      isActive: a.id === agent.id
    }));
    
    setAgents(updatedAgents);
    
    toast({
      title: "Agente ativado",
      description: `${agent.name} agora é seu agente ativo.`,
    });
  };

  const handleViewAgentDetails = (agent: Agent) => {
    setSelectedAgent(agent);
    setIsAgentDetailsOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!selectedAgent) return;
    
    setAgents(agents.filter(a => a.id !== selectedAgent.id));
    setDeleteConfirmOpen(false);
    setIsAgentDetailsOpen(false);
    setSelectedAgent(null);
    
    toast({
      title: "Agente excluído",
      description: "O agente foi removido com sucesso.",
      variant: "destructive"
    });
  };

  const handleCloseNewAgentDialog = () => {
    form.reset();
    setIsNewAgentDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Button variant="outline" onClick={handleGoBack} className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold">Configuração do Agente</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  Agente Ativo
                </CardTitle>
                <CardDescription>
                  Este é o agente que está sendo usado atualmente
                </CardDescription>
              </CardHeader>
              <CardContent>
                {agents.find(agent => agent.isActive) ? (
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-medium">
                          {agents.find(agent => agent.isActive)?.name}
                        </h3>
                        <p className="text-muted-foreground">
                          {agents.find(agent => agent.isActive)?.company} • {agents.find(agent => agent.isActive)?.industry}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 bg-primary text-primary-foreground px-2 py-1 rounded text-xs">
                        <Check className="h-3 w-3" />
                        Ativo
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Objetivo:</span> {agents.find(agent => agent.isActive)?.objective}</p>
                      <p><span className="font-medium">Personalidade:</span> {agents.find(agent => agent.isActive)?.personality}</p>
                    </div>
                    <Button variant="outline" size="sm" className="mt-4" onClick={() => handleViewAgentDetails(agents.find(agent => agent.isActive)!)}>
                      <Info className="mr-2 h-4 w-4" />
                      Ver detalhes completos
                    </Button>
                  </div>
                ) : (
                  <div className="text-center p-6">
                    <Bot className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Nenhum agente ativo</h3>
                    <p className="text-muted-foreground mb-4">Selecione um agente da lista ou crie um novo</p>
                    <Dialog open={isNewAgentDialogOpen} onOpenChange={setIsNewAgentDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Criar agente
                        </Button>
                      </DialogTrigger>
                      {/* Dialog content is below */}
                    </Dialog>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary" />
                  Criar Novo Agente
                </CardTitle>
                <CardDescription>
                  Defina um novo assistente personalizado
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center p-6">
                <Dialog open={isNewAgentDialogOpen} onOpenChange={setIsNewAgentDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="w-full">
                      <UserPlus className="mr-2 h-5 w-5" />
                      Novo Agente
                    </Button>
                  </DialogTrigger>
                  {/* Dialog content is below */}
                </Dialog>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              Agentes Disponíveis
            </CardTitle>
            <CardDescription>
              Selecione ou gerencie seus agentes pré-configurados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {agents.map((agent) => (
                <Card key={agent.id} className={`border ${agent.isActive ? 'border-primary' : ''}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex justify-between items-center">
                      <span>{agent.name}</span>
                      {agent.isActive && (
                        <div className="flex items-center gap-1 bg-primary text-primary-foreground px-2 py-1 rounded text-xs">
                          <Check className="h-3 w-3" />
                          Ativo
                        </div>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {agent.company} • {agent.industry}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <p className="line-clamp-2">{agent.personality}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleViewAgentDetails(agent)}
                    >
                      <Info className="mr-2 h-3 w-3" />
                      Detalhes
                    </Button>
                    {!agent.isActive && (
                      <Button 
                        variant="default" 
                        size="sm" 
                        onClick={() => handleSelectAgent(agent)}
                      >
                        <Check className="mr-2 h-3 w-3" />
                        Ativar
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* New Agent Dialog */}
        <Dialog open={isNewAgentDialogOpen} onOpenChange={setIsNewAgentDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Novo Agente</DialogTitle>
              <DialogDescription>
                Configure os detalhes do seu novo assistente virtual.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCreateAgent)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qual é o nicho ou indústria para este prompt?</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Pet Shop, Imobiliária, Restaurante" {...field} />
                      </FormControl>
                      <FormDescription>
                        O setor ou segmento de mercado onde o agente irá atuar.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qual é o nome da nova empresa?</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Pet Paradise, Casa & Lar, Sabor Gourmet" {...field} />
                      </FormControl>
                      <FormDescription>
                        O nome da empresa que o agente irá representar.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="mainProduct"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qual é o principal produto ou serviço oferecido?</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Ex: Produtos para pets, Venda de imóveis, Refeições gourmet" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Os produtos ou serviços que a empresa oferece aos clientes.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="strategy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qual é a estratégia para atendimento e vendas?</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Ex: Atendimento personalizado com foco no bem-estar animal" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        A abordagem que o agente deve utilizar para atender e vender.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qual deve ser o nome do agente?</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Nina, Carlos, Marina" {...field} />
                      </FormControl>
                      <FormDescription>
                        O nome que o assistente virtual usará para se identificar.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="personality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quais são os principais traços de personalidade do agente?</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Ex: Amigável, paciente, conhecedor de animais e seus comportamentos" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Como o agente deve se comportar e se comunicar.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="objective"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qual é o objetivo central do agente?</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Ex: Aumentar vendas e fidelizar clientes com atendimento superior" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        O propósito principal do agente na interação com clientes.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="thinkingStyle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>O agente deve pensar como quem?</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ex: Uma especialista em animais que ama pets" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        A mentalidade ou perspectiva que o agente deve adotar.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleCloseNewAgentDialog} disabled={isSubmitting}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <span className="mr-2 h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
                        Criando...
                      </>
                    ) : (
                      'Criar Agente'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Agent Details Dialog */}
        <Dialog open={isAgentDetailsOpen} onOpenChange={setIsAgentDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Detalhes do Agente
              </DialogTitle>
            </DialogHeader>
            
            {selectedAgent && (
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedAgent.name}</h2>
                    <p className="text-muted-foreground">{selectedAgent.company} • {selectedAgent.industry}</p>
                  </div>
                  {selectedAgent.isActive && (
                    <div className="flex items-center gap-1 bg-primary text-primary-foreground px-2 py-1 rounded text-xs">
                      <Check className="h-3 w-3" />
                      Ativo
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">Produto/Serviço</h3>
                    <p className="text-sm">{selectedAgent.mainProduct}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Estratégia</h3>
                    <p className="text-sm">{selectedAgent.strategy}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Personalidade</h3>
                    <p className="text-sm">{selectedAgent.personality}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Objetivo</h3>
                    <p className="text-sm">{selectedAgent.objective}</p>
                  </div>
                  
                  <div className="space-y-2 col-span-2">
                    <h3 className="font-medium">Estilo de Pensamento</h3>
                    <p className="text-sm">{selectedAgent.thinkingStyle}</p>
                  </div>
                </div>
                
                <DialogFooter className="gap-2">
                  {!selectedAgent.isActive && (
                    <Button 
                      variant="default" 
                      onClick={() => {
                        handleSelectAgent(selectedAgent);
                        setIsAgentDetailsOpen(false);
                      }}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Ativar Agente
                    </Button>
                  )}
                  
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      setDeleteConfirmOpen(true);
                    }}
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Excluir
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir este agente? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>
                <Trash className="mr-2 h-4 w-4" />
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AgentConfig;
