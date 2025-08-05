
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User, AuthError, AuthTokenResponsePassword } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{
    error: AuthError | null;
    data: Session | null;
  }>;
  signInWithKiwify: (email: string, password: string) => Promise<{
    error: string | null;
    data: any | null;
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
    const response = await supabase.auth.signInWithPassword({ email, password });
    setIsLoading(false);
    
    return {
      error: response.error,
      data: response.data.session
    };
  };

  const signInWithKiwify = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Verificar se o email e senha estão corretos na tabela kiwify
      const { data: kiwifyData, error: kiwifyError } = await supabase
        .from('kiwify')
        .select('email, nova_senha, senha_alterada')
        .eq('email', email)
        .eq('nova_senha', password)
        .eq('senha_alterada', true)
        .maybeSingle();

      if (kiwifyError) {
        console.error('Erro ao verificar credenciais na tabela kiwify:', kiwifyError);
        return {
          error: 'Erro ao verificar credenciais',
          data: null
        };
      }

      if (!kiwifyData) {
        return {
          error: 'Email ou senha incorretos',
          data: null
        };
      }

      // Se chegou até aqui, as credenciais estão corretas
      // Criar uma sessão "fake" para simular login
      const fakeUser = {
        id: email, // usando email como ID único
        email: email,
        aud: 'authenticated',
        role: 'authenticated',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email_confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        app_metadata: {},
        user_metadata: {}
      };

      const fakeSession = {
        access_token: 'fake-token',
        refresh_token: 'fake-refresh',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        token_type: 'bearer',
        user: fakeUser as User
      };

      setUser(fakeUser as User);
      setSession(fakeSession as Session);

      return {
        error: null,
        data: { email }
      };
    } catch (error) {
      console.error('Erro inesperado no login kiwify:', error);
      return {
        error: 'Erro inesperado',
        data: null
      };
    } finally {
      setIsLoading(false);
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
    signInWithKiwify,
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
