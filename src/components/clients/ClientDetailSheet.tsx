
import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User, Phone, Mail, MapPin, MessageSquare, CreditCard, FileText, Dog, Trash2, Edit2 } from 'lucide-react';
import { Contact } from '@/types/client';
import DeleteClientDialog from './DeleteClientDialog';
import SendMessageDialog from './SendMessageDialog';

interface ClientDetailSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedContact: Contact | null;
  onEditClick: () => void;
  onDeleteClick: () => void;
  onSendMessageClick: () => void;
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;
  handleDeleteContact: () => void;
  isMessageDialogOpen: boolean;
  setIsMessageDialogOpen: (open: boolean) => void;
  messageText: string;
  setMessageText: (text: string) => void;
  handleMessageSubmit: () => void;
  isPauseDurationDialogOpen: boolean;
  setIsPauseDurationDialogOpen: (open: boolean) => void;
  handlePauseDurationConfirm: (duration: number | null) => void;
}

const ClientDetailSheet = ({
  isOpen,
  onOpenChange,
  selectedContact,
  onEditClick,
  onDeleteClick,
  onSendMessageClick,
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  handleDeleteContact,
  isMessageDialogOpen,
  setIsMessageDialogOpen,
  messageText,
  setMessageText,
  handleMessageSubmit,
  isPauseDurationDialogOpen,
  setIsPauseDurationDialogOpen,
  handlePauseDurationConfirm
}: ClientDetailSheetProps) => {
  if (!selectedContact) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-xl flex items-center gap-2">
            <User className="h-5 w-5 text-petshop-blue dark:text-petshop-gold" />
            {selectedContact.name}
          </SheetTitle>
          <SheetDescription>
            Detalhes do cliente e seu pet
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Informações Básicas
            </h3>
            <div className="grid grid-cols-[20px_1fr] gap-x-3 gap-y-4 items-start">
              <Mail className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium">{selectedContact.email || 'Não informado'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
              </div>
              
              <Phone className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium">{selectedContact.phone || 'Não informado'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Telefone</p>
              </div>
              
              <FileText className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium">{selectedContact.cpfCnpj || 'Não informado'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">CPF/CNPJ</p>
              </div>
              
              <CreditCard className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium">{selectedContact.asaasCustomerId || 'Não informado'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">ID Asaas</p>
              </div>
              
              <MapPin className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium">{selectedContact.address || 'Não informado'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Endereço</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Informações do Pet
            </h3>
            <div className="grid grid-cols-[20px_1fr] gap-x-3 gap-y-4 items-start">
              <Dog className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium">{selectedContact.petName || 'Não informado'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Nome do Pet</p>
              </div>
              
              <Dog className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium">{selectedContact.petBreed || 'Não informado'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Raça</p>
              </div>
              
              <Dog className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium">{selectedContact.petSize || 'Não informado'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Porte</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Observações
            </h3>
            <div className="rounded-md bg-gray-50 dark:bg-gray-800 p-3">
              <p className="text-sm">{selectedContact.notes || 'Sem observações'}</p>
            </div>
          </div>
          
          <div className="pt-4 border-t dark:border-gray-700">
            <div className="flex flex-wrap gap-2 justify-end">
              <DeleteClientDialog 
                isOpen={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                selectedContact={selectedContact}
                handleDeleteContact={handleDeleteContact}
              />
              
              <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" onClick={onSendMessageClick}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Mensagem
                  </Button>
                </DialogTrigger>
                <SendMessageDialog 
                  selectedContact={selectedContact}
                  messageText={messageText}
                  setMessageText={setMessageText}
                  handleMessageSubmit={handleMessageSubmit}
                  onOpenChange={setIsMessageDialogOpen}
                  isPauseDurationDialogOpen={isPauseDurationDialogOpen}
                  setIsPauseDurationDialogOpen={setIsPauseDurationDialogOpen}
                  handlePauseDurationConfirm={handlePauseDurationConfirm}
                />
              </Dialog>
              
              <Button variant="outline" size="sm" onClick={onEditClick}>
                <Edit2 className="mr-2 h-4 w-4" />
                Editar
              </Button>
              
              <Button variant="default" size="sm">
                <Phone className="mr-2 h-4 w-4" />
                Ligar
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ClientDetailSheet;
