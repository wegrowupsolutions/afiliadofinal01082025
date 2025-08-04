import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useFirstAccess } from '@/hooks/useFirstAccess';
import { useAuth } from '@/context/AuthContext';

interface FirstAccessGuardProps {
  children: React.ReactNode;
}

export const FirstAccessGuard: React.FC<FirstAccessGuardProps> = ({ children }) => {
  const { user, isLoading: authLoading } = useAuth();
  const { isFirstAccess, isLoading: firstAccessLoading } = useFirstAccess();
  const location = useLocation();

  // Se ainda está carregando, não renderizar nada
  if (authLoading || firstAccessLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Se não está logado, permitir acesso normal (tela de login)
  if (!user) {
    return <>{children}</>;
  }

  // Se está na página de mudança de senha, permitir acesso
  if (location.pathname === '/change-password') {
    return <>{children}</>;
  }

  // Se é primeiro acesso e não está na página de mudança de senha, redirecionar
  if (isFirstAccess) {
    return <Navigate to="/change-password" replace />;
  }

  // Caso contrário, permitir acesso normal
  return <>{children}</>;
};