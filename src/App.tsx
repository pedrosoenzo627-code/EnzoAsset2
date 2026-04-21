import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Marketplace } from './pages/Marketplace';
import { CreatorApplicationForm } from './pages/CreatorApplicationForm';
import { Dashboard } from './pages/Dashboard';
import { AdminPanel } from './pages/AdminPanel';
import { MyLibrary } from './pages/MyLibrary';
import { Login } from './pages/Login';

const AppContent = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen bg-bg flex items-center justify-center tech-dots">
        <div className="relative">
          <div className="w-20 h-20 border-2 border-primary/20 rounded-full animate-ping"></div>
          <div className="absolute inset-0 w-20 h-20 border-t-2 border-primary rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-bg text-white font-sans selection:bg-primary/30 selection:text-primary">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/creators" element={<CreatorApplicationForm />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/library" element={<MyLibrary />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        
        <footer className="py-24 border-t border-border bg-black relative overflow-hidden tech-grid selection:bg-primary/30">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
          <div className="scanline"></div>
          
          <div className="container mx-auto px-6 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-16">
              <div className="space-y-6">
                <div className="flex items-center space-x-4 group cursor-pointer">
                  <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center font-black text-black text-2xl shadow-[0_0_30px_rgba(193,255,0,0.2)] group-hover:scale-110 transition-transform">E</div>
                  <div className="flex flex-col -space-y-1">
                    <span className="text-3xl font-black tracking-tighter uppercase italic text-white">ENZO ASSETS</span>
                    <span className="text-[9px] font-black tracking-[0.4em] text-primary uppercase">PROTOCOL_VAULT</span>
                  </div>
                </div>
                <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest max-w-sm leading-relaxed opacity-60">
                   A infraestrutura definitiva para distribuição de ativos digitais de alta performance. 
                   © 2026 EnzoAssets.com - Todos os direitos reservados.
                   <span className="block mt-2 text-primary/40 italic">NÃO AFILIADO AO ROBLOX CORPORATION.</span>
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 md:gap-20">
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">RECURSOS</h4>
                  <div className="flex flex-col space-y-4 text-[9px] font-black uppercase tracking-widest text-gray-500">
                    <Link to="/" className="hover:text-primary transition-colors">INÍCIO</Link>
                    <Link to="/marketplace" className="hover:text-primary transition-colors">TERMINAL</Link>
                    <Link to="/creators" className="hover:text-primary transition-colors">VENDEDORES</Link>
                    <Link to="/library" className="hover:text-primary transition-colors">O_COFRE</Link>
                  </div>
                </div>
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">SUPORTE</h4>
                  <div className="flex flex-col space-y-4 text-[9px] font-black uppercase tracking-widest text-gray-500">
                    <a href="#" className="hover:text-primary transition-colors">DISCORD_HUB</a>
                    <a href="#" className="hover:text-primary transition-colors">STATUS_CHECK</a>
                    <a href="#" className="hover:text-primary transition-colors">PRIVACIDADE</a>
                  </div>
                </div>
                <div className="space-y-6 col-span-2 sm:col-span-1">
                  <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">STATUS</h4>
                  <div className="flex items-center space-x-3 bg-primary/5 border border-primary/10 px-4 py-3 rounded-2xl">
                     <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(193,255,0,1)]"></div>
                     <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">OPERANDO_NORMAL</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-20 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
               <span className="text-[8px] font-mono text-gray-800 uppercase tracking-widest">BUILD_REF: 0XF5A23C91</span>
               <div className="flex space-x-6 text-[8px] font-black text-gray-800 uppercase tracking-widest">
                  <span>ENCRYPTED_BY_ELITE</span>
                  <span>SESSION: {Math.random().toString(36).substring(7).toUpperCase()}</span>
               </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
