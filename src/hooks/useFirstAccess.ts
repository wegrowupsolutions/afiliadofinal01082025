import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useFirstAccess = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [isFirstAccess, setIsFirstAccess] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkFirstAccess = async () => {
      if (authLoading) {
        setIsLoading(false);
        return;
      }

      // Se não está logado, não é primeiro acesso (vai para tela de login)
      if (!user?.email) {
        setIsFirstAccess(false);
        setIsLoading(false);
        return;
      }

      try {
        // Verificar se existe algum registro na tabela kiwify que ainda precisa alterar senha
        // e se corresponde ao email do usuário logado
        const { data, error } = await supabase
          .from('kiwify')
          .select('email, senha_alterada')
          .eq('email', user.email)
          .eq('senha_alterada', false)
          .maybeSingle();

        if (error) {
          console.error('Erro ao verificar primeiro acesso:', error);
          setIsFirstAccess(false);
          return;
        }

        // Se existe um registro com senha_alterada = false, é primeiro acesso
        setIsFirstAccess(!!data);
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