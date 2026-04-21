import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, ArrowRight, Users, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export const Home = () => {
  return (
    <div className="relative overflow-hidden bg-bg min-h-screen selection:bg-primary/30 selection:text-primary">
      {/* Immersive Atmosphere - Poly-Chrome Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/10 via-quinary/5 to-transparent blur-[120px]"></div>
        <div className="absolute top-[20%] right-0 w-[600px] h-[600px] bg-tertiary/5 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[10%] left-[20%] w-[500px] h-[500px] bg-senary/10 blur-[150px] rounded-full"></div>
        <div className="absolute top-[60%] right-[10%] w-[400px] h-[400px] bg-octonary/5 blur-[120px] rounded-full"></div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-4 min-h-[95vh] flex items-center z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center max-w-[100vw] overflow-x-hidden md:overflow-visible">
            
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center space-x-6 bg-white/[0.03] border border-white/5 px-8 py-3 rounded-2xl backdrop-blur-3xl mb-12 tech-grid"
            >
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_#C1FF00]"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse delay-75 shadow-[0_0_8px_#FF00E5]"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-quinary animate-pulse delay-150 shadow-[0_0_8px_#2E5BFF]"></div>
              </div>
              <span className="text-[10px] font-tech font-black uppercase tracking-[0.6em] text-white/40">HYPER_CORE_PROTOCOL • V3.9</span>
            </motion.div>

            <div className="relative mb-16 px-4">
              <motion.h1 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="text-[14vw] md:text-[18vw] font-display leading-[0.7] tracking-tighter text-white italic lowercase"
              >
                <span className="glitch-text block">enzo</span> 
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-tertiary md:ml-32 animate-[gradient_8s_linear_infinite] bg-[length:200%_auto]">assets</span>
              </motion.h1>
            </div>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-gray-500 font-tech text-xl md:text-3xl max-w-4xl leading-tight tracking-tight mb-20 uppercase px-4 font-light italic"
            >
              Arquitetura de <span className="text-quaternary italic-none glow-yellow">ativos mutáveis</span> para a <br />
              próxima <span className="text-septenary italic-none">singularidade digital</span>.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row items-center gap-10"
            >
              <Link 
                to="/marketplace" 
                className="group relative bg-white text-black px-24 py-8 rounded-[1rem] font-black text-xs tracking-[0.5em] overflow-hidden transition-all hover:scale-105 active:scale-95 flex items-center space-x-6 uppercase"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-tertiary opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <div className="absolute left-0 top-0 w-1 h-full bg-primary"></div>
                <span>EXEC_TERMINAL</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-3 transition-transform" />
              </Link>
              
              <Link 
                to="/creators"
                className="group px-16 py-8 rounded-[1rem] font-black text-xs tracking-[0.5em] border border-white/5 hover:border-quaternary/40 hover:bg-quaternary/5 transition-all text-white backdrop-blur-3xl uppercase flex items-center space-x-4 relative overflow-hidden"
              >
                <div className="absolute right-0 top-0 w-[2px] h-full bg-quaternary opacity-50"></div>
                <span>SYNC_CREATORS</span>
                <Users className="w-5 h-5 opacity-40 group-hover:opacity-100 group-hover:text-quaternary transition-all" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Poly-Chrome Bento Showcase */}
      <section className="py-40 px-4 relative z-10">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 px-4">
            <div className="md:col-span-12 mb-16">
               <span className="text-senary font-tech font-black text-[10px] tracking-[0.8em] uppercase block mb-4 glow-purple">NETWORK_LAYERS</span>
               <h2 className="text-6xl md:text-9xl font-display text-white tracking-tighter italic">Polígonos de <br/><span className="text-octonary">Performance</span></h2>
            </div>
            
            <motion.div 
              whileHover={{ y: -10 }}
              className="md:col-span-7 glass-morphism p-16 rounded-[2rem] relative overflow-hidden group border-white/5 bg-black/40"
            >
               <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-quinary to-transparent"></div>
               <ShieldCheck className="w-24 h-24 text-quinary mb-16 opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 glow-blue" />
               <h3 className="text-5xl font-display text-white italic mb-6">Omni Guard <br/> v4.0</h3>
               <p className="text-gray-500 font-tech text-xs uppercase tracking-[0.2em] leading-relaxed max-w-sm opacity-60">Segurança multi-camada auditada por protocolos de criptografia quântica.</p>
               <div className="absolute -right-16 -bottom-16 w-64 h-64 border border-quinary/10 rounded-full group-hover:scale-150 transition-transform duration-[2s]"></div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -10 }}
              className="md:col-span-5 bg-septenary p-16 rounded-[2rem] flex flex-col justify-between group overflow-hidden relative"
            >
               <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/10"></div>
               <div className="relative z-10 text-white">
                  <span className="font-tech font-black text-9xl leading-none italic -ml-4">X10</span>
                  <p className="font-tech font-black uppercase tracking-[0.4em] text-[10px] mt-4 text-white/60">Aceleração de Fluxo</p>
               </div>
               <div className="relative z-10 pt-12">
                  <p className="text-white font-tech text-[12px] uppercase font-black tracking-[0.3em] leading-tight">Implementação instantânea em ambientes de alta densidade.</p>
               </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Grid Features List */}
      <section className="py-40 px-4 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1 border-white/5 bg-white/5 border p-1 rounded-[1.5rem]">
            {[
              { label: 'BANDWIDTH', val: '4.8 GB/S', color: 'text-primary' },
              { label: 'LATENCY', val: '0.02 MS', color: 'text-secondary' },
              { label: 'UPTIME', val: '99.98 %', color: 'text-tertiary' },
              { label: 'SECURITY', val: 'L-LEVEL 8', color: 'text-quinary' }
            ].map((stat, i) => (
              <div key={i} className="bg-bg p-12 flex flex-col items-center justify-center space-y-4 group">
                <span className="text-[10px] font-tech font-black text-gray-700 uppercase tracking-widest">{stat.label}</span>
                <span className={cn("text-4xl font-display italic transition-all group-hover:scale-110 shadow-current", stat.color)}>{stat.val}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Poly-Chrome Horizontal Cards */}
      <section className="py-60 px-4 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto space-y-6">
             <div className="mb-24 px-4 text-center">
                <span className="text-octonary font-tech font-black text-[10px] tracking-[1em] uppercase block mb-6">SYNTH_REQUISITION</span>
                <h2 className="text-7xl md:text-[10rem] font-display text-white tracking-tighter italic">Diretórios <span className="text-quaternary">Ativos</span></h2>
             </div>

             {[
               { id: "0XA", title: "INTERFACE_NEON", color: "border-primary/20", iconColor: "text-primary", bg: "bg-primary/5" },
               { id: "0XB", title: "LOGIC_STREAM", color: "border-secondary/20", iconColor: "text-secondary", bg: "bg-secondary/5" },
               { id: "0XC", title: "DYNAMICS_FLARE", color: "border-tertiary/20", iconColor: "text-tertiary", bg: "bg-tertiary/5" },
               { id: "0XD", title: "CRYPTO_LAYER", color: "border-senary/20", iconColor: "text-senary", bg: "bg-senary/5" }
             ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02 }}
                  className={cn("flex flex-col md:flex-row md:items-center justify-between p-12 rounded-[1rem] border transition-all duration-500 group relative overflow-hidden glass-morphism", item.color, item.bg)}
                >
                  <div className="flex items-center space-x-12 relative z-10">
                    <span className={cn("font-mono font-black text-2xl opacity-20 group-hover:opacity-100 transition-opacity", item.iconColor)}>{item.id}</span>
                    <h3 className="text-4xl md:text-6xl font-display text-white italic tracking-tighter uppercase group-hover:translate-x-6 transition-transform duration-700">{item.title}</h3>
                  </div>
                  <Link to="/marketplace" className="mt-10 md:mt-0 w-20 h-20 rounded-full border border-white/5 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-500 relative">
                     <ArrowRight className="w-8 h-8" />
                  </Link>
                </motion.div>
             ))}
          </div>
        </div>
      </section>
    </div>
  );
};
