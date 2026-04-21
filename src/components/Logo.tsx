import React from 'react';
import { motion } from 'motion/react';

export const Logo = ({ size = "md", className = "" }: { size?: "sm" | "md" | "lg" | "xl", className?: string }) => {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-20 h-20"
  };

  const iconSizes = {
    sm: "12",
    md: "14",
    lg: "16",
    xl: "24"
  };

  return (
    <div className={`relative flex items-center justify-center group ${className}`}>
      {/* Background Glow */}
      <div className={`absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity`}></div>
      
      {/* Outer Hexagon/Shape */}
      <motion.div 
        whileHover={{ rotate: 5, scale: 1.05 }}
        transition={{ type: "spring", stiffness: 200, damping: 10 }}
        className={`${sizes[size]} rounded-[1rem] overflow-hidden border border-white/10 flex items-center justify-center bg-black relative z-10 shadow-lg`}
      >
        <img 
          src="/logo.png" 
          alt="Enzo Assets" 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            const el = e.currentTarget;
            el.style.display = 'none';
            const parent = el.parentElement;
            if (parent && !parent.querySelector('.fallback-e')) {
              const span = document.createElement('span');
              span.className = 'fallback-e text-white font-display italic select-none';
              span.style.fontSize = iconSizes[size] + 'px';
              span.innerText = 'E';
              parent.appendChild(span);
            }
          }}
          referrerPolicy="no-referrer"
        />
      </motion.div>

      {/* Accents */}
      <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(193,255,0,0.5)]"></div>
    </div>
  );
};
