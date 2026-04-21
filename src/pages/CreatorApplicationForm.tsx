import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { db, serverTimestamp } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ShieldCheck, CheckCircle2, FileText, Send, Lock, Rocket, Gamepad2, Users, MessageSquare, Info, Loader2, Activity, Fingerprint } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

export const CreatorApplicationForm = () => {
  const { user, profile, loading: authLoading, signIn } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isRobloxLink, setIsRobloxLink] = useState(false);

  const [formData, setFormData] = useState({
    portfolioUrl: '',
    gameLink: '',
    experience: '',
    whyUs: '',
    pastWork: '',
    discordTag: '',
    specialty: 'UI',
    benefitsAccepted: false
  });

  useEffect(() => {
    if (!authLoading && profile?.role === 'admin') {
      navigate('/dashboard');
    }
  }, [profile, authLoading, navigate]);

  useEffect(() => {
    const isRoblox = formData.gameLink.includes('roblox.com/games/');
    setIsRobloxLink(isRoblox);
  }, [formData.gameLink]);

  const benefits = [
    "Retenção mínima de rede (90% Profit Share).",
    "Protocolos de distribuição AAA escaláveis.",
    "Terminal analítico de vendas em tempo real.",
    "Exposição prioritária no ecossistema global.",
    "Acesso ao Canal de Elite (Inner Circle)."
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.benefitsAccepted) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'applications'), {
        userId: user.uid,
        userEmail: user.email,
        ...formData,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Application submission error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <div className="h-screen flex items-center justify-center text-white font-tech font-black tracking-[0.5em] uppercase animate-pulse">VALIDANDO_ID...</div>;

  if (submitted) {
    return (
      <div className="pt-32 pb-20 container mx-auto px-4 max-w-2xl text-center min-h-screen flex items-center justify-center selection:bg-primary/30">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-morphism border border-primary/20 p-20 rounded-[4rem] relative overflow-hidden tech-grid shadow-[0_0_100px_rgba(193,255,0,0.05)]"
        >
          <div className="hud-corner hud-corner-tl border-primary"></div>
          <div className="hud-corner hud-corner-tr border-primary"></div>
          <div className="hud-corner hud-corner-bl border-primary"></div>
          <div className="hud-corner hud-corner-br border-primary"></div>

          <div className="w-24 h-24 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center mx-auto mb-10 border border-primary/20 rotate-6 glow-primary">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h2 className="text-5xl font-display text-white mb-6 tracking-tighter italic uppercase leading-none">TRANSMISSÃO <br /><span className="text-primary">RECEBIDA</span></h2>
          <p className="text-gray-500 mb-12 leading-relaxed text-[11px] font-tech font-black uppercase tracking-[0.4em] opacity-50">
            Sua candidatura entrou em fase de auditoria manual. 
            Diretiva oficial será emitida via e-mail em breve.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-white text-black py-8 rounded-2xl font-tech font-black text-[10px] tracking-[0.5em] hover:bg-primary transition-all shadow-2xl uppercase"
          >
            RETORNAR_STATUS_HUB
          </button>
        </motion.div>
      </div>
    );
  }

  if (profile?.role === 'creator') {
    return (
      <div className="pt-32 pb-20 container mx-auto px-4 max-w-2xl text-center min-h-screen flex items-center justify-center selection:bg-primary/30">
        <div className="glass-morphism border border-secondary/20 p-20 rounded-[4rem] relative overflow-hidden">
          <div className="hud-corner hud-corner-tl border-secondary"></div>
          <div className="hud-corner hud-corner-tr border-secondary"></div>
          <h2 className="text-5xl font-display text-white mb-8 tracking-tighter italic uppercase leading-none">VOCÊ JÁ É<br /><span className="text-secondary">UM CREATOR</span></h2>
          <p className="text-gray-500 mb-12 leading-relaxed text-[11px] font-tech font-black uppercase tracking-[0.4em] opacity-50">Seu nó de processamento já está ativo no terminal de criação.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-white text-black px-16 py-8 rounded-2xl font-tech font-black text-[10px] tracking-[0.5em] hover:bg-secondary transition-all shadow-2xl uppercase"
          >
            ACESSAR_DASH_TERMINAL
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 container mx-auto px-4 min-h-screen selection:bg-primary/30 relative">
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-[20%] left-0 w-96 h-96 bg-primary/5 blur-[100px] rounded-full"></div>
         <div className="absolute bottom-[20%] right-0 w-96 h-96 bg-tertiary/5 blur-[100px] rounded-full"></div>
      </div>
      
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-24 relative z-10">
        {/* Left Side: Recruitment Manifesto */}
        <div className="lg:w-1/2 space-y-20">
          <div className="space-y-8">
            <div className="inline-flex items-center space-x-4 bg-primary/5 text-primary border border-primary/20 px-6 py-2.5 rounded-full text-[10px] font-tech font-black uppercase tracking-[0.4em] glow-primary">
              <ShieldCheck className="w-5 h-5 animate-pulse" />
              <span>RECRUTAMENTO_V_8.4 • PROTOCOLO_FORJA</span>
            </div>
            <h1 className="text-7xl md:text-[8rem] font-display text-white tracking-tighter leading-[0.8] uppercase italic">
              JUNTE-SE <br/><span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-tertiary bg-[length:200%_auto] animate-[gradient_8s_linear_infinite]">À ELITE.</span>
            </h1>
            <p className="text-gray-500 text-base md:text-xl font-tech leading-relaxed max-w-sm uppercase tracking-tight opacity-50">
              Buscamos arquitetos que operam na borda da realidade digital. Sua criatividade é o nosso combustível.
            </p>
          </div>

          <div className="space-y-12">
            <h3 className="text-[10px] font-tech font-black text-gray-700 uppercase tracking-[0.6em] mb-12">VANTAGENS_DO_SISTEMA</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {benefits.map((benefit, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="glass-morphism border border-white/5 p-8 rounded-[2rem] group hover:border-quaternary/30 transition-all tech-grid"
                >
                  <div className="w-12 h-12 bg-black rounded-2xl border border-white/5 flex items-center justify-center mb-6 group-hover:bg-quaternary group-hover:text-black transition-all glow-yellow">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <p className="text-[10px] font-tech font-black uppercase tracking-widest text-gray-600 leading-relaxed group-hover:text-white transition-colors">{benefit}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="p-12 rounded-[2.5rem] glass-morphism border border-white/5 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-10 opacity-5 rotate-12 group-hover:scale-110 transition-transform">
                <Rocket className="w-40 h-40 text-primary" />
             </div>
             <h4 className="text-white font-tech font-black text-[10px] tracking-widest uppercase mb-4">REQUISITO_HASH_MIN</h4>
             <p className="text-gray-700 font-tech text-[10px] leading-relaxed uppercase font-black tracking-widest max-w-sm">Você deve possuir um portfólio verificável de ativos AAA já implementados em escala.</p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="lg:w-1/2">
          {!user ? (
            <div className="glass-morphism border border-white/5 p-24 rounded-[4rem] text-center flex flex-col items-center justify-center space-y-12 shadow-2xl relative overflow-hidden min-h-[600px]">
              <div className="hud-corner hud-corner-tl"></div>
              <div className="hud-corner hud-corner-br"></div>
              <div className="w-28 h-28 bg-black rounded-[2.5rem] flex items-center justify-center border border-white/5 rotate-6 group hover:rotate-0 transition-all duration-500 shadow-[0_0_50px_rgba(255,255,255,0.05)]">
                 <Lock className="w-12 h-12 text-gray-800" />
              </div>
              <div className="space-y-6">
                <h2 className="text-5xl font-display text-white uppercase italic tracking-tighter leading-none">CANAL_BLOQUEADO</h2>
                <p className="text-gray-700 font-tech font-black text-[11px] tracking-[0.4em] uppercase max-w-xs mx-auto">Requer autenticação de identidade para acessar o dossiê de recruta.</p>
              </div>
              <button 
                onClick={() => navigate('/login')}
                className="bg-primary text-black px-20 py-8 rounded-2xl font-tech font-black text-[10px] tracking-[0.5em] hover:bg-white transition-all transform active:scale-95 shadow-2xl uppercase"
              >
                AUTENTICAR_SESSÃO
              </button>
            </div>
          ) : (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmit}
              className="glass-morphism border border-white/5 p-2 md:p-16 rounded-[4rem] shadow-2xl relative overflow-hidden flex flex-col gap-2 bg-black/40"
            >
              <div className="hud-corner hud-corner-tl"></div>
              <div className="hud-corner hud-corner-br"></div>
              
              <div className="p-10 md:p-14 space-y-12">
                <div className="flex items-center space-x-4 text-quinary font-tech font-black text-[10px] tracking-[0.5em] uppercase mb-12 glow-blue">
                  <FileText className="w-8 h-8" />
                  <span>DOSSIÊ DE INGRESSO_DATA</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-[9px] font-tech font-black text-gray-700 uppercase tracking-widest ml-4 block">LINK_PORTFOLIO</label>
                    <input
                      required
                      type="url"
                      placeholder="HTTPS://CARGA..."
                      className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-8 text-white font-tech font-bold focus:outline-none focus:border-quinary/40 transition-all uppercase placeholder:text-gray-900 text-xs shadow-inner"
                      value={formData.portfolioUrl}
                      onChange={e => setFormData({ ...formData, portfolioUrl: e.target.value })}
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[9px] font-tech font-black text-gray-700 uppercase tracking-widest ml-4 block">ASSET_MOCKUP_ID</label>
                    <div className="relative">
                      <input
                        required
                        type="url"
                        placeholder="ROBLOX.COM/GAMES/..."
                        className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-8 text-white font-tech font-bold focus:outline-none focus:border-quinary/40 transition-all uppercase placeholder:text-gray-900 text-xs shadow-inner"
                        value={formData.gameLink}
                        onChange={e => setFormData({ ...formData, gameLink: e.target.value })}
                      />
                      <AnimatePresence>
                        {isRobloxLink && (
                          <motion.div 
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center space-x-3 text-[9px] text-primary font-tech font-black uppercase tracking-widest"
                          >
                             <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_#C1FF00]"></div>
                             <span>SNC_VIFD</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[9px] font-tech font-black text-gray-700 uppercase tracking-widest ml-4 block">MOD_MANIFESTO</label>
                  <textarea
                    required
                    rows={2}
                    className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-8 text-white font-tech font-bold focus:outline-none focus:border-quinary/40 transition-all resize-none placeholder:text-gray-900 text-xs shadow-inner uppercase"
                    placeholder="Motive sua entrada na rede elite..."
                    value={formData.whyUs}
                    onChange={e => setFormData({ ...formData, whyUs: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-[9px] font-tech font-black text-gray-700 uppercase tracking-widest ml-4 block">DISCORD_ID</label>
                    <input
                      required
                      type="text"
                      placeholder="USERNAME"
                      className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-8 text-white font-tech font-bold focus:outline-none focus:border-quinary/40 transition-all placeholder:text-gray-900 text-xs shadow-inner uppercase"
                      value={formData.discordTag}
                      onChange={e => setFormData({ ...formData, discordTag: e.target.value })}
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[9px] font-tech font-black text-gray-700 uppercase tracking-widest ml-4 block">FORGE_SPEC</label>
                    <select
                      className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-8 text-white font-tech font-bold focus:outline-none focus:border-quinary/40 appearance-none uppercase text-xs shadow-inner cursor-pointer"
                      value={formData.specialty}
                      onChange={e => setFormData({ ...formData, specialty: e.target.value })}
                    >
                      <option value="UI" className="bg-bg">ARQUITETO UI</option>
                      <option value="Scripting" className="bg-bg">LOGIC SCRIPTER</option>
                      <option value="Modeling" className="bg-bg">3D MODELER</option>
                      <option value="VFX" className="bg-bg">VFX ARTIST</option>
                      <option value="All" className="bg-bg">FULLSTACK ELITE</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center space-x-6 p-8 bg-black/60 border border-white/5 rounded-[2rem] group cursor-pointer" onClick={() => setFormData({ ...formData, benefitsAccepted: !formData.benefitsAccepted })}>
                  <div className={cn(
                    "w-10 h-10 rounded-xl border flex items-center justify-center transition-all shrink-0",
                    formData.benefitsAccepted ? "bg-primary border-primary text-black" : "border-white/10 text-transparent"
                  )}>
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] text-gray-600 font-tech font-black uppercase tracking-[0.3em] group-hover:text-white transition-colors">
                    ACEITO RETENÇÃO DE <span className="text-primary italic font-black">10%</span> SOBRE FLUXO_MARKET
                  </span>
                </div>

                <button
                  disabled={loading || !formData.benefitsAccepted}
                  className="w-full bg-white text-black py-8 rounded-[2rem] font-tech font-black text-[11px] tracking-[0.5em] flex items-center justify-center space-x-6 transition-all disabled:opacity-30 shadow-2xl active:scale-95 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-tertiary opacity-0 group-hover:opacity-10 transition-opacity"></div>
                  {loading ? (
                    <Loader2 className="w-8 h-8 animate-spin text-black" />
                  ) : (
                    <>
                      <span>TRANSMITIR_CANDIDATURA</span>
                      <Send className="w-6 h-6 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" />
                    </>
                  )}
                </button>
                <p className="text-center text-[9px] text-gray-800 font-tech font-black tracking-[0.5em] uppercase opacity-40">CRIPTOGRAFIA_BIO_IDENT_V8.2</p>
              </div>
            </motion.form>
          )}
        </div>
      </div>
    </div>
  );
};
