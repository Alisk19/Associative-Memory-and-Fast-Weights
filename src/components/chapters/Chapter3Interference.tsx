import React, { useState, useMemo, useEffect } from 'react';
import { SimulationState } from '../../types';
import {
  generateMemorySet,
  computeSynapticMatrix,
  matrixVectorMultiply,
  cosineSimilarity,
  computeKeyGramMatrix,
} from '../../utils/math';
import { AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Matrix3D } from '../Matrix3D';
import { playClick, playCrunch, startWarningHum, stopWarningHum } from '../../utils/audio';

interface Chapter3Props {
  simulationState: SimulationState;
  onUpdateN?: (n: number) => void;
}

export const Chapter3Interference: React.FC<Chapter3Props> = ({
  simulationState,
  onUpdateN,
}) => {
  const [localN, setLocalN] = useState<number>(96);
  const N = onUpdateN ? simulationState.storedCount : localN;
  const setN = (val: number) => {
    setLocalN(val);
    if (onUpdateN) onUpdateN(val);
  };

  const d = simulationState.dimension; // 128

  // Compute memory set, W, readout at N
  const { pairs, W, r, queryPair, cosSim, bitFlips, noiseVariance } = useMemo(() => {
    const memory = generateMemorySet(N, d, 'dense', 6, 101);
    const matrix = computeSynapticMatrix(memory, d);
    const queryIdx = 0;
    const qPair = memory[queryIdx];
    const readout = matrixVectorMultiply(matrix, qPair.key);
    const sim = cosineSimilarity(readout, qPair.value);

    // Analyze first 16 dimensions for bit flips
    let flips = 0;
    for (let i = 0; i < 16; i++) {
      const origSign = qPair.value[i] >= 0 ? 1 : -1;
      const readSign = readout[i] >= 0 ? 1 : -1;
      if (origSign !== readSign) {
        flips++;
      }
    }

    const variance = (N - 1) / d;

    return {
      pairs: memory,
      W: matrix,
      r: readout,
      queryPair: qPair,
      cosSim: sim,
      bitFlips: flips,
      noiseVariance: variance,
    };
  }, [N, d]);

  useEffect(() => {
    if (cosSim < 0.2) {
      startWarningHum();
    } else {
      stopWarningHum();
    }
    return () => stopWarningHum();
  }, [cosSim]);

  // Compute 16x16 gram matrix
  const gramSlice = useMemo(() => {
    const keys = pairs.slice(0, 16).map((p) => p.key);
    return computeKeyGramMatrix(keys, 16);
  }, [pairs]);

  // Operating regime
  const getRegime = () => {
    if (N <= 16) return { name: 'High Fidelity', range: 'N = 1 to 16', cos: '> 0.95', color: 'emerald' };
    if (N <= 64) return { name: 'Interference Rising', range: 'N = 17 to 64', cos: '~ 0.85', color: 'violet' };
    if (N <= 128) return { name: 'Recall Degrading (ACTIVE)', range: 'N = 65 to 128', cos: '~ 0.54', color: 'amber' };
    return { name: 'Crosstalk Dominates / Complete Collapse', range: 'N > 128', cos: '< 0.20', color: 'red' };
  };

  const regime = getRegime();

  // Theoretical points for curve SVG
  const curvePoints = useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    for (let nVal = 1; nVal <= 150; nVal += 2) {
      const varVal = (nVal - 1) / d;
      const expCos = 1 / Math.sqrt(1 + varVal);
      // Map to SVG coordinates: width 500, height 180
      // x: [1, 150] -> [40, 480]
      // y: [0, 1] -> [160, 20]
      const px = 40 + ((nVal - 1) / 149) * 440;
      const py = 160 - expCos * 140;
      pts.push({ x: px, y: py });
    }
    return pts;
  }, [d]);

  const currentPtX = 40 + ((N - 1) / 149) * 440;
  const currentPtY = 160 - Math.max(0, Math.min(1, cosSim)) * 140;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header breadcrumbs */}
      <div>
        <div className="flex items-center justify-between text-[11px] font-mono text-apple-gray mb-2 uppercase tracking-wider font-bold">
          <span>Lab Workbench // Chapter 03 // Memory Capacity Limits • Deliberate Overload</span>
          <span className="text-orange-500 font-bold">Sec. Break</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 border-b border-apple-border pb-6">
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-apple-text font-display">
              More memories. More interference.
            </h1>
            <p className="mt-3 text-base text-apple-gray leading-relaxed font-body">
              Push <code className="font-mono text-apple-text font-semibold bg-apple-bg border border-apple-border px-1 py-0.5 rounded">N</code> upward and
              deliberately exceed the memory's comfortable operating range to observe catastrophic
              associative breakdown under linear outer-product accumulation.
            </p>
          </div>

          {/* Top Right Academic Status Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-apple-surface p-3.5 rounded-xl border border-apple-border shadow-[0_2px_8px_rgba(0,0,0,0.04)] font-mono text-xs shrink-0 self-start">
            <div className="border-r border-apple-border pr-3">
              <div className="text-[9px] text-apple-gray font-bold tracking-wider uppercase">Stored Pairs</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-sm font-bold text-apple-text">N = {N}</span>
                {N >= 128 && (
                  <span className="bg-red-50 text-red-600 border border-red-200 text-[9px] px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wider">
                    Saturated
                  </span>
                )}
              </div>
            </div>
            <div className="border-r border-apple-border pr-3">
              <div className="text-[9px] text-apple-gray font-bold tracking-wider uppercase">Dimensionality</div>
              <div className="text-sm font-bold text-apple-text mt-0.5">d = 128</div>
            </div>
            <div className="border-r border-apple-border pr-3">
              <div className="text-[9px] text-apple-gray font-bold tracking-wider uppercase">Retrieval Fidelity</div>
              <div className={`text-sm font-bold mt-0.5 ${cosSim < 0.2 ? 'text-red-500' : cosSim < 0.8 ? 'text-orange-500' : 'text-emerald-600'}`}>
                cos θ = {cosSim.toFixed(3)}
              </div>
            </div>
            <div>
              <div className="text-[9px] text-apple-gray font-bold tracking-wider uppercase">Crosstalk Leakage</div>
              <div className="text-sm font-bold text-magenta-600 mt-0.5">
                σ² = {noiseVariance.toFixed(3)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Controls & Theoretical Breakdown (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* DELIBERATE OVERLOAD CONTROL RAILS */}
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-apple-surface border border-apple-border rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-6"
          >
            <div className="flex items-center justify-between font-mono text-xs border-b border-apple-border pb-3">
              <span className="font-bold text-apple-text tracking-wider uppercase">Deliberate Overload Control Rails</span>
              <span className="text-[10px] text-apple-gray font-bold uppercase tracking-wider">Outer Product Hebbian Sum</span>
            </div>

            {/* Slider container */}
            <div className="space-y-3">
              <div className="flex items-center justify-between font-mono">
                <label className="text-[11px] font-bold text-apple-text tracking-wider uppercase">
                  Stored Key-Value Pairs (N)
                </label>
                <span className="bg-magenta-50 px-2.5 py-1 rounded-md border border-magenta-200 font-bold text-sm text-magenta-600">
                  N = {N} / 150
                </span>
              </div>

              <input
                type="range"
                min="1"
                max="150"
                value={N}
                onChange={(e) => {
                  setN(parseInt(e.target.value));
                  if (Math.random() < 0.1) playClick(); // sparse click for slider
                }}
                className="w-full h-2.5 bg-apple-border rounded-full appearance-none cursor-pointer accent-magenta-500 outline-none"
              />

              <div className="flex justify-between text-[10px] font-mono text-apple-gray font-bold uppercase tracking-wider">
                <span>N=1</span>
                <span>N=64 (Linear Rise)</span>
                <span>N=128 (d wall)</span>
                <span>N=150</span>
              </div>
            </div>

            {/* Dynamic Operating Regime */}
            <div className="bg-apple-bg border border-apple-border rounded-xl p-4 font-mono text-xs space-y-3">
              <div className="text-[10px] text-apple-gray font-bold uppercase tracking-wider">
                Dynamic Operating Regime:
              </div>
              <div className="space-y-2 text-[11px] font-bold">
                <div className={`flex justify-between items-center px-2.5 py-1.5 rounded-md transition-colors ${N >= 1 && N <= 16 ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'text-apple-gray'}`}>
                  <span className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${N >= 1 && N <= 16 ? 'bg-emerald-500' : 'bg-apple-border'}`} />
                    <span>N = 1 to 16 High Fidelity</span>
                  </span>
                  <span>cos θ &gt; 0.95</span>
                </div>
                <div className={`flex justify-between items-center px-2.5 py-1.5 rounded-md transition-colors ${N >= 17 && N <= 64 ? 'bg-violet-50 text-violet-600 border border-violet-200' : 'text-apple-gray'}`}>
                  <span className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${N >= 17 && N <= 64 ? 'bg-violet-500' : 'bg-apple-border'}`} />
                    <span>N = 17 to 64 Interference Rising</span>
                  </span>
                  <span>cos θ ~ 0.85</span>
                </div>
                <div className={`flex justify-between items-center px-2.5 py-1.5 rounded-md transition-colors ${N >= 65 && N <= 128 ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'text-apple-gray'}`}>
                  <span className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${N >= 65 && N <= 128 ? 'bg-amber-500' : 'bg-apple-border'}`} />
                    <span>N = 65 to 128 Recall Degrading</span>
                  </span>
                  <span>cos θ ~ 0.54</span>
                </div>
                <div className={`flex justify-between items-center px-2.5 py-1.5 rounded-md transition-colors ${N > 128 ? 'bg-red-50 text-red-600 border border-red-200' : 'text-apple-gray'}`}>
                  <span className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${N > 128 ? 'bg-red-500' : 'bg-apple-border'}`} />
                    <span>N &gt; 128 Complete Collapse</span>
                  </span>
                  <span>cos θ &lt; 0.20</span>
                </div>
              </div>
            </div>

            {/* Regime Jump Presets */}
            <div className="space-y-2 font-mono">
              <div className="text-[10px] text-apple-gray uppercase font-bold tracking-wider">
                Regime Jump Presets:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <button
                  onClick={() => { playClick(); setN(16); }}
                  className={`px-2 py-2 border rounded-lg transition-all cursor-pointer text-center ${
                    N === 16 ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-bold shadow-sm' : 'bg-white border-apple-border text-apple-gray hover:bg-apple-bg hover:text-apple-text font-bold'
                  }`}
                >
                  <div className="text-[11px] tracking-wider">N = 16</div>
                  <div className="text-[9px] opacity-80 mt-0.5">Safe Zone</div>
                </button>
                <button
                  onClick={() => { playClick(); setN(64); }}
                  className={`px-2 py-2 border rounded-lg transition-all cursor-pointer text-center ${
                    N === 64 ? 'bg-violet-50 border-violet-300 text-violet-700 font-bold shadow-sm' : 'bg-white border-apple-border text-apple-gray hover:bg-apple-bg hover:text-apple-text font-bold'
                  }`}
                >
                  <div className="text-[11px] tracking-wider">N = 64</div>
                  <div className="text-[9px] opacity-80 mt-0.5">Onset</div>
                </button>
                <button
                  onClick={() => { playCrunch(); setN(96); }}
                  className={`px-2 py-2 border rounded-lg transition-all cursor-pointer text-center ${
                    N === 96 ? 'bg-amber-50 border-amber-300 text-amber-700 font-bold shadow-sm' : 'bg-white border-apple-border text-apple-gray hover:bg-apple-bg hover:text-apple-text font-bold'
                  }`}
                >
                  <div className="text-[11px] tracking-wider">N = 96</div>
                  <div className="text-[9px] opacity-80 mt-0.5">(Active)</div>
                </button>
                <button
                  onClick={() => { playCrunch(); setN(150); }}
                  className={`px-2 py-2 border rounded-lg transition-all cursor-pointer text-center ${
                    N === 150 ? 'bg-red-50 border-red-300 text-red-700 font-bold shadow-sm' : 'bg-white border-apple-border text-apple-gray hover:bg-apple-bg hover:text-apple-text font-bold'
                  }`}
                >
                  <div className="text-[11px] tracking-wider">N = 150</div>
                  <div className="text-[9px] opacity-80 mt-0.5">Collapse</div>
                </button>
              </div>
            </div>
          </motion.div>

          {/* CRUCIAL MISCONCEPTION CALLOUT */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-magenta-50 border border-magenta-200 rounded-2xl p-5 sm:p-6 shadow-sm font-mono space-y-3"
          >
            <div className="flex items-center gap-2 text-magenta-600 font-bold tracking-wide uppercase text-[11px]">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>Crucial Misconception: More Patterns ≠ Free Capacity</span>
            </div>
            <p className="font-body text-apple-text leading-relaxed text-sm">
              The memory does not suddenly become "full" like a disk drive or KV-cache buffer overflow. In an uncompressed associative matrix, recall degrades continuously because <strong className="bg-white px-1.5 py-0.5 rounded border border-magenta-200 text-magenta-700">every additional stored pattern injects non-zero inner-product leakage</strong> directly into the associative readout.
            </p>
            <p className="text-xs text-magenta-700/80 italic border-l-2 border-magenta-300 pl-3 pt-1 font-serif">
              Associative accumulation is unmanaged superposition: each outer product y_k ⊗ x_k corrupts all prior coordinates unless explicitly orthogonalized or sparsified.
            </p>
          </motion.div>

          {/* Failure Mode Formal Analysis */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-apple-surface border border-apple-border rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] font-mono text-xs space-y-6"
          >
            <div className="flex items-center justify-between border-b border-apple-border pb-3">
              <span className="font-bold text-apple-text tracking-wide uppercase">Failure Mode Formal Analysis</span>
              <span className="text-[10px] text-apple-gray font-bold uppercase tracking-wider">Mathematical Proof</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="text-[9px] text-red-500 uppercase font-bold tracking-wider">Primary Failure Mode</div>
                <div className="font-bold text-red-700 mt-1.5 text-sm">Crosstalk / Interference</div>
                <div className="text-[10px] text-red-600/80 mt-2 leading-relaxed">
                  Cross-correlation leakage between non-orthogonal keys
                </div>
              </div>
              <div className="p-4 bg-apple-bg border border-apple-border rounded-xl">
                <div className="text-[9px] text-apple-gray uppercase font-bold tracking-wider">Not The Cause</div>
                <div className="font-bold text-apple-text mt-1.5 text-sm">Buffer Overflow</div>
                <div className="text-[10px] text-apple-gray mt-2 leading-relaxed">
                  Physical dimensions (d×d) remain rigidly identical
                </div>
              </div>
            </div>

            {/* Projection decomposition formula */}
            <div className="bg-apple-bg border border-apple-border p-5 rounded-xl space-y-4">
              <div className="text-[10px] text-apple-gray uppercase font-bold tracking-wider">
                Projection Decomposition:
              </div>
              <div className="text-sm font-bold text-apple-text tracking-wide font-serif italic">
                r = W • x<sub className="font-sans not-italic">q</sub> = (∑ y<sub className="font-sans not-italic">i</sub> • x<sub className="font-sans not-italic">i</sub><sup>T</sup>) • x<sub className="font-sans not-italic">q</sub>
              </div>
              <div className="text-sm font-bold text-apple-text tracking-wide font-serif italic">
                r = y<sub className="font-sans not-italic">q</sub> • (x<sub className="font-sans not-italic">q</sub><sup>T</sup> • x<sub className="font-sans not-italic">q</sub>) + ∑<sub className="font-sans not-italic">i≠q</sub> y<sub className="font-sans not-italic">i</sub> • (x<sub className="font-sans not-italic">i</sub><sup>T</sup> • x<sub className="font-sans not-italic">q</sub>)
              </div>
              <div className="text-[11px] text-apple-gray font-body leading-relaxed">
                Under independent random isotropic keys, cross terms behave as Gaussian noise with variance:
              </div>
              <div className="bg-white p-3 rounded-lg border border-magenta-200 text-center text-magenta-600 font-bold text-sm shadow-sm">
                σ²_noise = (N - 1) / d = ({N} - 1) / {d} = {noiseVariance.toFixed(3)}
              </div>
              <div className="text-xs text-apple-gray leading-relaxed font-body italic">
                When N ≈ d, the signal-to-noise ratio drops to 1.0, rendering reconstruction indistinguishable from pure thermal crosstalk.
              </div>
            </div>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: Readout Comparison & Live Visualizations (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* READOUT COMPARISON: GROUND TRUTH VS NOISY RECONSTRUCTION -> RETRO TERMINAL */}
          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="retro-terminal rounded-2xl p-6 shadow-lg space-y-5 relative overflow-hidden"
          >
            <div className="absolute inset-0 pointer-events-none opacity-10" style={{ background: 'repeating-linear-gradient(to bottom, transparent, transparent 2px, #00ff41 2px, #00ff41 4px)' }} />
            
            <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-xs border-b border-[var(--color-retro-border)] pb-4 relative z-10">
              <div className="flex items-center gap-2 font-bold text-[var(--color-retro-green)] tracking-wider">
                <span>{" >"} READOUT COMPARISON: GROUND TRUTH VS RECONSTRUCTION</span>
              </div>
              <span className="bg-[#ff3333] text-black px-2.5 py-1 rounded-[2px] font-bold text-[10px] tracking-wider uppercase shadow-[0_0_8px_rgba(255,51,51,0.6)]">
                {bitFlips}/16 BITS INVERTED
              </span>
            </div>

            <p className="text-xs text-white/80 font-sans leading-relaxed relative z-10">
              Comparing original stored vector <code className="font-mono bg-white/10 px-1 py-0.5 rounded text-[var(--color-retro-green)]">y_query</code> with the actual associative matrix readout <code className="font-mono bg-white/10 px-1 py-0.5 rounded text-[var(--color-retro-green)]">r = W • x_query</code> at <strong className="text-white font-mono bg-black border border-white/30 px-1 py-0.5 rounded">N = {N}</strong>. The continuous crosstalk pushes coordinate values across the zero threshold, corrupting discrete bipolar state recovery.
            </p>

            {/* Target Pattern Array (16 sample dims) */}
            <div className="space-y-3 font-mono relative z-10">
              <div className="flex justify-between text-[11px] uppercase tracking-wider font-bold text-[var(--color-retro-green)]">
                <span>
                  Target Discrete Pattern (y_query, 16 sample dims):
                </span>
                <span className="text-[#00ff41] drop-shadow-[0_0_4px_currentColor]">Fidelity = 1.000 (Pure)</span>
              </div>
              <div className="grid grid-cols-16 gap-1">
                {Array.from({ length: 16 }).map((_, i) => {
                  const val = queryPair.value[i];
                  return (
                    <div
                      key={i}
                      className="bg-black border border-[#00ff41]/50 text-[#00ff41] rounded-[2px] py-1.5 text-center text-[10px] font-bold shadow-md"
                      title={`Target y[${i}] = ${val > 0 ? '+1' : '-1'}`}
                    >
                      {val > 0 ? '+1' : '-1'}
                      <div className="text-[8px] text-[#00ff41]/60 font-normal mt-0.5">{i}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Noisy Readout Vector Array */}
            <div className="space-y-3 font-mono relative z-10">
              <div className="flex justify-between text-[11px] uppercase tracking-wider font-bold text-[var(--color-retro-green)]">
                <span>
                  Noisy Readout Vector r = W • x_query:
                </span>
                <span className={`${cosSim < 0.2 ? 'text-[#ff3333]' : cosSim < 0.8 ? 'text-[var(--color-retro-amber)]' : 'text-[#00ff41]'}`}>
                  cos θ = {cosSim.toFixed(3)}
                </span>
              </div>
              <div className="grid grid-cols-16 gap-1">
                {Array.from({ length: 16 }).map((_, i) => {
                  const orig = queryPair.value[i];
                  const readoutVal = r[i];
                  const isFlipped = (orig >= 0 && readoutVal < 0) || (orig < 0 && readoutVal >= 0);
                  const isWeak = Math.abs(readoutVal) < 0.1;

                  return (
                    <div
                      key={i}
                      className={`rounded-[2px] py-1.5 text-center text-[9px] font-bold border transition-colors shadow-md ${
                        isFlipped
                          ? 'bg-[#ff3333]/20 text-[#ff3333] border-[#ff3333] shadow-[0_0_8px_rgba(255,51,51,0.5)]'
                          : isWeak
                          ? 'bg-[var(--color-retro-amber)]/20 text-[var(--color-retro-amber)] border-[var(--color-retro-amber)]/50'
                          : 'bg-[#00ff41]/10 text-[#00ff41] border-[#00ff41]/50'
                      }`}
                      title={`Readout r[${i}] = ${readoutVal.toFixed(3)}, target = ${orig > 0 ? '+1' : '-1'}`}
                    >
                      <div>{readoutVal >= 0 ? `+${readoutVal.toFixed(2)}` : readoutVal.toFixed(2)}</div>
                      <div
                        className={`text-[7.5px] font-bold uppercase mt-1 tracking-wider ${
                          isFlipped ? 'text-[#ff3333]' : isWeak ? 'text-[var(--color-retro-amber)]' : 'text-[#00ff41]'
                        }`}
                      >
                        {isFlipped ? 'FLIP' : isWeak ? 'WEAK' : 'OK'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Error rate footer */}
            <div className="flex flex-wrap items-center justify-between text-[11px] font-mono pt-4 border-t border-[var(--color-retro-border)] text-[var(--color-retro-green)] relative z-10">
              <div className="flex items-center gap-1.5 text-[#ff3333] font-bold tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                <span>
                  Error Rate: {((bitFlips / 16) * 100).toFixed(1)}% (Sign Inversion)
                </span>
              </div>
              <span className="font-bold tracking-wider">
                Bit Margin σ = ±{noiseVariance.toFixed(3)}
              </span>
            </div>
          </motion.div>

          {/* FIDELITY COLLAPSE CURVE: COS θ(N) -> RETRO TERMINAL */}
          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="retro-terminal rounded-2xl p-6 shadow-lg space-y-4 relative overflow-hidden"
          >
            <div className="absolute inset-0 pointer-events-none opacity-10" style={{ background: 'repeating-linear-gradient(to bottom, transparent, transparent 2px, #00ff41 2px, #00ff41 4px)' }} />
            
            <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs border-b border-[var(--color-retro-border)] pb-3 relative z-10">
              <div className="flex items-center gap-2 font-bold text-[var(--color-retro-green)] tracking-wider">
                <span>{" >"} FIDELITY COLLAPSE CURVE: COS θ(N)</span>
              </div>
              <span className="text-black font-bold tracking-wider text-[10px] bg-[var(--color-retro-green)] px-2 py-0.5 rounded-[2px]">
                HOPFIELD WALL: N ≈ 0.14d ≈ 18
              </span>
            </div>

            {/* SVG Plot */}
            <div className="w-full bg-black border border-[var(--color-retro-border)] rounded-[4px] p-2 overflow-hidden relative z-10">
              {/* Subtle background glow behind the curve */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#00ff41]/5 via-[#00ff41]/5 to-[#ff3333]/5 pointer-events-none" />
              
              <svg viewBox="0 0 520 190" className="w-full h-auto text-xs font-mono relative z-10">
                {/* Axes */}
                <line x1="40" y1="20" x2="40" y2="160" stroke="var(--color-retro-border)" strokeWidth="1" /> 
                <line x1="40" y1="160" x2="490" y2="160" stroke="var(--color-retro-border)" strokeWidth="1" />

                {/* Horizontal reference grid */}
                <line x1="40" y1="20" x2="490" y2="20" stroke="var(--color-retro-border)" strokeDasharray="3 3" />
                <text x="10" y="24" fill="var(--color-retro-green)" fontSize="9">1.00</text> 

                <line x1="40" y1="55" x2="490" y2="55" stroke="var(--color-retro-border)" strokeDasharray="3 3" />
                <text x="10" y="59" fill="var(--color-retro-green)" fontSize="9">0.75</text>

                <line x1="40" y1="90" x2="490" y2="90" stroke="var(--color-retro-border)" strokeDasharray="3 3" />
                <text x="10" y="94" fill="var(--color-retro-green)" fontSize="9">0.50</text>

                <line x1="40" y1="125" x2="490" y2="125" stroke="var(--color-retro-border)" strokeDasharray="3 3" />
                <text x="10" y="129" fill="var(--color-retro-green)" fontSize="9">0.25</text>

                <text x="10" y="164" fill="var(--color-retro-green)" fontSize="9">0.00</text>

                {/* X labels */}
                <text x="40" y="174" fill="var(--color-retro-green)" fontSize="9" textAnchor="middle">N=1</text>
                <text x="135" y="174" fill="var(--color-retro-green)" fontSize="9" textAnchor="middle">N=32</text>
                <text x="230" y="174" fill="var(--color-retro-green)" fontSize="9" textAnchor="middle">N=64</text>
                <text x="325" y="174" fill="var(--color-retro-green)" fontSize="9" textAnchor="middle">N=96</text>
                <text x="420" y="174" fill="var(--color-retro-green)" fontSize="9" textAnchor="middle">N=128</text>
                <text x="480" y="174" fill="var(--color-retro-green)" fontSize="9" textAnchor="middle">N=150</text>

                {/* Hopfield capacity line at N=18 */}
                {(() => {
                  const hopfieldX = 40 + ((18 - 1) / 149) * 440;
                  return (
                    <g>
                      <line
                        x1={hopfieldX}
                        y1="20"
                        x2={hopfieldX}
                        y2="160"
                        stroke="#00ff41"
                        strokeWidth="1.5"
                        strokeDasharray="4 3"
                      />
                      <text
                        x={hopfieldX + 8}
                        y="100"
                        fill="#00ff41"
                        fontSize="8"
                        transform={`rotate(-90 ${hopfieldX + 8} 100)`}
                      >
                        Hopfield 0.14d ≈ 18
                      </text>
                    </g>
                  );
                })()}

                {/* Crosstalk dominance zone shaded (N >= 65) */}
                {(() => {
                  const zoneStartX = 40 + ((65 - 1) / 149) * 440;
                  return (
                    <g>
                      <rect
                        x={zoneStartX}
                        y="20"
                        width={490 - zoneStartX}
                        height="140"
                        fill="#ff3333" 
                        opacity="0.1"
                      />
                      <text
                        x={zoneStartX + 10}
                        y="35"
                        fill="#ff3333" 
                        fontSize="8"
                        fontWeight="bold"
                        letterSpacing="0.05em"
                      >
                        CROSSTALK DOMINANCE
                      </text>
                    </g>
                  );
                })()}

                {/* Dimension d=128 line */}
                {(() => {
                  const dWallX = 40 + ((128 - 1) / 149) * 440;
                  return (
                    <line
                      x1={dWallX}
                      y1="20"
                      x2={dWallX}
                      y2="160"
                      stroke="#ff3333" 
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                  );
                })()}

                {/* Curve path */}
                <path
                  d={curvePoints.reduce((acc, pt, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '')}
                  fill="none"
                  stroke="#00ff41" 
                  strokeWidth="2"
                  style={{ filter: 'drop-shadow(0px 0px 4px rgba(0, 255, 65, 0.8))' }}
                />

                {/* Active Operating Point Dot */}
                <motion.circle 
                  cx={currentPtX} 
                  cy={currentPtY} 
                  r="5" 
                  fill="#fff" 
                  stroke="#00ff41" 
                  strokeWidth="2" 
                  initial={false}
                  animate={{ cx: currentPtX, cy: currentPtY }}
                  transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  style={{ filter: 'drop-shadow(0px 0px 8px rgba(255, 255, 255, 1))' }}
                />
                
                {/* Dynamic Label Box */}
                <motion.g 
                  initial={false}
                  animate={{ x: Math.min(380, currentPtX - 35), y: Math.max(25, currentPtY - 24) }}
                  transition={{ type: "spring", stiffness: 100, damping: 20 }}
                >
                  <rect
                    width="84"
                    height="20"
                    rx="2"
                    fill="#000" 
                    stroke="#00ff41" 
                    strokeWidth="1"
                  />
                  <text
                    x="42"
                    y="13"
                    fill="#00ff41"
                    fontSize="9"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    N={N}: cos θ={cosSim.toFixed(3)}
                  </text>
                </motion.g>
              </svg>
            </div>
          </motion.div>

          {/* PAIRWISE INNER PRODUCT MATRIX (K • K^T) -> RETRO TERMINAL */}
          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="retro-terminal rounded-2xl p-6 shadow-lg space-y-4 relative overflow-hidden"
          >
            <div className="absolute inset-0 pointer-events-none opacity-10" style={{ background: 'repeating-linear-gradient(to bottom, transparent, transparent 2px, #00ff41 2px, #00ff41 4px)' }} />
            
            <div className="flex items-center justify-between font-mono text-xs border-b border-[var(--color-retro-border)] pb-3 relative z-10">
              <div className="flex items-center gap-2 font-bold text-[var(--color-retro-green)] tracking-wider">
                <span>{" >"} PAIRWISE INNER PRODUCT (K • Kᵀ) NOISE LEAKAGE</span>
              </div>
              <span className="text-[10px] text-black bg-[var(--color-retro-green)] font-bold px-2 py-0.5 rounded-[2px] tracking-widest uppercase">
                16×16 SUB-BLOCK
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center font-mono relative z-10">
              {/* 16x16 Heatmap */}
              <div className="md:col-span-5 flex justify-center">
                <Matrix3D data={gramSlice} maxVal={1.0} theme="red" size={200} />
              </div>

              {/* Explanatory callout */}
              <div className="md:col-span-7 space-y-4 text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-3.5 h-3.5 bg-[#00ff41] shadow-[0_0_8px_rgba(0,255,65,0.8)]" />
                  <span className="font-bold text-white tracking-wider">Target Auto-correlation Diagonal = 1.0</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-3.5 h-3.5 bg-[#ff3333] shadow-[0_0_8px_rgba(255,51,51,0.8)]" />
                  <span className="font-bold text-white tracking-wider">Spurious Cross-Term (|x_iᵀ x_j| &gt; 0.25)</span>
                </div>
                
                <p className="font-sans text-white/70 text-[11px] leading-relaxed pt-2">
                  In an idealized orthogonal storage, all off-diagonal entries are 0.00. Here, with <strong className="text-black font-mono bg-white font-bold px-1.5 py-0.5 rounded-sm">{N} random keys</strong> packed into <code className="text-[#00ff41] font-mono font-bold text-xs bg-[#00ff41]/10 px-1 py-0.5">d=128</code> dimensions, off-diagonal leakage accumulates catastrophically. The diagonal signal is no longer separated from the background noise floor.
                </p>
                
                <div className="border border-[var(--color-retro-green)]/30 rounded p-4 text-[11px] font-sans text-white mt-3 leading-relaxed shadow-[inset_0_0_10px_rgba(0,255,65,0.05)] bg-[#00ff41]/5">
                  <strong className="text-[var(--color-retro-green)] uppercase tracking-wider text-[11px] block mb-1">Next Chapter Hypothesis:</strong> 
                  Can non-linear thresholding or high-dimensional activation sparsification suppress these off-diagonal terms before they corrupt readout?
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
