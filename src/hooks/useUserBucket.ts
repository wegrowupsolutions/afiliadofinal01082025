import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useUserBucket = () => {
  const { user, session } = useAuth();

  useEffect(() => {
    const createUserBucket = async () => {
      if (!user || !session) return;

      try {
        const { data, error } = await supabase.functions.invoke('create-user-bucket', {
          body: {
            email: user.email,
            user_id: user.id
          }
        });

        if (error) {
          console.error('Erro ao criar bucket do usuário:', error);
        } else {
          console.log('Bucket do usuário verificado/criado:', data.bucket_name);
        }
      } catch (error) {
        console.error('Erro na criação automática do bucket:', error);
      }
    };

    // Criar bucket automaticamente quando o usuário fizer login
    createUserBucket();
  }, [user, session]);

  return { user };
};