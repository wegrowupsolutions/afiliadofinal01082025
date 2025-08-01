import React from 'react';
import { format, isSameDay, parseISO } from 'date-fns';
import { pt } from 'date-fns/locale';
import { 
  Table, TableHeader, TableBody, TableRow, 
  TableHead, TableCell 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Edit, Trash2, Clock, Mail, LinkIcon, LoaderCircle, 
  Bath, Stethoscope, Calendar
} from 'lucide-react';
import { CalendarEvent } from '@/types/calendar';
import { AgendaType } from '@/hooks/useAgendaType';

interface EventsTableProps {
  events: CalendarEvent[];
  isLoading: boolean;
  onEditEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (event: CalendarEvent) => void;
  onOpenEventLink: (url: string) => void;
  agendaType?: AgendaType;
}

export function EventsTable({ 
  events, 
  isLoading, 
  onEditEvent, 
  onDeleteEvent, 
  onOpenEventLink,
  agendaType = 'banho'
}: EventsTableProps) {
  
  const getStatusColor = (status: string, responseStatus?: string) => {
    if (responseStatus) {
      switch (responseStatus) {
        case 'accepted':
          return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
        case 'tentative':
          return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
        case 'declined':
          return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
        case 'needsAction':
          return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
        default:
          return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      }
    }
    
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'tentative':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };
  
  const getResponseStatusLabel = (responseStatus?: string) => {
    switch (responseStatus) {
      case 'accepted':
        return 'Confirmado';
      case 'tentative':
        return 'Provisório';
      case 'declined':
        return 'Recusado';
      case 'needsAction':
        return 'Pendente';
      default:
        return 'Indefinido';
    }
  };

  const getAgendaTypeIcon = () => {
    switch (agendaType) {
      case 'banho':
        return <Bath className="h-4 w-4 text-blue-500" />;
      case 'vet':
        return <Stethoscope className="h-4 w-4 text-green-500" />;
      default:
        return <Calendar className="h-4 w-4 text-purple-500" />;
    }
  };
  
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Horário</TableHead>
            <TableHead className="flex items-center gap-1">
              {getAgendaTypeIcon()}
              <span>Serviço</span>
            </TableHead>
            <TableHead>Participante</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.length > 0 ? events.map(event => {
            const startDate = parseISO(event.start);
            const endDate = parseISO(event.end);
            const attendee = event.attendees?.find(a => a !== null);
            
            return (
              <TableRow key={event.id}>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-gray-500" />
                    {format(startDate, 'HH:mm')}
                    {!isSameDay(startDate, endDate) && ' - evento de múltiplos dias'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {format(startDate, "dd/MM/yyyy")}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{event.summary}</TableCell>
                <TableCell>
                  {attendee?.email ? (
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4 text-gray-500" />
                      {attendee.email}
                    </div>
                  ) : (
                    <span className="text-gray-500">Sem participante</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status, attendee?.responseStatus)}`}>
                    {getResponseStatusLabel(attendee?.responseStatus)}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onEditEvent(event)} 
                      title="Editar evento"
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/30"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onDeleteEvent(event)} 
                      title="Excluir evento"
                      className="text-red-600 hover:text-red-800 hover:bg-red-100 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onOpenEventLink(event.htmlLink)} 
                      title="Abrir no Google Calendar"
                    >
                      <LinkIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          }) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4 text-gray-500 dark:text-gray-400">
                {isLoading ? (
                  <div className="flex justify-center items-center gap-2">
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    <span>Carregando eventos...</span>
                  </div>
                ) : (
                  "Nenhum evento encontrado para esta data ou pesquisa."
                )}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
