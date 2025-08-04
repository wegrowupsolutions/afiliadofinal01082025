import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Bot, Mail, Lock, Eye, EyeOff, Brain, Cpu, Zap, Shield, Network, Binary } from 'lucide-react';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';

const loginSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "Senha deve ter pelo menos 6 caracteres" })
});

const Index = () => {
  const navigate = useNavigate();
  const { signIn, signInWithKiwify, user, isLoading: authLoading } = useAuth();
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
      // Usar autenticação via tabela kiwify
      const { error, data } = await signInWithKiwify(formData.email, formData.password);
      
      if (error) {
        console.error('Login error:', error);
        toast.error(error || 'Email ou senha incorretos. Verifique suas credenciais.');
      } else {
        toast.success('Login realizado com sucesso!');
        navigate('/dashboard');
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900">
        <div className="h-16 w-16 border-4 border-t-transparent border-cyan-400 rounded-full animate-spin"></div>
      </div>
    );
  }

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
                  <Bot className="h-12 w-12 text-cyan-400 drop-shadow-glow animate-pulse" />
                  <div className="absolute inset-0 h-12 w-12 bg-cyan-400/20 rounded-full blur-md"></div>
                </div>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-400 bg-clip-text text-transparent mb-2">
                Afiliado IA
              </h1>
              <p className="text-slate-300 text-sm">
                Sistema Inteligente de Automação
              </p>
              <div className="mt-4 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"></div>
            </div>

            <div className="space-y-5 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 group-hover:text-cyan-400 transition-colors duration-300" />
                <Input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`pl-10 h-12 bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-400 rounded-lg transition-all duration-300 hover:border-cyan-400/50 focus:border-cyan-400 focus:bg-slate-800/70 ${errors.email ? 'border-red-400' : ''}`}
                />
                {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
              </div>

              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 group-hover:text-cyan-400 transition-colors duration-300" />
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Senha"
                  value={formData.password}
                  onChange={handleChange}
                  className={`pl-10 pr-10 h-12 bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-400 rounded-lg transition-all duration-300 hover:border-cyan-400/50 focus:border-cyan-400 focus:bg-slate-800/70 ${errors.password ? 'border-red-400' : ''}`}
                />
                <button 
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 hover:text-cyan-400 transition-colors duration-300"
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
                  className="w-4 h-4 bg-slate-800 border-slate-600 rounded focus:ring-cyan-400 text-cyan-400"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-slate-300 hover:text-cyan-300 transition-colors duration-300">
                  Lembrar-me
                </label>
              </div>
              <a href="#" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors duration-300">
                Esqueceu a senha?
              </a>
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
                <Bot className="mr-2 h-5 w-5" />
              )}
              {isLoading ? "Processando..." : "Acesso ao Sistema"}
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
    </div>
  );
};

export default Index;
