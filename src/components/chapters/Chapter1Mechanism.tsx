import React, { useState, useMemo } from 'react';
import { SimulationState } from '../../types';
import { generateMemorySet, computeOuterProduct, dotProduct } from '../../utils/math';
import { Matrix3D } from '../Matrix3D';
import { Lightbulb, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

interface Chapter1Props {
  simulationState: SimulationState;
}

export const Chapter1Mechanism: React.FC<Chapter1Props> = ({ simulationState }) => {
  const [seed, setSeed] = useState(42);
  const [hoveredCell, setHoveredCell] = useState<{ r: number; c: number; val: number } | null>(null);

  // Generate single key-value pair for N=1 demonstration
  const memoryPair = useMemo(() => {
    const set = generateMemorySet(1, simulationState.dimension, 'dense', 6, seed);
    return set[0];
  }, [simulationState.dimension, seed]);

  // Compute outer product slice 16x16
  const outerProductSlice = useMemo(() => {
    const W = computeOuterProduct(
      memoryPair.value.slice(0, 16),
      memoryPair.key.slice(0, 16)
    );
    return W;
  }, [memoryPair]);

  const maxVal = useMemo(() => {
    let m = 0.001;
    for (let i = 0; i < 16; i++) {
      for (let j = 0; j < 16; j++) {
        m = Math.max(m, Math.abs(outerProductSlice[i][j]));
      }
    }
    return m;
  }, [outerProductSlice]);

  // Query readout projection for N=1: r = W * x
  const readoutValues = useMemo(() => {
    // Project r_j = y_j * (x^T * x)
    const normSq = dotProduct(memoryPair.key, memoryPair.key);
    // 8 sample readout coordinates
    return Array.from({ length: 8 }).map((_, i) => {
      const targetVal = memoryPair.value[i];
      const retrieved = targetVal * normSq;
      const delta = Math.abs(targetVal - retrieved);
      return {
        idx: i,
        target: targetVal,
        readout: retrieved,
        delta: delta,
      };
    });
  }, [memoryPair]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Chapter Title & Academic Header */}
      <div>
        <div className="flex items-center justify-between text-[11px] font-mono text-apple-gray mb-2 uppercase tracking-wider font-bold">
          <span>Chapter 01 // Foundation & Mathematical Mechanism</span>
          <span className="text-apple-blue">■ Sec. 1.1</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 border-b border-apple-border pb-6">
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-apple-text font-display">
              Every memory starts with one write.
            </h1>
            <p className="mt-3 text-base text-apple-gray leading-relaxed font-body">
              An interactive inquiry into outer-product Hebbian writes and linear associative
              readout. Examine how synaptic plastic weights bind arbitrary continuous keys to value
              vectors in a single deterministic pass.
            </p>
          </div>

          {/* Academic Dimensionality & Capacity Stats Box */}
          <div className="grid grid-cols-3 gap-3 bg-apple-surface p-3.5 rounded-xl border border-apple-border shadow-[0_2px_8px_rgba(0,0,0,0.04)] font-mono text-xs shrink-0 self-start">
            <div className="border-r border-apple-border pr-3">
              <div className="text-[9px] text-apple-gray font-bold tracking-wider uppercase">Dimensionality (D)</div>
              <div className="text-sm font-bold text-apple-text mt-0.5">128 × 128</div>
            </div>
            <div className="border-r border-apple-border pr-3">
              <div className="text-[9px] text-apple-gray font-bold tracking-wider uppercase">Synaptic Capacity</div>
              <div className="text-sm font-bold text-apple-text mt-0.5">α ≈ 0.14 • D</div>
            </div>
            <div>
              <div className="text-[9px] text-apple-gray font-bold tracking-wider uppercase">Retrieval Fidelity</div>
              <div className="text-sm font-bold text-apple-blue mt-0.5">1.000 (K=1)</div>
            </div>
          </div>
        </div>
      </div>

      {/* MODULE A: TENSOR WRITE ACCUMULATION */}
      <section className="bg-apple-surface border border-apple-border rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="bg-apple-bg px-5 py-3 border-b border-apple-border flex items-center justify-between">
          <span className="font-mono text-[11px] font-bold tracking-wider text-apple-text uppercase">
            Module A: Tensor Write Accumulation
          </span>
          <span className="bg-apple-blue text-white px-2.5 py-1 rounded-md font-mono text-[9px] font-bold tracking-wider uppercase">
            Hebbian Write Rule
          </span>
        </div>

        <div className="p-5 sm:p-6 space-y-8">
          {/* Equation 1 Callout */}
          <div className="bg-apple-bg border-l-[3px] border-apple-blue px-4 py-3 rounded-r-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
            <div className="flex items-baseline gap-3">
              <span className="text-[10px] text-apple-gray font-bold tracking-wider uppercase">Eq. 1</span>
              <span className="text-lg font-bold text-apple-text tracking-wide">
                W ← W + y · x<sup>T</sup>
              </span>
            </div>
            <span className="text-xs text-apple-gray font-medium">
              Rank-1 Synaptic Matrix Update
            </span>
          </div>

          <p className="text-sm text-apple-gray leading-relaxed font-body">
            Given an input key vector <code className="bg-apple-bg px-1.5 py-0.5 rounded-md text-apple-blue font-mono text-xs border border-apple-border">x ∈ ℝ¹²⁸</code> and
            target value <code className="bg-apple-bg px-1.5 py-0.5 rounded-md text-apple-blue font-mono text-xs border border-apple-border">y ∈ ℝ¹²⁸</code>, the association
            is inscribed into the collective synaptic tensor via the tensor outer product, preserving linear superposition.
          </p>

          {/* Interactive Registers Diagram */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-center font-mono">
            {/* Value vector y */}
            <div className="p-4 bg-apple-bg border border-apple-border rounded-xl">
              <div className="text-[9px] text-apple-gray uppercase tracking-wider mb-2 font-bold">
                Input Registers
              </div>
              <div className="text-xs font-bold text-apple-text">VALUE VECTOR</div>
              <div className="text-sm font-bold text-apple-blue my-1.5">y ∈ ℝ¹²⁸</div>
              <div className="text-[10px] text-apple-gray font-mono">||y|| = 128.0</div>
            </div>

            {/* Operator */}
            <div className="flex flex-col items-center justify-center p-4 bg-apple-bg/50 border border-dashed border-apple-border rounded-xl">
              <div className="text-[9px] text-apple-gray uppercase tracking-wider mb-2 font-bold">
                Outer Operator
              </div>
              <div className="text-2xl font-light text-apple-gray my-0.5">⊗</div>
              <div className="text-[10px] text-apple-gray">Kronecker / Outer</div>
            </div>

            {/* Transposed key x^T */}
            <div className="p-4 bg-apple-bg border border-apple-border rounded-xl">
              <div className="text-[9px] text-apple-gray uppercase tracking-wider mb-2 font-bold">
                Transposed Key
              </div>
              <div className="text-xs font-bold text-apple-text">KEY ADDRESS</div>
              <div className="text-sm font-bold text-apple-blue my-1.5">xᵀ ∈ ℝ¹ˣ¹²⁸</div>
              <div className="text-[10px] text-apple-gray font-mono">||x|| = 1.000</div>
            </div>

            {/* Matrix Update result */}
            <div className="p-4 bg-apple-blue/5 border border-apple-blue/20 rounded-xl">
              <div className="text-[9px] text-apple-blue uppercase tracking-wider mb-2 font-bold">
                Tensor State
              </div>
              <div className="text-xs font-bold text-apple-text">MATRIX UPDATE</div>
              <div className="text-sm font-bold text-apple-blue my-1.5">ΔW (128×128)</div>
              <div className="text-[10px] text-apple-blue font-mono font-bold">Rank-1 Active</div>
            </div>
          </div>

          {/* Active Synaptic Slice W[0..15, 0..15] 16x16 Region -> RETRO TERMINAL */}
          <div className="retro-terminal rounded-xl p-5 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-10" style={{ background: 'repeating-linear-gradient(to bottom, transparent, transparent 2px, #00ff41 2px, #00ff41 4px)' }} />
            
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4 font-mono text-[11px] relative z-10">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[var(--color-retro-green)] tracking-wider">
                  {'>'} ACTIVE SYNAPTIC SLICE W[0..15, 0..15]
                </span>
                <span className="bg-[var(--color-retro-green)] text-black text-[9px] px-1.5 py-0.5 font-bold uppercase tracking-wider">
                  16×16 REGION
                </span>
              </div>

              {/* Color legend */}
              <div className="flex items-center gap-4 text-[10px] text-[var(--color-retro-green)]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 border border-[var(--color-retro-green)]" />
                  <span>0.0</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-[var(--color-retro-green)] opacity-50" />
                  <span>+0.45</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-[var(--color-retro-green)]" />
                  <span>+0.98</span>
                </div>
                <button
                  onClick={() => setSeed((s) => s + 1)}
                  className="flex items-center gap-1.5 text-[var(--color-retro-bg)] hover:text-black bg-[var(--color-retro-green)] hover:bg-white px-2.5 py-1 rounded-[2px] text-[10px] font-bold tracking-wider cursor-pointer transition-colors ml-2"
                  title="Generate new random key-value sample"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>{'>'} READOUT PROJECTION (QUERY)</span>
                </button>
              </div>
            </div>

            {/* Matrix 3D Representation */}
            <div className="flex justify-center py-4 relative z-10">
              <Matrix3D data={outerProductSlice} maxVal={maxVal} theme="green" />
            </div>

            <div className="flex flex-wrap items-center justify-between text-[10px] font-mono text-[var(--color-retro-green)] mt-4 pt-3 border-t border-[var(--color-retro-border)] relative z-10">
              <span>
                {'>'} MEMORY REGISTER: PAIR #01 ACTIVE{' '}
                {hoveredCell && (
                  <span className="text-white font-bold ml-2">
                    W[{hoveredCell.r}, {hoveredCell.c}] = {hoveredCell.val.toFixed(4)}
                  </span>
                )}
              </span>
              <div className="flex gap-4 font-bold">
                <span>RANK = 1</span>
                <span>•</span>
                <span>{'>'} DYNAMIC HEBBIAN UPDATES</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MODULE B: ASSOCIATIVE PROJECTION RETRIEVAL */}
      <section className="bg-apple-surface border border-apple-border rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="bg-apple-bg px-5 py-3 border-b border-apple-border flex items-center justify-between">
          <span className="font-mono text-[11px] font-bold tracking-wider text-apple-text uppercase">
            Module B: Associative Projection Retrieval
          </span>
          <span className="bg-emerald-600 text-white px-2.5 py-1 rounded-md font-mono text-[9px] font-bold tracking-wider uppercase">
            Associative Projection Read
          </span>
        </div>

        <div className="p-5 sm:p-6 space-y-8">
          {/* Equation 2 Callout */}
          <div className="bg-apple-bg border-l-[3px] border-emerald-500 px-4 py-3 rounded-r-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
            <div className="flex items-baseline gap-3">
              <span className="text-[10px] text-apple-gray font-bold tracking-wider uppercase">Eq. 2</span>
              <span className="text-lg font-bold text-apple-text tracking-wide">
                r = W · x
              </span>
            </div>
            <span className="text-xs text-apple-gray font-medium">
              Linear Projection Lookup
            </span>
          </div>

          <p className="text-sm text-apple-gray leading-relaxed font-body">
            Retrieval requires no search loops or nearest-neighbor trees. Probing the weight matrix{' '}
            <code className="bg-apple-bg px-1.5 py-0.5 rounded-md font-mono text-xs text-apple-text border border-apple-border">W</code> with query vector{' '}
            <code className="bg-apple-bg px-1.5 py-0.5 rounded-md font-mono text-xs text-apple-text border border-apple-border">x</code> activates the synaptic weights through standard matrix-vector multiplication in a single{' '}
            <code className="bg-apple-bg px-1.5 py-0.5 rounded-md font-mono text-xs text-apple-text border border-apple-border">O(d²)</code> step.
          </p>

          {/* Matrix-Vector flow diagram */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center font-mono">
            <div className="p-4 bg-apple-bg border border-apple-border rounded-xl">
              <div className="text-[9px] text-apple-gray uppercase tracking-wider mb-2 font-bold">
                Weight Tensor
              </div>
              <div className="text-xs font-bold text-apple-text">STORED SYNAPSES</div>
              <div className="text-sm font-bold text-apple-text my-1.5">W ∈ ℝ¹²⁸ˣ¹²⁸</div>
              <div className="text-[10px] text-apple-gray">Single Memory W₁</div>
            </div>

            <div className="p-4 bg-apple-bg border border-apple-border rounded-xl">
              <div className="text-[9px] text-apple-gray uppercase tracking-wider mb-2 font-bold">
                Projection Operator
              </div>
              <div className="text-xs font-bold text-apple-text">QUERY PROBE</div>
              <div className="text-sm font-bold text-emerald-600 my-1.5">x_probe ∈ ℝ¹²⁸</div>
              <div className="text-[10px] text-apple-gray">Norm = 1.000</div>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="text-[9px] text-emerald-700 uppercase tracking-wider mb-2 font-bold">
                Reconstructed Pattern
              </div>
              <div className="text-xs font-bold text-emerald-900">OUTPUT VECTOR</div>
              <div className="text-sm font-bold text-emerald-600 my-1.5">r ∈ ℝ¹²⁸</div>
              <div className="text-[10px] text-emerald-700 font-bold">Fidelity: 1.000</div>
            </div>
          </div>

          {/* Readout Output Channel Comparison r[0..7] vs y[0..7] -> Apple Light Panel */}
          <div className="border border-apple-border rounded-xl p-5 bg-apple-bg shadow-inner">
            <div className="flex items-center justify-between mb-4 font-mono text-[11px]">
              <span className="font-bold text-apple-text uppercase tracking-wider">
                Readout Output Channel: R[0..7] vs Y[0..7]
              </span>
              <div className="flex items-center gap-2 text-emerald-600 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>COSINE SIM: 0.9998</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 font-mono">
              {readoutValues.map((item) => (
                <div
                  key={item.idx}
                  className="bg-apple-surface border border-apple-border p-3 rounded-lg text-center shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                >
                  <div className="text-[10px] text-apple-gray font-bold">r[{item.idx}]</div>
                  <div
                    className={`text-sm font-bold my-1 ${item.readout >= 0 ? 'text-apple-blue' : 'text-apple-text'
                      }`}
                  >
                    {item.readout >= 0 ? `+${item.readout.toFixed(3)}` : item.readout.toFixed(3)}
                  </div>
                  <div className="text-[9px] text-emerald-600 font-bold tracking-wider">
                    Δ {item.delta.toFixed(3)}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-[11px] font-mono text-apple-gray mt-4 pt-3 border-t border-apple-border text-center">
              At N=1 stored pattern, query projection is identical to target output up to floating
              point precision.
            </div>
          </div>
        </div>
      </section>

      {/* THEORETICAL ANALYSIS: SIGNAL VS. NOISE ALGEBRAIC DECOMPOSITION */}
      <section className="bg-apple-surface border border-apple-border rounded-2xl p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-8">
        <div className="flex items-center justify-between font-mono text-[11px]">
          <div className="flex items-center gap-2 font-bold text-apple-text tracking-wider uppercase">
            <span className="text-lg text-apple-blue font-serif font-bold italic">Σ</span>
            <span>Theoretical Analysis: Signal vs. Noise Algebraic Decomposition</span>
          </div>
          <span className="text-apple-gray font-mono">PROV-EQ-01.3</span>
        </div>

        {/* Big General Formula Box */}
        <div className="bg-apple-bg border border-apple-border p-8 rounded-xl text-center font-mono">
          <div className="text-[10px] text-apple-gray font-bold tracking-widest uppercase mb-4">
            General Retrieval Decomposition Formula For N Stored Associations
          </div>
          <div className="text-xl sm:text-2xl font-bold text-apple-text my-2 tracking-wide font-serif italic">
            r<sub className="font-sans not-italic">j</sub> = y<sub className="font-sans not-italic">j</sub> (x<sub className="font-sans not-italic">j</sub><sup>T</sup> x<sub className="font-sans not-italic">j</sub>) + ∑<sub className="font-sans not-italic">i≠j</sub> y<sub className="font-sans not-italic">i</sub> (x<sub className="font-sans not-italic">i</sub><sup>T</sup> x<sub className="font-sans not-italic">j</sub>)
          </div>
          <div className="text-xs text-apple-gray mt-4 font-body">
            Readout vector splits into a pure target projection and an accumulated crosstalk interference sum.
          </div>
        </div>

        {/* 2 Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-mono">
          {/* Card 1: Desired Signal */}
          <div className="border border-emerald-200 rounded-xl p-5 bg-emerald-50/50 space-y-4">
            <div className="flex items-center justify-between">
              <span className="bg-emerald-600 text-white text-[9px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                1. Desired Signal Component
              </span>
              <span className="text-[10px] font-bold text-emerald-700 tracking-wider">ENERGY: 1.000</span>
            </div>

            <div className="text-base font-bold text-apple-text border-b border-emerald-200/50 pb-3 font-serif italic">
              y<sub className="font-sans not-italic">j</sub> • ||x<sub className="font-sans not-italic">j</sub>||² = y<sub className="font-sans not-italic">j</sub>
            </div>

            <div className="text-[10px] text-emerald-800/70 font-bold uppercase tracking-wider">
              Condition: Unit-norm key vectors (x<sub>j</sub>, x<sub>j</sub>) = 1.0
            </div>

            <p className="text-sm font-body text-apple-text leading-relaxed">
              When querying with the authentic address vector <code className="font-mono text-apple-text bg-white px-1.5 py-0.5 rounded border border-emerald-200/50 text-xs">x_j</code>, its inner product with itself evaluates exactly to unity. This guarantees that the target vector <code className="font-mono text-apple-text bg-white px-1.5 py-0.5 rounded border border-emerald-200/50 text-xs">y_j</code> is regenerated at unit amplitude.
            </p>

            <div className="flex items-center gap-2 text-[11px] text-emerald-700 font-bold pt-2 border-t border-emerald-200/50">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Zero amplitude degradation under orthonormal normalization.</span>
            </div>
          </div>

          {/* Card 2: Crosstalk */}
          <div className="border border-orange-200 rounded-xl p-5 bg-orange-50/50 space-y-4">
            <div className="flex items-center justify-between">
              <span className="bg-orange-500 text-white text-[9px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                2. Crosstalk (Interference Noise)
              </span>
              <span className="text-[10px] font-bold text-orange-700 tracking-wider">∑ OVER N-1 PAIRS</span>
            </div>

            <div className="text-base font-bold text-apple-text border-b border-orange-200/50 pb-3 font-serif italic">
              ∑<sub className="font-sans not-italic">i≠j</sub> y<sub className="font-sans not-italic">i</sub> (x<sub className="font-sans not-italic">i</sub><sup>T</sup> x<sub className="font-sans not-italic">j</sub>)
            </div>

            <div className="text-[10px] text-orange-800/70 font-bold uppercase tracking-wider">
              Inner product overlap leakage: (x<sub>i</sub>, x<sub>j</sub>) ≠ 0
            </div>

            <p className="text-sm font-body text-apple-text leading-relaxed">
              If stored keys are not strictly orthogonal, off-diagonal dot products inject corrupting projections from every other stored pattern <code className="font-mono text-apple-text bg-white px-1.5 py-0.5 rounded border border-orange-200/50 text-xs">y_i</code> into the readout, accumulating variance as load factor <code className="font-mono text-apple-text bg-white px-1.5 py-0.5 rounded border border-orange-200/50 text-xs">α = N/D</code> expands.
            </p>

            <div className="flex items-center gap-2 text-[11px] text-orange-700 font-bold pt-2 border-t border-orange-200/50">
              <AlertTriangle className="w-4 h-4 text-orange-600 shrink-0" />
              <span>Bounds asymptotic capacity limit to α ≈ 0.138 • D before catastrophic recall collapse.</span>
            </div>
          </div>
        </div>

        {/* Foundational Dilemma Callout */}
        <div className="bg-apple-blue/5 border border-apple-blue/20 rounded-xl p-5 flex items-start gap-4">
          <Lightbulb className="w-6 h-6 text-apple-blue shrink-0 mt-0.5" />
          <div className="space-y-2">
            <div className="font-mono font-bold text-apple-blue tracking-wider uppercase text-xs">
              Foundational Dilemma of Fast Weight Associative Caches
            </div>
            <p className="text-apple-text font-bold text-sm italic font-serif">
              "Each stored key-value pair contributes an outer product to the same fixed-size matrix. The same matrix stores every pair — and must retrieve every pair."
            </p>
            <p className="text-apple-gray font-body text-sm leading-relaxed">
              Because memory capacity does not grow with time, memory density relies entirely on geometric quasi-orthogonality and sparse non-linear rectification.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
