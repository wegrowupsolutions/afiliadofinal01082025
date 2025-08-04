import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useFirstAccess = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [isFirstAccess, setIsFirstAccess] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkFirstAccess = async () => {
      if (authLoading || !user?.email) {
        setIsLoading(false);
        return;
      }

      try {
        // Verificar se o usuário já alterou a senha
        const { data, error } = await supabase
          .from('kiwify')
          .select('senha_alterada')
          .eq('email', user.email)
          .maybeSingle();

        if (error) {
          console.error('Erro ao verificar primeiro acesso:', error);
          setIsFirstAccess(false);
          return;
        }

        // Se não existe registro ou senha_alterada é false, é primeiro acesso
        const firstAccess = !data || !data.senha_alterada;
        setIsFirstAccess(firstAccess);
      } catch (error) {
        console.error('Erro inesperado ao verificar primeiro acesso:', error);
        setIsFirstAccess(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkFirstAccess();
  }, [user?.email, authLoading]);

  return {
    isFirstAccess,
    isLoading
  };
};