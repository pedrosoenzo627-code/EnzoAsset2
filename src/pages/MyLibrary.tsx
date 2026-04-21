import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Purchase } from '../types';
import { Library, Download, Package, ExternalLink, ShieldCheck, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export const MyLibrary = () => {
  const { user, loading: authLoading, signIn } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPurchases = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const q = query(
          collection(db, 'purchases'), 
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Purchase[];
        setPurchases(list);
      } catch (error) {
        console.error("Error fetching library:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchPurchases();
    else if (!authLoading) setLoading(false);
  }, [user, authLoading]);

  if (authLoading) return <div className="h-screen flex items-center justify-center text-white font-black tracking-widest text-xs uppercase animate-pulse">Carregando...</div>;

  if (!user) {
    return (
      <div className="pt-32 pb-20 container mx-auto px-4 min-h-screen flex items-center justify-center selection:bg-primary/30 tech-dots relative">
        <div className="scanline"></div>
        <div className="bg-surface border border-border p-20 rounded-[4rem] max-w-2xl mx-auto flex flex-col items-center relative overflow-hidden text-center">
          <div className="scanline"></div>
          <div className="w-24 h-24 bg-black rounded-[2rem] flex items-center justify-center mb-10 border border-border rotate-6 group hover:rotate-0 transition-transform duration-500 shadow-[0_0_50px_rgba(193,255,0,0.05)]">
            <Library className="w-10 h-10 text-gray-600" />
          </div>
          <h2 className="text-5xl font-black text-white mb-6 tracking-tighter uppercase italic leading-none">ACESSO<br /><span className="text-primary italic-none">RESTRITO</span></h2>
          <p className="text-gray-600 mb-12 leading-relaxed text-[10px] font-black uppercase tracking-widest max-w-sm">
            Sua biblioteca é pessoal e segura. Conecte sua conta para visualizar e baixar todos os seus assets adquiridos via protocolo Enzo.
          </p>
          <button 
            onClick={() => signIn()}
            className="group relative bg-primary text-black px-16 py-6 rounded-2xl font-black text-[10px] tracking-[0.3em] overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl uppercase"
          >
            CONECTAR AGORA
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 container mx-auto px-4 min-h-screen selection:bg-primary/30 tech-dots relative">
      <div className="scanline"></div>
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8 border-b border-border pb-12 relative overflow-hidden">
        <div className="absolute -bottom-px left-0 w-48 h-px bg-primary shadow-[0_0_15px_rgba(193,255,0,0.5)]"></div>
        
        <div className="space-y-4">
          <div className="inline-flex items-center space-x-3 bg-primary/5 text-primary border border-primary/10 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.4em]">
            <ShieldCheck className="w-5 h-5 animate-pulse" />
            <span>CRIPTO_VAULT v2.0 • PROTOCOLO VERIFICADO</span>
          </div>
          <h1 className="text-6xl md:text-9xl font-black text-white tracking-tighter uppercase italic leading-[0.7]">MEU<br /><span className="text-primary italic-none">COFRE</span></h1>
          <p className="text-gray-500 font-mono text-[10px] uppercase tracking-widest leading-relaxed max-w-sm">Diretório pessoal de assets auditados. Todas as licenças ativas são vitalícias e intransferíveis.</p>
        </div>
        
        <div className="bg-surface border border-border p-8 rounded-[3rem] flex items-center space-x-8 group hover:border-primary/20 transition-all tech-grid">
           <div className="text-right">
              <span className="text-[9px] font-black text-gray-700 uppercase block tracking-[0.3em] mb-1">REGISTROS</span>
              <span className="text-3xl font-black text-white tracking-tighter italic uppercase">{purchases.length} PROTOCOLOS</span>
           </div>
           <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-primary border border-border rotate-6 group-hover:rotate-0 transition-all">
              <Package className="w-8 h-8" />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-[30rem] bg-surface animate-pulse rounded-[3.5rem] border border-border"></div>)
        ) : purchases.length > 0 ? (
          purchases.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="bg-surface border border-border rounded-[3.5rem] overflow-hidden group hover:border-primary/20 transition-all flex flex-col tech-grid p-2"
            >
              <div className="aspect-[4/3] relative rounded-[3rem] overflow-hidden bg-black mb-4">
                <img 
                  src={item.productImage || 'https://picsum.photos/seed/roblox/800/600'} 
                  alt={item.productName} 
                  className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                <div className="absolute bottom-8 left-8 right-8">
                   <div className="bg-black/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[8px] font-black text-primary border border-primary/20 tracking-[0.3em] uppercase w-fit mb-4">VERIFIED_PROTOCOL</div>
                   <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">{item.productName}</h3>
                </div>
              </div>

              <div className="px-8 pb-10 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-8 pb-8 border-b border-border">
                   <div>
                      <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest block mb-2">SINC_DATA</span>
                      <span className="text-[10px] text-white font-black uppercase tracking-tight">
                        {item.createdAt?.seconds 
                          ? new Date(item.createdAt.seconds * 1000).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) 
                          : 'INSTANT_SYNC'}
                      </span>
                   </div>
                   <div className="text-right">
                      <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest block mb-1">STATUS</span>
                      <span className="text-primary text-[9px] font-black uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-lg border border-primary/20">LIFETIME</span>
                   </div>
                </div>

                <div className="mt-auto space-y-4">
                   <a 
                     href={item.fileUrl} 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="w-full bg-primary text-black py-5 rounded-2xl font-black text-[10px] tracking-[0.2em] flex items-center justify-center space-x-3 hover:bg-white transition-all transform active:scale-95 shadow-xl uppercase"
                   >
                     <Download className="w-5 h-5" />
                     <span>DESCARREGAR PROTOCOLO</span>
                   </a>
                   <p className="text-[8px] text-center text-gray-700 font-black uppercase tracking-[0.3em]">Criptografia de ponta-a-ponta • Enzo Shield Ativo</p>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-40 border border-border bg-surface/50 rounded-[5rem] text-center flex flex-col items-center justify-center tech-dots">
             <div className="w-24 h-24 bg-black rounded-[2rem] flex items-center justify-center mb-10 border border-border shadow-[0_0_50px_rgba(193,255,0,0.05)]">
                <Package className="w-12 h-12 text-gray-800" />
             </div>
             <div className="space-y-4 mb-12">
               <h3 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">COFRE VAZIO</h3>
               <p className="text-gray-600 max-w-sm mx-auto font-black text-[10px] tracking-widest uppercase">
                 Nenhuma diretiva de asset foi encontrada em sua conta. Inicialize uma transação no terminal de mercado.
               </p>
             </div>
             <Link to="/marketplace" className="bg-primary text-black px-12 py-6 rounded-2xl font-black text-[10px] tracking-[0.3em] hover:bg-white transition-all shadow-xl uppercase">
               ACESSAR MERCADO
             </Link>
          </div>
        )}
      </div>
    </div>
  );
};
