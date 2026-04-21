import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { db, serverTimestamp } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ShieldCheck, CheckCircle2, FileText, Send, Lock, Rocket, Gamepad2, Users, MessageSquare, Info, Loader2, Activity } from 'lucide-react';
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
    "Receita líquida de 90% em todas as transações.",
    "Engine de distribuição escalável e segura.",
    "Painel analítico para performance de vendas.",
    "Curadoria técnica para máxima valorização dos ativos.",
    "Comunidade privada de desenvolvedores high-tier."
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

  if (authLoading) return <div className="h-screen flex items-center justify-center text-white font-black tracking-widest text-[10px] uppercase">Validando Credenciais...</div>;

  if (submitted) {
    return (
      <div className="pt-32 md:pt-40 pb-20 container mx-auto px-4 max-w-2xl text-center min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 border border-white/5 p-10 md:p-20 rounded-[2.5rem] md:rounded-[4rem] shadow-[0_0_100px_rgba(34,197,94,0.05)] border-green-500/10"
        >
          <div className="w-20 md:w-24 h-20 md:h-24 bg-green-500/10 text-green-500 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center mx-auto mb-8 md:mb-10 border border-green-500/20 rotate-6">
            <CheckCircle2 className="w-10 md:w-12 h-10 md:h-12" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 md:mb-6 tracking-tighter uppercase italic leading-[0.9]">TRANSMISSÃO <br /> RECEBIDA</h2>
          <p className="text-gray-500 mb-8 md:mb-12 leading-relaxed text-base md:text-lg font-medium">
            Sua aplicação entrou em nossa fila de curadoria manual. 
            Você receberá uma diretiva oficial via e-mail em até 48 horas úteis.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-white text-black px-10 md:px-12 py-5 md:py-6 rounded-2xl font-black text-xs tracking-widest hover:bg-blue-600 hover:text-white transition-all transform active:scale-95 shadow-2xl"
          >
            RETORNAR AO HUB
          </button>
        </motion.div>
      </div>
    );
  }

  if (profile?.role === 'creator') {
    return (
      <div className="pt-32 md:pt-40 pb-20 container mx-auto px-4 max-w-2xl text-center min-h-screen flex items-center justify-center">
        <div className="bg-blue-600/5 border border-blue-600/20 p-10 md:p-20 rounded-[2.5rem] md:rounded-[4rem]">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tighter uppercase italic">VOCÊ JÁ É<br />UM CREATOR</h2>
          <p className="text-gray-500 mb-8 md:mb-10 text-base md:text-lg font-medium">Acesse seu centro de comando para gerenciar sua frota de assets.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-white text-black px-10 md:px-12 py-5 md:py-6 rounded-2xl font-black text-xs tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-xl shadow-white/5 uppercase"
          >
            Acessar Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 container mx-auto px-4 min-h-screen selection:bg-primary/30 tech-dots relative">
      <div className="scanline"></div>
      
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-20">
        {/* Left Side: Recruitment Manifesto */}
        <div className="lg:w-1/2 space-y-16">
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-3 bg-primary/5 text-primary border border-primary/10 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.4em]">
              <ShieldCheck className="w-5 h-5 animate-pulse" />
              <span>PROTOCOLO DE RECRUTAMENTO v.25</span>
            </div>
            <h1 className="text-6xl md:text-9xl font-black text-white tracking-tighter leading-[0.7] uppercase italic">
              JUNTE-SE <span className="text-primary italic-none">À ELITE.</span>
            </h1>
            <p className="text-gray-500 text-lg md:text-xl font-mono leading-relaxed max-w-md uppercase tracking-tight">
              A elite dos arquitetos digitais está aqui. Buscamos mentes capazes de distorcer a realidade do Roblox.
            </p>
          </div>

          <div className="space-y-8">
            <h3 className="text-[10px] font-black text-gray-700 uppercase tracking-[0.4em] mb-8">VANTAGENS_OPERACIONAIS</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {benefits.map((benefit, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-surface border border-border p-6 rounded-[2rem] group hover:border-primary/20 transition-all tech-grid"
                >
                  <div className="w-10 h-10 bg-black rounded-xl border border-border flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-black transition-all">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 leading-relaxed group-hover:text-white transition-colors">{benefit}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="p-10 rounded-[3rem] bg-surface border border-border relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12 group-hover:scale-110 transition-transform">
                <Rocket className="w-32 h-32 text-primary" />
             </div>
             <h4 className="text-white font-black text-[10px] tracking-widest uppercase mb-4">REQUISITO MÍNIMO</h4>
             <p className="text-gray-600 font-mono text-[10px] leading-relaxed uppercase font-black tracking-widest max-w-sm">Você deve possuir um portfólio verificável e pelo menos um ativo de alta complexidade em produção.</p>
          </div>
        </div>

        {/* Right Side: High-End Application Form */}
        <div className="lg:w-1/2">
          {!user ? (
            <div className="bg-surface border border-border p-20 rounded-[4rem] text-center flex flex-col items-center justify-center space-y-10 shadow-2xl relative overflow-hidden">
              <div className="scanline"></div>
              <div className="w-24 h-24 bg-black rounded-[2rem] flex items-center justify-center border border-border rotate-6 group hover:rotate-0 transition-transform duration-500 shadow-[0_0_50px_rgba(193,255,0,0.05)]">
                 <Lock className="w-10 h-10 text-gray-600" />
              </div>
              <div className="space-y-4">
                <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">TERMINAL BLOQUEADO</h2>
                <p className="text-gray-600 font-black text-[10px] tracking-widest uppercase max-w-xs mx-auto">É necessário autenticação biométrica/digital para acessar o protocolo de recruta.</p>
              </div>
              <button 
                onClick={() => navigate('/login')}
                className="bg-primary text-black px-16 py-6 rounded-2xl font-black text-[10px] tracking-[0.3em] hover:bg-white transition-all transform active:scale-95 shadow-2xl uppercase"
              >
                AUTENTICAR AGORA
              </button>
            </div>
          ) : (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmit}
              className="bg-surface border border-border p-2 md:p-16 rounded-[4rem] shadow-2xl relative overflow-hidden flex flex-col gap-2"
            >
              <div className="scanline"></div>
              <div className="p-10 md:p-14 space-y-10">
                <div className="flex items-center space-x-3 text-primary font-black text-[10px] tracking-[0.3em] uppercase mb-10">
                  <FileText className="w-6 h-6" />
                  <span>DOSSIÊ DE CANDIDATURA</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-700 uppercase tracking-widest ml-2 block">PORTFOLIO_URL</label>
                    <input
                      required
                      type="url"
                      placeholder="Link do seu trabalho..."
                      className="w-full bg-black/50 border border-border rounded-2xl px-6 py-5 text-white font-bold focus:outline-none focus:border-primary/30 transition-all uppercase placeholder:text-gray-900 text-xs shadow-inner"
                      value={formData.portfolioUrl}
                      onChange={e => setFormData({ ...formData, portfolioUrl: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-700 uppercase tracking-widest ml-2 block">ASSET_MOCKUP</label>
                    <div className="relative">
                      <input
                        required
                        type="url"
                        placeholder="Link do ativo..."
                        className="w-full bg-black/50 border border-border rounded-2xl px-6 py-5 text-white font-bold focus:outline-none focus:border-primary/30 transition-all uppercase placeholder:text-gray-900 text-xs shadow-inner"
                        value={formData.gameLink}
                        onChange={e => setFormData({ ...formData, gameLink: e.target.value })}
                      />
                      <AnimatePresence>
                        {isRobloxLink && (
                          <motion.div 
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2 text-[8px] text-primary font-black uppercase tracking-widest"
                          >
                             <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                            <span>VERIFIED</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-gray-700 uppercase tracking-widest ml-2 block">MANIFESTO_OPERACIONAL</label>
                  <textarea
                    required
                    rows={2}
                    className="w-full bg-black/50 border border-border rounded-2xl px-6 py-5 text-white font-bold focus:outline-none focus:border-primary/30 transition-all resize-none placeholder:text-gray-900 text-xs shadow-inner uppercase"
                    placeholder="Por que você merece este assento?"
                    value={formData.whyUs}
                    onChange={e => setFormData({ ...formData, whyUs: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-gray-700 uppercase tracking-widest ml-2 block">ARQUIVOS_HISTORICOS</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Quais sistemas você já construiu?"
                    className="w-full bg-black/50 border border-border rounded-2xl px-6 py-5 text-white font-bold focus:outline-none focus:border-primary/30 transition-all resize-none placeholder:text-gray-900 text-xs shadow-inner uppercase"
                    value={formData.pastWork}
                    onChange={e => setFormData({ ...formData, pastWork: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-700 uppercase tracking-widest ml-2 block">IDENTIDADE_DISCORD</label>
                    <input
                      required
                      type="text"
                      placeholder="Username#0000"
                      className="w-full bg-black/50 border border-border rounded-2xl px-6 py-5 text-white font-bold focus:outline-none focus:border-primary/30 transition-all placeholder:text-gray-900 text-xs shadow-inner uppercase"
                      value={formData.discordTag}
                      onChange={e => setFormData({ ...formData, discordTag: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-700 uppercase tracking-widest ml-2 block">ESPECIALIDADE_LEVEL</label>
                    <select
                      className="w-full bg-black/50 border border-border rounded-2xl px-6 py-5 text-white font-bold focus:outline-none focus:border-primary/30 appearance-none uppercase text-xs shadow-inner cursor-pointer"
                      value={formData.specialty}
                      onChange={e => setFormData({ ...formData, specialty: e.target.value })}
                    >
                      <option value="UI" className="bg-surface">ARQUITETO UI</option>
                      <option value="Scripting" className="bg-surface">LOGIC SCRIPTER</option>
                      <option value="Modeling" className="bg-surface">3D MODELER</option>
                      <option value="VFX" className="bg-surface">VFX ARTIST</option>
                      <option value="All" className="bg-surface">FULLSTACK ELITE</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-8 bg-black/50 border border-border rounded-[2rem] group cursor-pointer" onClick={() => setFormData({ ...formData, benefitsAccepted: !formData.benefitsAccepted })}>
                  <div className={cn(
                    "w-8 h-8 rounded-xl border flex items-center justify-center transition-all shrink-0",
                    formData.benefitsAccepted ? "bg-primary border-primary text-black" : "border-border text-transparent"
                  )}>
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest group-hover:text-white transition-colors">
                    ACEITO RETENÇÃO DE <span className="text-primary italic font-black">10%</span> SOBRE VENDAS
                  </span>
                </div>

                <button
                  disabled={loading || !formData.benefitsAccepted}
                  className="w-full bg-primary text-black py-7 rounded-[2rem] font-black text-[10px] tracking-[0.3em] flex items-center justify-center space-x-4 transition-all disabled:opacity-30 shadow-2xl active:scale-95 group"
                >
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-black" />
                  ) : (
                    <>
                      <span>TRANSMITIR CANDIDATURA</span>
                      <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </>
                  )}
                </button>
                <p className="text-center text-[8px] text-gray-800 font-black tracking-[0.4em] uppercase">Encriptação de Grau Militar v2.0</p>
              </div>
            </motion.form>
          )}
        </div>
      </div>
    </div>
  );
};
