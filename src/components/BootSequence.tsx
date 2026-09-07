import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BOOT_LOGS = [
  "INIT BDH-CORE v2.0.4",
  "ALLOCATING FAST WEIGHTS TENSOR... [OK]",
  "ESTABLISHING CROSSTALK BOUNDARIES... [OK]",
  "MOUNTING SPARSE VECTOR REGISTERS...",
  "WARN: HOPFIELD LIMITER BYPASSED",
  "INJECTING ASSOCIATIVE PAYLOAD...",
  "SYNC COMPLETE. ENTERING LABORATORY."
];

export const BootSequence: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [logIndex, setLogIndex] = useState(0);
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    // Rapidly step through logs
    const interval = setInterval(() => {
      setLogIndex((prev) => {
        if (prev < BOOT_LOGS.length - 1) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, 150); // fast 150ms per log line

    // Trigger glitch and finish
    const timer1 = setTimeout(() => {
      setGlitch(true);
    }, 1300);

    const timer2 = setTimeout(() => {
      onComplete();
    }, 1500);

    return () => {
      clearInterval(interval);
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="fixed inset-0 z-50 flex flex-col justify-center items-center bg-black overflow-hidden font-mono text-sm"
    >
      {/* CRT Scanline Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{ background: 'repeating-linear-gradient(to bottom, transparent, transparent 2px, #00ff41 2px, #00ff41 4px)' }} 
      />

      <motion.div
        animate={glitch ? { x: [-10, 10, -5, 5, 0], opacity: [1, 0.5, 1] } : {}}
        transition={{ duration: 0.2 }}
        className="relative z-10 w-full max-w-2xl px-6"
      >
        <div className="space-y-1">
          {BOOT_LOGS.slice(0, logIndex + 1).map((log, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`font-bold ${
                log.includes("WARN") ? "text-amber-500" : "text-[#00ff41]"
              } drop-shadow-[0_0_5px_currentColor]`}
            >
              {'>'} {log}
            </motion.div>
          ))}
          {logIndex < BOOT_LOGS.length - 1 && (
            <motion.div
              animate={{ opacity: [1, 0] }}
              transition={{ repeat: Infinity, duration: 0.4 }}
              className="w-3 h-5 bg-[#00ff41] mt-2 shadow-[0_0_8px_#00ff41]"
            />
          )}
        </div>
      </motion.div>

      {/* Extreme Glitch Overlay just before finishing */}
      <AnimatePresence>
        {glitch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-white mix-blend-difference pointer-events-none z-50"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};
