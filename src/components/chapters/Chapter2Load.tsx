import React, { useState, useMemo } from 'react';
import { SimulationState } from '../../types';
import {
  generateMemorySet,
  computeSynapticMatrix,
  matrixVectorMultiply,
  cosineSimilarity,
} from '../../utils/math';
import { Plus, Minus, RotateCcw, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import { Matrix3D } from '../Matrix3D';
import { playClick, playCrunch } from '../../utils/audio';

interface Chapter2Props {
  simulationState: SimulationState;
  onProceedToInterference?: () => void;
}

export const Chapter2Load: React.FC<Chapter2Props> = ({
  simulationState,
  onProceedToInterference,
}) => {
  const [loadCount, setLoadCount] = useState<number>(8);
  const [activeQuery, setActiveQuery] = useState<number>(0);
  const d = simulationState.dimension; // 128

  // Generate sequence of memory pairs
  const memoryPairs = useMemo(() => {
    return generateMemorySet(16, d, 'dense', 6, 777);
  }, [d]);

  // Compute partial synaptic matrix for current loadCount
  const activePairs = useMemo(() => {
    return memoryPairs.slice(0, loadCount);
  }, [memoryPairs, loadCount]);

  const W = useMemo(() => {
    return computeSynapticMatrix(activePairs, d);
  }, [activePairs, d]);

  // Query readout for activeQuery
  const currentQueryPair = activePairs[Math.min(activeQuery, activePairs.length - 1)];
  const readout = useMemo(() => {
    return matrixVectorMultiply(W, currentQueryPair.key);
  }, [W, currentQueryPair]);

  const cosSim = useMemo(() => {
    return cosineSimilarity(readout, currentQueryPair.value);
  }, [readout, currentQueryPair]);

  // 16x16 slice of W
  const wSlice = useMemo(() => {
    return W.slice(0, 16).map((row) => row.slice(0, 16));
  }, [W]);

  // Max value in slice for normalization
  const maxVal = useMemo(() => {
    let m = 0.001;
    for (let i = 0; i < 16; i++) {
      for (let j = 0; j < 16; j++) {
        m = Math.max(m, Math.abs(wSlice[i][j]));
      }
    }
    return m;
  }, [wSlice]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header breadcrumb */}
      <div>
        <div className="flex items-center justify-between text-[11px] font-mono text-apple-gray mb-2 uppercase tracking-wider font-bold">
          <span>Chapter 02 // Superposition in Action • Incremental Synaptic Loading</span>
          <span className="text-apple-blue">■ Sec. 1.2</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 border-b border-apple-border pb-6">
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-apple-text font-display">
              Loading the memory: Superposition holds up.
            </h1>
            <p className="mt-3 text-base text-apple-gray leading-relaxed font-body">
              Observe how outer products linearly accumulate into a shared weight tensor.
              When pattern count <code className="font-mono text-apple-text font-semibold bg-apple-bg border border-apple-border px-1 py-0.5 rounded">N ≪ d</code>,
              the quasi-orthogonality of high-dimensional space shields associations from disruptive
              crosstalk.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 bg-apple-surface p-3.5 rounded-xl border border-apple-border shadow-[0_2px_8px_rgba(0,0,0,0.04)] font-mono text-xs shrink-0 self-start">
            <div className="border-r border-apple-border pr-3">
              <div className="text-[9px] text-apple-gray font-bold uppercase tracking-wider">Stored (N)</div>
              <div className="text-sm font-bold text-apple-blue mt-0.5">{loadCount} / 16 PAIRS</div>
            </div>
            <div className="border-r border-apple-border pr-3">
              <div className="text-[9px] text-apple-gray font-bold uppercase tracking-wider">Estimated Rank</div>
              <div className="text-sm font-bold text-apple-text mt-0.5">Rank = {loadCount}</div>
            </div>
            <div>
              <div className="text-[9px] text-apple-gray font-bold uppercase tracking-wider">Retrieval Fidelity</div>
              <div className="text-sm font-bold text-emerald-600 mt-0.5">
                cos θ = {cosSim.toFixed(3)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Controls & Write Stepper */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-apple-surface border border-apple-border rounded-2xl p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] font-mono text-xs space-y-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-apple-border pb-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-apple-text tracking-wider uppercase">Synaptic Accumulation Stepper:</span>
            <span className="bg-apple-blue/10 text-apple-blue border border-apple-blue/20 px-2.5 py-1 rounded-md font-bold text-[11px] tracking-wider uppercase">
              N = {loadCount} Pairs Committed
            </span>
          </div>

          {/* Stepper Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playClick();
                setLoadCount((c) => Math.max(1, c - 1));
              }}
              disabled={loadCount <= 1}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-apple-border hover:bg-apple-bg text-apple-text disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer font-bold"
            >
              <Minus className="w-3.5 h-3.5" />
              <span>REMOVE PAIR</span>
            </button>
            <button
              onClick={() => {
                playCrunch();
                setLoadCount((c) => Math.max(16, c + 1));
              }}
              disabled={loadCount >= 16}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-apple-blue hover:bg-blue-600 text-white rounded-md font-bold disabled:opacity-40 disabled:hover:bg-apple-blue transition-colors cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>WRITE NEXT PAIR (N+1)</span>
            </button>
            <button
              onClick={() => {
                playClick();
                setLoadCount(1);
              }}
              className="p-1.5 border border-apple-border hover:bg-apple-bg rounded-md text-apple-gray cursor-pointer transition-colors ml-1"
              title="Reset to N=1"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Query selector pills */}
        <div className="space-y-3 pt-1">
          <div className="flex justify-between items-center text-apple-gray mb-3">
            <span className="font-bold tracking-wider uppercase text-[10px]">Select Active Key to Probe the Memory Matrix:</span>
            <span className="text-[10px] text-apple-blue font-bold tracking-wider bg-apple-blue/10 px-2.5 py-1 rounded-md uppercase">
              Probing Key #{activeQuery + 1}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {activePairs.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  playClick();
                  setActiveQuery(idx);
                }}
                className={`px-3.5 py-1.5 rounded-full border font-bold text-xs transition-all cursor-pointer ${
                  activeQuery === idx
                    ? 'bg-apple-blue text-white border-apple-blue shadow-[0_2px_8px_rgba(0,102,204,0.3)] scale-105'
                    : 'bg-white text-apple-gray border-apple-border hover:bg-apple-bg hover:text-apple-text'
                }`}
              >
                Key #{idx + 1}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* 2-Column Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Matrix accumulation visualization (6 cols) -> RETRO TERMINAL */}
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-6 retro-terminal rounded-2xl p-5 shadow-lg space-y-4 font-mono text-xs relative overflow-hidden"
        >
          <div className="absolute inset-0 pointer-events-none opacity-10" style={{ background: 'repeating-linear-gradient(to bottom, transparent, transparent 2px, #00ff41 2px, #00ff41 4px)' }} />
          
          <div className="flex items-center justify-between border-b border-[var(--color-retro-border)] pb-3 relative z-10">
            <span className="font-bold text-[var(--color-retro-green)] tracking-wider">
              {'>'} ACCUMULATED SYNAPTIC TENSOR W[0..15, 0..15]
            </span>
            <span className="bg-[var(--color-retro-green)] text-black px-1.5 py-0.5 rounded-[2px] font-bold text-[9px] tracking-wider uppercase">
              Max |W_ij| = {maxVal.toFixed(3)}
            </span>
          </div>

          <div className="flex justify-center py-5 relative z-10">
            <Matrix3D data={wSlice} maxVal={maxVal} theme="green" />
          </div>

          <div className="flex justify-between text-[10px] font-bold text-[var(--color-retro-green)] pt-3 border-t border-[var(--color-retro-border)] relative z-10 tracking-wider">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[var(--color-retro-green)] border border-[var(--color-retro-green)]"></span> POSITIVE W</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[var(--color-retro-amber)] border border-[var(--color-retro-amber)]"></span> NEGATIVE W</span>
          </div>
        </motion.div>

        {/* Right: Readout Channel & Superposition Math (6 cols) */}
        <div className="lg:col-span-6 space-y-6 font-mono text-xs">
          {/* Readout stats -> Retro Terminal as well, for consistency of the "Lab" tools */}
          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="retro-terminal rounded-2xl p-5 shadow-lg space-y-4 relative overflow-hidden"
          >
            <div className="absolute inset-0 pointer-events-none opacity-10" style={{ background: 'repeating-linear-gradient(to bottom, transparent, transparent 2px, #00ff41 2px, #00ff41 4px)' }} />
            
            <div className="flex items-center justify-between border-b border-[var(--color-retro-border)] pb-3 relative z-10">
              <span className="font-bold text-[var(--color-retro-green)] tracking-wider">
                {'>'} ASSOCIATIVE READOUT FIDELITY
              </span>
              <span className="text-black bg-[var(--color-retro-green)] font-bold text-xs px-2 py-0.5 rounded-[2px] tracking-widest">
                COS θ = {cosSim.toFixed(3)}
              </span>
            </div>

            <p className="font-sans text-white/80 text-xs leading-relaxed relative z-10">
              When querying key #{activeQuery + 1}, the matrix performs{' '}
              <code className="font-mono bg-white/10 px-1 py-0.5 rounded text-[var(--color-retro-green)] border border-[var(--color-retro-green)]/30">r = W • x_{activeQuery + 1}</code>.
              Because <strong className="text-white">N={loadCount}</strong> is well below the
              Hopfield capacity wall (<code className="font-mono text-white/60">0.14 • 128 ≈ 18</code>), the
              retrieved pattern retains over <strong className="text-[var(--color-retro-green)] font-bold drop-shadow-[0_0_5px_currentColor]">95% fidelity</strong>.
            </p>

            {/* Readout vector comparison */}
            <div className="space-y-3 pt-3 relative z-10">
              <span className="font-bold text-[var(--color-retro-green)] tracking-wider text-[10px] uppercase">
                Discrete target vs Retrieved float:
              </span>
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 8 }).map((_, i) => {
                  const target = currentQueryPair.value[i];
                  const readVal = readout[i];
                  const signMatch = (target >= 0 && readVal >= 0) || (target < 0 && readVal < 0);

                  return (
                    <div
                      key={i}
                      className={`p-2.5 border text-center transition-colors ${
                        signMatch 
                        ? 'bg-[#00ff41]/10 border-[#00ff41]/30' 
                        : 'bg-[#ff3333]/10 border-[#ff3333]/30'
                      }`}
                    >
                      <div className="text-[9px] text-white/50 uppercase tracking-wider mb-1 font-bold">dim {i}</div>
                      <div className={`font-bold text-sm my-0.5 ${signMatch ? 'text-white' : 'text-[#ff3333]'}`}>
                        {readVal >= 0 ? `+${readVal.toFixed(2)}` : readVal.toFixed(2)}
                      </div>
                      <div className={`text-[9px] font-bold tracking-wider ${signMatch ? 'text-[#00ff41]' : 'text-[#ff3333]'}`}>
                        TGT: {target > 0 ? '+1' : '-1'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Superposition principle callout -> Apple styling for explanation */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-apple-blue/5 border border-apple-blue/20 rounded-2xl p-6 space-y-3 shadow-sm"
          >
            <div className="flex items-center gap-2 font-bold text-apple-blue text-[11px] tracking-wider uppercase">
              <Layers className="w-4 h-4 text-apple-blue" />
              <span>Superposition Law at Low Load</span>
            </div>
            <p className="font-body text-sm text-apple-gray leading-relaxed">
              In linear associative memory, memories do not compete for discrete slots. They coexist
              as distributed linear projections in the same <code className="font-mono bg-white border border-apple-blue/20 px-1.5 py-0.5 rounded text-apple-text text-xs">128×128</code> matrix.
              As long as keys are quasi-orthogonal, each memory can be retrieved almost independently.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
