import React, { useState, useEffect } from 'react';
import { collection, query, where, limit, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, PRODUCT_CATEGORIES } from '../types';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, ShoppingCart, User, CheckCircle, CreditCard, X as CloseIcon, ShieldCheck, Activity, MessageSquare, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export const Marketplace = () => {
  const { user, signIn } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<'idle' | 'confirm' | 'success'>('idle');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');

    if (params.get('success') === 'true' && sessionId) {
      setCheckoutStep('success');
      
      // Proactive verification fallback + Client-Side Sync Plan B
      const verifySession = async () => {
        try {
          const response = await fetch('/api/payments/verify-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId })
          });
          
          const data = await response.json();
          console.log("[VERIFY] Resposta do servidor:", data);

          if (data.success && data.status === 'paid' && data.metadata && user) {
            console.log("[SYNC] Iniciando sincronização via navegador (Plano B)...");
            
            // Check for existing purchase to prevent duplicates
            const { getDocs, query, collection, where } = await import('firebase/firestore');
            const q = query(
              collection(db, 'purchases'), 
              where('stripeSessionId', '==', sessionId)
            );
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
              await addDoc(collection(db, 'purchases'), {
                userId: user.uid,
                productId: data.metadata.productId,
                productName: data.metadata.productName || 'Asset Digital',
                productImage: data.metadata.productImage || 'https://picsum.photos/seed/asset/400/400',
                fileUrl: data.metadata.fileUrl || '',
                price: parseFloat(data.metadata.amount || '0'),
                creatorId: data.metadata.creatorId,
                createdAt: serverTimestamp(),
                stripeSessionId: sessionId,
                syncSource: 'client_fallback'
              });
              console.log("[SYNC] Compra sincronizada manualmente no cofre!");
            } else {
              console.log("[SYNC] Compra já registrada anteriormente. Pulando duplicata.");
            }
            
            // Update UI to show real product details
            setSelectedProduct({ 
              name: data.metadata.productName || 'Aquisição Sincronizada',
              imageUrl: data.metadata.productImage,
              price: parseFloat(data.metadata.amount || '0')
            } as any);
          }
        } catch (e) {
          console.error("[VERIFY/SYNC] Erro no fluxo de sincronização:", e);
        }
      };
      
      verifySession();

      // Set a fake selected product if none to show success UI
      if (!selectedProduct) {
        setSelectedProduct({ name: 'Aquisição Sincronizada' } as any);
      }
      // Clean URL params
      window.history.replaceState({}, '', window.location.pathname);
    }
    if (params.get('canceled') === 'true') {
      alert('Pagamento cancelado ou interrompido.');
    }
  }, []);

  const categoryCounts = PRODUCT_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = products.filter(p => p.category === cat).length;
    return acc;
  }, {} as Record<string, number>);

  const handleBuy = (product: Product) => {
    if (!user) {
      if (window.confirm('Você precisa estar logado para comprar. Deseja entrar agora?')) {
        signIn();
      }
      return;
    }
    setSelectedProduct(product);
    setCheckoutStep('confirm');
  };

  const completePurchase = async () => {
    if (!user || !selectedProduct) return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product: {
            id: selectedProduct.id,
            name: selectedProduct.name,
            description: selectedProduct.description,
            price: selectedProduct.price,
            creatorId: selectedProduct.creatorId,
            thumbnail: selectedProduct.imageUrl,
            fileUrl: selectedProduct.fileUrl // Added for sync
          },
          user: {
            uid: user.uid,
            email: user.email
          }
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || errData.error || 'Falha ao iniciar checkout');
      }

      const data = await response.json();
      if (data.url) {
        // Essential: window.top.location for iframe breakout
        try {
          window.top!.location.href = data.url;
        } catch (e) {
          window.location.href = data.url;
        }
      }
    } catch (error: any) {
      console.error("Stripe error:", error);
      alert(`Erro ao processar pagamento: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let q = query(collection(db, 'products'), limit(100));
    if (activeCategory !== 'all') {
      q = query(collection(db, 'products'), where('category', '==', activeCategory), limit(100));
    }

    setLoading(true);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Product)
      }));
      setProducts(productsList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching products:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [activeCategory]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pt-32 pb-20 container mx-auto px-4 min-h-screen selection:bg-primary/30 relative">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[20%] left-0 w-96 h-96 bg-quinary/5 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-[20%] right-0 w-96 h-96 bg-tertiary/5 blur-[100px] rounded-full"></div>
      </div>

      <div className="relative z-10">
        {/* Header Section */}
        <div className="mb-20 flex flex-col items-center text-center border-b border-white/5 pb-16 gap-10 relative">
          <div className="inline-flex items-center space-x-4 text-quaternary font-tech font-black text-[10px] tracking-[0.5em] uppercase bg-quaternary/5 px-6 py-2.5 rounded-full border border-quaternary/20 glow-yellow">
             <Activity className="w-4 h-4 animate-pulse" />
             <span>Rede de Protocolos • Sincronizada</span>
          </div>
          
          <h1 className="text-7xl md:text-[10rem] font-display text-white tracking-tighter leading-[0.8] relative italic">
            MERCADO<br/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-tertiary bg-[length:200%_auto] animate-[gradient_8s_linear_infinite]">TERMINAL</span>
          </h1>

          <div className="relative w-full max-w-2xl mt-8">
             <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
             <input
               type="text"
               placeholder="PESQUISAR HASH_DATA..."
               className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-16 pr-6 py-6 text-white font-tech font-bold tracking-widest focus:outline-none focus:border-primary/40 transition-all text-xs placeholder:text-gray-700 uppercase backdrop-blur-xl"
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
             />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-16">
          {/* Navigation Sidebar */}
          <aside className="lg:w-80 shrink-0">
            <div className="sticky top-32 space-y-12">
              <div className="space-y-6">
                <h3 className="text-[10px] font-tech font-black text-gray-600 uppercase tracking-[0.4em] flex items-center space-x-3">
                  <span className="w-2 h-2 bg-secondary rounded-full shadow-[0_0_8px_#00FFD1]"></span>
                  <span>CAMADAS_VAULT</span>
                </h3>
                
                <div className="flex flex-col border border-white/5 rounded-[1.5rem] overflow-hidden bg-black/40 backdrop-blur-3xl tech-grid">
                  {[
                    { id: 'all', name: 'SISTEMA COMPLETO', color: 'text-primary', activeColor: 'bg-primary', count: products.length, icon: <Activity className="w-3 h-3" /> },
                    { id: 'Discord Assets', name: 'DISCORD ASSETS', color: 'text-secondary', activeColor: 'bg-secondary', count: categoryCounts['Discord Assets'] || 0, icon: <MessageSquare className="w-3 h-3" /> },
                    ...PRODUCT_CATEGORIES.filter(c => c !== 'Discord Assets').map(cat => ({
                      id: cat,
                      name: cat.toUpperCase(),
                      color: 'text-tertiary',
                      activeColor: 'bg-tertiary',
                      count: categoryCounts[cat] || 0,
                      icon: <Tag className="w-3 h-3" />
                    }))
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={cn(
                        "flex items-center justify-between px-8 py-6 text-[10px] font-tech font-black tracking-[0.2em] border-b border-white/5 transition-all text-left uppercase group",
                        activeCategory === cat.id ? `${cat.activeColor} text-black` : "text-gray-500 hover:bg-white/5"
                      )}
                    >
                      <div className="flex items-center space-x-4">
                         {cat.icon}
                         <span>{cat.name}</span>
                      </div>
                      <span className="font-mono text-[9px] opacity-40">{cat.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-8 rounded-[1.5rem] bg-white/[0.02] border border-white/5 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12 group-hover:scale-110 transition-transform">
                   <ShieldCheck className="w-20 h-20 text-primary" />
                 </div>
                 <h4 className="text-white font-tech font-black text-[10px] tracking-widest uppercase mb-3">ENZO_AUTH</h4>
                 <p className="text-gray-600 text-[10px] leading-relaxed font-tech font-medium uppercase tracking-widest">Protocolos de segurança bio-métria aplicados a cada transferência de bit.</p>
              </div>
            </div>
          </aside>

          {/* Assets Grid */}
          <main className="flex-1">
            {loading ? (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {[1, 2, 4, 5].map(i => <div key={i} className="h-[35rem] bg-white/[0.02] animate-pulse rounded-[2rem] border border-white/5"></div>)}
               </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {filteredProducts.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group relative glass-morphism rounded-[2rem] overflow-hidden hover:border-primary/40 transition-all duration-500 flex flex-col p-4 hover:translate-y-[-8px] hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-white/5"
                  >
                    <div className="hud-corner hud-corner-tl"></div>
                    <div className="hud-corner hud-corner-tr"></div>
                    <div className="hud-corner hud-corner-bl"></div>
                    <div className="hud-corner hud-corner-br"></div>

                    <div className="relative aspect-[16/10] rounded-[1.5rem] overflow-hidden bg-black mb-8">
                       <img
                         src={product.imageUrl || `https://picsum.photos/seed/${product.id}/800/1000`}
                         alt={product.name}
                         className="w-full h-full object-cover grayscale brightness-50 group-hover:grayscale-0 group-hover:brightness-100 group-hover:scale-105 transition-all duration-1000"
                         referrerPolicy="no-referrer"
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                       
                       <div className="absolute top-6 left-6">
                          <span className={cn(
                            "px-4 py-2 rounded-xl text-[9px] font-tech font-black text-white border tracking-widest uppercase backdrop-blur-md",
                            product.category === 'Discord Assets' ? "bg-secondary/20 border-secondary/20 text-secondary" : "bg-primary/20 border-primary/20 text-primary"
                          )}>
                             {product.category}
                          </span>
                       </div>
                    </div>

                    <div className="px-6 pb-6 flex-1 flex flex-col">
                       <div className="flex items-center space-x-3 mb-6 opacity-40">
                          <User className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-tech font-black uppercase tracking-widest">{product.creatorName}</span>
                       </div>
                       <h3 className="text-4xl font-display text-white tracking-tighter mb-4 line-clamp-1 italic">{product.name}</h3>
                       <p className="text-gray-500 font-tech leading-relaxed mb-10 line-clamp-2 text-xs tracking-tight uppercase opacity-40">
                          {product.description}
                       </p>

                       <div className="mt-auto pt-8 border-t border-white/5 flex items-center justify-between">
                          <div>
                             <span className="text-[9px] font-tech font-black text-gray-700 uppercase tracking-widest block mb-1">DATA_HASH</span>
                             <div className={cn(
                               "text-4xl font-display italic",
                               i % 4 === 0 ? "text-primary" : i % 4 === 1 ? "text-secondary" : i % 4 === 2 ? "text-tertiary" : "text-quaternary"
                             )}>R$ {product.price.toFixed(2)}</div>
                          </div>
                          <button
                            onClick={() => handleBuy(product)}
                            className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center hover:bg-primary transition-all duration-300 transform active:scale-90 group/btn"
                          >
                             <ShoppingCart className="w-6 h-6 group-hover/btn:rotate-12 transition-transform" />
                          </button>
                       </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
               <div className="py-40 flex flex-col items-center justify-center text-center border border-white/5 rounded-[4rem] bg-white/[0.01]">
                  <Search className="w-20 h-20 text-gray-800 mb-8" />
                  <h3 className="text-5xl font-display text-white tracking-tighter italic">Vácuo de Protocolos</h3>
                  <p className="text-gray-600 mt-6 max-w-sm font-tech font-black text-[10px] tracking-[0.3em] uppercase opacity-40">Nenhum hash corresponde aos critérios de filtragem atuais.</p>
               </div>
            )}
          </main>
        </div>
      </div>

      {/* Checkout Terminal Modal */}
      <AnimatePresence>
        {checkoutStep !== 'idle' && selectedProduct && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/98 backdrop-blur-3xl">
             <motion.button 
               onClick={() => setCheckoutStep('idle')}
               className="absolute top-10 right-10 w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all z-[210]"
             >
                <CloseIcon className="w-6 h-6" />
             </motion.button>

             <motion.div
               initial={{ opacity: 0, scale: 0.9, y: 30 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 30 }}
               className="w-full max-w-sm glass-morphism rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl relative border-white/5"
             >
                <div className="h-40 bg-black relative border-b border-white/5 overflow-hidden">
                   <img 
                     src={selectedProduct.imageUrl || `https://picsum.photos/seed/${selectedProduct.id}/800/400`} 
                     className="w-full h-full object-cover opacity-50 grayscale" 
                     referrerPolicy="no-referrer"
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-bg to-transparent"></div>
                </div>

                <div className="p-8 flex flex-col">
                   {checkoutStep === 'confirm' ? (
                     <>
                        <div className="flex items-center space-x-3 text-secondary font-tech font-black text-[9px] tracking-[0.5em] uppercase mb-6 glow-blue">
                           <CreditCard className="w-4 h-4" />
                           <span>SYNC_TRANSACTION</span>
                        </div>
                        <h2 className="text-4xl font-display text-white tracking-tighter mb-4 italic leading-tight">{selectedProduct.name}</h2>
                        <p className="text-gray-500 font-tech text-[10px] leading-relaxed mb-8 uppercase tracking-widest opacity-40">Preparando canal de transferência criptografada.</p>
                        
                        <div className="bg-white/[0.03] border border-white/5 p-6 rounded-[1.5rem] mb-10 flex justify-between items-center group relative overflow-hidden">
                           <div className="relative z-10">
                              <span className="text-[9px] font-tech font-black text-gray-500 uppercase tracking-widest block mb-1">VALOR_DASH</span>
                              <span className="text-3xl font-display text-white italic">R$ {selectedProduct.price.toFixed(2)}</span>
                           </div>
                           <div className="text-right relative z-10">
                              <span className="text-[9px] font-tech font-black text-primary uppercase tracking-widest block mb-1">LICENÇA</span>
                              <span className="text-[10px] text-white font-tech font-black uppercase tracking-widest glow-primary">ETERNAL</span>
                           </div>
                           <div className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:scale-110 transition-transform">
                              <CreditCard className="w-32 h-32 text-primary" />
                           </div>
                        </div>

                        <button 
                          onClick={completePurchase}
                          disabled={loading}
                          className="w-full bg-primary text-black py-6 rounded-2xl font-black text-[10px] tracking-[0.4em] hover:bg-white transition-all transform active:scale-95 disabled:opacity-50 uppercase shadow-2xl"
                        >
                           {loading ? 'SINC_DATA...' : 'EXECUTAR_TRANSFER'}
                        </button>
                        <p className="text-center mt-6 text-[8px] text-gray-700 font-tech font-black uppercase tracking-[0.5em]">Network Distributed • Protocolo Seguro</p>
                     </>
                   ) : (
                     <div className="text-center py-10">
                        <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-10 border border-primary/20 glow-primary">
                           <CheckCircle className="w-12 h-12" />
                        </div>
                        <h2 className="text-5xl font-display text-white tracking-tighter mb-6 italic">Sucesso</h2>
                        <p className="text-gray-500 font-tech text-[11px] mb-12 max-w-xs mx-auto uppercase tracking-widest opacity-40 leading-relaxed">Protocolo instanciado. Ativo sincronizado com seu cofre pessoal.</p>
                        <Link 
                          to="/library" 
                          className="w-full bg-white text-black py-6 rounded-2xl font-black text-[10px] tracking-[0.4em] hover:bg-primary transition-all uppercase block"
                        >
                          ACESSAR_COFRE
                        </Link>
                     </div>
                   )}
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
