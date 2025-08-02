
import React, { useEffect } from 'react';
import { LineChart, Users, Smartphone, PawPrint, TrendingUp } from 'lucide-react';
import { useClientStats } from '@/hooks/useClientStats';
import { useLeadsStats } from '@/hooks/useLeadsStats';
import { useLeadsByState } from '@/hooks/useLeadsByState';
import { useDashboardRealtime } from '@/hooks/useDashboardRealtime';

// Import components
import DashboardHeader from '@/components/metrics/DashboardHeader';
import StatCard from '@/components/metrics/StatCard';
import LeadsGrowthChart from '@/components/metrics/LeadsGrowthChart';
import ClientGrowthChart from '@/components/metrics/ClientGrowthChart';
import PetTypesChart from '@/components/metrics/PetTypesChart';
import ServicesBarChart from '@/components/metrics/ServicesBarChart';
import RecentClientsTable from '@/components/metrics/RecentClientsTable';
import BrazilMapChart from '@/components/metrics/BrazilMapChart';

const MetricsDashboard = () => {
  const { stats, loading, refetchStats } = useClientStats();
  const { stats: leadsStats, loading: leadsLoading, refetchStats: refetchLeadsStats } = useLeadsStats();
  const { leadsByState, loading: stateLoading, fetchLeadsByState } = useLeadsByState();
  
  // Initialize real-time updates for the metrics dashboard
  useDashboardRealtime();
  
  // Fetch data when component mounts
  useEffect(() => {
    refetchStats();
    refetchLeadsStats();
    fetchLeadsByState();
  }, [refetchStats, refetchLeadsStats, fetchLeadsByState]);
  
  // Use real data for monthly leads growth
  const monthlyLeadsData = leadsStats.monthlyLeadsGrowth?.length > 0 
    ? leadsStats.monthlyLeadsGrowth 
    : [
        { month: 'Jan', leads: 0 },
        { month: 'Fev', leads: 0 },
        { month: 'Mar', leads: 0 },
        { month: 'Abr', leads: 0 },
        { month: 'Mai', leads: 0 },
        { month: 'Jun', leads: 0 },
        { month: 'Jul', leads: 0 },
        { month: 'Ago', leads: 0 },
        { month: 'Set', leads: 0 },
        { month: 'Out', leads: 0 },
        { month: 'Nov', leads: 0 },
        { month: 'Dez', leads: 0 }
      ];
  
  // Use pet breed data from the API instead of hardcoded data
  const petBreedsData = stats.petBreeds?.length > 0 
    ? stats.petBreeds 
    : [
        { name: 'Não especificado', value: 100, color: '#8B5CF6' }
      ];

  const petServicesData = [
    { name: 'Banho', value: 45 },
    { name: 'Tosa', value: 35 },
    { name: 'Consulta', value: 20 },
    { name: 'Vacinas', value: 30 },
    { name: 'Compras', value: 25 },
  ];
  
  // Use real leads data from the database
  const recentLeadsData = leadsStats.recentLeads?.length > 0
    ? leadsStats.recentLeads
    : [
        { id: 1, name: 'Carregando...', phone: '...', pets: 0, lastVisit: '...' }
      ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <DashboardHeader />
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-800 dark:text-white">
            <LineChart className="h-6 w-6 text-petshop-blue dark:text-blue-400" />
            Dashboard de Métricas
          </h2>
        </div>
        
        {/* Estatísticas em Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <StatCard
            title="Total de Leads"
            value={leadsStats.totalLeads}
            icon={<TrendingUp />}
            trend={`${leadsStats.newLeadsThisMonth} novos este mês`}
            loading={leadsLoading}
            iconBgClass="bg-blue-100 dark:bg-blue-900/30"
            iconTextClass="text-blue-600 dark:text-blue-400"
          />
        </div>
        
        {/* Gráficos e Tabelas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <LeadsGrowthChart data={monthlyLeadsData} loading={leadsLoading} />
          <RecentClientsTable clients={recentLeadsData} loading={leadsLoading} />
        </div>
        
        {/* Mapa do Brasil */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          <BrazilMapChart leadsByState={leadsByState} loading={stateLoading} />
        </div>
      </main>
    </div>
  );
};

export default MetricsDashboard;
