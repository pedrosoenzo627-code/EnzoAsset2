import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc, setDoc, collection, query, getDocs } from 'firebase/firestore';
import { CreatorApplication, UserProfile, Withdrawal } from '../types';
import { ShieldCheck, UserCheck, UserX, Clock, Mail, ExternalLink, Gem, Gamepad2, Banknote, CheckCircle, XCircle, ListFilter, RefreshCcw, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

export const AdminPanel = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'applications' | 'withdrawals'>('applications');
  const [applications, setApplications] = useState<CreatorApplication[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || profile?.role !== 'admin')) {
      navigate('/');
    }
  }, [user, profile, authLoading]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'applications') {
        const q = query(collection(db, 'applications'));
        const querySnapshot = await getDocs(q);
        const apps = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as CreatorApplication)
        }));
        setApplications(apps);
      } else {
        const q = query(collection(db, 'withdrawals'));
        const querySnapshot = await getDocs(q);
        const draws = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Withdrawal)
        }));
        setWithdrawals(draws);
      }
    } catch (error) {
      console.error("Data synchronization error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.role === 'admin') fetchData();
  }, [profile, activeTab]);

  const handleApplicationAction = async (app: CreatorApplication, newStatus: 'approved' | 'rejected') => {
    if (!app.id) return;
    try {
      await updateDoc(doc(db, 'applications', app.id), {
        status: newStatus
      });
      if (newStatus === 'approved') {
        await updateDoc(doc(db, 'users', app.userId), {
          role: 'creator'
        });
      }
      fetchData();
    } catch (error) {
      console.error("Application resolution error:", error);
    }
  };

  const handleWithdrawAction = async (draw: Withdrawal, newStatus: 'completed' | 'rejected') => {
    if (!draw.id) return;
    try {
      await updateDoc(doc(db, 'withdrawals', draw.id), {
        status: newStatus
      });
      fetchData();
    } catch (error) {
      console.error("Withdrawal processing error:", error);
    }
  };

  if (authLoading) return <div className="h-screen flex items-center justify-center text-white font-black tracking-widest text-[10px] uppercase">Acessando Terminal Central...</div>;

  return (
    <div className="pt-32 pb-20 container mx-auto px-4 min-h-screen selection:bg-primary/30 tech-dots relative">
      <div className="scanline"></div>
      
      {/* Admin Header */}
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-10 gap-8 relative">
        <div className="space-y-4">
          <div className="inline-flex items-center space-x-3 text-primary font-black text-[9px] tracking-[0.4em] uppercase bg-primary/5 px-4 py-2 border border-primary/10 rounded-full">
             <ShieldCheck className="w-5 h-5" />
             <span>Acesso Nível 5 • Protocolo Root</span>
          </div>
          <h1 className="text-6xl md:text-9xl font-black text-white tracking-tighter uppercase italic leading-[0.7]">CENTRAL</h1>
          <p className="text-gray-500 font-mono text-[10px] uppercase tracking-widest leading-relaxed max-w-xl">Supervisão de recrutamento e auditoria de fluxos financeiros globais.</p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-5 bg-surface border border-border rounded-2xl text-gray-400 hover:text-primary transition-all flex items-center justify-center shrink-0"
          >
            <RefreshCcw className={cn("w-5 h-5", loading && "animate-spin")} />
          </button>
          <div className="flex-1 md:flex-none flex bg-surface p-1.5 rounded-2xl border border-border">
            <button
              onClick={() => setActiveTab('applications')}
              className={cn(
                "flex-1 px-6 py-4 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all",
                activeTab === 'applications' ? "bg-primary text-black" : "text-gray-500 hover:text-white"
              )}
            >
              Recrutas
            </button>
            <button
              onClick={() => setActiveTab('withdrawals')}
              className={cn(
                "flex-1 px-6 py-4 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all",
                activeTab === 'withdrawals' ? "bg-primary text-black" : "text-gray-500 hover:text-white"
              )}
            >
              Auditoria
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="space-y-6">
             {[1, 2, 3].map(i => <div key={i} className="h-64 bg-surface rounded-[3rem] animate-pulse border border-border"></div>)}
          </div>
        ) : activeTab === 'applications' ? (
          applications.length > 0 ? (
            applications.map((app) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-surface border border-border p-8 md:p-12 rounded-[3.5rem] flex flex-col xl:flex-row justify-between gap-10 group hover:border-primary/20 transition-all tech-grid"
              >
                <div className="flex-1 space-y-8">
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="bg-black p-5 rounded-2xl border border-border w-fit">
                      <Mail className="w-8 h-8 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-3xl font-black text-white tracking-tighter italic uppercase break-all">{app.userEmail}</h3>
                      <div className="flex flex-wrap items-center gap-4">
                        <span className="text-[9px] text-gray-600 font-mono uppercase tracking-widest">UID_TOKEN: {app.userId.slice(0, 16)}</span>
                        <div className={cn(
                          "px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border",
                          app.status === 'pending' ? "bg-primary/10 border-primary/30 text-primary" :
                          app.status === 'approved' ? "bg-green-500/10 border-green-500/30 text-green-500" :
                          "bg-red-500/10 border-red-500/30 text-red-500"
                        )}>
                          {app.status}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pt-8 border-t border-border">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest block mb-2">Portfolio_Link</span>
                      <a href={app.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary font-black text-[11px] flex items-center space-x-2 transition-colors uppercase">
                        <span>Acessar Workspace</span> <ExternalLink className="w-3.5 h-3.5 text-primary" />
                      </a>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest block mb-2">Project_Report</span>
                      <a href={(app as any).gameLink} target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary font-black text-[11px] flex items-center space-x-2 transition-colors uppercase">
                        <span>Ver Ativo Primário</span> <Gamepad2 className="w-3.5 h-3.5 text-primary" />
                      </a>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest block mb-2">Discord_ID</span>
                      <p className="text-white font-black text-[11px] uppercase tracking-tight italic">{(app as any).discordTag || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-black/50 p-6 rounded-2xl border border-border">
                      <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest block mb-3">Histórico Técnico</span>
                      <p className="text-gray-500 text-xs leading-relaxed font-medium uppercase font-black text-[10px] tracking-widest italic opacity-60 line-clamp-3">"{app.experience}"</p>
                    </div>
                    <div className="bg-black/50 p-6 rounded-2xl border border-border">
                      <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest block mb-3">Manifesto Operacional</span>
                      <p className="text-gray-500 text-xs leading-relaxed font-medium uppercase font-black text-[10px] tracking-widest italic opacity-60 line-clamp-3">"{(app as any).whyUs || '...'}"</p>
                    </div>
                  </div>
                </div>

                {app.status === 'pending' && (
                  <div className="flex flex-col sm:row lg:flex-col gap-4 min-w-0 md:min-w-[200px] justify-center">
                    <button 
                      onClick={() => handleApplicationAction(app, 'approved')} 
                      className="w-full bg-primary text-black px-6 py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center space-x-3 hover:bg-white transition-all shadow-xl"
                    >
                      <UserCheck className="w-4 h-4" /> <span>Validar</span>
                    </button>
                    <button 
                      onClick={() => handleApplicationAction(app, 'rejected')} 
                      className="w-full bg-black/40 text-gray-600 px-6 py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] border border-border flex items-center justify-center space-x-3 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all"
                    >
                      <UserX className="w-4 h-4" /> <span>Recusar</span>
                    </button>
                  </div>
                )}
              </motion.div>
            ))
          ) : (
            <div className="py-40 text-center bg-surface/50 border border-border rounded-[4rem] tech-dots">
              <Clock className="w-16 h-16 text-gray-800 mx-auto mb-6" />
              <p className="text-gray-600 font-black uppercase tracking-[0.4em] text-[10px]">Pilha de Processamento Vázia</p>
            </div>
          )
        ) : (
          withdrawals.length > 0 ? (
            withdrawals.map((draw) => (
              <motion.div
                key={draw.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-surface border border-border p-8 md:p-12 rounded-[3.5rem] flex flex-col lg:flex-row justify-between gap-10 group hover:border-primary/20 transition-all tech-grid"
              >
                <div className="flex-1 space-y-8">
                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    <div className="bg-black p-5 rounded-2xl border border-border w-fit">
                      <Banknote className="w-8 h-8 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-3xl font-black text-white tracking-tighter italic uppercase break-all">{draw.userEmail}</h3>
                      <div className="flex items-center gap-6 mt-1">
                        <span className="text-3xl font-black text-primary italic tracking-tighter">R$ {draw.amount.toFixed(2)}</span>
                        <div className={cn(
                          "px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border",
                          draw.status === 'pending' ? "bg-primary/10 border-primary/30 text-primary" :
                          draw.status === 'completed' ? "bg-green-500/10 border-green-500/30 text-green-500" :
                          "bg-red-500/10 border-red-500/30 text-red-500"
                        )}>
                          {draw.status}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8 border-t border-border">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest block mb-2">Protocolo de Liquidação</span>
                      <p className="text-white font-black text-xl italic uppercase font-mono">{draw.method}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest block mb-2">Data_Timestamp</span>
                      <p className="text-gray-500 font-black uppercase tracking-widest text-[10px]">
                         {draw.createdAt?.seconds 
                          ? new Date(draw.createdAt.seconds * 1000).toLocaleString() 
                          : 'REAL-TIME_STREAMING'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-black/50 p-8 rounded-2xl border border-border">
                    <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest block mb-4">CHAVE_PIX_TARGET</span>
                    <p className="text-xl text-white font-black font-mono break-all tracking-tight uppercase leading-none">{draw.details}</p>
                  </div>
                </div>

                {draw.status === 'pending' && (
                  <div className="flex flex-col sm:row lg:flex-col gap-4 min-w-0 md:min-w-[200px] justify-center">
                    <button
                      onClick={() => handleWithdrawAction(draw, 'completed')}
                      className="w-full bg-primary text-black px-8 py-6 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center space-x-3 hover:bg-white transition-all shadow-xl"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span>Liquidar</span>
                    </button>
                    <button
                      onClick={() => handleWithdrawAction(draw, 'rejected')}
                      className="w-full bg-black/40 text-gray-600 px-8 py-6 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] border border-border flex items-center justify-center space-x-3 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all"
                    >
                      <XCircle className="w-5 h-5" />
                      <span>Recusar</span>
                    </button>
                  </div>
                )}
              </motion.div>
            ))
          ) : (
            <div className="py-40 text-center bg-surface/50 border border-border rounded-[4rem] tech-dots">
              <Banknote className="w-16 h-16 text-gray-800 mx-auto mb-6" />
              <p className="text-gray-600 font-black uppercase tracking-[0.4em] text-[10px]">Cofre Global Consolidado</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};
