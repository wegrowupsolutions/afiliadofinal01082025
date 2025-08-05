import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Lock, Mail, CheckCircle } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { toast } from "sonner";
import { z } from 'zod';

const changePasswordSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type FormData = {
  email: string;
  password: string;
  confirmPassword: string;
};

const ChangePassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    // Animação de entrada da página
    const timer = setTimeout(() => {
      document.body.classList.add('animate-fade-in');
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpar erro específico quando usuário começar a digitar
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    try {
      changePasswordSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<FormData> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof FormData] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Verificar se o email existe na tabela kiwify
      const { data: emailExists, error: checkError } = await supabase
        .rpc('check_kiwify_email_exists', { user_email: formData.email });

      if (checkError) {
        throw checkError;
      }

      if (!emailExists) {
        setErrors({ email: 'Email não encontrado. Verifique se você possui acesso à plataforma.' });
        return;
      }

      // Atualizar senha na tabela kiwify
      const { data: updateSuccess, error: updateError } = await supabase
        .rpc('update_kiwify_password', { 
          user_email: formData.email, 
          new_password: formData.password 
        });

      if (updateError) {
        throw updateError;
      }

      if (!updateSuccess) {
        throw new Error('Falha ao atualizar senha');
      }

      // Mostrar modal de sucesso
      setShowSuccessModal(true);

    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      toast.error('Erro ao alterar senha. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessOk = () => {
    setShowSuccessModal(false);
    navigate('/');
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
          <Lock className="absolute top-[20%] right-[30%] w-16 h-16 text-cyan-400 opacity-30 animate-float drop-shadow-glow" style={{ animationDelay: '1s' }} />
          <Mail className="absolute bottom-[35%] left-[20%] w-20 h-20 text-teal-400 opacity-25 animate-float drop-shadow-glow" style={{ animationDelay: '3s' }} />
          <CheckCircle className="absolute top-[65%] right-[15%] w-14 h-14 text-blue-400 opacity-30 animate-pulse drop-shadow-glow" style={{ animationDelay: '0.5s' }} />
        </div>
        
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-slate-900/30 to-transparent"></div>
      </div>

      {/* Main Content */}
      <div className="m-auto z-20 px-6 py-8 transition-all duration-700 transform animate-fade-in">
        <div className="w-full max-w-md mx-auto">
          <form 
            onSubmit={handleSubmit} 
            className="relative backdrop-blur-xl bg-slate-900/40 border border-cyan-400/20 rounded-2xl p-8 space-y-6 shadow-2xl shadow-cyan-500/10 animate-fade-in"
          >
            {/* Header with AI theme */}
            <div className="text-center mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center justify-center mb-4">
                <div className="relative">
                  <Lock className="h-12 w-12 text-cyan-400 drop-shadow-glow animate-pulse" />
                  <div className="absolute inset-0 h-12 w-12 bg-cyan-400/20 rounded-full blur-md"></div>
                </div>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-400 bg-clip-text text-transparent mb-2">
                Definir Nova Senha
              </h1>
              <p className="text-slate-300 text-sm">
                Digite seu email e crie uma nova senha para acessar a plataforma
              </p>
              <div className="mt-4 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"></div>
            </div>

            <div className="space-y-5 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              {/* Email */}
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 group-hover:text-cyan-400 transition-colors duration-300" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`pl-10 h-12 bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-400 rounded-lg transition-all duration-300 hover:border-cyan-400/50 focus:border-cyan-400 focus:bg-slate-800/70 ${errors.email ? 'border-red-400' : ''}`}
                  placeholder="seu@email.com"
                  required
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 group-hover:text-cyan-400 transition-colors duration-300" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  className={`pl-10 pr-10 h-12 bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-400 rounded-lg transition-all duration-300 hover:border-cyan-400/50 focus:border-cyan-400 focus:bg-slate-800/70 ${errors.password ? 'border-red-400' : ''}`}
                  placeholder="Mínimo 6 caracteres"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 hover:text-cyan-400 transition-colors duration-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                {errors.password && (
                  <p className="text-red-400 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 group-hover:text-cyan-400 transition-colors duration-300" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`pl-10 pr-10 h-12 bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-400 rounded-lg transition-all duration-300 hover:border-cyan-400/50 focus:border-cyan-400 focus:bg-slate-800/70 ${errors.confirmPassword ? 'border-red-400' : ''}`}
                  placeholder="Digite a senha novamente"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 hover:text-cyan-400 transition-colors duration-300"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                {errors.confirmPassword && (
                  <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full relative overflow-hidden bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-900 font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-300 animate-slide-up shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/30 group"
              style={{ animationDelay: '0.6s' }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="h-5 w-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                  <span>Alterando senha...</span>
                </div>
              ) : (
                <>
                  <Lock className="mr-2 h-5 w-5" />
                  Alterar Senha
                </>
              )}
            </button>

            {/* Back to Login */}
            <div className="text-center animate-slide-up" style={{ animationDelay: '0.7s' }}>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors duration-300"
              >
                Voltar para o login
              </button>
            </div>

            {/* Tech decoration at bottom */}
            <div className="mt-6 flex items-center justify-center space-x-4 opacity-30">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              <div className="w-1 h-1 bg-teal-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="relative backdrop-blur-xl bg-slate-900/40 border border-cyan-400/20 rounded-2xl p-8 max-w-md w-full mx-4 animate-slide-up shadow-2xl shadow-cyan-500/10">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <CheckCircle className="h-12 w-12 text-cyan-400 drop-shadow-glow" />
                  <div className="absolute inset-0 h-12 w-12 bg-cyan-400/20 rounded-full blur-md"></div>
                </div>
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-400 bg-clip-text text-transparent mb-4">
                Senha Alterada com Sucesso!
              </h2>
              <p className="text-slate-300 mb-6">
                Sua senha foi definida com sucesso. Agora você pode fazer login na plataforma.
              </p>
              <button
                onClick={handleSuccessOk}
                className="w-full relative overflow-hidden bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-900 font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/30 group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChangePassword;