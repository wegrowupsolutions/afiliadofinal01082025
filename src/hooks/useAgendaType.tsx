
import { useState, useCallback } from 'react';

export type AgendaType = 'banho' | 'vet';

export function useAgendaType() {
  const [agendaType, setAgendaType] = useState<AgendaType>('banho');

  const changeAgendaType = useCallback((type: AgendaType) => {
    setAgendaType(type);
  }, []);

  const getEndpointSuffix = useCallback(() => {
    switch (agendaType) {
      case 'banho':
        return '/banho';
      case 'vet':
        return '/vet';
    }
  }, [agendaType]);

  return {
    agendaType,
    changeAgendaType,
    getEndpointSuffix,
    isBanho: agendaType === 'banho',
    isVet: agendaType === 'vet'
  };
}
