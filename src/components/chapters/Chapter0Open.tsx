import React, { useEffect, useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface Chapter0Props {
  onStart: () => void;
}

const ParticleMatrix = () => {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; opacity: number }[]>([]);

  useEffect(() => {
    // Generate static matrix points
    const pts = [];
    let id = 0;
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        pts.push({
          id: id++,
          x: j * 12.5 + 6.25,
          y: i * 12.5 + 6.25,
          opacity: Math.random() * 0.5 + 0.1,
        });
      }
    }
    setParticles(pts);
  }, []);

  return (
    <div className="relative w-48 h-48 sm:w-64 sm:h-64 mx-auto perspective-1000">
      <motion.div 
        className="absolute inset-0 grid grid-cols-8 grid-rows-8 gap-1 p-2 rounded-xl retro-terminal overflow-hidden"
        animate={{ rotateX: [5, 10, 5], rotateY: [-5, 5, -5] }}
        transition={{ duration: 10, ease: "linear", repeat: Infinity }}
      >
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="bg-[#00ff41] rounded-[2px]"
            initial={{ opacity: p.opacity }}
            animate={{ opacity: [p.opacity, p.opacity + 0.4, p.opacity] }}
            transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
        {/* Scanning beam effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00ff41]/20 to-transparent w-full h-[200%]"
          animate={{ translateY: ['-100%', '0%'] }}
          transition={{ duration: 3, ease: "linear", repeat: Infinity }}
          style={{ mixBlendMode: 'screen' }}
        />
        
        {/* Retro scanlines overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-20" style={{ background: 'repeating-linear-gradient(to bottom, transparent, transparent 2px, #000 2px, #000 4px)' }} />
      </motion.div>
    </div>
  );
};

export const Chapter0Open: React.FC<Chapter0Props> = ({ onStart }) => {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center space-y-16 animate-fadeIn max-w-4xl mx-auto px-4">
      {/* Editorial Header */}
      <div className="text-center space-y-5">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[10px] font-mono text-apple-gray tracking-[0.2em] font-bold uppercase"
        >
          DataForge 2026 // Pathway Track
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 100 }}
          className="text-5xl sm:text-7xl font-bold tracking-tighter text-apple-text font-display leading-[1.05]"
        >
          Fast Weights.
          <br />
          <span className="text-apple-blue">
            Fast Recall.
          </span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg sm:text-xl text-apple-gray font-display max-w-2xl mx-auto leading-relaxed mt-6"
        >
          “Can one fixed-size Hebbian memory keep recalling what it has learned?”
        </motion.p>
      </div>

      {/* Visualizer & Preset Meta */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.8, type: "spring", bounce: 0.3 }}
        className="w-full max-w-lg relative mt-8"
      >
        <ParticleMatrix />
        
        {/* Floating Meta Badges */}
        <div className="absolute top-4 -left-4 sm:-left-16 bg-white/90 backdrop-blur-md border border-apple-border px-4 py-2.5 rounded-xl font-mono text-xs shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
          <div className="text-[10px] text-apple-gray mb-1 tracking-wider uppercase font-bold">Dimension</div>
          <div className="text-apple-text font-bold text-sm">d = 128</div>
        </div>
        
        <div className="absolute bottom-12 -right-4 sm:-right-16 bg-white/90 backdrop-blur-md border border-apple-border px-4 py-2.5 rounded-xl font-mono text-xs shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
          <div className="text-[10px] text-apple-gray mb-1 tracking-wider uppercase font-bold">Stored Pairs</div>
          <div className="text-apple-text font-bold text-sm">N = 8</div>
        </div>
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-xl border border-apple-border px-5 py-3 rounded-2xl font-display text-sm text-center shadow-[0_20px_40px_rgba(0,0,0,0.1)] z-10">
          <div className="text-[10px] text-apple-gray mb-1 tracking-widest font-bold uppercase">Recall Fidelity</div>
          <div className="text-3xl font-bold text-apple-text flex items-center justify-center gap-2 tracking-tight">
            0.98 <Sparkles className="w-5 h-5 text-apple-blue" />
          </div>
        </div>
      </motion.div>

      {/* Primary Action */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="pt-10"
      >
        <button
          onClick={onStart}
          className="group flex items-center gap-2 bg-apple-text hover:bg-black text-white font-display font-medium text-lg px-8 py-4 rounded-full transition-all duration-300 shadow-[0_4px_14px_rgba(0,0,0,0.2)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.25)] hover:scale-[1.02] cursor-pointer"
        >
          <span>Start the Experiment</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
        </button>
      </motion.div>
    </div>
  );
};
