import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, serverTimestamp } from '../lib/firebase';
import { collection, query, where, addDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { Product, PRODUCT_CATEGORIES } from '../types';
import { Plus, Package, Trash2, LayoutDashboard, FileUp, Image as ImageIcon, Wallet, Banknote, Loader2, Sparkles, Wand2, X, ShieldCheck, QrCode, Activity, ShieldAlert, BarChart3, Fingerprint, Cpu, Globe, Database, Zap, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { generateRobloxScript } from '../services/geminiService';
import Markdown from 'react-markdown';
import { Logo } from '../components/Logo';

export const Dashboard = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawData, setWithdrawData] = useState({
    method: 'Pix',
    details: ''
  });

  // AI Script States
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState<{name: string, category: string, desc: string}>({ name: '', category: 'Scripts', desc: '' });
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [launchLoading, setLaunchLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'catalog' | 'security' | 'intelligence'>('catalog');
  const [platformStats, setPlatformStats] = useState<any>(null);
  const [scanningId, setScanningId] = useState<string | null>(null);
  const [scans, setScans] = useState<Record<string, any>>({});

  const stats = React.useMemo(() => {
    const totalCount = products.length;
    const totalListedValue = products.reduce((acc, p) => acc + p.price, 0);
    const balance = profile?.balance || 0;
    const totalSales = profile?.totalSales || 0;
    const grossRevenue = profile?.totalRevenue || (balance * 1.11); 

    return {
      totalCount,
      totalListedValue,
      revenue: grossRevenue,
      earnings: balance,
      totalSales
    };
  }, [products, profile]);

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    category: PRODUCT_CATEGORIES[0] as string,
    fileUrl: '',
    imageUrl: ''
  });

  useEffect(() => {
    if (!authLoading && (!user || (profile?.role !== 'creator' && profile?.role !== 'admin'))) {
      navigate('/creators');
    }
  }, [user, profile, authLoading]);

  useEffect(() => {
    if (!user) return;
    const prodQ = query(collection(db, 'products'), where('creatorId', '==', user.uid));
    const unsubscribeProducts = onSnapshot(prodQ, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as Product) })));
      setLoading(false);
    }, (err) => {
      console.error("Products sync error:", err);
      setLoading(false);
    });

    const drawQ = query(collection(db, 'withdrawals'), where('userId', '==', user.uid));
    const unsubscribeWithdrawals = onSnapshot(drawQ, (snapshot) => {
      setWithdrawals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeProducts();
      unsubscribeWithdrawals();
    };
  }, [user]);

  useEffect(() => {
    const fetchPlatformStats = async () => {
      try {
        const res = await fetch('/api/platform/stats');
        if (res.ok) setPlatformStats(await res.json());
      } catch (err) {
        console.error("Stats fetch error:", err);
      }
    };
    fetchPlatformStats();
  }, []);

  const handleSecurityScan = async (id: string) => {
    setScanningId(id);
    try {
      const res = await fetch('/api/security/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId: id })
      });
      if (res.ok) {
        const result = await res.json();
        setScans(prev => ({ ...prev, [id]: result }));
      }
    } catch (err) {
      console.error("Scan error:", err);
    } finally {
      setScanningId(null);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || launchLoading) return;
    setLaunchLoading(true);
    try {
      const configResponse = await fetch('/api/generate-product-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProduct.name,
          description: newProduct.description,
          category: newProduct.category,
          price: newProduct.price
        })
      });
      const systemConfig = configResponse.ok ? await configResponse.json() : null;
      await addDoc(collection(db, 'products'), {
        ...newProduct,
        systemConfig,
        creatorId: user.uid,
        creatorName: user.displayName || 'Anônimo',
        createdAt: serverTimestamp(),
        slug: newProduct.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')
      });
      setShowAddModal(false);
      setNewProduct({ name: '', description: '', price: 0, category: PRODUCT_CATEGORIES[0] as string, fileUrl: '', imageUrl: '' });
    } catch (error: any) {
      console.error("Error adding product:", error);
      alert(`Falha ao lançar produto: ${error.message}`);
    } finally {
      setLaunchLoading(false);
    }
  };

  const handleAIScriptGen = async (e: React.FormEvent) => {
    e.preventDefault();
    setAiLoading(true);
    setAiResult('');
    try {
      const script = await generateRobloxScript(aiPrompt.name, aiPrompt.category, aiPrompt.desc);
      setAiResult(script || 'Falha ao gerar script.');
    } catch (err) {
      console.error("AI Gen Error:", err);
      setAiResult("Erro técnico ao conectar com a rede neural.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Deseja realmente remover este produto?')) return;
    try { await deleteDoc(doc(db, 'products', id)); } catch (error) { console.error("Error deleting product:", error); }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || stats.earnings <= 0) return;
    setWithdrawLoading(true);
    try {
      const response = await fetch('/api/creators/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, amount: stats.earnings, pixKey: withdrawData.details })
      });
      const result = await response.json();
      if (response.ok) {
        alert('Solicitação de saque enviada com sucesso!');
        setShowWithdrawModal(false);
      } else { throw new Error(result.error); }
    } catch (err: any) { console.error("Withdrawal error:", err); alert(`Erro: ${err.message}`); } finally { setWithdrawLoading(false); }
  };

  if (authLoading) return <div className="h-screen bg-bg flex items-center justify-center text-white font-tech font-black tracking-[0.5em] uppercase">SYNC_DASH...</div>;

  return (
    <div className="pt-32 pb-20 container mx-auto px-4 min-h-screen selection:bg-primary/30 relative">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-quinary/5 blur-[100px] rounded-full"></div>
      </div>

      <div className="relative z-10">
        {/* Header Section */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between border-b border-white/5 pb-10 gap-8">
          <div className="space-y-6">
             <div className="inline-flex items-center space-x-4 bg-primary/5 text-primary border border-primary/20 px-6 py-2 rounded-full text-[10px] font-tech font-black uppercase tracking-[0.5em] glow-primary">
                <Activity className="w-4 h-4 animate-pulse" />
                <span>WORKSPACE_TERMINAL • HASH_v9.1</span>
             </div>
             <h1 className="text-6xl md:text-[8rem] font-display text-white tracking-tighter italic uppercase leading-[0.7]">CENTRAL</h1>
          </div>

          <div className="flex flex-wrap gap-6">
              <button
                onClick={() => setShowAddModal(true)}
                className="px-10 py-6 bg-white text-black rounded-[1rem] font-tech font-black text-[10px] tracking-[0.3em] hover:bg-primary transition-all flex items-center space-x-4 shadow-2xl uppercase"
              >
                <Plus className="w-5 h-5" />
                <span>FORJAR_ATIVO</span>
              </button>
              <button
                onClick={() => setShowAIModal(true)}
                className="px-10 py-6 glass-morphism border border-white/5 text-white rounded-[1rem] font-tech font-black text-[10px] tracking-[0.3em] hover:border-quinary/30 transition-all flex items-center space-x-4 uppercase"
              >
                <Cpu className="w-5 h-5 text-quinary glow-blue" />
                <span>NEURAL_SINC</span>
              </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-16">
          <div className="md:col-span-4 glass-morphism p-10 rounded-[2.5rem] border border-white/5 flex flex-col justify-between aspect-square md:aspect-auto tech-grid">
            <div className="flex justify-between items-start">
               <Package className="w-12 h-12 text-primary glow-primary" />
               <span className="text-[10px] font-tech font-black text-gray-700 uppercase tracking-widest px-4 py-2 border border-white/5 rounded-full">OBJ_HASH</span>
            </div>
            <div>
              <div className="text-8xl font-display font-black text-white tracking-tighter italic leading-none">{stats.totalCount}</div>
              <p className="text-gray-600 text-[10px] font-tech font-black uppercase tracking-[0.4em] mt-6">Protocolos Inteiros</p>
            </div>
          </div>

          <div className="md:col-span-8 glass-morphism p-12 rounded-[2.5rem] border border-white/5 relative overflow-hidden group tech-grid">
             <div className="absolute top-0 right-0 p-16 opacity-[0.03] group-hover:scale-110 transition-transform">
               <Wallet className="w-80 h-80 text-secondary" />
             </div>
             <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                   <span className="text-[10px] font-tech font-black text-gray-700 uppercase tracking-[0.5em] block mb-4">CRÉDITOS_SINC</span>
                   <h2 className="text-7xl md:text-[10rem] font-display font-black text-white tracking-tighter italic leading-none">R$ {stats.earnings.toFixed(2)}</h2>
                </div>
                <div className="flex flex-wrap items-center gap-8 mt-12">
                   <button 
                     onClick={() => setShowWithdrawModal(true)}
                     disabled={stats.earnings <= 0}
                     className="bg-secondary text-black px-12 py-6 rounded-[1rem] font-tech font-black text-[10px] tracking-[0.4em] hover:bg-white transition-all disabled:opacity-30 uppercase shadow-2xl"
                   >
                     EXEC_RESGATE_FIN
                   </button>
                   <div className="flex flex-col">
                      <span className="text-white/40 text-xl font-display italic tracking-tighter">R$ {stats.revenue.toFixed(2)} G_REV</span>
                      <span className="text-[8px] font-tech font-black text-gray-700 uppercase tracking-widest">Fluxo_Acumulado</span>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-3 mb-16 bg-white/[0.01] p-2 rounded-2xl border border-white/5 w-fit overflow-x-auto max-w-full">
          {[
            { id: 'catalog', label: 'CATÁLOGO', icon: Package, color: 'text-primary', activeColor: 'bg-primary' },
            { id: 'security', label: 'SEGURANÇA', icon: ShieldCheck, color: 'text-secondary', activeColor: 'bg-secondary' },
            { id: 'intelligence', label: 'MÉTRICAS', icon: BarChart3, color: 'text-tertiary', activeColor: 'bg-tertiary' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center space-x-4 px-10 py-4 rounded-xl font-tech font-black text-[10px] tracking-widest transition-all uppercase whitespace-nowrap",
                activeTab === tab.id 
                  ? `${tab.activeColor} text-black shadow-2xl` 
                  : "text-gray-600 hover:text-white"
              )}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'catalog' && (
          <div className="space-y-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
              {loading ? (
                [1, 2, 3, 4].map(i => <div key={i} className="h-[30rem] glass-morphism rounded-[2.5rem] animate-pulse"></div>)
              ) : products.map((product) => (
                <motion.div 
                  key={product.id}
                  layoutId={product.id}
                  className="glass-morphism border border-white/5 rounded-[2.5rem] overflow-hidden group hover:border-primary/40 transition-all flex flex-col p-4"
                >
                   <div className="hud-corner hud-corner-tl"></div>
                   <div className="hud-corner hud-corner-br"></div>
                   <div className="relative h-60 rounded-[1.8rem] overflow-hidden mb-8 border border-white/5 bg-black">
                      <img 
                        src={product.imageUrl || `https://picsum.photos/seed/${product.id}/600/400`} 
                        alt={product.name}
                        className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-[2s]"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-6 right-6 z-10">
                         <button 
                           onClick={() => handleDelete(product.id!)}
                           className="bg-septenary/10 text-septenary p-4 rounded-xl hover:bg-septenary hover:text-white transition-all border border-septenary/20"
                         >
                           <Trash2 className="w-5 h-5" />
                         </button>
                      </div>
                   </div>
                   <div className="px-6 pb-6 space-y-6 flex-1 flex flex-col justify-between">
                      <div>
                         <h3 className="text-3xl font-display text-white tracking-tighter uppercase italic leading-none truncate">{product.name}</h3>
                         <span className="text-[9px] font-tech font-black text-gray-700 uppercase tracking-[0.3em] mt-3 block">#{product.slug?.substring(0, 12)}</span>
                      </div>
                      <div className="flex items-end justify-between pt-8 border-t border-white/5">
                         <div>
                            <span className="text-[9px] font-tech font-black text-gray-800 uppercase tracking-widest block mb-1">VAL_HASH</span>
                            <div className="text-3xl font-display text-white italic">R$ {product.price.toFixed(2)}</div>
                         </div>
                         <div className="w-3 h-3 rounded-full bg-primary glow-primary"></div>
                      </div>
                   </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
        
        {/* Placeholder for other tabs during UI rewrite */}
        {(activeTab === 'security' || activeTab === 'intelligence') && (
           <div className="py-40 glass-morphism border border-white/5 rounded-[4rem] text-center tech-grid">
              <Cpu className="w-20 h-20 text-gray-800 mx-auto mb-10 opacity-20" />
              <h3 className="text-5xl font-display text-white tracking-tighter italic">Processando Dados</h3>
              <p className="text-gray-700 font-tech font-black text-[10px] tracking-[0.4em] uppercase mt-6 opacity-40">Módulo em fase de sincronização com o novo design poly-chrome.</p>
           </div>
        )}
      </div>

      {/* Add Product Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/98 backdrop-blur-3xl">
             <motion.div
               initial={{ opacity: 0, scale: 0.9, y: 30 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 30 }}
               className="w-full max-w-3xl glass-morphism border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl relative"
             >
                <div className="hud-corner hud-corner-tl"></div>
                <div className="hud-corner hud-corner-tr"></div>
                
                <div className="p-16 relative">
                   <div className="flex justify-between items-start mb-16">
                      <div className="space-y-4">
                         <span className="text-primary font-tech font-black text-[10px] tracking-[0.5em] block uppercase underline underline-offset-8">PROTOCOLO_FORJA_v9</span>
                         <h2 className="text-6xl font-display text-white tracking-tighter italic leading-none">NOVO ATIVO</h2>
                      </div>
                      <button onClick={() => setShowAddModal(false)} className="text-gray-700 hover:text-white transition-all bg-white/5 p-4 rounded-xl">
                        <X className="w-8 h-8" />
                      </button>
                   </div>
                   
                   <form onSubmit={handleAddProduct} className="space-y-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="space-y-3">
                            <label className="text-[10px] font-tech font-black text-gray-700 uppercase tracking-widest ml-4 block">ID_ATIBUTO</label>
                            <input
                              required
                              type="text"
                              className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-8 text-white font-tech font-bold focus:outline-none focus:border-primary/40 transition-all text-xs uppercase"
                              placeholder="NOME_PROTOCOLO..."
                              value={newProduct.name}
                              onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                            />
                         </div>
                         <div className="space-y-3">
                            <label className="text-[10px] font-tech font-black text-gray-700 uppercase tracking-widest ml-4 block">CAMADA_SEC</label>
                            <select
                              className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-8 text-white font-tech font-bold focus:outline-none focus:border-primary/40 appearance-none text-xs uppercase cursor-pointer"
                              value={newProduct.category}
                              onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                            >
                              {PRODUCT_CATEGORIES.map(c => <option key={c} value={c} className="bg-bg">{c}</option>)}
                            </select>
                         </div>
                      </div>

                      <div className="space-y-3">
                         <label className="text-[10px] font-tech font-black text-gray-700 uppercase tracking-widest ml-4 block">DESC_TÉCNICA</label>
                         <textarea
                           required
                           className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-8 text-white font-tech font-bold focus:outline-none focus:border-primary/40 h-32 resize-none text-xs uppercase"
                           placeholder="RESUMO_DATA_LAYER..."
                           value={newProduct.description}
                           onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                         />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="space-y-3">
                            <label className="text-[10px] font-tech font-black text-gray-700 uppercase tracking-widest ml-4 block">THUMB_URI</label>
                            <input
                              required
                              type="url"
                              className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-8 text-white font-tech font-bold focus:outline-none focus:border-primary/40 transition-all text-xs"
                              placeholder="HTTPS://..."
                              value={newProduct.imageUrl}
                              onChange={e => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                            />
                         </div>
                         <div className="space-y-3">
                            <label className="text-[10px] font-tech font-black text-gray-700 uppercase tracking-widest ml-4 block">SOURCE_URI</label>
                            <input
                              required
                              type="url"
                              className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-8 text-white font-tech font-bold focus:outline-none focus:border-primary/40 transition-all text-xs"
                              placeholder="HTTPS://DRIVE..."
                              value={newProduct.fileUrl}
                              onChange={e => setNewProduct({ ...newProduct, fileUrl: e.target.value })}
                            />
                         </div>
                      </div>

                      <div className="flex items-center justify-between p-8 bg-black/60 border border-white/5 rounded-[2rem] gap-10">
                         <div>
                            <label className="text-[9px] font-tech font-black text-gray-700 uppercase tracking-widest block mb-1">VALOR_DASH</label>
                            <div className="flex items-center space-x-3 italic">
                               <span className="text-2xl font-display text-white/30 italic">R$</span>
                               <input
                                 type="number"
                                 min="0"
                                 step="0.01"
                                 className="bg-transparent text-5xl font-display text-white w-40 focus:outline-none tracking-tighter"
                                 value={newProduct.price}
                                 onChange={e => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })}
                               />
                            </div>
                         </div>
                         <button 
                            disabled={launchLoading}
                            className="bg-white text-black px-16 py-8 rounded-[1.5rem] font-tech font-black text-[12px] tracking-[0.5em] hover:bg-primary transition-all shadow-2xl disabled:opacity-50 uppercase"
                         >
                            {launchLoading ? 'PROCESSANDO...' : 'EXECUTAR_FORJA'}
                         </button>
                      </div>
                   </form>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
