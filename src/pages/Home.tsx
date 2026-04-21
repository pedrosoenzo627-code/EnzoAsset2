import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, ArrowRight, Users, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Home = () => {
  return (
    <div className="relative overflow-hidden bg-bg tech-grid min-h-screen selection:bg-primary/30 selection:text-primary">
      {/* Immersive Atmosphere */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[150px] -translate-y-1/2 translate-x-1/2 rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/5 blur-[150px] translate-y-1/2 -translate-x-1/2 rounded-full"></div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-4 min-h-[95vh] flex items-center z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center max-w-[100vw] overflow-x-hidden md:overflow-visible">
            
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center space-x-4 bg-white/5 border border-white/10 px-6 py-2.5 rounded-full backdrop-blur-3xl mb-12"
            >
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(193,255,0,1)]"></div>
              <span className="text-[10px] font-tech font-black uppercase tracking-[0.5em] text-white/60">ENZO_ECOSYSTEM • PROTOCOLO_ATIVO</span>
            </motion.div>

            <div className="relative mb-16 transform -skew-x-6">
              <motion.h1 
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                className="text-[14vw] md:text-[18vw] font-display leading-[0.7] tracking-tighter text-white italic lowercase"
              >
                enzo <br /> 
                <span className="cyber-text-gradient md:ml-32">assets</span>
              </motion.h1>
              
              <div className="absolute -top-10 -right-20 hidden lg:block opacity-20">
                <div className="w-64 h-64 border border-primary/30 rounded-full flex items-center justify-center animate-[spin_20s_linear_infinite]">
                  <div className="w-48 h-48 border border-primary/20 rounded-full border-dashed animate-[spin_15s_linear_infinite_reverse]"></div>
                </div>
              </div>
            </div>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-gray-500 font-tech text-xl md:text-3xl max-w-4xl leading-tight tracking-tight mb-20 uppercase px-4 font-light italic"
            >
              Arquitetura de <span className="text-white italic-none">ativos de elite</span> para desenvolvedores <br />
              que definem o novo padrão da indústria global.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row items-center gap-10"
            >
              <Link 
                to="/marketplace" 
                className="group relative bg-primary text-black px-20 py-8 rounded-[2rem] font-black text-xs tracking-[0.4em] overflow-hidden transition-all hover:scale-105 active:scale-95 flex items-center space-x-6 shadow-[0_0_50px_rgba(193,255,0,0.15)] uppercase"
              >
                <span>ACESSAR TERMINAL</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-3 transition-transform" />
              </Link>
              
              <Link 
                to="/creators"
                className="group px-16 py-8 rounded-[2rem] font-black text-xs tracking-[0.4em] border border-white/10 hover:border-white/40 hover:bg-white/5 transition-all text-white backdrop-blur-3xl uppercase flex items-center space-x-4"
              >
                <span>RECRUTAMENTO</span>
                <Users className="w-5 h-5 opacity-40 group-hover:opacity-100 group-hover:text-primary transition-all" />
              </Link>
            </motion.div>
          </div>
        </div>
        
        {/* Decorative Rail Text */}
        <div className="absolute left-10 top-1/2 -translate-y-1/2 hidden xl:flex flex-col space-y-40 opacity-20 pointer-events-none">
           <span className="font-tech text-xs uppercase tracking-[1em] rotate-180 [writing-mode:vertical-rl]">01_DESIGN_SYSTEM</span>
           <span className="font-tech text-xs uppercase tracking-[1em] rotate-180 [writing-mode:vertical-rl]">02_ARCHITECTURE</span>
           <span className="font-tech text-xs uppercase tracking-[1em] rotate-180 [writing-mode:vertical-rl]">03_DISTRIBUTION</span>
        </div>
      </section>

      {/* Bento Showcase */}
      <section className="py-40 px-4 relative z-10">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-12 mb-12">
               <span className="text-primary font-tech font-black text-[10px] tracking-[0.8em] uppercase block mb-4">ANALYTICS_CORE</span>
               <h2 className="text-6xl md:text-8xl font-display text-white tracking-tighter italic">Infraestrutura<br/><span className="cyber-text-gradient">Auditada</span></h2>
            </div>
            
            <motion.div 
              whileHover={{ y: -10 }}
              className="md:col-span-8 glass-morphism p-16 rounded-[4rem] relative overflow-hidden group border-white/5"
            >
               <div className="hud-corner hud-corner-tl"></div>
               <div className="hud-corner hud-corner-tr"></div>
               <div className="hud-corner hud-corner-bl"></div>
               <div className="hud-corner hud-corner-br"></div>
               
               <ShieldCheck className="w-24 h-24 text-primary mb-16 opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
               <div className="flex flex-col md:flex-row justify-between items-end gap-10">
                  <div className="max-w-md">
                     <h3 className="text-5xl font-display text-white italic mb-6">Enzo Shield <br/> v3.0</h3>
                     <p className="text-gray-500 font-tech text-sm uppercase tracking-tight leading-relaxed opacity-60 uppercase tracking-widest text-[10px]">Proteção total contra injeções de memória e abusos de canais remotos. Segurança absoluta para ambientes competitivos.</p>
                  </div>
                  <div className="text-[12rem] font-display text-white/5 font-black leading-none italic absolute -right-10 -bottom-10 pointer-events-none">SHIELD</div>
               </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -10 }}
              className="md:col-span-4 bg-primary p-16 rounded-[4rem] flex flex-col justify-between group overflow-hidden relative"
            >
               <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/20 rounded-full blur-[60px] group-hover:scale-150 transition-transform duration-[2s]"></div>
               <div className="relative z-10 text-black">
                  <span className="font-tech font-black text-9xl leading-none italic -ml-4">98%</span>
                  <p className="font-tech font-black uppercase tracking-[0.3em] text-[10px] mt-4 opacity-60">Confiabilidade Técnica</p>
               </div>
               <div className="relative z-10 pt-12">
                  <p className="text-black font-tech text-[11px] uppercase font-black tracking-[0.2em] leading-tight">Taxa de integração nativa com frameworks industriais AAA.</p>
               </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Products Listing */}
      <section className="py-60 px-4 relative">
        <div className="container mx-auto">
          <div className="max-w-6xl mx-auto space-y-4">
             <div className="flex justify-between items-end mb-20 px-4">
                <div>
                   <span className="text-secondary font-tech font-black text-[10px] tracking-[0.8em] uppercase block mb-4">VAULT_HIGHLIGHTS</span>
                   <h2 className="text-5xl md:text-7xl font-display text-white tracking-tighter italic">Lançamentos <span className="opacity-20 italic-none text-4xl ml-4">v2.1</span></h2>
                </div>
                <Link to="/marketplace" className="text-[10px] font-tech font-black text-gray-500 uppercase tracking-[0.4em] hover:text-white transition-all flex items-center space-x-2 pb-2">
                   <span>VER_CATÁLOGO</span>
                   <ChevronRight className="w-4 h-4" />
                </Link>
             </div>

             {[
               { id: "0X1", title: "SISTEMAS DE ECONOMIA", desc: "Arquitetura financeira ultra-robusta.", cat: "CORE", price: "R$ 499" },
               { id: "0X2", title: "NEXUS INTERFACE ENGINE", desc: "A UI Kit mais sofisticada do mercado.", cat: "INTERFACE", price: "R$ 890" },
               { id: "0X3", title: "PHYSICS OVERRIDE V1", desc: "Módulo de estabilização de física real.", cat: "ENVIRONMENT", price: "R$ 1.250" }
             ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="flex flex-col md:flex-row md:items-center justify-between p-12 glass-morphism rounded-[3rem] border-white/5 hover:border-primary/30 transition-all duration-500 group relative overflow-hidden"
                >
                  <div className="absolute left-0 top-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="flex items-center space-x-12 relative z-10">
                    <span className="font-mono text-gray-800 font-black text-4xl group-hover:text-primary/20 transition-colors hidden lg:block">{item.id}</span>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                         <span className="bg-white/5 text-secondary text-[8px] font-tech font-black uppercase tracking-[0.4em] px-3 py-1 rounded-full border border-white/5">{item.cat}</span>
                         <span className="text-primary text-[8px] font-tech font-black uppercase tracking-[0.4em] animate-pulse">DISPONÍVEL</span>
                      </div>
                      <h3 className="text-4xl md:text-5xl font-display text-white italic tracking-tighter uppercase group-hover:translate-x-4 transition-transform duration-500">{item.title}</h3>
                    </div>
                  </div>
                  <div className="flex items-center space-x-16 mt-10 md:mt-0 relative z-10 justify-between md:justify-end">
                     <div className="text-right">
                        <span className="text-[10px] font-tech font-black text-gray-700 uppercase tracking-widest block mb-1">VALOR_ESTIMADO</span>
                        <span className="text-3xl font-display text-white/50 group-hover:text-white transition-colors italic">{item.price}</span>
                     </div>
                     <Link to="/marketplace" className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-500 hover:rotate-45">
                        <ArrowRight className="w-8 h-8 text-white group-hover:text-black transition-colors" />
                     </Link>
                  </div>
                </motion.div>
             ))}
          </div>
        </div>
      </section>
    </div>
  );
};
