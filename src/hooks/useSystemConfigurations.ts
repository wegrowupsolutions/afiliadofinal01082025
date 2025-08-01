import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export const useSystemConfigurations = () => {
  const [configurations, setConfigurations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadConfigurations();
      checkAdminStatus();
    }
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user?.email) return;
    
    try {
      const { data, error } = await supabase.rpc('is_admin_email', {
        email_to_check: user.email
      });
      
      if (!error) {
        setIsAdmin(data);
      }
    } catch (error) {
      console.error('Erro ao verificar status de admin:', error);
      setIsAdmin(false);
    }
  };

  const loadConfigurations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('system_configurations')
        .select('key, value');

      if (error) {
        console.error('Erro ao carregar configurações:', error);
        return;
      }

      const configMap: Record<string, string> = {};
      data?.forEach(config => {
        configMap[config.key] = config.value;
      });

      setConfigurations(configMap);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateConfiguration = async (key: string, value: string): Promise<boolean> => {
    if (!isAdmin) {
      console.error('Apenas administradores podem modificar configurações');
      return false;
    }

    try {
      const { error } = await supabase
        .from('system_configurations')
        .upsert({
          key,
          value,
          description: `Configuração ${key}`,
          updated_by: user?.id
        });

      if (error) {
        console.error('Erro ao atualizar configuração:', error);
        return false;
      }

      // Atualizar estado local
      setConfigurations(prev => ({ ...prev, [key]: value }));
      return true;
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
      return false;
    }
  };

  return {
    configurations,
    loading,
    isAdmin,
    updateConfiguration,
    loadConfigurations
  };
};