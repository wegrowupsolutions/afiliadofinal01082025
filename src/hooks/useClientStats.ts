import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useClientStats() {
  const [stats, setStats] = useState({
    totalClients: 0,
    totalPets: 0,
    newClientsThisMonth: 0,
    monthlyGrowth: [],
    petBreeds: [],
    recentClients: []
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const refetchStats = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch total clients
      const { count: totalClients } = await supabase
        .from('dados_cliente')
        .select('*', { count: 'exact' });

      // Fetch total pets (assuming each client has at least one pet)
      const { count: totalPets } = await supabase
        .from('dados_cliente')
        .select('*', { count: 'exact' })
        .not('nome_pet', 'is', null);

      // Fetch new clients this month (from 1st of current month to today)
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      const { count: newClientsThisMonth } = await supabase
        .from('dados_cliente')
        .select('*', { count: 'exact' })
        .gte('created_at', firstDayOfMonth.toISOString())
        .lte('created_at', today.toISOString());

      // Fetch monthly growth data
      const currentYear = new Date().getFullYear();
      const monthlyGrowthData = [];
      
      for (let month = 0; month < 12; month++) {
        const startOfMonth = new Date(currentYear, month, 1);
        const endOfMonth = new Date(currentYear, month + 1, 0);
        
        const { count } = await supabase
          .from('dados_cliente')
          .select('*', { count: 'exact' })
          .gte('created_at', startOfMonth.toISOString())
          .lte('created_at', endOfMonth.toISOString());
        
        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        monthlyGrowthData.push({
          month: monthNames[month],
          clients: count || 0
        });
      }

      // Fetch pet breeds data
      const { data: petsData } = await supabase
        .from('dados_cliente')
        .select('raca_pet')
        .not('raca_pet', 'is', null);

      const breedCounts = {};
      petsData?.forEach(pet => {
        if (pet.raca_pet) {
          breedCounts[pet.raca_pet] = (breedCounts[pet.raca_pet] || 0) + 1;
        }
      });

      const colors = [
        '#8B5CF6', '#EC4899', '#10B981', '#3B82F6', 
        '#F59E0B', '#EF4444', '#6366F1', '#14B8A6',
        '#F97316', '#8B5CF6', '#06B6D4', '#D946EF'
      ];

      const petBreeds = Object.entries(breedCounts).map(([name, value], index) => ({
        name,
        value,
        color: colors[index % colors.length]
      }));

      // Fetch recent clients
      const { data: recentClientsData } = await supabase
        .from('dados_cliente')
        .select('id, nome, telefone, nome_pet, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      const recentClients = recentClientsData?.map(client => ({
        id: client.id,
        name: client.nome,
        phone: client.telefone,
        pets: client.nome_pet ? 1 : 0,
        lastVisit: new Date(client.created_at).toLocaleDateString('pt-BR')
      })) || [];

      // Update stats
      setStats({
        totalClients: totalClients || 0,
        totalPets: totalPets || 0,
        newClientsThisMonth: newClientsThisMonth || 0,
        monthlyGrowth: monthlyGrowthData,
        petBreeds,
        recentClients
      });

    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        title: "Erro ao atualizar estatísticas",
        description: "Ocorreu um erro ao atualizar as estatísticas.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return { stats, loading, refetchStats };
}
