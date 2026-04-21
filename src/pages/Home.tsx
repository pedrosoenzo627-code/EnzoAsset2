import React from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Rocket, ShieldCheck, Zap, Globe, Users, ArrowRight, Star, ChevronRight, Package, Layout, Code, Wand2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Home = () => {
  return (
    <div className="relative overflow-hidden bg-bg tech-dots min-h-screen selection:bg-primary/30 selection:text-primary">
      <div className="scanline"></div>
      
      {/* Hero Section */}
      <section className="relative pt-40 pb-32 px-4 border-b border-border min-h-[90vh] flex items-center">
        <div className="container mx-auto">
          <div className="flex flex-col items-center text-center max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center space-x-3 bg-primary/10 text-primary border border-primary/20 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.4em] backdrop-blur-md mb-12"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Plataforma Ultra-Técnica</span>
            </motion.div>

            <div className="relative mb-16">
              <motion.h1 
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="text-[12vw] md:text-[15vw] font-black leading-[0.75] tracking-tighter text-white uppercase italic italic-none text-glow"
              >
                ENZO <br /> 
                <span className="text-primary italic">ASSETS</span>
              </motion.h1>
            </div>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-gray-500 text-xl md:text-3xl font-medium max-w-4xl leading-tight tracking-tight mb-16"
            >
              Arquitetura de ativos de elite para desenvolvedores que não aceitam o padrão. 
              Scripts modulares e UIs de alta densidade técnica.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row items-center gap-8"
            >
              <Link 
                to="/marketplace" 
                className="group relative bg-primary text-black px-16 py-7 rounded-2xl font-black text-sm tracking-[0.3em] overflow-hidden transition-all hover:scale-105 active:scale-95 flex items-center space-x-4 shadow-[0_0_40px_rgba(193,255,0,0.2)]"
              >
                <span>TERMINAL ASSETS</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </Link>
              <Link 
                to="/creators"
                className="px-16 py-7 rounded-2xl font-black text-sm tracking-[0.3em] border border-white/10 hover:bg-white/5 transition-all text-white backdrop-blur-sm uppercase"
              >
                Recrutamento
              </Link>
            </motion.div>
          </div>
        </div>
        
        {/* Floating Background Text */}
        <div className="absolute inset-0 z-[-1] flex items-center justify-center opacity-[0.02] pointer-events-none select-none">
          <span className="text-[60vw] font-black uppercase text-white leading-none">ROOT</span>
        </div>
      </section>

      {/* Bento Stats */}
      <section className="py-32 px-4 relative border-b border-border bg-gradient-to-b from-bg to-zinc-950">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-2 bg-surface p-12 rounded-[3.5rem] border border-border group hover:border-primary/20 transition-all flex flex-col justify-between aspect-square md:aspect-auto">
              <ShieldCheck className="w-16 h-16 text-primary mb-12" />
              <div>
                <h3 className="text-4xl font-black text-white italic mb-4">SEGURANÇA <br /> NÍVEL 5</h3>
                <p className="text-gray-500 font-medium">Cada script é auditado por nossa rede de segurança proprietária antes da distribuição.</p>
              </div>
            </div>
            <div className="bg-primary p-12 rounded-[3.5rem] flex flex-col justify-between aspect-square">
              <span className="text-black font-black text-8xl leading-none italic">-90%</span>
              <p className="text-black/70 font-black uppercase tracking-[0.2em] text-xs">Otimização de tempo em projetos AAA.</p>
            </div>
            <div className="bg-surface p-12 rounded-[3.5rem] border border-border flex flex-col justify-between aspect-square">
               <div className="flex -space-x-4">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-14 h-14 rounded-full border-4 border-bg bg-zinc-800 flex items-center justify-center overflow-hidden">
                      <img src={`https://picsum.photos/seed/${i}/100/100`} className="w-full h-full object-cover grayscale" referrerPolicy="no-referrer" />
                    </div>
                  ))}
               </div>
               <div>
                  <h3 className="text-3xl font-black text-white italic mb-2">NETWORK</h3>
                  <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">+4.5K USUÁRIOS</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Marquee */}
      <div className="py-12 border-b border-border overflow-hidden whitespace-nowrap bg-bg">
         <motion.div 
           initial={{ x: 0 }}
           animate={{ x: "-50%" }}
           transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
           className="inline-block text-[10vw] font-black tracking-tighter uppercase italic text-transparent stroke-text opacity-10"
         >
           SCRIPTS — UI KITS — MODELS — VFX — ANIMATIONS — SCRIPTS — UI KITS — MODELS — VFX — ANIMATIONS — 
         </motion.div>
      </div>

      {/* Dark Luxury Cards */}
      <section className="py-40 px-4 relative">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto space-y-10">
             {[
               { title: "SISTEMAS DE ECONOMIA", desc: "Arquitetura financeira robusta para jogos de larga escala.", cat: "SCRIPTS" },
               { title: "NEXUS INTERFACE V3", desc: "A UI mais polida e responsiva já criada para o ecossistema Roblox.", cat: "UI ASSETS" },
               { title: "MODULOS DE SEGURANÇA", desc: "Proteção total contra injeções e abusos de RemotoEvents.", cat: "PLUGINS" }
             ].map((item, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ x: 20 }}
                  className="flex items-center justify-between p-12 border-b border-white/5 hover:bg-white/[0.02] transition-all group"
                >
                  <div className="space-y-4">
                    <span className="text-primary text-[10px] font-black uppercase tracking-[0.4em]">{item.cat}</span>
                    <h3 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase">{item.title}</h3>
                    <p className="text-gray-600 font-medium text-lg max-w-lg">{item.desc}</p>
                  </div>
                  <div className="hidden md:flex w-24 h-24 rounded-full border border-white/10 items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all">
                    <ArrowRight className="w-10 h-10 text-white group-hover:text-black transition-colors" />
                  </div>
                </motion.div>
             ))}
          </div>
        </div>
      </section>
    </div>
  );
};
