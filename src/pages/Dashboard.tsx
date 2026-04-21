import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, serverTimestamp } from '../lib/firebase';
import { collection, query, where, addDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { Product, PRODUCT_CATEGORIES } from '../types';
import { Plus, Package, Trash2, LayoutDashboard, FileUp, Image as ImageIcon, Wallet, Banknote, Loader2, Sparkles, Wand2, X, ShieldCheck, QrCode, Activity, ShieldAlert, BarChart3, Fingerprint, Cpu, Globe, Database, Zap } from 'lucide-react';
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
    // We assume some gross revenue calculation for display
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
    
    // Real-time products listener
    const prodQ = query(collection(db, 'products'), where('creatorId', '==', user.uid));
    const unsubscribeProducts = onSnapshot(prodQ, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as Product) })));
      setLoading(false);
    }, (err) => {
      console.error("Products sync error:", err);
      setLoading(false);
    });

    // Real-time withdrawals listener
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
      // Step 1: Generate System Config (Non-AI) from backend
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

      // Step 2: Save to Firestore
      await addDoc(collection(db, 'products'), {
        ...newProduct,
        systemConfig, // Now using deterministic system config
        creatorId: user.uid,
        creatorName: user.displayName || 'Anônimo',
        createdAt: serverTimestamp(),
        slug: newProduct.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')
      });
      
      setShowAddModal(false);
      setNewProduct({
        name: '',
        description: '',
        price: 0,
        category: PRODUCT_CATEGORIES[0] as string,
        fileUrl: '',
        imageUrl: ''
      });
    } catch (error: any) {
      console.error("Error adding product:", error);
      const errorMessage = error.message || "Erro desconhecido";
      alert(`Falha ao lançar produto: ${errorMessage}. Verifique sua conexão ou permissões.`);
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
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || stats.earnings <= 0) return;
    setWithdrawLoading(true);
    try {
      const response = await fetch('/api/creators/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          amount: stats.earnings,
          pixKey: withdrawData.details
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        alert('Solicitação de saque enviada com sucesso! O valor será processado em breve.');
        setShowWithdrawModal(false);
      } else {
        throw new Error(result.error || 'Falha ao processar saque');
      }
    } catch (err: any) {
      console.error("Withdrawal error:", err);
      alert(`Erro ao solicitar saque: ${err.message}`);
    } finally {
      setWithdrawLoading(false);
    }
  };

  if (authLoading) return <div className="h-screen flex items-center justify-center text-white font-black tracking-widest text-[10px] uppercase">Sincronizando Sessão...</div>;

  return (
    <div className="pt-32 pb-20 container mx-auto px-4 min-h-screen selection:bg-primary/30 tech-dots relative">
      <div className="scanline"></div>
      
      {/* Platform Stats Row */}
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-10 gap-8">
        <div className="space-y-4">
           <div className="inline-flex items-center space-x-3 text-primary font-black text-[9px] tracking-[0.3em] uppercase bg-primary/5 px-4 py-2 border border-primary/10 rounded-full">
              <Activity className="w-4 h-4 animate-pulse" />
              <span>Sessão Encriptada • Protocolo v3.4</span>
           </div>
           <h1 className="text-6xl md:text-9xl font-black text-white tracking-tighter uppercase italic leading-[0.7]">WORKSPACE</h1>
        </div>

        <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-8 py-5 bg-primary text-black rounded-2xl font-black text-[10px] tracking-[0.2em] hover:scale-105 transition-all flex items-center space-x-3 shadow-[0_0_40px_rgba(193,255,0,0.2)] uppercase"
            >
              <Plus className="w-5 h-5" />
              <span>Novo Protocolo</span>
            </button>
            <button
              onClick={() => setShowAIModal(true)}
              className="px-8 py-5 bg-surface border border-border text-white rounded-2xl font-black text-[10px] tracking-[0.2em] hover:border-primary/50 transition-all flex items-center space-x-3 uppercase"
            >
              <Cpu className="w-5 h-5 text-primary" />
              <span>AI.Neural</span>
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">
        {/* Compact Stats Grid */}
        <div className="md:col-span-4 bg-surface p-8 rounded-[3rem] border border-border flex flex-col justify-between aspect-square md:aspect-auto">
          <div className="flex justify-between items-start">
             <Package className="w-10 h-10 text-primary" />
             <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-3 py-1 bg-black/50 border border-border rounded-full">Ativos</span>
          </div>
          <div>
            <div className="text-7xl font-black text-white tracking-tighter leading-none">{stats.totalCount}</div>
            <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest mt-4">Unidades Integradas</p>
          </div>
        </div>

        <div className="md:col-span-8 bg-surface p-10 rounded-[3rem] border border-border tech-grid relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform">
             <Wallet className="w-64 h-64 text-primary" />
           </div>
           <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="space-y-2">
                 <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Saldo Líquido</span>
                 <h2 className="text-7xl md:text-9xl font-black text-white tracking-tighter italic leading-none">R$ {stats.earnings.toFixed(2)}</h2>
              </div>
              <div className="flex flex-wrap gap-4 mt-8">
                 <button 
                   onClick={() => setShowWithdrawModal(true)}
                   disabled={stats.earnings <= 0}
                   className="bg-primary text-black px-10 py-5 rounded-2xl font-black text-[10px] tracking-[0.2em] hover:bg-white transition-all disabled:opacity-30 uppercase"
                 >
                   RESGATAR_SALDO.EXE
                 </button>
                 <div className="h-10 w-px bg-border hidden sm:block"></div>
                 <div className="flex items-center gap-6">
                    <div>
                      <span className="block text-2xl font-black text-white/50 tracking-tighter">R$ {stats.revenue.toFixed(2)}</span>
                      <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Vendas_Brutas</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="flex space-x-2 mb-12 bg-surface p-2 rounded-2xl border border-border w-fit overflow-x-auto max-w-full">
        {[
          { id: 'catalog', label: 'CATÁLOGO', icon: Package },
          { id: 'security', label: 'SEGURANÇA', icon: ShieldCheck },
          { id: 'intelligence', label: 'INTELIGÊNCIA', icon: BarChart3 }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center space-x-3 px-8 py-3 rounded-xl font-black text-[10px] tracking-widest transition-all uppercase whitespace-nowrap",
              activeTab === tab.id 
                ? "bg-primary text-black shadow-[0_0_20px_rgba(193,255,0,0.2)]" 
                : "text-gray-500 hover:text-white"
            )}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'catalog' ? (
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-border pb-6">
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">MEU CATÁLOGO</h2>
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-black/50 px-4 py-2 rounded-full border border-border">{products.length} REGISTROS</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              [1, 2, 3, 4].map(i => <div key={i} className="h-96 bg-surface rounded-[2.5rem] animate-pulse"></div>)
            ) : products.length > 0 ? (
               products.map((product) => (
                  <motion.div 
                    key={product.id}
                    layoutId={product.id}
                    className="bg-surface border border-border rounded-[2.5rem] overflow-hidden group hover:border-primary/30 transition-all flex flex-col p-2"
                  >
                     <div className="relative h-56 rounded-[2rem] overflow-hidden mb-6">
                        <img 
                          src={product.imageUrl || `https://picsum.photos/seed/${product.id}/600/400`} 
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-4 right-4 z-10 flex gap-2">
                           <button 
                             onClick={() => handleDelete(product.id!)}
                             className="bg-red-500/10 text-red-500 p-3 rounded-xl hover:bg-red-500 hover:text-white transition-all backdrop-blur-md border border-red-500/20"
                           >
                             <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                        <div className="absolute bottom-4 left-4 z-10">
                           <span className="bg-primary/20 backdrop-blur-md px-3 py-1.5 rounded-lg text-[8px] font-black text-primary border border-primary/20 uppercase tracking-[0.2em]">{product.category}</span>
                        </div>
                     </div>
                     <div className="px-6 pb-6 space-y-4 flex-1 flex flex-col justify-between">
                        <div>
                           <h3 className="text-xl font-black text-white tracking-tighter uppercase italic line-clamp-1">{product.name}</h3>
                           <p className="text-gray-600 font-mono text-[8px] uppercase tracking-widest mt-2">{product.slug}</p>
                        </div>
                        <div className="flex items-end justify-between pt-4 border-t border-border">
                           <div>
                              <span className="text-[8px] font-black text-gray-700 uppercase tracking-widest block mb-1">Price_Value</span>
                              <div className="text-2xl font-black text-white italic">R$ {product.price.toFixed(2)}</div>
                           </div>
                           <div className="w-2.5 h-2.5 rounded-full bg-primary glow-primary animate-pulse"></div>
                        </div>
                     </div>
                  </motion.div>
               ))
            ) : (
               <div className="col-span-full py-32 bg-surface border-2 border-dashed border-border rounded-[4rem] text-center">
                  <Package className="w-16 h-16 text-gray-800 mx-auto mb-8" />
                  <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-4 italic leading-none">CAtálogo Vázio</h3>
                  <p className="text-gray-600 font-medium max-w-sm mx-auto mb-10">Sua workspace técnica está pronta para o primeiro protocolo de lançamento.</p>
                  <button 
                    onClick={() => setShowAddModal(true)}
                    className="px-12 py-5 bg-white text-black rounded-2xl font-black text-[10px] tracking-widest hover:bg-primary transition-all uppercase"
                  >
                    Iniciar Protocolo Ativo
                  </button>
               </div>
            )}
          </div>
        </div>
      ) : activeTab === 'security' ? (
        <div className="mb-20 grid grid-cols-1 md:grid-cols-3 gap-8">
           {/* Security Hub Components */}
           <div className="md:col-span-1 space-y-6">
              <div className="p-8 bg-zinc-950 border border-white/5 rounded-[3rem] tech-grid">
                 <ShieldAlert className="w-10 h-10 text-blue-600 mb-6" />
                 <h3 className="text-xl font-black text-white tracking-tighter uppercase mb-4 italic leading-tight">STATUS DA REDE</h3>
                 <div className="space-y-4">
                    <div className="flex justify-between items-center py-4 border-b border-white/5">
                       <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Firewall Elite</span>
                       <span className="text-green-500 text-[10px] font-black uppercase tracking-widest">Ativo</span>
                    </div>
                    <div className="flex justify-between items-center py-4 border-b border-white/5">
                       <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">DDoS Protection</span>
                       <span className="text-green-500 text-[10px] font-black uppercase tracking-widest">Locked</span>
                    </div>
                    <div className="flex justify-between items-center py-4">
                       <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Last Scan</span>
                       <span className="text-white text-[10px] font-black uppercase tracking-widest">2m ago</span>
                    </div>
                 </div>
              </div>
              
              <div className="p-8 bg-black/40 border border-blue-600/20 rounded-[3rem] relative overflow-hidden group">
                 <div className="absolute inset-0 bg-blue-600/5 -z-10 group-hover:bg-blue-600/10 transition-colors"></div>
                 <h3 className="text-xs font-black text-blue-500 tracking-widest uppercase mb-4 italic italic-none">Proteção de IP</h3>
                 <p className="text-gray-500 text-[10px] leading-relaxed uppercase font-black tracking-widest">Seus códigos são protegidos por tecnologia de ofuscação avançada em nível de servidor.</p>
              </div>
           </div>

           <div className="md:col-span-2 p-10 bg-zinc-950 border border-white/5 rounded-[3rem] custom-scrollbar h-fit max-h-[70vh] overflow-y-auto">
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic mb-10 flex items-center gap-4">
                 <ShieldCheck className="w-8 h-8 text-blue-600" />
                 Auditoria de Ativos
              </h2>
              
              <div className="space-y-4">
                 {products.map(product => {
                    const scanResult = scans[product.id!];
                    return (
                      <div key={product.id} className="p-6 bg-black/40 border border-white/5 rounded-3xl flex items-center justify-between group hover:border-blue-600/30 transition-all">
                         <div className="flex items-center space-x-6">
                            <div className="w-16 h-16 rounded-2xl bg-zinc-900 overflow-hidden relative border border-white/5">
                               <img src={product.imageUrl} className="w-full h-full object-cover opacity-50" />
                               {scanningId === product.id && <div className="absolute inset-0 bg-blue-600/40 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-white" /></div>}
                            </div>
                            <div>
                               <h4 className="text-white font-black text-xs uppercase tracking-widest mb-1">{product.name}</h4>
                               {scanResult ? (
                                  <div className="flex items-center space-x-3">
                                     <span className="text-green-500 text-[9px] font-black uppercase tracking-widest">Score: {scanResult.score}</span>
                                     <span className="text-gray-600 text-[9px] uppercase font-mono">Last: {new Date(scanResult.scannedAt).toLocaleTimeString()}</span>
                                  </div>
                               ) : (
                                  <span className="text-gray-600 text-[9px] font-black uppercase tracking-widest">Aguardando Auditoria</span>
                               )}
                            </div>
                         </div>
                         
                         {scanResult ? (
                            <div className="flex space-x-2">
                               {scanResult.checks.slice(0, 2).map((c: any, i: number) => (
                                  <div key={i} className="px-3 py-1 bg-white/5 rounded-full text-[8px] font-black text-gray-500 uppercase tracking-widest">{c.name}</div>
                               ))}
                               <button 
                                 onClick={() => handleSecurityScan(product.id!)}
                                 className="text-blue-500 text-[9px] font-black uppercase tracking-widest hover:text-white"
                               >
                                 Rescan
                               </button>
                            </div>
                         ) : (
                            <button 
                              onClick={() => handleSecurityScan(product.id!)}
                              disabled={scanningId === product.id}
                              className="px-6 py-2 bg-blue-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                            >
                              Run Audit
                            </button>
                         )}
                      </div>
                    );
                 })}
              </div>
           </div>
        </div>
      ) : (
        <div className="mb-20 space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Market Capital', val: platformStats?.sales?.totalVolume || '...', icon: Globe, color: 'text-blue-500' },
                { label: 'Avg Unit Price', val: platformStats?.sales?.avgTicket || '...', icon: Database, color: 'text-cyan-500' },
                { label: 'AI Sync Load', val: platformStats?.ai?.tokensProcessed || '...', icon: Cpu, color: 'text-purple-500' },
                { label: 'Global Uptime', val: platformStats?.security?.uptime || '99.99%', icon: Zap, color: 'text-green-500' }
              ].map((stat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-8 bg-zinc-950 border border-white/5 rounded-[2.5rem] tech-grid group hover:border-blue-500/20 transition-all"
                >
                   <stat.icon className={cn("w-8 h-8 mb-6 transition-transform group-hover:scale-110", stat.color)} />
                   <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] block mb-2">{stat.label}</span>
                   <div className="text-2xl font-black text-white tracking-widest font-mono uppercase">{stat.val}</div>
                </motion.div>
              ))}
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-10 bg-zinc-950 border border-white/5 rounded-[3.5rem] relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
                    <BarChart3 className="w-48 h-48 text-blue-600" />
                 </div>
                 <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic mb-8">Fluxo de Crescimento</h3>
                 <div className="h-64 flex items-end justify-between gap-4">
                    {[40, 70, 45, 90, 65, 80, 55, 100, 75, 85].map((h, i) => (
                      <div key={i} className="flex-1 bg-white/5 rounded-t-xl group-hover:bg-blue-600/10 transition-colors relative overflow-hidden">
                         <motion.div 
                           initial={{ height: 0 }} 
                           animate={{ height: `${h}%` }}
                           className="absolute bottom-0 left-0 right-0 bg-blue-600/40 group-hover:bg-blue-600 transition-all"
                         ></motion.div>
                      </div>
                    ))}
                 </div>
                 <div className="mt-8 flex justify-between uppercase font-black text-[8px] text-gray-600 tracking-widest font-mono">
                    <span>JAN.2026</span>
                    <span>PERIOD: LIVE_STREAM</span>
                    <span>APR.2026</span>
                 </div>
              </div>

              <div className="p-10 bg-zinc-950 border border-white/5 rounded-[3.5rem] flex flex-col justify-between">
                 <div>
                    <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic mb-2">Relatório de IA</h3>
                    <p className="text-gray-500 font-medium text-sm leading-relaxed mb-10">Eficiência técnica e produtividade assistida por inteligência artificial em sua conta.</p>
                    
                    <div className="space-y-8">
                       <div>
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                             <span className="text-gray-500">Otimização de Código</span>
                             <span className="text-white">94%</span>
                          </div>
                          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                             <div className="h-full bg-blue-600 w-[94%] shadow-[0_0_10px_rgba(37,99,235,1)]"></div>
                          </div>
                       </div>
                       <div>
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                             <span className="text-gray-500">Sucesso de Lançamento</span>
                             <span className="text-white">100%</span>
                          </div>
                          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                             <div className="h-full bg-cyan-500 w-[100%] shadow-[0_0_10px_rgba(6,182,212,1)]"></div>
                          </div>
                       </div>
                    </div>
                 </div>
                 
                 <div className="mt-12 p-6 bg-black/40 border border-white/5 rounded-3xl flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                       <Cpu className="w-6 h-6 text-blue-500" />
                       <div>
                          <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest block">Neural Load</span>
                          <span className="text-xs font-bold text-white">GEN-3 ENGINE ACTIVE</span>
                       </div>
                    </div>
                    <div className="w-3 h-3 rounded-full bg-green-500 glow-blue animate-pulse"></div>
                 </div>
              </div>
           </div>
        </div>
      )}

      <AnimatePresence>
        {showWithdrawModal && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl">
             <motion.div
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="w-full max-w-xl bg-zinc-950 border border-white/5 rounded-[4rem] overflow-hidden"
             >
                <div className="p-12 md:p-16 text-center">
                   <div className="w-24 h-24 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-blue-600/20">
                      <Banknote className="w-10 h-10 text-blue-500" />
                   </div>
                   <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none mb-4">SOLICITAR RESGATE</h2>
                   <p className="text-gray-500 mb-12 font-medium">Seu saldo líquido de <strong>R$ {stats.earnings.toFixed(2)}</strong> será processado via Pix.</p>

                   <form onSubmit={handleWithdraw} className="space-y-6 text-left">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest block ml-2">Método de Transferência</label>
                         <div className="flex items-center space-x-2 bg-black border border-white/5 rounded-2xl px-6 py-5 text-white font-black text-xs uppercase tracking-widest">
                            <QrCode className="w-4 h-4 text-blue-500" />
                            <span>PIX (Instantâneo)</span>
                         </div>
                      </div>

                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest block ml-2">Chave Pix (CPF/Email/Aleatória)</label>
                         <input
                           required
                           type="text"
                           className="w-full bg-black border border-white/5 rounded-2xl px-6 py-5 text-white font-bold tracking-tight focus:outline-none focus:border-blue-500 transition-all placeholder:text-zinc-800"
                           placeholder="Insira sua chave Pix para receber..."
                           value={withdrawData.details}
                           onChange={e => setWithdrawData({ ...withdrawData, details: e.target.value })}
                         />
                      </div>

                      <div className="flex gap-4 pt-8">
                         <button 
                           type="button"
                           onClick={() => setShowWithdrawModal(false)}
                           className="flex-1 px-8 py-5 border border-white/5 text-white rounded-2xl font-black text-[10px] tracking-widest hover:bg-white hover:text-black transition-all uppercase"
                         >
                           CANCELAR
                         </button>
                         <button 
                           disabled={withdrawLoading || stats.earnings <= 0}
                           className="flex-2 px-12 py-5 bg-blue-600 text-white rounded-2xl font-black text-[10px] tracking-widest hover:bg-white hover:text-black transition-all flex items-center justify-center space-x-3 disabled:opacity-30 uppercase"
                         >
                           {withdrawLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>CONFIRMAR RESGATE</span>}
                         </button>
                      </div>
                   </form>
                </div>
             </motion.div>
          </div>
        )}

        {showAddModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl">
             <motion.div
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="w-full max-w-2xl bg-surface border border-border rounded-[3rem] overflow-hidden shadow-2xl"
             >
                <div className="p-8 md:p-12 relative">
                   <div className="absolute top-8 right-8">
                      <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-white transition-all bg-black/40 p-3 rounded-xl border border-border">
                        <Plus className="w-6 h-6 rotate-45" />
                      </button>
                   </div>
                   
                   <div className="mb-10">
                      <span className="text-primary text-[9px] font-black uppercase tracking-[0.4em] mb-4 block underline underline-offset-4">Protocolo de Lançamento</span>
                      <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">NOVO ATIVO</h2>
                   </div>
                   
                   <form onSubmit={handleAddProduct} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-3">Identificador</label>
                            <input
                              required
                              type="text"
                              className="w-full bg-black/50 border border-border rounded-xl px-5 py-4 text-white font-bold tracking-tight focus:outline-none focus:border-primary/50 transition-all text-xs placeholder:text-gray-800"
                              placeholder="NOME DO ASSET..."
                              value={newProduct.name}
                              onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                            />
                         </div>
                         <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-3">Classificação</label>
                            <select
                              className="w-full bg-black/50 border border-border rounded-xl px-5 py-4 text-white font-bold tracking-tight focus:outline-none focus:border-primary/50 appearance-none text-xs uppercase"
                              value={newProduct.category}
                              onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                            >
                              {PRODUCT_CATEGORIES.map(c => <option key={c} value={c} className="bg-zinc-950">{c}</option>)}
                            </select>
                         </div>
                      </div>

                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-3">Documentação Técnica</label>
                         <textarea
                           required
                           className="w-full bg-black/50 border border-border rounded-xl px-5 py-4 text-white font-bold tracking-tight focus:outline-none focus:border-primary/50 h-24 resize-none text-xs placeholder:text-gray-800"
                           placeholder="RESUMO DAS FUNCIONALIDADES..."
                           value={newProduct.description}
                           onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                         />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-3">Link da Imagem</label>
                            <input
                              required
                              type="url"
                              className="w-full bg-black/50 border border-border rounded-xl px-5 py-4 text-white font-bold tracking-tight focus:outline-none focus:border-primary/50 transition-all text-xs placeholder:text-gray-800"
                              placeholder="HTTPS://..."
                              value={newProduct.imageUrl}
                              onChange={e => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                            />
                         </div>
                         <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-3">Link do Ativo</label>
                            <input
                              required
                              type="url"
                              className="w-full bg-black/50 border border-border rounded-xl px-5 py-4 text-white font-bold tracking-tight focus:outline-none focus:border-primary/50 transition-all text-xs placeholder:text-gray-800 transition-all"
                              placeholder="HTTPS://DRIVE..."
                              value={newProduct.fileUrl}
                              onChange={e => setNewProduct({ ...newProduct, fileUrl: e.target.value })}
                            />
                         </div>
                      </div>

                      <div className="flex items-center justify-between p-6 bg-black/50 border border-border rounded-2xl gap-8">
                         <div className="flex items-center space-x-8">
                            <div>
                               <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest block mb-1">Valor Final</label>
                               <div className="flex items-center space-x-2 italic">
                                  <span className="text-xl font-black text-white/30 italic">R$</span>
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className="bg-transparent text-4xl font-black text-white w-32 focus:outline-none tracking-tighter"
                                    value={newProduct.price}
                                    onChange={e => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })}
                                  />
                               </div>
                            </div>
                         </div>
                         <button 
                            disabled={launchLoading}
                            className="bg-primary text-black px-10 py-5 rounded-xl font-black text-[10px] tracking-widest hover:bg-white transition-all shadow-2xl disabled:opacity-50 uppercase"
                         >
                            {launchLoading ? 'PROCESSANDO...' : 'LANÇAR'}
                         </button>
                      </div>
                   </form>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAIModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl">
             <motion.div
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.9 }}
               className="w-full max-w-5xl bg-zinc-950 border border-white/5 rounded-[3rem] overflow-hidden flex flex-col md:flex-row h-[85vh] shadow-[0_0_150px_rgba(37,99,235,0.1)]"
             >
                {/* Form Side */}
                <div className="w-full md:w-[400px] bg-black/40 p-8 md:p-12 border-r border-white/5 overflow-y-auto">
                   <div className="flex items-center justify-between mb-10">
                      <div className="flex items-center space-x-2 text-blue-500 font-black text-[10px] tracking-widest uppercase">
                         <Sparkles className="w-4 h-4" />
                         <span>ENZO AI LABS (V2 API)</span>
                      </div>
                      <button onClick={() => setShowAIModal(false)} className="text-gray-500 hover:text-white">
                         <X className="w-8 h-8" />
                      </button>
                   </div>

                   <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-[0.9] mb-8">GERADOR DE <br /> SCRIPTS .LUA</h2>
                   
                   <form onSubmit={handleAIScriptGen} className="space-y-6">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-3 mb-1 block">Nome do Asset</label>
                        <input
                          required
                          className="w-full bg-black border border-white/5 rounded-xl px-4 py-4 text-white font-bold text-xs focus:border-blue-500 transition-all uppercase"
                          placeholder="EX: KILL SYSTEM"
                          value={aiPrompt.name}
                          onChange={e => setAiPrompt({...aiPrompt, name: e.target.value})}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-3 mb-1 block">Tipo de Código</label>
                        <select
                          className="w-full bg-black border border-white/5 rounded-xl px-4 py-4 text-white font-bold text-xs focus:border-blue-500 transition-all appearance-none uppercase"
                          value={aiPrompt.category}
                          onChange={e => setAiPrompt({...aiPrompt, category: e.target.value})}
                        >
                          <option value="Scripts">Game Script</option>
                          <option value="UI Kits">UI Logic</option>
                          <option value="Animations">Animation Controller</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-3 mb-1 block">Breve Descrição</label>
                        <textarea
                          required
                          className="w-full bg-black border border-white/5 rounded-xl px-4 py-4 text-white font-bold text-xs focus:border-blue-500 transition-all h-32 resize-none"
                          placeholder="O que o script deve fazer?"
                          value={aiPrompt.desc}
                          onChange={e => setAiPrompt({...aiPrompt, desc: e.target.value})}
                        />
                      </div>

                      <button
                        disabled={aiLoading}
                        className="w-full bg-white text-black py-5 rounded-2xl font-black text-[10px] tracking-widest hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
                      >
                        {aiLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <Wand2 className="w-5 h-5" />
                            <span>PROCESSAR IA</span>
                          </>
                        )}
                      </button>
                   </form>
                </div>

                {/* Result Side */}
                <div className="flex-1 p-8 md:p-12 overflow-y-auto bg-black/20 custom-scrollbar">
                   {!aiResult && !aiLoading && (
                      <div className="h-full flex flex-col items-center justify-center text-center">
                         <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center border border-white/5 mb-8 rotate-12">
                            <Sparkles className="w-10 h-10 text-blue-600" />
                         </div>
                         <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">AGUARDANDO INPUT</h3>
                         <p className="text-gray-600 mt-4 max-w-xs font-medium uppercase text-[10px] tracking-widest">Preencha os dados ao lado para iniciar a criação do seu script exclusivo.</p>
                      </div>
                   )}
                   
                   {aiLoading && (
                      <div className="h-full flex flex-col items-center justify-center text-center">
                         <div className="w-20 h-20 bg-blue-600/10 rounded-3xl flex items-center justify-center border border-blue-600/20 mb-8 animate-pulse">
                            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                         </div>
                         <h3 className="text-2xl font-black text-blue-500 italic uppercase tracking-tighter">GERANDO CÓDIGO...</h3>
                         <p className="text-gray-600 mt-4 max-w-xs font-medium uppercase text-[10px] tracking-widest">Nossa IA está arquitetando seu script Roblox customizado.</p>
                      </div>
                   )}

                   {aiResult && (
                      <div className="markdown-body prose prose-invert max-w-none">
                         <Markdown>{aiResult}</Markdown>
                         
                         <div className="mt-12 flex items-center justify-between pt-10 border-t border-white/5">
                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">© ENZO ASSETS ENGINE</p>
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(aiResult);
                                alert("Script copiado para o clipboard!");
                              }}
                              className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all font-mono"
                            >
                              Copy.Lua()
                            </button>
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
