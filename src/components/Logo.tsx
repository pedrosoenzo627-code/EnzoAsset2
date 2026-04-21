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
      <div className={`absolute inset-0 bg-blue-600/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity`}></div>
      
      {/* Outer Hexagon/Shape */}
      <motion.div 
        whileHover={{ rotate: 180 }}
        transition={{ type: "spring", stiffness: 200, damping: 10 }}
        className={`${sizes[size]} bg-blue-600 rounded-[35%] flex items-center justify-center text-white font-black shadow-lg shadow-blue-600/20 relative z-10`}
      >
        <span className="italic transform -skew-x-12 select-none" style={{ fontSize: iconSizes[size] + 'px' }}>E</span>
      </motion.div>

      {/* Accents */}
      <div className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div>
    </div>
  );
};
