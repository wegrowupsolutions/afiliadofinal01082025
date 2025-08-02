import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useLeadsStats() {
  const [stats, setStats] = useState({
    totalLeads: 0,
    newLeadsThisMonth: 0,
    monthlyLeadsGrowth: [],
    recentLeads: []
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const refetchStats = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch total leads
      const { count: totalLeads } = await supabase
        .from('afiliado_base_leads')
        .select('*', { count: 'exact' });

      // Fetch new leads this month
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      
      const { count: newLeadsThisMonth } = await supabase
        .from('afiliado_base_leads')
        .select('*', { count: 'exact' })
        .gte('timestamp', firstDayOfMonth.toISOString())
        .lte('timestamp', today.toISOString());

      // Fetch monthly leads growth data
      const currentYear = new Date().getFullYear();
      const monthlyLeadsGrowthData = [];
      
      for (let month = 0; month < 12; month++) {
        const startOfMonth = new Date(currentYear, month, 1);
        const endOfMonth = new Date(currentYear, month + 1, 0);
        
        const { count } = await supabase
          .from('afiliado_base_leads')
          .select('*', { count: 'exact' })
          .gte('timestamp', startOfMonth.toISOString())
          .lte('timestamp', endOfMonth.toISOString());
        
        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        monthlyLeadsGrowthData.push({
          month: monthNames[month],
          leads: count || 0
        });
      }

      // Fetch recent leads
      const { data: recentLeadsData } = await supabase
        .from('afiliado_base_leads')
        .select('id, name, remotejid, timestamp')
        .order('timestamp', { ascending: false })
        .limit(5);

      const recentLeads = recentLeadsData?.map(lead => ({
        id: lead.id,
        name: lead.name || 'Nome não informado',
        phone: lead.remotejid?.replace('@s.whatsapp.net', '') || 'Telefone não informado',
        pets: 0, // Como é lead, ainda não tem pets
        lastVisit: lead.timestamp ? new Date(lead.timestamp).toLocaleDateString('pt-BR') : 'Data não informada'
      })) || [];

      // Update stats
      setStats({
        totalLeads: totalLeads || 0,
        newLeadsThisMonth: newLeadsThisMonth || 0,
        monthlyLeadsGrowth: monthlyLeadsGrowthData,
        recentLeads
      });

    } catch (error) {
      console.error('Error fetching leads stats:', error);
      toast({
        title: "Erro ao atualizar estatísticas de leads",
        description: "Ocorreu um erro ao atualizar as estatísticas de leads.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return { stats, loading, refetchStats };
}