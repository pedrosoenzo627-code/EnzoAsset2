import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { Purchase, Product } from '../types';
import { Library, Download, Package, ExternalLink, ShieldCheck, Loader2, Award } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

// Unified type for library display
interface LibraryItem {
  id: string;
  name: string;
  image: string;
  fileUrl: string;
  date: any;
  type: 'purchase' | 'creation';
  category?: string;
}

export const MyLibrary = () => {
  const { user, loading: authLoading, signIn } = useAuth();
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      if (!authLoading) setLoading(false);
      return;
    }

    setLoading(true);

    // 1. Listen to Purchases
    const qPurchases = query(
      collection(db, 'purchases'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    // 2. Listen to Created Products
    const qCreated = query(
      collection(db, 'products'),
      where('creatorId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    let purchasesList: LibraryItem[] = [];
    let createdList: LibraryItem[] = [];

    const updateLibrary = () => {
      const combined = [...purchasesList, ...createdList];
      // Remove duplicates if a creator bought their own product (rare but possible)
      const unique = combined.reduce((acc, current) => {
        const x = acc.find(item => item.id === current.id || (item.type === 'purchase' && current.type === 'creation' && item.name === current.name));
        if (!x) return acc.concat([current]);
        return acc;
      }, [] as LibraryItem[]);

      // Sort by date (descending)
      unique.sort((a, b) => {
        const dateA = a.date?.seconds || 0;
        const dateB = b.date?.seconds || 0;
        return dateB - dateA;
      });

      setItems(unique);
      setLoading(false);
    };

    const unsubPurchases = onSnapshot(qPurchases, (snapshot) => {
      purchasesList = snapshot.docs.map(doc => {
        const data = doc.data() as Purchase;
        return {
          id: doc.id,
          name: data.productName,
          image: data.productImage,
          fileUrl: data.fileUrl,
          date: data.createdAt,
          type: 'purchase'
        };
      });
      updateLibrary();
    }, (error) => {
      console.error("Error listening to purchases:", error);
      setLoading(false);
    });

    const unsubCreated = onSnapshot(qCreated, (snapshot) => {
      createdList = snapshot.docs.map(doc => {
        const data = doc.data() as Product;
        return {
          id: doc.id,
          name: data.name,
          image: data.imageUrl,
          fileUrl: data.fileUrl,
          date: data.createdAt,
          type: 'creation',
          category: data.category
        };
      });
      updateLibrary();
    }, (error) => {
      console.error("Error listening to created products:", error);
    });

    return () => {
      unsubPurchases();
      unsubCreated();
    };
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
              <span className="text-3xl font-black text-white tracking-tighter italic uppercase">{items.length} PROTOCOLOS</span>
           </div>
           <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-primary border border-border rotate-6 group-hover:rotate-0 transition-all">
              <Package className="w-8 h-8" />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-[30rem] bg-surface animate-pulse rounded-[3.5rem] border border-border"></div>)
        ) : items.length > 0 ? (
          items.map((item, i) => (
            <motion.div
              key={item.id + item.type}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="bg-surface border border-border rounded-[3.5rem] overflow-hidden group hover:border-primary/20 transition-all flex flex-col tech-grid p-2"
            >
              <div className="aspect-[4/3] relative rounded-[3rem] overflow-hidden bg-black mb-4">
                <img 
                  src={item.image || 'https://picsum.photos/seed/roblox/800/600'} 
                  alt={item.name} 
                  className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                   <div className={cn(
                     "px-3 py-1.5 rounded-xl text-[8px] font-black border tracking-[0.3em] uppercase w-fit flex items-center space-x-2",
                     item.type === 'creation' ? "bg-secondary/20 text-secondary border-secondary/20" : "bg-primary/20 text-primary border-primary/20"
                   )}>
                      {item.type === 'creation' ? <Award className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                      <span>{item.type === 'creation' ? 'OWNER_ASSET' : 'VERIFIED_PROTOCOL'}</span>
                   </div>
                </div>
                <div className="absolute bottom-8 left-8 right-8">
                   <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">{item.name}</h3>
                </div>
              </div>

              <div className="px-8 pb-10 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-8 pb-8 border-b border-border">
                   <div>
                      <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest block mb-2">SINC_DATA</span>
                      <span className="text-[10px] text-white font-black uppercase tracking-tight">
                        {item.date?.seconds 
                          ? new Date(item.date.seconds * 1000).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) 
                          : 'INSTANT_SYNC'}
                      </span>
                   </div>
                   <div className="text-right">
                      <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest block mb-1">ORIGEM</span>
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border",
                        item.type === 'creation' ? "text-secondary bg-secondary/10 border-secondary/20" : "text-primary bg-primary/10 border-primary/20"
                      )}>
                        {item.type === 'creation' ? 'CRIADO' : 'ADQUIRIDO'}
                      </span>
                   </div>
                </div>

                <div className="mt-auto space-y-4">
                   <a 
                     href={item.fileUrl} 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className={cn(
                       "w-full py-5 rounded-2xl font-black text-[10px] tracking-[0.2em] flex items-center justify-center space-x-3 transition-all transform active:scale-95 shadow-xl uppercase px-4 text-center",
                       item.type === 'creation' ? "bg-secondary text-black hover:bg-white" : "bg-primary text-black hover:bg-white"
                     )}
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
