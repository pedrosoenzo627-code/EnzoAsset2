import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, Phone, Github, Chrome, ArrowRight, ShieldCheck, Zap, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export const Login = () => {
  const { signIn, signInEmail } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'email' | 'social' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInEmail(email, password, isSignUp);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Falha na autenticação');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    setLoading(true);
    setError(null);
    try {
      await signIn(provider);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || `Falha no login com ${provider}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg relative flex items-center justify-center p-4 overflow-hidden tech-dots">
      <div className="scanline"></div>
      
      {/* Background Decor */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 blur-[120px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 blur-[120px] rounded-full"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[480px] z-10"
      >
        <div className="bg-surface border border-border rounded-[2.5rem] overflow-hidden backdrop-blur-xl">
          {/* Header */}
          <div className="p-10 border-b border-border text-center relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <ShieldCheck className="w-24 h-24 text-primary" />
             </div>
             <Zap className="w-10 h-10 text-primary mx-auto mb-6" />
             <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-2">Acesso Terminal</h1>
             <p className="text-gray-500 font-medium text-sm">Autentique-se para interagir com a rede Enzo Assets.</p>
          </div>

          {/* Tabs Navigation */}
          <div className="flex border-b border-border">
            {[
              { id: 'email', label: 'E-mail', icon: Mail },
              { id: 'social', label: 'Social', icon: Chrome },
              { id: 'phone', label: 'Telefone', icon: Phone },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-5 flex flex-col items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab.id ? 'text-primary bg-primary/5' : 'text-gray-500 hover:text-white'
                }`}
              >
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-primary' : 'text-gray-500'}`} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Form Content */}
          <div className="p-10">
            {error && (
              <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center space-x-3 text-red-500 text-xs font-bold uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <AnimatePresence mode="wait">
              {activeTab === 'email' && (
                <motion.form 
                  key="email-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleEmailAuth}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Endereço de Rede</label>
                    <div className="relative group">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-primary transition-colors" />
                      <input 
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu@email.com"
                        className="w-full bg-black/50 border border-border p-6 pl-16 rounded-2xl text-white font-medium placeholder:text-gray-700 focus:outline-none focus:border-primary/50 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Chave de Acesso</label>
                    <div className="relative group">
                      <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-primary transition-colors" />
                      <input 
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-black/50 border border-border p-6 pl-16 rounded-2xl text-white font-medium placeholder:text-gray-700 focus:outline-none focus:border-primary/50 transition-all"
                      />
                    </div>
                  </div>

                  <button 
                    disabled={loading}
                    className="w-full bg-white text-black p-6 rounded-2xl font-black text-sm tracking-[0.2em] hover:bg-primary transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
                  >
                    <span>{loading ? 'PROCESSANDO...' : (isSignUp ? 'CRIAR CONTA' : 'AUTENTICAR')}</span>
                    {!loading && <ArrowRight className="w-5 h-5" />}
                  </button>

                  <p className="text-center text-gray-500 text-xs font-medium">
                    {isSignUp ? 'Já possui cadastro?' : 'Ainda não é membro?'}{' '}
                    <button 
                      type="button"
                      onClick={() => setIsSignUp(!isSignUp)}
                      className="text-primary hover:underline font-black"
                    >
                      {isSignUp ? 'ENTRAR' : 'REGISTRAR'}
                    </button>
                  </p>
                </motion.form>
              )}

              {activeTab === 'social' && (
                <motion.div 
                  key="social-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <button 
                    onClick={() => handleSocialLogin('google')}
                    disabled={loading}
                    className="w-full bg-white text-black p-6 rounded-2xl font-black text-sm tracking-[0.2em] flex items-center justify-center space-x-4 hover:bg-zinc-200 transition-all disabled:opacity-50"
                  >
                    <Chrome className="w-6 h-6" />
                    <span>ENTRAR COM GOOGLE</span>
                  </button>
                  <button 
                    onClick={() => handleSocialLogin('github')}
                    disabled={loading}
                    className="w-full bg-zinc-900 text-white p-6 rounded-2xl font-black text-sm tracking-[0.2em] flex items-center justify-center space-x-4 border border-white/5 hover:bg-black transition-all disabled:opacity-50"
                  >
                    <Github className="w-6 h-6" />
                    <span>ENTRAR COM GITHUB</span>
                  </button>
                  <p className="text-center text-gray-600 text-[9px] font-bold uppercase tracking-widest leading-loose">
                    Autenticação via provedores externos de confiança. <br />
                    Seus dados técnicos estão protegidos.
                  </p>
                </motion.div>
              )}

              {activeTab === 'phone' && (
                <motion.div 
                  key="phone-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8 text-center"
                >
                  <div className="p-12 border-2 border-dashed border-border rounded-[2.5rem] space-y-6">
                    <Phone className="w-16 h-16 text-gray-700 mx-auto" />
                    <p className="text-gray-500 font-medium italic">A autenticação via telefone está em fase de implantação de rede.</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('email')}
                    className="text-primary text-xs font-black uppercase tracking-widest hover:underline"
                  >
                    Voltar para E-mail
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-8 flex justify-between px-6">
          <Link to="/" className="text-[10px] font-black text-gray-500 hover:text-white uppercase tracking-widest">Página Inicial</Link>
          <span className="text-[10px] font-black text-gray-800 uppercase tracking-widest">Protocolo v3.4.0</span>
          <Link to="/marketplace" className="text-[10px] font-black text-gray-500 hover:text-white uppercase tracking-widest">Marketplace</Link>
        </div>
      </motion.div>
    </div>
  );
};
