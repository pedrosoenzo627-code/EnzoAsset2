import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, User, LogOut, Menu, X, Rocket, ShieldCheck, Library, MessageSquare, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Logo } from './Logo';

export const Navbar = () => {
  const { user, profile, signIn, logout } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Início', href: '/', color: 'hover:text-primary', line: 'bg-primary' },
    { name: 'Loja', href: '/marketplace', color: 'hover:text-secondary', line: 'bg-secondary' },
    { name: 'Cofre', href: '/library', color: 'hover:text-quinary', line: 'bg-quinary' },
    { name: 'Vender', href: '/creators', color: 'hover:text-octonary', line: 'bg-octonary' },
    { name: 'Discord', href: 'https://discord.gg/tFbNXuuxST', external: true, color: 'hover:text-tertiary', line: 'bg-tertiary' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-black/60 backdrop-blur-3xl border-b border-white/5 transition-all duration-500 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
      
      <div className="max-w-[1700px] mx-auto px-8 h-24 md:h-28 flex items-center justify-between">
        <div className="flex items-center space-x-16">
          <Link to="/" className="flex items-center space-x-5 group relative">
            <div className="absolute -inset-6 bg-gradient-to-r from-primary/20 via-tertiary/20 to-quinary/20 blur-3xl scale-0 group-hover:scale-100 transition-transform duration-700"></div>
            <div className="relative">
              <Logo size="md" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-bg animate-pulse"></div>
            </div>
            <div className="hidden sm:flex flex-col -space-y-2">
              <span className="text-3xl font-display italic text-white tracking-widest leading-none">ENZO</span>
              <span className="text-[10px] font-tech font-black tracking-[0.6em] text-primary uppercase opacity-60">PROTOCOLO</span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center space-x-12">
            {navLinks.map((link) => (
              link.external ? (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "text-[10px] font-tech font-black text-gray-500 uppercase tracking-[0.4em] transition-all relative group flex items-center space-x-3",
                    link.color
                  )}
                >
                  <span className="relative z-10">{link.name}</span>
                  <span className={cn("absolute -bottom-2 left-0 w-0 h-[2px] transition-all duration-500 group-hover:w-full", link.line)}></span>
                </a>
              ) : (
                <Link
                  key={link.name}
                  to={link.href}
                  className={cn(
                    "text-[10px] font-tech font-black text-gray-500 uppercase tracking-[0.4em] transition-all relative group",
                    link.color
                  )}
                >
                  <span className="relative z-10">{link.name}</span>
                  <span className={cn("absolute -bottom-2 left-0 w-0 h-[2px] transition-all duration-500 group-hover:w-full", link.line)}></span>
                </Link>
              )
            ))}
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-10">
          {user ? (
            <div className="flex items-center space-x-10">
              <Link
                to="/library"
                className="group flex flex-col items-center justify-center space-y-2 text-gray-500 hover:text-white transition-all"
              >
                <div className="relative">
                   <Library className="w-6 h-6 group-hover:text-quinary group-hover:scale-110 transition-transform duration-500" />
                   <div className="absolute -top-1 -right-1 w-2 h-2 bg-quinary rounded-full blur-[4px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <span className="text-[8px] font-tech font-black uppercase tracking-[0.4em] opacity-0 group-hover:opacity-100 transition-all">VAULT</span>
              </Link>
              
              {(profile?.role === 'creator' || profile?.role === 'admin') && (
                <Link
                  to="/dashboard"
                  className="bg-primary/5 border border-primary/10 text-primary px-8 py-4 rounded-[1rem] text-[10px] font-tech font-black uppercase tracking-[0.3em] hover:bg-primary hover:text-black transition-all flex items-center space-x-3 shadow-[0_0_20px_rgba(193,255,0,0.1)] hover:shadow-[0_0_30px_#C1FF00]"
                >
                  <Zap className="w-4 h-4 fill-current animate-pulse" />
                  <span>DASHBOARD</span>
                </Link>
              )}

              {profile?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="bg-septenary/10 border border-septenary/20 text-septenary px-8 py-4 rounded-[1rem] text-[10px] font-tech font-black uppercase tracking-[0.3em] hover:bg-septenary hover:text-white transition-all flex items-center space-x-3 shadow-[0_0_20px_rgba(255,61,0,0.1)] hover:shadow-[0_0_30px_#FF3D00]"
                >
                  <ShieldCheck className="w-4 h-4 transform group-hover:rotate-12" />
                  <span>MASTER</span>
                </Link>
              )}

              <div className="h-10 w-[1px] bg-white/10"></div>
              
              <div className="flex items-center space-x-6 group cursor-pointer">
                 <div className="relative">
                    <img
                      src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`}
                      alt="avatar"
                      className="w-12 h-12 rounded-[1.2rem] border-2 border-white/5 group-hover:border-primary transition-all object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-bg"></div>
                 </div>
                 <div className="flex flex-col items-start -space-y-1">
                    <span className="text-[11px] font-tech font-black text-white uppercase tracking-tight italic">{user.displayName?.split(' ')[0]}</span>
                    <button onClick={logout} className="text-[8px] font-tech font-black text-gray-600 hover:text-septenary transition-colors uppercase tracking-[0.3em]">KILL_SESSION</button>
                 </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="group relative bg-white text-black px-12 py-5 rounded-[1rem] font-tech font-black text-[10px] tracking-[0.5em] hover:bg-primary transition-all transform active:scale-95 shadow-[0_0_50px_rgba(255,255,255,0.05)] uppercase overflow-hidden"
            >
              <div className="absolute left-0 top-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span>IDENTIFY_USER</span>
            </button>
          )}
        </div>

        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-gray-500 hover:text-primary transition-all active:scale-90"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overhaul */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-bg border-b border-white/5 p-10 space-y-10 relative overflow-hidden"
          >
            <div className="scanline"></div>
            <div className="grid grid-cols-2 gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className="bg-white/[0.02] border border-white/5 p-8 rounded-[1.5rem] flex flex-col justify-center items-start group active:bg-primary transition-all"
                >
                  <span className="text-gray-700 text-[8px] font-tech font-black uppercase tracking-[0.4em] mb-3 group-active:text-black">Diretório</span>
                  <span className="text-2xl font-display text-white tracking-tighter italic group-active:text-black">{link.name}</span>
                </Link>
              ))}
            </div>

            {user ? (
               <div className="space-y-6 pt-6 border-t border-white/5">
                  <Link
                    to="/library"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between bg-white/[0.02] border border-white/5 p-8 rounded-[1.5rem] group"
                  >
                    <div className="flex items-center space-x-6">
                      <Library className="w-8 h-8 text-quinary" />
                      <span className="font-tech font-black uppercase tracking-[0.5em] text-xs text-white">Meu Cofre</span>
                    </div>
                  </Link>
                  <button
                    onClick={() => { logout(); setIsOpen(false); }}
                    className="w-full bg-septenary/10 border border-septenary/20 text-septenary py-8 rounded-[1.5rem] font-tech font-black text-[10px] tracking-[0.6em] uppercase"
                  >
                    KILL_SESSION
                  </button>
               </div>
            ) : (
              <button
                onClick={() => { navigate('/login'); setIsOpen(false); }}
                className="w-full bg-white text-black py-8 rounded-[1.5rem] font-tech font-black text-[10px] tracking-[0.6em] uppercase shadow-2xl"
              >
                IDENTIFY_LOGIN
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
