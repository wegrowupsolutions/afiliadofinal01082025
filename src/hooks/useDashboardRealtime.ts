
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useClientStats } from './useClientStats';
import { useConversations } from './useConversations';

export function useDashboardRealtime() {
  const { fetchConversations } = useConversations();
  const { refetchStats } = useClientStats();

  useEffect(() => {
    console.log('Setting up dashboard-wide realtime updates');
    
    // Subscribe to changes in the clients table
    const clientsSubscription = supabase
      .channel('dashboard_clients_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'dados_cliente' 
        }, 
        async (payload) => {
          console.log('Client data changed:', payload);
          await refetchStats();
        }
      )
      .subscribe();

    // Subscribe to changes in appointments/schedule
    const scheduleSubscription = supabase
      .channel('dashboard_schedule_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'appointments' 
        }, 
        async () => {
          console.log('Schedule data changed');
          await refetchStats();
        }
      )
      .subscribe();
      
    // Subscribe to changes in services/products
    const servicesSubscription = supabase
      .channel('dashboard_services_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'services' 
        }, 
        async () => {
          console.log('Services data changed');
          await refetchStats();
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up dashboard realtime subscriptions');
      clientsSubscription.unsubscribe();
      scheduleSubscription.unsubscribe();
      servicesSubscription.unsubscribe();
    };
  }, [refetchStats, fetchConversations]);
}

