import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, Phone, Github, Chrome, ArrowRight, ShieldCheck, Zap, AlertTriangle, Fingerprint, Cpu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { cn } from '../lib/utils';

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
    <div className="min-h-screen bg-bg relative flex items-center justify-center p-6 overflow-hidden tech-grid selection:bg-primary/30">
      {/* Poly-Chrome Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-tertiary/10 blur-[150px] rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-quinary/20 to-transparent"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[550px] z-10"
      >
        <div className="glass-morphism border border-white/5 rounded-[3rem] overflow-hidden backdrop-blur-3xl shadow-[0_50px_100px_rgba(0,0,0,0.8)] relative">
          <div className="hud-corner hud-corner-tl"></div>
          <div className="hud-corner hud-corner-tr"></div>
          <div className="hud-corner hud-corner-bl"></div>
          <div className="hud-corner hud-corner-br"></div>

          {/* Header */}
          <div className="p-16 text-center relative overflow-hidden bg-white/[0.01]">
             <div className="absolute top-0 right-0 p-8 opacity-5">
                <ShieldCheck className="w-48 h-48 text-primary" />
             </div>
             
             <div className="w-24 h-24 bg-black rounded-[2rem] border border-white/5 flex items-center justify-center mx-auto mb-10 group hover:border-primary transition-all duration-500 shadow-2xl relative">
                <Fingerprint className="w-10 h-10 text-primary group-hover:scale-110 transition-transform" />
                <div className="absolute inset-0 bg-primary/5 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
             </div>

             <h1 className="text-5xl font-display italic text-white tracking-tighter uppercase mb-4 leading-none">
                LOGIN_<span className="text-primary italic-none">TERMINAL</span>
             </h1>
             <p className="text-gray-600 font-tech font-black text-[10px] tracking-[0.5em] uppercase opacity-60">Audit_Log • Session_Sync v8.2</p>
          </div>

          {/* Tabs Navigation */}
          <div className="flex bg-black/40 border-y border-white/5">
            {[
              { id: 'email', label: 'EMAIL_SYNC', icon: Mail, color: 'text-primary' },
              { id: 'social', label: 'POLY_AUTH', icon: Chrome, color: 'text-secondary' },
              { id: 'phone', label: 'BIO_PHONE', icon: Phone, color: 'text-tertiary' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex-1 py-8 flex flex-col items-center gap-3 text-[9px] font-tech font-black uppercase tracking-[0.3em] transition-all relative overflow-hidden group",
                  activeTab === tab.id ? "bg-white/[0.03] text-white" : "text-gray-600 hover:text-gray-300"
                )}
              >
                <tab.icon className={cn("w-5 h-5", activeTab === tab.id ? tab.color : "text-gray-600")} />
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div layoutId="tab-underline" className={cn("absolute bottom-0 left-0 w-full h-[2px] shadow-[0_0_10px_currentcolor]", tab.color.replace('text-', 'bg-'))} />
                )}
              </button>
            ))}
          </div>

          {/* Form Content */}
          <div className="p-16">
            {error && (
              <div className="mb-10 p-6 bg-septenary/5 border border-septenary/20 rounded-2xl flex items-center space-x-4 text-septenary text-[10px] font-tech font-black uppercase tracking-[0.2em] glow-red">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 animate-pulse" />
                <span>ERRO_PROTOCOLO: {error}</span>
              </div>
            )}

            <AnimatePresence mode="wait">
              {activeTab === 'email' && (
                <motion.form 
                  key="email-form"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  onSubmit={handleEmailAuth}
                  className="space-y-10"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-4">
                       <label className="text-[9px] font-tech font-black text-gray-700 uppercase tracking-widest">EMAIL_HASH</label>
                       <span className="text-[8px] font-mono text-gray-800">UNRESTRICTED</span>
                    </div>
                    <div className="relative group">
                      <Mail className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-700 group-focus-within:text-primary transition-colors" />
                      <input 
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="INPUT_IDENTITY..."
                        className="w-full bg-white/[0.02] border border-white/5 p-8 pl-20 rounded-2xl text-white font-tech font-bold text-xs tracking-widest placeholder:text-gray-800 focus:outline-none focus:border-primary/40 focus:bg-white/[0.04] transition-all uppercase"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-4">
                       <label className="text-[9px] font-tech font-black text-gray-700 uppercase tracking-widest">ACCESS_KEY</label>
                       <Cpu className="w-4 h-4 text-gray-800" />
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-8 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-700 group-focus-within:text-primary transition-colors" />
                      <input 
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white/[0.02] border border-white/5 p-8 pl-20 rounded-2xl text-white font-tech font-bold text-xs tracking-widest placeholder:text-gray-800 focus:outline-none focus:border-primary/40 focus:bg-white/[0.04] transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <button 
                      disabled={loading}
                      className="w-full bg-white text-black p-8 rounded-2xl font-tech font-black text-xs tracking-[0.5em] hover:bg-primary transition-all flex items-center justify-center space-x-4 disabled:opacity-50 shadow-2xl uppercase relative group overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-tertiary opacity-0 group-hover:opacity-10 transition-opacity"></div>
                      <span>{loading ? 'SYNC_IDENT...' : (isSignUp ? 'CREATE_ACCOUNT' : 'EXEC_LOGIN')}</span>
                      {!loading && <ArrowRight className="w-6 h-6" />}
                    </button>

                    <button 
                      type="button"
                      onClick={() => setIsSignUp(!isSignUp)}
                      className="w-full text-center text-gray-600 text-[10px] font-tech font-black uppercase tracking-[0.4em] hover:text-white transition-colors"
                    >
                      {isSignUp ? 'ALREADY_HAVE_HASH? LOGIN' : 'NEW_NODE? REGISTER_IDENTITY'}
                    </button>
                  </div>
                </motion.form>
              )}

              {activeTab === 'social' && (
                <motion.div 
                  key="social-form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <button 
                    onClick={() => handleSocialLogin('google')}
                    disabled={loading}
                    className="w-full bg-white/[0.03] border border-white/5 text-white p-8 rounded-[1.5rem] font-tech font-black text-xs tracking-[0.4em] flex items-center justify-center space-x-6 hover:bg-white hover:text-black transition-all disabled:opacity-50 group relative overflow-hidden"
                  >
                    <Chrome className="w-8 h-8 text-secondary group-hover:text-black transition-colors" />
                    <span>GOOGLE_CLOUD_SYNC</span>
                  </button>
                  <button 
                    onClick={() => handleSocialLogin('github')}
                    disabled={loading}
                    className="w-full bg-white/[0.03] border border-white/5 text-white p-8 rounded-[1.5rem] font-tech font-black text-xs tracking-[0.4em] flex items-center justify-center space-x-6 hover:bg-white hover:text-black transition-all disabled:opacity-50 group relative overflow-hidden"
                  >
                    <Github className="w-8 h-8 text-white group-hover:text-black transition-colors" />
                    <span>GITHUB_REPO_AUTH</span>
                  </button>
                  <div className="pt-10 flex flex-col items-center space-y-4 opacity-40">
                     <div className="h-[1px] w-full bg-white/5"></div>
                     <p className="text-[10px] font-tech font-black text-gray-400 uppercase tracking-[0.5em] text-center px-4 leading-relaxed">
                        Redirecionando via camadas de túnel RSA de 4096 bits.
                     </p>
                  </div>
                </motion.div>
              )}

              {activeTab === 'phone' && (
                <motion.div 
                  key="phone-form"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-16 text-center space-y-10"
                >
                  <div className="w-32 h-32 bg-septenary/5 border-2 border-dashed border-septenary/20 rounded-full flex items-center justify-center mx-auto relative group">
                    <Phone className="w-12 h-12 text-septenary/40 group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="text-3xl font-display text-white italic tracking-tighter uppercase">PROTOCOL_OFFLINE</h3>
                  <p className="text-gray-600 font-tech font-black text-[10px] uppercase tracking-[0.4em] max-w-xs mx-auto leading-relaxed">O canal de verificação biométrica via SMS está em manutenção prioritária.</p>
                  <button 
                    onClick={() => setActiveTab('email')}
                    className="text-primary text-[10px] font-tech font-black uppercase tracking-[0.6em] hover:text-white transition-colors"
                  >
                    RECOVER_TO_EMAIL
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-16 flex justify-between px-10">
          <Link to="/" className="text-[9px] font-tech font-black text-gray-700 hover:text-white uppercase tracking-[0.5em] transition-colors">TERMINAR_SESSION</Link>
          <div className="flex space-x-4">
             <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
             <span className="text-[9px] font-tech font-black text-gray-800 uppercase tracking-[0.5em]">POLY_SECURE</span>
          </div>
          <Link to="/marketplace" className="text-[9px] font-tech font-black text-gray-700 hover:text-white uppercase tracking-[0.5em] transition-colors">MKT_HASH</Link>
        </div>
      </motion.div>
    </div>
  );
};
