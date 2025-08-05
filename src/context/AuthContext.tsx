
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User, AuthError, AuthTokenResponsePassword } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{
    error: AuthError | null;
    data: Session | null;
  }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);

        // Criar bucket automaticamente quando o usuário fizer login
        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(async () => {
            try {
              const { data, error } = await supabase.functions.invoke('create-user-bucket', {
                body: {
                  email: session.user.email,
                  user_id: session.user.id
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
          }, 100);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Primeiro, verificar se é um usuário do Kiwify que precisa de conta criada
      const { data: kiwifySync, error: syncError } = await supabase
        .rpc('sync_kiwify_user_on_login', { 
          user_email: email, 
          user_password: password 
        });

      if (syncError) {
        console.error('Erro na sincronização Kiwify:', syncError);
      }

      // Se há dados do Kiwify, verificar se precisa criar conta
      if (kiwifySync && kiwifySync.length > 0) {
        const kiwifyData = kiwifySync[0] as any;
        
        // A função agora retorna should_create_account que indica se precisa criar
        if (kiwifyData.should_create_account) {
          // Criar conta no Supabase Auth
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
              emailRedirectTo: `${window.location.origin}/dashboard`,
              data: {
                full_name: (kiwifyData.kiwify_data as any)?.nome || ''
              }
            }
          });

          if (signUpError) {
            console.error('Erro ao criar conta:', signUpError);
            // Se falhou por email já existir, tentar login normal
            if (signUpError.message.includes('already been registered')) {
              const response = await supabase.auth.signInWithPassword({ email, password });
              setIsLoading(false);
              return {
                error: response.error,
                data: response.data.session
              };
            }
            
            setIsLoading(false);
            return {
              error: signUpError,
              data: null
            };
          }

          // Atualizar kiwify com o novo user_id
          if (signUpData.user) {
            await supabase
              .from('kiwify')
              .update({ 
                user_id: signUpData.user.id,
                senha_alterada: true 
              })
              .eq('email', email);
              
            // Criar perfil
            await supabase
              .from('profiles')
              .upsert({ 
                id: signUpData.user.id,
                email: email,
                full_name: (kiwifyData.kiwify_data as any)?.nome || ''
              });
          }

          // Conta criada, fazer login
          const loginResponse = await supabase.auth.signInWithPassword({ email, password });
          setIsLoading(false);
          return {
            error: loginResponse.error,
            data: loginResponse.data.session
          };
        }
      }

      // Login normal para usuários já existentes (incluindo Kiwify já sincronizados)
      const response = await supabase.auth.signInWithPassword({ email, password });
      setIsLoading(false);
      
      return {
        error: response.error,
        data: response.data.session
      };
    } catch (error) {
      console.error('Erro no signIn:', error);
      setIsLoading(false);
      return {
        error: error as any,
        data: null
      };
    }
  };

  const signOut = async () => {
    console.log('Iniciando logout...');
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Erro no logout:', error);
      } else {
        console.log('Logout realizado com sucesso');
      }
      navigate('/');
    } catch (error) {
      console.error('Erro inesperado no logout:', error);
    } finally {
      setIsLoading(false);
      console.log('Logout finalizado');
    }
  };

  const value = {
    session,
    user,
    isLoading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
