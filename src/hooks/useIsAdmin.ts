import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export const useIsAdmin = () => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useAuth();

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // Primeiro, tentar verificar usando o método padrão do Supabase
        const { data, error } = await supabase.rpc('is_current_user_admin');
        
        if (error || data === null) {
          // Se falhar (usuário Kiwify), verificar diretamente por email
          const adminEmails = [
            'teste@gmail.com',
            'rfreitasdc@gmail.com',
            'viniciushtx@gmail.com'
          ];
          
          setIsAdmin(adminEmails.includes(user.email || ''));
        } else {
          setIsAdmin(data === true);
        }
      } catch (error) {
        console.error('Erro ao verificar status de admin:', error);
        // Fallback para verificação por email
        const adminEmails = [
          'teste@gmail.com',
          'rfreitasdc@gmail.com',
          'viniciushtx@gmail.com'
        ];
        
        setIsAdmin(adminEmails.includes(user.email || ''));
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  return { isAdmin, loading };
};

export default useIsAdmin;