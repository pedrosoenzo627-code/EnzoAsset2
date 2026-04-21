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
import { cn } from './lib/utils';

const AppContent = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen bg-bg flex items-center justify-center tech-grid relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-tertiary/5 to-quinary/5 blur-3xl"></div>
        <div className="relative">
          <div className="w-24 h-24 border-2 border-primary/10 rounded-full animate-ping"></div>
          <div className="absolute inset-0 w-24 h-24 border-t-2 border-primary border-r-2 border-secondary border-b-2 border-tertiary border-l-2 border-quinary rounded-full animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white font-tech font-black text-[10px] tracking-[0.5em] animate-pulse">SINC</div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-bg text-white font-sans selection:bg-primary/30 selection:text-primary relative overflow-x-hidden">
        {/* Immersive Layers */}
        <div className="fixed inset-0 pointer-events-none z-[990]">
          <div className="scanline"></div>
          <div className="absolute inset-0 noise-overlay"></div>
        </div>

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
        
        <footer className="py-24 border-t border-white/5 bg-black relative overflow-hidden tech-grid selection:bg-primary/30">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-primary via-secondary via-tertiary via-quinary to-primary opacity-20"></div>
          
          <div className="container mx-auto px-6 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-16">
              <div className="space-y-8">
                <div className="flex items-center space-x-6 group cursor-pointer">
                  <div className="w-16 h-16 rounded-[1rem] bg-black overflow-hidden border border-white/5 flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.05)] group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <img 
                      src="/logo.png" 
                      className="w-full h-full object-cover" 
                      alt="Enzo Logo" 
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          const span = document.createElement('span');
                          span.className = 'text-white font-display italic text-3xl';
                          span.innerText = 'E';
                          parent.appendChild(span);
                        }
                      }}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex flex-col -space-y-2">
                    <span className="text-4xl font-display italic text-white tracking-widest">ENZO ASSETS</span>
                    <span className="text-[10px] font-tech font-black tracking-[0.6em] text-primary uppercase opacity-60">PROTOCOLO_POLY_CHROME</span>
                  </div>
                </div>
                <p className="text-gray-600 font-tech text-[10px] font-black uppercase tracking-[0.4em] max-w-sm leading-[1.8] opacity-40">
                   Sistemas de distribuição mutáveis.<br/>
                   Acelerando a evolução para a singularidade digital 2026.
                   <span className="block mt-4 text-quinary/60">© ENZOASSETS PROTOCOL • ALL RIGHTS RESERVED</span>
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 md:gap-24">
                <div className="space-y-8">
                  <h4 className="text-[10px] font-tech font-black text-gray-700 uppercase tracking-[0.6em]">DIRETÓRIOS</h4>
                  <div className="flex flex-col space-y-5 text-[10px] font-tech font-bold uppercase tracking-[0.4em] text-gray-500">
                    <Link to="/" className="hover:text-primary transition-all hover:translate-x-2 text-primary/80">INÍCIO</Link>
                    <Link to="/marketplace" className="hover:text-secondary transition-all hover:translate-x-2 text-secondary/80">TERMINAL</Link>
                    <Link to="/creators" className="hover:text-tertiary transition-all hover:translate-x-2 text-tertiary/80">FORJA</Link>
                    <Link to="/library" className="hover:text-quinary transition-all hover:translate-x-2 text-quinary/80">COFRE</Link>
                  </div>
                </div>
                <div className="space-y-8">
                  <h4 className="text-[10px] font-tech font-black text-gray-700 uppercase tracking-[0.6em]">SYNC</h4>
                  <div className="flex flex-col space-y-5 text-[10px] font-tech font-bold uppercase tracking-[0.4em] text-gray-500">
                    <a href="https://discord.gg/tFbNXuuxST" target="_blank" rel="noopener noreferrer" className="hover:text-secondary transition-all hover:translate-x-2 text-secondary/80">DISCORD_HUB</a>
                    <a href="#" className="hover:text-quaternary transition-all hover:translate-x-2 text-quaternary/80">STATUS_NET</a>
                    <a href="#" className="hover:text-septenary transition-all hover:translate-x-2 text-septenary/80">PRIVACY_HASH</a>
                  </div>
                </div>
                <div className="space-y-8 col-span-2 sm:col-span-1">
                  <h4 className="text-[10px] font-tech font-black text-gray-700 uppercase tracking-[0.6em]">NODE_STATUS</h4>
                  <div className="flex items-center space-x-4 bg-white/[0.02] border border-white/5 px-6 py-4 rounded-2xl relative group overflow-hidden">
                     <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                     <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_#C1FF00]"></div>
                     <span className="text-[10px] font-tech font-black text-primary uppercase tracking-[0.3em]">ONLINE_POLY</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-32 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
               <span className="text-[9px] font-mono text-gray-800 uppercase tracking-[1em] opacity-40">POLY_SYNC_ID: {Math.random().toString(16).substring(2, 10).toUpperCase()}</span>
               <div className="flex space-x-10 text-[9px] font-tech font-black text-gray-800 uppercase tracking-[0.5em] opacity-40">
                  <span className="hover:text-primary transition-colors cursor-pointer">AUDIT_LOGS</span>
                  <span className="hover:text-secondary transition-colors cursor-pointer">ENCRYP_V8</span>
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
