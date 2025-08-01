
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AgendaType } from '@/hooks/useAgendaType';
import { Bath, Stethoscope } from 'lucide-react';

interface AgendaTypeSelectorProps {
  selectedType: AgendaType;
  onTypeChange: (type: AgendaType) => void;
}

export function AgendaTypeSelector({ selectedType, onTypeChange }: AgendaTypeSelectorProps) {
  return (
    <Tabs 
      defaultValue={selectedType} 
      className="w-full" 
      onValueChange={(value) => onTypeChange(value as AgendaType)}
      value={selectedType}
    >
      <TabsList className="grid grid-cols-2 w-full">
        <TabsTrigger value="banho" className="flex items-center gap-2">
          <Bath className="h-4 w-4" />
          <span className="hidden sm:inline">Banho</span>
        </TabsTrigger>
        <TabsTrigger value="vet" className="flex items-center gap-2">
          <Stethoscope className="h-4 w-4" />
          <span className="hidden sm:inline">Veterinário</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
