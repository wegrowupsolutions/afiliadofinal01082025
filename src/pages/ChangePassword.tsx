import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Lock, Shield, Mail, Bot, Brain, Cpu, Zap, Network, Binary, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { z } from 'zod';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const passwordSchema = z.object({
  email: z.string().email('Email inválido'),
  newPassword: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'A confirmação da senha deve ter pelo menos 6 caracteres'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

export default function ChangePassword() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  useEffect(() => {
    setIsPageLoaded(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpar erro específico quando usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    try {
      passwordSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            formattedErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(formattedErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Primeiro verificar se o email existe na tabela kiwify (confirma a compra)
      const { data: existingRecord, error: checkError } = await supabase
        .from('kiwify')
        .select('email, senha_alterada')
        .eq('email', formData.email)
        .maybeSingle();

      if (checkError) {
        console.error('Erro ao verificar email na tabela kiwify:', checkError);
        toast.error('Erro ao verificar informações do cliente');
        return;
      }

      if (!existingRecord) {
        toast.error('Email não encontrado. Verifique se este email foi usado na compra.');
        return;
      }

      if (existingRecord.senha_alterada) {
        toast.error('Este email já teve a senha alterada. Entre em contato com o suporte se necessário.');
        return;
      }

      // Se chegou até aqui, o email é válido e não teve senha alterada ainda
      // Atualizar senha no Supabase Auth (se o usuário estiver logado)
      if (user?.email) {
        const { error: authError } = await supabase.auth.updateUser({
          password: formData.newPassword
        });

        if (authError) {
          console.error('Erro ao atualizar senha no Auth:', authError);
          // Não retornar aqui, pois o importante é salvar na tabela kiwify
        }
      }

      // Salvar nova senha na tabela kiwify
      const { error: kiwifyError } = await supabase
        .from('kiwify')
        .update({ 
          nova_senha: formData.newPassword,
          senha_alterada: true
        })
        .eq('email', formData.email);

      if (kiwifyError) {
        console.error('Erro ao salvar senha na tabela kiwify:', kiwifyError);
        toast.error('Erro ao salvar nova senha');
        return;
      }

      // Mostrar dialog de sucesso
      setShowSuccessDialog(true);
    } catch (error) {
      console.error('Erro inesperado ao alterar senha:', error);
      toast.error('Erro inesperado ao alterar senha');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-30">
        <ThemeToggle />
      </div>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-0">
        {/* Circuit pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="circuit" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 0 10 L 20 10 M 10 0 L 10 20" stroke="currentColor" strokeWidth="0.5" fill="none" className="text-cyan-400"/>
                <circle cx="10" cy="10" r="1" fill="currentColor" className="text-cyan-400"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#circuit)"/>
          </svg>
        </div>
        
        {/* Floating tech elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          {/* Glowing orbs */}
          <div className="absolute top-[15%] left-[10%] w-32 h-32 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 opacity-20 animate-pulse blur-xl"></div>
          <div className="absolute bottom-[25%] right-[15%] w-40 h-40 rounded-full bg-gradient-to-r from-teal-400 to-cyan-500 opacity-15 animate-pulse blur-xl" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-[45%] right-[25%] w-24 h-24 rounded-full bg-gradient-to-r from-blue-400 to-teal-500 opacity-25 animate-pulse blur-xl" style={{ animationDelay: '4s' }}></div>
          
          {/* Tech icons with glow effect */}
          <Brain className="absolute top-[20%] right-[30%] w-16 h-16 text-cyan-400 opacity-30 animate-float drop-shadow-glow" style={{ animationDelay: '1s' }} />
          <Cpu className="absolute bottom-[35%] left-[20%] w-20 h-20 text-teal-400 opacity-25 animate-float drop-shadow-glow" style={{ animationDelay: '3s' }} />
          <Network className="absolute top-[65%] right-[15%] w-14 h-14 text-blue-400 opacity-30 animate-pulse drop-shadow-glow" style={{ animationDelay: '0.5s' }} />
          <Zap className="absolute top-[30%] left-[25%] w-12 h-12 text-cyan-300 opacity-35 animate-bounce drop-shadow-glow" style={{ animationDelay: '2.5s' }} />
          <Shield className="absolute bottom-[20%] right-[35%] w-18 h-18 text-teal-300 opacity-25 animate-pulse drop-shadow-glow" style={{ animationDelay: '1.8s' }} />
          <Binary className="absolute top-[75%] left-[35%] w-10 h-10 text-blue-300 opacity-20 animate-float drop-shadow-glow" style={{ animationDelay: '4.2s' }} />
        </div>
        
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-slate-900/30 to-transparent"></div>
      </div>
      
      {/* Main Content */}
      <div 
        className={`m-auto z-20 px-6 py-8 transition-all duration-700 transform ${isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
      >
        <div className="w-full max-w-md mx-auto">
          <form 
            onSubmit={handleSubmit} 
            className="relative backdrop-blur-xl bg-slate-900/40 border border-cyan-400/20 rounded-2xl p-8 space-y-6 shadow-2xl shadow-cyan-500/10 animate-fade-in"
          >
            {/* Header with AI theme */}
            <div className="text-center mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center justify-center mb-4">
                <div className="relative">
                  <Shield className="h-12 w-12 text-cyan-400 drop-shadow-glow animate-pulse" />
                  <div className="absolute inset-0 h-12 w-12 bg-cyan-400/20 rounded-full blur-md"></div>
                </div>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-400 bg-clip-text text-transparent mb-2">
                Primeiro Acesso
              </h1>
              <p className="text-slate-300 text-sm">
                Digite o email usado na compra e defina sua nova senha para acessar o sistema
              </p>
              <div className="mt-4 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"></div>
            </div>

            <div className="space-y-5 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 group-hover:text-cyan-400 transition-colors duration-300" />
                <Input
                  type="email"
                  name="email"
                  placeholder="Email da Compra"
                  value={formData.email}
                  onChange={handleChange}
                  className={`pl-10 h-12 bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-400 rounded-lg transition-all duration-300 hover:border-cyan-400/50 focus:border-cyan-400 focus:bg-slate-800/70 ${errors.email ? 'border-red-400' : ''}`}
                  disabled={isLoading}
                />
                {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
              </div>

              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 group-hover:text-cyan-400 transition-colors duration-300" />
                <Input
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  placeholder="Nova Senha"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className={`pl-10 pr-10 h-12 bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-400 rounded-lg transition-all duration-300 hover:border-cyan-400/50 focus:border-cyan-400 focus:bg-slate-800/70 ${errors.newPassword ? 'border-red-400' : ''}`}
                  disabled={isLoading}
                />
                <button 
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 hover:text-cyan-400 transition-colors duration-300"
                  disabled={isLoading}
                >
                  {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                {errors.newPassword && <p className="text-red-400 text-sm mt-1">{errors.newPassword}</p>}
              </div>

              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 group-hover:text-cyan-400 transition-colors duration-300" />
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirmar Nova Senha"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`pl-10 pr-10 h-12 bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-400 rounded-lg transition-all duration-300 hover:border-cyan-400/50 focus:border-cyan-400 focus:bg-slate-800/70 ${errors.confirmPassword ? 'border-red-400' : ''}`}
                  disabled={isLoading}
                />
                <button 
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 hover:text-cyan-400 transition-colors duration-300"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full relative overflow-hidden bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-900 font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-300 animate-slide-up shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/30 group"
              style={{ animationDelay: '0.6s' }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <Shield className="mr-2 h-5 w-5" />
              )}
              {isLoading ? "Alterando senha..." : "Alterar Senha"}
            </button>

            {/* Tech decoration at bottom */}
            <div className="mt-6 flex items-center justify-center space-x-4 opacity-30">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              <div className="w-1 h-1 bg-teal-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
          </form>
        </div>
      </div>
      
      {/* Success Dialog */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent className="bg-slate-900/95 border border-cyan-400/20 backdrop-blur-xl max-w-md">
          <AlertDialogHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <CheckCircle className="h-16 w-16 text-green-400 drop-shadow-glow animate-pulse" />
                <div className="absolute inset-0 h-16 w-16 bg-green-400/20 rounded-full blur-md"></div>
              </div>
            </div>
            <AlertDialogTitle className="text-2xl font-bold bg-gradient-to-r from-green-400 via-cyan-300 to-teal-400 bg-clip-text text-transparent">
              Senha Alterada com Sucesso!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300 text-base">
              Sua senha foi alterada com sucesso. Agora você pode fazer login com seu email e nova senha.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-center pt-6">
            <AlertDialogAction
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-900 font-bold py-3 px-8 rounded-lg transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/30"
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}