import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

// Mapeamento de DDD para estados
const dddToState = {
  11: 'SP', 12: 'SP', 13: 'SP', 14: 'SP', 15: 'SP', 16: 'SP', 17: 'SP', 18: 'SP', 19: 'SP',
  21: 'RJ', 22: 'RJ', 24: 'RJ',
  27: 'ES', 28: 'ES',
  31: 'MG', 32: 'MG', 33: 'MG', 34: 'MG', 35: 'MG', 37: 'MG', 38: 'MG',
  41: 'PR', 42: 'PR', 43: 'PR', 44: 'PR', 45: 'PR', 46: 'PR',
  47: 'SC', 48: 'SC', 49: 'SC',
  51: 'RS', 53: 'RS', 54: 'RS', 55: 'RS',
  61: 'DF',
  62: 'GO', 64: 'GO',
  63: 'TO',
  65: 'MT', 66: 'MT',
  67: 'MS',
  68: 'AC',
  69: 'RO',
  71: 'BA', 73: 'BA', 74: 'BA', 75: 'BA', 77: 'BA',
  79: 'SE',
  81: 'PE', 87: 'PE',
  82: 'AL',
  83: 'PB',
  84: 'RN',
  85: 'CE', 88: 'CE',
  86: 'PI', 89: 'PI',
  91: 'PA', 93: 'PA', 94: 'PA',
  92: 'AM', 97: 'AM',
  95: 'RR',
  96: 'AP',
  98: 'MA', 99: 'MA'
};

// Estados brasileiros
const brazilianStates = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

function extractDDD(phone: string): string | null {
  // Remove prefixos e sufixos como @s.whatsapp.net
  const cleanPhone = phone.replace(/@.*$/, '').replace(/^\+?55/, '');
  
  // Extrai os dois primeiros dígitos como DDD
  const ddd = cleanPhone.substring(0, 2);
  
  // Verifica se é um DDD válido
  if (dddToState[parseInt(ddd)]) {
    return ddd;
  }
  
  return null;
}

export function useLeadsByState() {
  const [leadsByState, setLeadsByState] = useState({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchLeadsByState = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Buscar todos os leads do usuário atual apenas
      const { data: leads, error } = await supabase
        .from('afiliado_base_leads')
        .select('remotejid, timestamp')
        .eq('user_id', user.id)
        .not('remotejid', 'is', null);

      if (error) {
        throw error;
      }

      // Processar leads por estado
      const stateCount = {};
      
      // Inicializar todos os estados com 0
      brazilianStates.forEach(state => {
        stateCount[state] = 0;
      });

      // Contar leads por estado
      leads?.forEach(lead => {
        if (lead.remotejid) {
          const ddd = extractDDD(lead.remotejid);
          if (ddd) {
            const state = dddToState[parseInt(ddd)];
            if (state) {
              stateCount[state] = (stateCount[state] || 0) + 1;
            }
          }
        }
      });

      setLeadsByState(stateCount);

    } catch (error) {
      console.error('Error fetching leads by state:', error);
      toast({
        title: "Erro ao carregar leads por estado",
        description: "Ocorreu um erro ao carregar os dados de leads por estado.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast, user]);

  return { leadsByState, loading, fetchLeadsByState };
}