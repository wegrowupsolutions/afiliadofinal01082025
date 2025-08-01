import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { PawPrint, Mail, Lock, Eye, EyeOff, Heart, Sparkles } from 'lucide-react';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';

const loginSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "Senha deve ter pelo menos 6 caracteres" })
});

const Index = () => {
  const navigate = useNavigate();
  const { signIn, user, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const [isPageLoaded, setIsPageLoaded] = useState(false);
  
  useEffect(() => {
    setIsPageLoaded(true);
  }, []);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = () => {
    try {
      loginSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: {
          email?: string;
          password?: string;
        } = {};
        
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof typeof newErrors] = err.message;
          }
        });
        
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await signIn(formData.email, formData.password);
      
      if (error) {
        console.error('Login error:', error);
        toast.error(error.message || 'Erro ao fazer login. Tente novamente.');
      } else {
        toast.success('Login realizado com sucesso!');
        // Navigate is handled by the auth state change in AuthContext
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-petshop-blue dark:bg-gray-900">
        <div className="h-16 w-16 border-4 border-t-transparent border-petshop-gold rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      <div className="absolute top-4 right-4 z-30">
        <ThemeToggle />
      </div>
      
      <div className="absolute inset-0 z-0">
        <img 
          src="/lovable-uploads/7a96682a-47a3-4ed0-8036-8a31ad28cb4b.png" 
          alt="Pet background" 
          className="w-full h-full object-cover transition-opacity duration-1000 opacity-80"
        />
        <div className="absolute inset-0 backdrop-blur-md bg-petshop-blue/30 dark:bg-gray-900/50"></div>
      </div>
      
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-10">
        <div className="absolute top-[10%] left-[5%] w-28 h-28 rounded-full bg-petshop-gold dark:bg-amber-500 opacity-20 animate-float"></div>
        <div className="absolute bottom-[20%] right-[10%] w-40 h-40 rounded-full bg-petshop-gold dark:bg-amber-500 opacity-10 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-[40%] right-[20%] w-24 h-24 rounded-full bg-petshop-gold dark:bg-amber-500 opacity-15 animate-float" style={{ animationDelay: '2s' }}></div>
        
        <PawPrint className="absolute top-[15%] right-[25%] w-16 h-16 text-white opacity-10 animate-bounce" style={{ animationDelay: '1.5s' }} />
        <PawPrint className="absolute bottom-[30%] left-[15%] w-20 h-20 text-white opacity-10 animate-float" style={{ animationDelay: '2.5s' }} />
        <PawPrint className="absolute top-[60%] right-[10%] w-12 h-12 text-petshop-gold dark:text-amber-500 opacity-15 animate-pulse" style={{ animationDelay: '0.5s' }} />
        <Heart className="absolute top-[25%] left-[30%] w-10 h-10 text-petshop-gold dark:text-amber-500 opacity-15 animate-pulse" style={{ animationDelay: '1.2s' }} />
        <Sparkles className="absolute bottom-[15%] right-[25%] w-14 h-14 text-white opacity-10 animate-pulse" style={{ animationDelay: '1.8s' }} />
      </div>
      
      <div 
        className={`m-auto z-20 px-6 py-8 transition-all duration-700 transform ${isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
      >
        <div className="w-full max-w-md mx-auto">
          <form 
            onSubmit={handleSubmit} 
            className="glass-card dark:bg-gray-800/40 rounded-2xl p-8 space-y-6 animate-fade-in"
            style={{ backdropFilter: "blur(16px)" }}
          >
            <h1 className="text-2xl font-bold text-white text-center mb-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              Bem-vindo ao Pet Paradise!
            </h1>
            <p className="text-white/80 text-center mb-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              Entre para gerenciar seu petshop
            </p>

            <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5 group-hover:text-petshop-gold transition-colors duration-300" />
                <Input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`pl-10 h-12 bg-white/10 dark:bg-gray-700/50 border-white/20 text-white rounded-md transition-all duration-300 hover:border-petshop-gold/50 ${errors.email ? 'border-red-400' : 'focus:border-petshop-gold'}`}
                />
                {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
              </div>

              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5 group-hover:text-petshop-gold transition-colors duration-300" />
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Senha"
                  value={formData.password}
                  onChange={handleChange}
                  className={`pl-10 h-12 bg-white/10 dark:bg-gray-700/50 border-white/20 text-white rounded-md transition-all duration-300 hover:border-petshop-gold/50 ${errors.password ? 'border-red-400' : 'focus:border-petshop-gold'}`}
                />
                <button 
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5 hover:text-petshop-gold transition-colors duration-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
              </div>
            </div>

            <div className="flex items-center justify-between animate-slide-up" style={{ animationDelay: '0.5s' }}>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 bg-white/10 dark:bg-gray-700/50 border-white/20 rounded focus:ring-petshop-gold text-petshop-gold"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-white/80 hover:text-white transition-colors duration-300">
                  Lembrar-me
                </label>
              </div>
              <a href="#" className="text-sm text-petshop-gold hover:text-white transition-colors duration-300">
                Esqueceu a senha?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full button-hover-effect bg-petshop-gold hover:bg-amber-500 text-petshop-blue dark:text-gray-900 font-bold py-3 px-4 rounded-md flex items-center justify-center transition-all duration-300 animate-slide-up"
              style={{ animationDelay: '0.6s' }}
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-petshop-blue dark:border-gray-900 border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <PawPrint className="mr-2 h-5 w-5" />
              )}
              {isLoading ? "Entrando..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Index;
