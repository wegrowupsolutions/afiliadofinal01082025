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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated gradients */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-accent/20 to-primary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        
        {/* Circuit patterns */}
        <div className="absolute top-20 left-20 w-32 h-32 opacity-10">
          <div className="w-full h-full border border-primary/30 rounded-lg"></div>
          <div className="absolute top-4 left-4 w-6 h-6 border border-primary/50 rounded-full"></div>
          <div className="absolute bottom-4 right-4 w-4 h-4 bg-primary/30 rounded-sm"></div>
        </div>
        
        {/* Tech icons floating */}
        <div className="absolute top-1/4 right-1/4 animate-pulse">
          <Lock className="h-8 w-8 text-primary/20 animate-bounce" />
        </div>
        <div className="absolute bottom-1/3 left-1/3 animate-pulse" style={{ animationDelay: '1s' }}>
          <Mail className="h-6 w-6 text-accent/30" />
        </div>
      </div>

      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Main Content */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-border/50 p-8 animate-slide-up">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-primary/10 p-4 rounded-full">
                <Lock className="h-8 w-8 text-primary drop-shadow-glow" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Definir Nova Senha
            </h1>
            <p className="text-muted-foreground">
              Digite seu email e crie uma nova senha para acessar a plataforma
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 h-12 bg-background/50 border-border/60 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                  placeholder="seu@email.com"
                  required
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              {errors.email && (
                <Alert className="border-destructive/20 bg-destructive/5">
                  <AlertDescription className="text-destructive text-sm">
                    {errors.email}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
                Nova Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 pr-10 h-12 bg-background/50 border-border/60 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                  placeholder="Mínimo 6 caracteres"
                  required
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <Alert className="border-destructive/20 bg-destructive/5">
                  <AlertDescription className="text-destructive text-sm">
                    {errors.password}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                Confirmar Senha
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="pl-10 pr-10 h-12 bg-background/50 border-border/60 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
                  placeholder="Digite a senha novamente"
                  required
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <Alert className="border-destructive/20 bg-destructive/5">
                  <AlertDescription className="text-destructive text-sm">
                    {errors.confirmPassword}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg button-hover-effect"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                  <span>Alterando senha...</span>
                </div>
              ) : (
                'Alterar Senha'
              )}
            </Button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Voltar para o login
            </button>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full mx-4 animate-slide-up">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full">
                  <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Senha Alterada com Sucesso!
              </h2>
              <p className="text-muted-foreground mb-6">
                Sua senha foi definida com sucesso. Agora você pode fazer login na plataforma.
              </p>
              <Button
                onClick={handleSuccessOk}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                OK
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChangePassword;