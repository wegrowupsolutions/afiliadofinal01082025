
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useDashboardRealtime } from '@/hooks/useDashboardRealtime';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import MetricsCard from '@/components/dashboard/MetricsCard';
import ChatsCard from '@/components/dashboard/ChatsCard';
import KnowledgeCard from '@/components/dashboard/KnowledgeCard';
import ClientsCard from '@/components/dashboard/ClientsCard';
import EvolutionCard from '@/components/dashboard/EvolutionCard';
import AcademiaCard from '@/components/dashboard/AcademiaCard';
import ConfigCard from '@/components/dashboard/ConfigCard';
import AgentConfigCard from '@/components/dashboard/AgentConfigCard';

const Dashboard = () => {
  const { user, isLoading } = useAuth();
  const { isAdmin } = useIsAdmin();
  const navigate = useNavigate();
  
  // Initialize real-time updates for the dashboard
  useDashboardRealtime();
  
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/');
    }
  }, [user, isLoading, navigate]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-petshop-blue dark:bg-gray-900">
        <div className="h-16 w-16 border-4 border-t-transparent border-petshop-gold rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Painel Administrativo</h1>
        <p className="text-muted-foreground mt-2">Gerencie todos os aspectos da sua plataforma</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricsCard />
        <ChatsCard />
        <KnowledgeCard />
        <ClientsCard />
        <EvolutionCard />
        <AcademiaCard />
        <AgentConfigCard />
        {isAdmin && <ConfigCard />}
      </div>
    </div>
  );
};

export default Dashboard;
