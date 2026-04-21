import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { LibraryItem } from '../types';
import { motion } from 'motion/react';
import { Package, Download, ShieldCheck, Library, Award } from 'lucide-react';
import { cn } from '../lib/utils';

export const MyLibrary = () => {
  const { user, loading: authLoading, signIn } = useAuth();
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user) return;

    setLoading(true);

    const qPurchases = query(
      collection(db, 'purchases'),
      where('userId', '==', user.uid)
    );

    const qCreated = query(
      collection(db, 'products'),
      where('creatorId', '==', user.uid)
    );

    let purchasesData: LibraryItem[] = [];
    let createdData: LibraryItem[] = [];

    const updateLibrary = () => {
      const combined = [...purchasesData, ...createdData].sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      });
      setItems(combined);
      setLoading(false);
    };

    const unsubPurchases = onSnapshot(qPurchases, (snapshot) => {
      purchasesData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          source: 'purchase',
          name: data.productName,
          imageUrl: data.productImage,
          fileUrl: data.fileUrl,
          createdAt: data.createdAt,
          category: data.category || 'Purchase'
        };
      });
      updateLibrary();
    }, (error) => {
      console.error("Error listening to purchases:", error);
    });

    const unsubCreated = onSnapshot(qCreated, (snapshot) => {
      createdData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          source: 'creation',
          name: data.name,
          imageUrl: data.imageUrl,
          fileUrl: data.fileUrl,
          createdAt: data.createdAt,
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

  if (authLoading) return <div className="h-screen bg-bg flex items-center justify-center text-white font-tech font-black tracking-[0.5em] uppercase">SYNC_VAULT...</div>;

  if (!user) {
    return (
      <div className="pt-40 pb-20 container mx-auto px-4 min-h-screen flex items-center justify-center relative">
         <div className="fixed inset-0 pointer-events-none z-0">
           <div className="absolute top-[20%] left-0 w-96 h-96 bg-quaternary/5 blur-[100px] rounded-full"></div>
         </div>
         <div className="glass-morphism border border-white/5 p-20 rounded-[4rem] text-center max-w-2xl relative z-10 tech-grid">
            <div className="hud-corner hud-corner-tl"></div>
            <div className="hud-corner hud-corner-br"></div>
            <div className="w-24 h-24 bg-black rounded-[2rem] flex items-center justify-center border border-white/5 border-quaternary/20 mx-auto mb-10 rotate-6 glow-yellow">
               <Package className="w-10 h-10 text-quaternary" />
            </div>
            <h2 className="text-5xl font-display text-white mb-6 uppercase italic tracking-tighter leading-none">COFRE_BLOQUEADO</h2>
            <p className="text-gray-500 font-tech font-black text-[11px] tracking-[0.4em] uppercase mb-12">Sincronize sua identidade neural para acessar seus ativos encriptados.</p>
            <button
              onClick={() => signIn()}
              className="bg-white text-black px-16 py-8 rounded-2xl font-tech font-black text-[10px] tracking-[0.5em] hover:bg-quaternary transition-all uppercase shadow-2xl"
            >
              AUTENTICAR_SESSÃO
            </button>
         </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 container mx-auto px-4 min-h-screen selection:bg-primary/30 relative">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[10%] left-[5%] w-96 h-96 bg-quinary/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[10%] right-[5%] w-96 h-96 bg-quaternary/5 blur-[120px] rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-16 space-y-6">
           <div className="inline-flex items-center space-x-4 bg-quinary/5 text-quinary border border-quinary/20 px-6 py-2.5 rounded-full text-[10px] font-tech font-black uppercase tracking-[0.5em] glow-blue">
              <Library className="w-5 h-5 animate-pulse" />
              <span>COFRE_PRIVADO • HASH_DATA_v9.2</span>
           </div>
           <h1 className="text-6xl md:text-[8rem] font-display text-white tracking-tighter italic uppercase leading-[0.7]">MEU_COFRE</h1>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-[30rem] glass-morphism rounded-[3rem] animate-pulse"></div>
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-morphism border border-white/5 rounded-[3rem] overflow-hidden group hover:border-quinary/30 transition-all flex flex-col p-4"
              >
                <div className="hud-corner hud-corner-tl border-quinary"></div>
                <div className="hud-corner hud-corner-br border-quinary"></div>
                
                <div className="relative h-64 rounded-[2rem] overflow-hidden mb-8 bg-black border border-white/5">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-[2s]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-6 right-6 z-10">
                    <div className={cn(
                      "px-5 py-2 rounded-xl text-[9px] font-tech font-black uppercase tracking-[0.2em] backdrop-blur-3xl border",
                      item.source === 'purchase' 
                        ? "bg-quaternary/10 text-quaternary border-quaternary/20 glow-yellow" 
                        : "bg-quinary/10 text-quinary border-quinary/20 glow-blue"
                    )}>
                      {item.source === 'purchase' ? 'CONQUISTADO' : 'FABRICADO'}
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-6 flex-1 flex flex-col justify-between space-y-8">
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                       <Award className={cn("w-5 h-5", item.source === 'purchase' ? 'text-quaternary' : 'text-quinary')} />
                       <span className="text-[10px] font-tech font-black text-gray-700 uppercase tracking-widest">{item.category}</span>
                    </div>
                    <h3 className="text-3xl font-display text-white tracking-tighter uppercase italic leading-none line-clamp-2">{item.name}</h3>
                  </div>

                  <div className="pt-8 border-t border-white/5 flex flex-col space-y-6">
                    <div className="flex justify-between items-center">
                       <span className="text-[9px] font-tech font-black text-gray-800 uppercase tracking-widest">SINC_DATA</span>
                       <span className="text-[10px] text-white font-tech font-black">
                         {item.createdAt?.seconds ? new Date(item.createdAt.seconds * 1000).toLocaleDateString() : 'REAL_TIME'}
                       </span>
                    </div>
                    <a
                      href={item.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "w-full py-7 rounded-2xl font-tech font-black text-[10px] tracking-[0.5em] flex items-center justify-center space-x-4 transition-all uppercase shadow-2xl active:scale-95",
                        item.source === 'purchase'
                          ? "bg-quaternary text-black hover:bg-white"
                          : "bg-quinary text-white hover:bg-white hover:text-black"
                      )}
                    >
                      <Download className="w-5 h-5" />
                      <span>EXTRAIR_ATIVO</span>
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-40 glass-morphism border border-white/5 rounded-[4rem] text-center tech-grid">
             <div className="hud-corner hud-corner-tl"></div>
             <div className="hud-corner hud-corner-br"></div>
             <Package className="w-20 h-20 text-gray-800 mx-auto mb-10 opacity-20" />
             <h2 className="text-5xl font-display text-white tracking-tighter italic uppercase leading-none">COFRE_VAZIO</h2>
             <p className="text-gray-700 font-tech font-black text-[10px] tracking-[0.4em] uppercase mt-8 opacity-40">Nenhum protocolo encriptado encontrado no seu diretório local.</p>
          </div>
        )}
      </div>
    </div>
  );
};
