import React, { useState, useEffect } from 'react';
import { collection, query, where, limit, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, PRODUCT_CATEGORIES } from '../types';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { Search, Filter, ShoppingCart, Tag, User, CheckCircle, CreditCard, X as CloseIcon, ShieldCheck, Activity, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { AnimatePresence } from 'motion/react';

export const Marketplace = () => {
  const { user, signIn } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<'idle' | 'confirm' | 'success'>('idle');

  // Stats for the sidebar
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
            thumbnail: selectedProduct.imageUrl
          },
          user: {
            uid: user.uid,
            email: user.email
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          throw new Error(`Erro do servidor (HTML): ${errorText.substring(0, 100)}...`);
        }
        throw new Error(errorData.error || 'Falha ao iniciar checkout');
      }

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Falha ao iniciar checkout');
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
    <div className="pt-32 pb-20 container mx-auto px-4 min-h-screen selection:bg-primary/30 tech-dots relative">
      <div className="scanline"></div>
      
      {/* Header Section */}
      <div className="mb-20 flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-12 gap-8 relative">
        <div className="absolute -bottom-px left-0 w-32 h-px bg-primary shadow-[0_0_15px_rgba(193,255,0,0.5)]"></div>
        
        {window.location.search.includes('canceled=true') && (
           <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-red-500 text-white px-8 py-3 rounded-xl font-black text-[10px] tracking-widest uppercase animate-bounce">
              TRANSAÇÃO_CANCELED
           </div>
        )}
        
        <div className="space-y-4">
          <div className="inline-flex items-center space-x-2 text-primary font-black text-[9px] tracking-[0.4em] uppercase bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
             <Activity className="w-4 h-4 animate-pulse" />
             <span>Rede de Ativos • Protocolo v2.0</span>
          </div>
          <h1 className="text-7xl md:text-[12rem] font-display text-white tracking-tighter leading-[0.8] mb-6 relative">
            MERCADO<br/>
            <span className="cyber-text-gradient italic ml-0 md:ml-12">PROTOCOLO</span>
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-primary/20 blur-[100px] pointer-events-none"></div>
          </h1>
          <p className="text-gray-500 font-tech text-[11px] uppercase tracking-[0.2em] leading-relaxed max-w-xl opacity-70">
            Acesso exclusivo a frameworks, UI Kits e ativos de alta performance<br/>
            auditados pela rede <span className="text-white">Enzo Assets</span>.
          </p>
        </div>

        <div className="relative w-full md:w-96">
           <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
           <input
             type="text"
             placeholder="FILTRAR PROTOCOLOS..."
             className="w-full bg-surface border border-border rounded-2xl pl-16 pr-6 py-5 text-white font-bold tracking-tight focus:outline-none focus:border-primary/30 transition-all text-xs placeholder:text-gray-700 uppercase"
             value={searchTerm}
             onChange={e => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Navigation Sidebar */}
        <aside className="lg:w-80 shrink-0">
          <div className="sticky top-32 space-y-10">
            <div className="space-y-6">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] flex items-center space-x-3">
                <Filter className="w-4 h-4 text-primary" />
                <span>DIRETÓRIO</span>
              </h3>
              
                  <div className="flex flex-col border border-border rounded-[2.5rem] overflow-hidden bg-black/40 backdrop-blur-md tech-grid">
                    <button
                      onClick={() => setActiveCategory('all')}
                      className={cn(
                        "flex items-center justify-between px-8 py-6 text-[10px] font-black tracking-widest border-b border-border transition-all text-left uppercase",
                        activeCategory === 'all' ? "bg-white text-black" : "text-gray-500 hover:bg-white/5"
                      )}
                    >
                      <div className="flex items-center space-x-3">
                         <Activity className="w-3 h-3" />
                         <span>SISTEMA COMPLETO</span>
                      </div>
                      <span className="font-mono text-[9px] opacity-40">{products.length}</span>
                    </button>

                    <button
                      onClick={() => setActiveCategory('Discord Assets')}
                      className={cn(
                        "flex items-center justify-between px-8 py-6 text-[10px] font-black tracking-widest border-b border-border transition-all text-left uppercase",
                        activeCategory === 'Discord Assets' ? "bg-secondary text-black" : "text-secondary/60 hover:bg-secondary/5"
                      )}
                    >
                      <div className="flex items-center space-x-3">
                         <MessageSquare className="w-3 h-3" />
                         <span>DISCORD ASSETS</span>
                      </div>
                      <span className="font-mono text-[9px] opacity-40">{categoryCounts['Discord Assets'] || 0}</span>
                    </button>

                    {PRODUCT_CATEGORIES.filter(c => c !== 'Discord Assets').map(category => (
                   <button
                     key={category}
                     onClick={() => setActiveCategory(category)}
                     className={cn(
                       "flex items-center justify-between px-8 py-6 text-[10px] font-black tracking-widest border-b border-border last:border-0 transition-all text-left uppercase",
                       activeCategory === category ? "bg-primary text-black" : "text-gray-500 hover:bg-white/5"
                     )}
                   >
                      <span>{category.replace('&', '+')}</span>
                      <span className="font-mono text-[10px] opacity-40">
                        {categoryCounts[category] || 0}
                      </span>
                   </button>
                ))}
              </div>
            </div>

            <div className="p-8 rounded-[2.5rem] bg-surface border border-border relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12 group-hover:scale-110 transition-transform">
                 <ShieldCheck className="w-20 h-20 text-primary" />
               </div>
               <h4 className="text-white font-black text-[10px] tracking-widest uppercase mb-3">CONFIANÇA ENZO</h4>
               <p className="text-gray-600 text-[10px] leading-relaxed font-medium uppercase font-black tracking-widest">Ativos com selo de verificação passam por auditorias técnicas rigorosas.</p>
            </div>
          </div>
        </aside>

        {/* Assets Grid */}
        <main className="flex-1">
          {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[1, 2, 4, 5].map(i => <div key={i} className="h-[30rem] bg-surface animate-pulse rounded-[3rem] border border-border"></div>)}
             </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative glass-morphism rounded-[3.5rem] overflow-hidden hover:border-primary/40 transition-all duration-500 flex flex-col p-3 hover:translate-y-[-8px] hover:shadow-[0_20px_50px_rgba(193,255,0,0.1)]"
                >
                  <div className="hud-corner hud-corner-tl"></div>
                  <div className="hud-corner hud-corner-tr"></div>
                  <div className="hud-corner hud-corner-bl"></div>
                  <div className="hud-corner hud-corner-br"></div>

                  <div className="relative aspect-[4/3] rounded-[2.8rem] overflow-hidden bg-black mb-6">
                     <img
                       src={product.imageUrl || `https://picsum.photos/seed/${product.id}/800/1000`}
                       alt={product.name}
                       className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000"
                       referrerPolicy="no-referrer"
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                     
                     <div className="absolute top-6 left-6">
                        <span className="bg-black/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[9px] font-black text-white border border-border tracking-widest uppercase">
                           {product.category}
                        </span>
                     </div>
                  </div>

                  <div className="px-8 pb-8 flex-1 flex flex-col">
                     <div className="flex items-center space-x-3 mb-4">
                        <div className="w-6 h-6 rounded-lg bg-white/5 border border-border flex items-center justify-center">
                           <User className="w-3.5 h-3.5 text-gray-500" />
                        </div>
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{product.creatorName}</span>
                     </div>
                     <h3 className="text-3xl font-display text-white tracking-tighter mb-4 line-clamp-1 italic">{product.name}</h3>
                     <p className="text-gray-500 font-tech leading-relaxed mb-10 line-clamp-2 text-xs tracking-tight uppercase opacity-60">
                        {product.description}
                     </p>

                     <div className="mt-auto pt-8 border-t border-border flex items-center justify-between">
                        <div>
                           <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest block mb-1">MKT_VAL</span>
                           <div className="text-3xl font-black text-white italic">R$ {product.price.toFixed(2)}</div>
                        </div>
                        <button
                          onClick={() => handleBuy(product)}
                          className="bg-primary text-black px-10 py-5 rounded-2xl font-black text-[10px] tracking-[0.2em] hover:bg-white transition-all transform active:scale-95 flex items-center space-x-3 uppercase shadow-xl"
                        >
                           <ShoppingCart className="w-5 h-5" />
                           <span className="hidden sm:inline">ADQUIRIR</span>
                        </button>
                     </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
             <div className="py-40 flex flex-col items-center justify-center text-center tech-dots border border-border rounded-[5rem] bg-surface/50">
                <Search className="w-20 h-20 text-gray-800 mb-8" />
                <h3 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">Vácuo de Dados</h3>
                <p className="text-gray-600 mt-6 max-w-sm font-medium uppercase font-black text-[10px] tracking-widest">Nenhum protocolo corresponde aos critérios de busca atuais.</p>
             </div>
          )}
        </main>
      </div>

      {/* Checkout Terminal Modal */}
      <AnimatePresence>
        {checkoutStep !== 'idle' && selectedProduct && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/98 backdrop-blur-3xl">
             <motion.button 
               onClick={() => setCheckoutStep('idle')}
               className="absolute top-10 right-10 w-12 h-12 rounded-2xl bg-surface border border-border flex items-center justify-center text-white hover:bg-white hover:text-black transition-all z-[210]"
             >
                <CloseIcon className="w-6 h-6" />
             </motion.button>

             <motion.div
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="w-full max-w-sm bg-surface border border-border rounded-[2rem] overflow-hidden flex flex-col shadow-2xl relative max-h-[90vh] overflow-y-auto"
             >
                {/* Visual Accent - Ultra Compact */}
                <div className="h-32 bg-black relative border-b border-border overflow-hidden shrink-0">
                   <img 
                     src={selectedProduct.imageUrl || `https://picsum.photos/seed/${selectedProduct.id}/800/400`} 
                     className="w-full h-full object-cover opacity-50 grayscale" 
                     referrerPolicy="no-referrer"
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent"></div>
                   <div className="absolute top-5 left-5">
                      <div className="bg-primary/20 backdrop-blur-md px-2.5 py-1 rounded-lg text-[7px] font-black text-primary border border-primary/20 tracking-[0.2em]">PROTOCOL_DATA</div>
                   </div>
                </div>

                <div className="p-6 md:p-8 flex flex-col">
                   {checkoutStep === 'confirm' ? (
                     <>
                        <div className="flex items-center space-x-2 text-primary font-black text-[8px] tracking-[0.3em] uppercase mb-4">
                           <CreditCard className="w-3 h-3" />
                           <span>CHECKOUT</span>
                        </div>
                        <h2 className="text-xl md:text-2xl font-black text-white tracking-tighter mb-2 italic uppercase leading-none">{selectedProduct.name}</h2>
                        <p className="text-gray-500 font-medium text-[10px] leading-relaxed mb-6">Confirmar transferência de protocolo.</p>
                        
                        <div className="bg-black/50 border border-border p-5 rounded-[1.5rem] mb-6 flex justify-between items-center group overflow-hidden relative">
                           <div className="relative z-10">
                              <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest block mb-0.5">VALOR</span>
                              <span className="text-2xl font-black text-white tracking-tighter italic">R$ {selectedProduct.price.toFixed(2)}</span>
                           </div>
                           <div className="text-right relative z-10">
                              <span className="text-[8px] font-black text-primary uppercase tracking-widest block mb-0.5">LICENÇA</span>
                              <span className="text-[8px] text-white font-black uppercase tracking-widest">ETERNAL</span>
                           </div>
                           <div className="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:scale-110 transition-transform">
                              <CreditCard className="w-32 h-32 text-primary" />
                           </div>
                        </div>

                        <button 
                          onClick={completePurchase}
                          disabled={loading}
                          className="w-full bg-primary text-black py-4 rounded-xl font-black text-[9px] tracking-[0.2em] hover:bg-white transition-all transform active:scale-95 disabled:opacity-50 uppercase shadow-2xl"
                        >
                           {loading ? 'SINCRONIZANDO...' : 'EXECUTAR TRANSAÇÃO'}
                        </button>
                        <p className="text-center mt-4 text-[7px] text-gray-700 font-black uppercase tracking-[0.3em]">Ambiente Seguro • Digital Asset Protocol</p>
                     </>
                   ) : (
                     <div className="text-center">
                        <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-8 border border-primary/20">
                           <CheckCircle className="w-12 h-12 animate-pulse" />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter mb-4 italic uppercase leading-none">SUCESSO</h2>
                        <p className="text-gray-500 font-medium text-[11px] mb-12 max-w-xs mx-auto">Protocolo transferido. O ativo já está instanciado em sua biblioteca pessoal.</p>
                        
                        <div className="flex flex-col space-y-4">
                           <a 
                             href={selectedProduct.fileUrl} 
                             target="_blank"
                             className="w-full bg-white text-black py-5 rounded-2xl font-black text-[10px] tracking-widest uppercase hover:bg-primary transition-all"
                           >
                             EXTRAIR ARQUIVOS
                           </a>
                           <Link 
                             to="/library" 
                             className="w-full border border-border text-gray-500 py-5 rounded-2xl font-black text-[10px] tracking-widest hover:text-white hover:border-white transition-all uppercase"
                           >
                             ACESSAR BIBLIOTECA
                           </Link>
                        </div>
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
