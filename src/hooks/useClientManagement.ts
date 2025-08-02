
import { useState, useEffect } from 'react';
import { Contact } from '@/types/client';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useClientManagement = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [isPauseDurationDialogOpen, setIsPauseDurationDialogOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [newContact, setNewContact] = useState<Partial<Contact>>({
    name: '',
    email: '',
    phone: '',
    address: '',
    petName: '',
    petSize: '',
    petBreed: '',
    cpfCnpj: '',
    asaasCustomerId: '',
    status: 'Active',
    notes: '',
  });

  const fetchClients = async () => {
    try {
      setLoadingContacts(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('Usuário não autenticado');
        setContacts([]);
        return;
      }
      
      const { data, error } = await supabase
        .from('afiliado_base_leads')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Erro na consulta:', error);
        throw error;
      }
      
      if (data) {
        const formattedContacts: Contact[] = data.map(lead => ({
          id: lead.id.toString(),
          name: lead.name || 'Lead sem nome',
          email: '', // afiliado_base_leads não tem campo email
          phone: lead.remotejid?.replace('@s.whatsapp.net', '') || '',
          petName: '',
          petSize: '',
          petBreed: '',
          cpfCnpj: '',
          asaasCustomerId: '',
          payments: null,
          status: 'Active',
          notes: '',
          lastContact: lead.timestamp ? new Date(lead.timestamp).toLocaleDateString('pt-BR') : 'Desconhecido'
        }));
        
        setContacts(formattedContacts);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast({
        title: "Erro ao carregar leads",
        description: "Ocorreu um erro ao buscar os leads do banco de dados.",
        variant: "destructive"
      });
    } finally {
      setLoadingContacts(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchClients();
    toast({
      title: "Atualizando dados",
      description: "Os dados da tabela estão sendo atualizados.",
    });
  };

  const handleContactClick = (contact: Contact) => {
    setSelectedContact(contact);
    setIsDetailSheetOpen(true);
  };

  const handleAddContact = async () => {
    if (!newContact.name || !newContact.phone) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e telefone são campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro de autenticação",
          description: "Usuário não autenticado.",
          variant: "destructive"
        });
        return;
      }
      
      const { data, error } = await supabase
        .from('afiliado_base_leads')
        .insert([
          {
            name: newContact.name,
            remotejid: newContact.phone ? `${newContact.phone}@s.whatsapp.net` : '',
            timestamp: new Date().toISOString(),
            user_id: user.id
          }
        ])
        .select();
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        const newClientData = data[0];
        
        fetchClients();
        
        setNewContact({
          name: '',
          email: '',
          phone: '',
          address: '',
          petName: '',
          petSize: '',
          petBreed: '',
          cpfCnpj: '',
          asaasCustomerId: '',
          status: 'Active',
          notes: '',
        });
        
        setIsAddContactOpen(false);
        
        toast({
          title: "Cliente adicionado",
          description: `${newContact.name} foi adicionado com sucesso.`,
        });
        
        try {
          await fetch('https://webhook.serverwegrowup.com.br/webhook/cria_usuario', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(newContact),
          });
        } catch (webhookError) {
          console.error('Erro ao enviar para webhook:', webhookError);
        }
      }
    } catch (error) {
      console.error('Erro ao cadastrar cliente:', error);
      toast({
        title: "Erro ao adicionar cliente",
        description: "Não foi possível salvar o cliente no banco de dados.",
        variant: "destructive",
      });
    }
  };

  const handleEditContact = async () => {
    if (!selectedContact) return;
    
    try {
      const { error } = await supabase
        .from('afiliado_base_leads')
        .update({
          name: newContact.name,
          remotejid: newContact.phone ? `${newContact.phone}@s.whatsapp.net` : '',
          timestamp: new Date().toISOString()
        })
        .eq('id', parseInt(selectedContact.id));
      
      if (error) throw error;
      
      fetchClients();
      
      setIsEditModalOpen(false);
      
      toast({
        title: "Cliente atualizado",
        description: `As informações de ${selectedContact.name} foram atualizadas.`,
      });
      
      try {
        await fetch('https://webhook.serverwegrowup.com.br/webhook/edita_usuario', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: selectedContact.id,
            ...newContact
          }),
        });
      } catch (webhookError) {
        console.error('Erro ao enviar para webhook:', webhookError);
      }
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      toast({
        title: "Erro ao atualizar cliente",
        description: "Não foi possível atualizar o cliente no banco de dados.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteContact = async () => {
    if (!selectedContact) return;
    
    try {
      const { error } = await supabase
        .from('afiliado_base_leads')
        .delete()
        .eq('id', parseInt(selectedContact.id));
      
      if (error) throw error;
      
      fetchClients();
      
      setSelectedContact(null);
      setIsDetailSheetOpen(false);
      setIsDeleteDialogOpen(false);
      
      toast({
        title: "Cliente removido",
        description: `${selectedContact.name} foi removido da sua lista de clientes.`,
        variant: "destructive",
      });
      
      try {
        await fetch('https://webhook.serverwegrowup.com.br/webhook/exclui_usuario', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ phone: selectedContact.phone }),
        });
      } catch (webhookError) {
        console.error('Erro ao enviar para webhook:', webhookError);
      }
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      toast({
        title: "Erro ao remover cliente",
        description: "Não foi possível remover o cliente do banco de dados.",
        variant: "destructive",
      });
      setIsDeleteDialogOpen(false);
    }
  };

  const openEditModal = () => {
    if (!selectedContact) return;
    setNewContact({
      name: selectedContact.name,
      email: selectedContact.email,
      phone: selectedContact.phone,
      address: selectedContact.address,
      petName: selectedContact.petName,
      petSize: selectedContact.petSize,
      petBreed: selectedContact.petBreed,
      cpfCnpj: selectedContact.cpfCnpj,
      asaasCustomerId: selectedContact.asaasCustomerId,
      payments: selectedContact.payments,
      status: selectedContact.status,
      notes: selectedContact.notes,
    });
    setIsEditModalOpen(true);
  };

  const handleMessageClick = () => {
    setMessageText('');
    setIsMessageDialogOpen(true);
  };

  const handleMessageSubmit = () => {
    if (!messageText.trim() || !selectedContact) return;
    
    setIsMessageDialogOpen(false);
    setIsPauseDurationDialogOpen(true);
  };

  const handlePauseDurationConfirm = async (duration: number | null) => {
    if (!selectedContact) return;
    
    try {
      const response = await fetch('https://webhook.serverwegrowup.com.br/webhook/envia_mensagem_afiliado', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: selectedContact.phone,
          message: messageText,
          pauseDuration: duration
        }),
      });
      
      if (!response.ok) {
        throw new Error('Falha ao enviar dados para o webhook');
      }
      
      setIsPauseDurationDialogOpen(false);
      
      toast({
        title: "Mensagem enviada",
        description: duration === null 
          ? `Mensagem enviada para ${selectedContact.name} sem pausar o bot.` 
          : `Mensagem enviada para ${selectedContact.name} e bot pausado por ${duration} segundos.`,
      });
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setIsPauseDurationDialogOpen(false);
      
      toast({
        title: "Erro ao enviar mensagem",
        description: "Não foi possível enviar a mensagem para o servidor.",
        variant: "destructive",
      });
    }
  };
  
  useEffect(() => {
    fetchClients();
  }, []);

  return {
    contacts,
    loadingContacts,
    refreshing,
    selectedContact,
    setSelectedContact,
    isAddContactOpen,
    setIsAddContactOpen,
    isDetailSheetOpen,
    setIsDetailSheetOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isMessageDialogOpen,
    setIsMessageDialogOpen,
    isPauseDurationDialogOpen,
    setIsPauseDurationDialogOpen,
    messageText,
    setMessageText,
    newContact,
    setNewContact,
    handleRefresh,
    handleContactClick,
    handleAddContact,
    handleEditContact,
    handleDeleteContact,
    openEditModal,
    handleMessageClick,
    handleMessageSubmit,
    handlePauseDurationConfirm
  };
};
