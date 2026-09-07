import React from 'react';
import { motion } from 'framer-motion';

interface Matrix3DProps {
  data: number[][];
  maxVal: number;
  theme?: 'green' | 'amber' | 'red';
  size?: number; // width/height of container in px
}

export const Matrix3D: React.FC<Matrix3DProps> = ({ data, maxVal, theme = 'green', size = 288 }) => {
  const getThemeColor = (val: number) => {
    const norm = Math.min(1, Math.abs(val) / (maxVal || 0.001));
    
    // Determine base color based on theme and sign
    if (theme === 'green') {
      return val > 0 
        ? `rgba(0, 255, 65, ${0.1 + norm * 0.9})` 
        : val < 0 
          ? `rgba(255, 176, 0, ${0.1 + norm * 0.9})` // Amber for negative
          : `rgba(21, 21, 21, 1)`;
    }
    
    if (theme === 'amber') {
      return val !== 0 
        ? `rgba(255, 176, 0, ${0.1 + norm * 0.9})`
        : `rgba(21, 21, 21, 1)`;
    }

    // red theme
    return val !== 0 
      ? `rgba(255, 51, 51, ${0.1 + norm * 0.9})`
      : `rgba(21, 21, 21, 1)`;
  };

  const getGlow = (val: number) => {
    const norm = Math.min(1, Math.abs(val) / (maxVal || 0.001));
    if (norm < 0.2) return 'none';
    
    if (theme === 'green' && val > 0) return `0 0 ${norm * 10}px rgba(0,255,65,0.8)`;
    if (theme === 'green' && val < 0) return `0 0 ${norm * 10}px rgba(255,176,0,0.8)`;
    if (theme === 'amber') return `0 0 ${norm * 10}px rgba(255,176,0,0.8)`;
    if (theme === 'red') return `0 0 ${norm * 10}px rgba(255,51,51,0.8)`;
    return 'none';
  };

  const cellSize = (size - 16) / 16; // 1px gap

  return (
    <div 
      className="relative flex justify-center items-center perspective-[1200px]"
      style={{ width: size, height: size }}
    >
      <motion.div 
        initial={{ rotateX: 60, rotateZ: 0 }}
        animate={{ rotateX: 60, rotateZ: 45 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="grid grid-cols-16 gap-[1px] transform-style-3d relative"
        style={{ 
          width: size, 
          height: size,
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Base Grid Plane (The hardware floor) */}
        <div 
          className="absolute inset-0 grid grid-cols-16 gap-[1px] bg-[var(--color-retro-border)] p-[1px]"
          style={{ transform: 'translateZ(0px)' }}
        >
          {Array.from({ length: 256 }).map((_, i) => (
            <div key={i} className="w-full h-full bg-[#111]" />
          ))}
        </div>

        {/* Floating Holographic Plates */}
        {data.map((row, rIdx) =>
          row.map((val, cIdx) => {
            const zOffset = Math.abs(val) / (maxVal || 0.001) * 40; // Max 40px float
            
            return (
              <motion.div
                key={`${rIdx}-${cIdx}`}
                initial={false}
                animate={{ 
                  backgroundColor: getThemeColor(val),
                  z: val !== 0 ? zOffset + 2 : 0, // float up
                  boxShadow: getGlow(val)
                }}
                transition={{ duration: 0.4, type: 'spring', bounce: 0.3 }}
                className="w-full h-full border border-black/20"
                style={{ 
                  width: cellSize, 
                  height: cellSize,
                }}
                title={`W[${rIdx}, ${cIdx}] = ${val.toFixed(3)}`}
              />
            );
          })
        )}
      </motion.div>
    </div>
  );
};
