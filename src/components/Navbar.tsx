import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, User, LogOut, Menu, X, Rocket, ShieldCheck, Library, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Logo } from './Logo';

export const Navbar = () => {
  const { user, profile, signIn, logout } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Início', href: '/' },
    { name: 'Loja', href: '/marketplace' },
    { name: 'Biblioteca', href: '/library' },
    { name: 'Seja Criador', href: '/creators' },
    { name: 'Discord', href: 'https://discord.gg/example', external: true },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-black/40 backdrop-blur-3xl border-b border-border transition-all duration-500 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
      
      <div className="max-w-[1500px] mx-auto px-6 h-20 md:h-24 flex items-center justify-between">
        <div className="flex items-center space-x-12">
          <Link to="/" className="flex items-center space-x-3 group relative">
            <div className="absolute -inset-4 bg-primary/10 blur-2xl rounded-full scale-0 group-hover:scale-100 transition-transform duration-500"></div>
            <Logo size="md" />
            <div className="hidden sm:flex flex-col -space-y-1">
              <span className="text-2xl font-black tracking-tighter text-white uppercase italic">ENZO</span>
              <span className="text-[9px] font-black tracking-[0.4em] text-primary uppercase">PROTOCOLOS</span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center space-x-10">
            {navLinks.map((link) => (
              link.external ? (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[9px] font-black text-gray-500 hover:text-secondary uppercase tracking-[0.3em] transition-all relative group flex items-center space-x-2"
                >
                  {link.name === 'Discord' && <MessageSquare className="w-3 h-3 text-secondary animate-pulse" />}
                  <span className="relative z-10">{link.name}</span>
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-secondary transition-all group-hover:w-full"></span>
                </a>
              ) : (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-[9px] font-black text-gray-500 hover:text-primary uppercase tracking-[0.3em] transition-all relative group"
                >
                  <span className="relative z-10">{link.name}</span>
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-primary transition-all group-hover:w-full"></span>
                </Link>
              )
            ))}
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-8">
          {user ? (
            <div className="flex items-center space-x-8">
              <Link
                to="/library"
                className="group flex flex-col items-center justify-center space-y-1 text-gray-500 hover:text-white transition-all"
              >
                <Library className="w-5 h-5 group-hover:text-primary group-hover:scale-110 transition-transform" />
                <span className="text-[8px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">COFRE</span>
              </Link>
              
              {(profile?.role === 'creator' || profile?.role === 'admin') && (
                <Link
                  to="/dashboard"
                  className="bg-primary/5 border border-primary/10 text-primary px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-primary hover:text-black transition-all flex items-center space-x-2"
                >
                  <Rocket className="w-4 h-4" />
                  <span>DASHBOARD</span>
                </Link>
              )}

              {profile?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="bg-red-500/5 border border-red-500/10 text-red-500 px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all flex items-center space-x-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>TERMINAL</span>
                </Link>
              )}

              <div className="h-8 w-px bg-border mx-2"></div>
              
              <div className="flex items-center space-x-4 group cursor-pointer">
                 <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-white uppercase tracking-tight italic">{user.displayName?.split(' ')[0]}</span>
                    <button onClick={logout} className="text-[8px] font-black text-gray-600 hover:text-red-500 transition-colors uppercase tracking-[0.3em]">KILL_SESSION</button>
                 </div>
                 <div className="relative">
                    <img
                      src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`}
                      alt="avatar"
                      className="w-11 h-11 rounded-2xl border border-border group-hover:border-primary transition-all object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-bg"></div>
                 </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="bg-primary text-black px-10 py-5 rounded-2xl font-black text-[9px] tracking-[0.3em] hover:bg-white transition-all transform active:scale-95 shadow-[0_0_30px_rgba(193,255,0,0.1)] uppercase"
            >
              AUTHENTICATE_USER
            </button>
          )}
        </div>

        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-14 h-14 rounded-2xl bg-surface border border-border flex items-center justify-center text-gray-400 hover:text-primary transition-all active:scale-90"
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
            className="md:hidden bg-bg border-b border-border p-8 space-y-8 shadow-2xl relative overflow-hidden"
          >
            <div className="scanline"></div>
            <div className="grid grid-cols-2 gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className="bg-surface border border-border p-6 rounded-3xl flex flex-col justify-center items-start group active:bg-primary transition-all"
                >
                  <span className="text-gray-600 text-[8px] font-black uppercase tracking-widest mb-1 group-active:text-black">Diretório</span>
                  <span className="text-xl font-black text-white tracking-tighter uppercase italic group-active:text-black">{link.name}</span>
                </Link>
              ))}
            </div>

            {user ? (
               <div className="space-y-4 pt-4 border-t border-border">
                  <Link
                    to="/library"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between bg-surface border border-border p-6 rounded-3xl group"
                  >
                    <div className="flex items-center space-x-4">
                      <Library className="w-6 h-6 text-primary" />
                      <span className="font-black uppercase tracking-widest text-xs text-white">Minha Biblioteca</span>
                    </div>
                    <span className="text-[10px] font-mono text-gray-600">v1.2</span>
                  </Link>
                  <button
                    onClick={() => { logout(); setIsOpen(false); }}
                    className="w-full bg-red-500/10 border border-red-500/20 text-red-500 py-6 rounded-3xl font-black text-[10px] tracking-widest uppercase"
                  >
                    DESCONECTAR
                  </button>
               </div>
            ) : (
              <button
                onClick={() => { navigate('/login'); setIsOpen(false); }}
                className="w-full bg-primary text-black py-6 rounded-3xl font-black text-[10px] tracking-[0.3em] shadow-xl uppercase"
              >
                EFETUAR LOGIN
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
