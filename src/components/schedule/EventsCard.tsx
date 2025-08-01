import React from 'react';
import { format } from 'date-fns';
import { CalendarEvent } from '@/types/calendar';
import { AgendaType } from '@/hooks/useAgendaType';
import { 
  Card, CardHeader, CardTitle, CardDescription, 
  CardContent, CardFooter 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Search, LoaderCircle, Bath, Stethoscope, Calendar } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { EventsTable } from './EventsTable';

interface EventsCardProps {
  events: CalendarEvent[];
  filteredEvents: CalendarEvent[];
  selectedTab: string;
  searchTerm: string;
  selectedDate: Date | undefined;
  isLoading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  onSearchChange: (term: string) => void;
  onTabChange: (tab: string) => void;
  onEditEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (event: CalendarEvent) => void;
  onOpenEventLink: (url: string) => void;
  agendaType?: AgendaType;
}

export function EventsCard({
  events,
  filteredEvents,
  selectedTab,
  searchTerm,
  selectedDate,
  isLoading,
  error,
  lastUpdated,
  onSearchChange,
  onTabChange,
  onEditEvent,
  onDeleteEvent,
  onOpenEventLink,
  agendaType = 'banho'
}: EventsCardProps) {
  const getAgendaIcon = () => {
    switch (agendaType) {
      case 'banho':
        return <Bath className="h-5 w-5 text-blue-500" />;
      case 'vet':
        return <Stethoscope className="h-5 w-5 text-green-500" />;
      default:
        return <Calendar className="h-5 w-5 text-purple-500" />;
    }
  };

  const getAgendaTitle = () => {
  switch (agendaType) {
    case 'banho':
      return 'Agenda de Banho e Tosa';
    case 'vet':
      return 'Agenda de Consultas Veterinárias';
  }
};

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            {getAgendaIcon()}
            <div>
              <CardTitle>{getAgendaTitle()}</CardTitle>
              <CardDescription>
                {selectedTab === 'day' 
                  ? `Visualizando ${filteredEvents.length} eventos para ${selectedDate ? format(selectedDate, "dd/MM/yyyy") : 'hoje'}`
                  : `Visualizando todos os ${filteredEvents.length} eventos`
                }
              </CardDescription>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input 
                type="search" 
                placeholder="Buscar eventos..." 
                className="pl-9" 
                value={searchTerm} 
                onChange={e => onSearchChange(e.target.value)}
              />
            </div>
            
            <Tabs defaultValue={selectedTab} className="w-full sm:w-auto" onValueChange={onTabChange}>
              <TabsList>
                <TabsTrigger value="day">Diário</TabsTrigger>
                <TabsTrigger value="all">Todos</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && events.length === 0 && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Não conseguimos atualizar os eventos, tentando novamente em breve...
            </AlertDescription>
          </Alert>
        )}

        {isLoading && events.length === 0 ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <EventsTable 
            events={filteredEvents}
            isLoading={isLoading}
            onEditEvent={onEditEvent}
            onDeleteEvent={onDeleteEvent}
            onOpenEventLink={onOpenEventLink}
            agendaType={agendaType}
          />
        )}
      </CardContent>
      {lastUpdated && (
        <CardFooter>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Última atualização: {format(lastUpdated, "dd/MM/yyyy HH:mm:ss")}
          </p>
        </CardFooter>
      )}
    </Card>
  );
}
