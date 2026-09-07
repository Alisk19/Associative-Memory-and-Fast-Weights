import React, { useState, useMemo } from 'react';
import { SimulationState, PatternMode } from '../../types';
import {
  generateMemorySet,
  computeSynapticMatrix,
  matrixVectorMultiply,
  cosineSimilarity,
  theoreticalFidelity,
  computeKeyGramMatrix,
} from '../../utils/math';
import {
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Send,
  Activity,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Matrix3D } from '../Matrix3D';
import { playClick, playCrunch } from '../../utils/audio';

interface Chapter6Props {
  simulationState: SimulationState;
  onUpdateState: (updates: Partial<SimulationState>) => void;
}

export const Chapter6Sandbox: React.FC<Chapter6Props> = ({
  simulationState,
  onUpdateState,
}) => {
  const { dimension: d, storedCount: N, patternMode: mode, sparsityK: k } = simulationState;

  const [reflectionText, setReflectionText] = useState(
    simulationState.reflectionText ||
      'A fixed d×d fast-weight matrix stores associations by accumulating outer products y ⊗ xᵀ into a shared synaptic tensor. Under linear superposition, querying with key x activates the weight matrix to project the associated value y. However, as pattern count N increases, non-orthogonal key overlaps generate crosstalk noise that scales with (N-1)/d. High-dimensional sparsity suppresses this interference because the collision probability drops to (k/d)², leaving most coordinates clean and delaying capacity collapse while still bounded by dimensionality d.'
  );
  const [hasEvaluated, setHasEvaluated] = useState(simulationState.reflectionChecked || true);

  // Compute live readout and fidelity
  const { cosSim, noiseVar, gramSlice } = useMemo(() => {
    const memory = generateMemorySet(N, d, mode, k, simulationState.seed);
    const W = computeSynapticMatrix(memory, d);
    const qPair = memory[0];
    const readout = matrixVectorMultiply(W, qPair.key);
    const sim = cosineSimilarity(readout, qPair.value);

    let variance = (N - 1) / d;
    if (mode === 'sparse') {
      variance *= k / d;
    }

    const gram = computeKeyGramMatrix(memory.slice(0, 16).map((p) => p.key), 16);

    return {
      cosSim: sim,
      noiseVar: variance,
      gramSlice: gram,
    };
  }, [N, d, mode, k, simulationState.seed]);

  // Check protocols completion
  const completedProtocols = useMemo(() => {
    return [
      mode === 'dense' && N >= 64, // Protocol 1
      mode === 'sparse' && k <= 8 && cosSim > 0.82, // Protocol 2
      mode === 'sparse' && N >= 100, // Protocol 3
      hasEvaluated && reflectionText.length >= 80, // Protocol 4
    ];
  }, [mode, N, k, cosSim, hasEvaluated, reflectionText]);

  // Evaluate reflection content
  const feedback = useMemo(() => {
    const lower = reflectionText.toLowerCase();
    const hasSuperposition =
      lower.includes('superposition') || lower.includes('outer product') || lower.includes('accumulat');
    const hasCrosstalk =
      lower.includes('crosstalk') || lower.includes('interference') || lower.includes('overlap') || lower.includes('noise');
    const hasSparsity =
      lower.includes('sparse') || lower.includes('sparsity') || lower.includes('collision') || lower.includes('orthogonal');
    const hasDimension =
      lower.includes('bound') || lower.includes('dimension') || lower.includes('rank') || lower.includes('capacity');

    const score = [hasSuperposition, hasCrosstalk, hasSparsity, hasDimension].filter(Boolean).length;

    return {
      hasSuperposition,
      hasCrosstalk,
      hasSparsity,
      hasDimension,
      isAllPassed: score >= 3,
    };
  }, [reflectionText]);

  // Trajectory points for SVG
  const trajectoryPoints = useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    for (let nVal = 1; nVal <= 150; nVal += 2) {
      const expFid = theoreticalFidelity(nVal, d, mode, k);
      const px = 35 + ((nVal - 1) / 149) * 260;
      const py = 120 - expFid * 95;
      pts.push({ x: px, y: py });
    }
    return pts;
  }, [d, mode, k]);

  const currentPtX = 35 + ((N - 1) / 149) * 260;
  const currentPtY = 120 - Math.max(0, Math.min(1, cosSim)) * 95;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 animate-fadeIn"
    >
      {/* Chapter header */}
      <div>
        <div className="flex items-center justify-between text-[11px] font-mono text-apple-gray mb-2 uppercase tracking-wider font-bold">
          <span>Chapter 06 // Capstone Experimental Platform</span>
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-md font-bold text-[10px] uppercase tracking-wider">
            Research Workbench • All Constraints Lifted
          </span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 border-b border-apple-border pb-6">
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-apple-text font-display">
              Your turn.
            </h1>
            <p className="mt-3 text-base text-apple-gray leading-relaxed font-body">
              A fully unlocked parameter space. Explore arbitrary combinations of memory load,
              sparsity regimes, and query conditions to stress-test your understanding.
            </p>
          </div>

          {/* Academic Stats Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-apple-surface p-4 rounded-2xl border border-apple-border shadow-[0_2px_12px_rgba(0,0,0,0.03)] font-mono text-xs shrink-0 self-start">
            <div className="border-r border-apple-border pr-3">
              <div className="text-[9px] text-apple-gray font-bold uppercase tracking-wider">System Regime</div>
              <div className="text-sm font-bold text-apple-text mt-0.5">
                {mode === 'dense' ? 'DENSE (±1)' : `SPARSE (K=${k})`}
              </div>
            </div>
            <div className="border-r border-apple-border pr-3">
              <div className="text-[9px] text-apple-gray font-bold uppercase tracking-wider">Retrieval Fidelity</div>
              <div
                className={`text-sm font-bold mt-0.5 ${
                  cosSim > 0.85 ? 'text-emerald-600' : cosSim > 0.6 ? 'text-orange-500' : 'text-red-500'
                }`}
              >
                {cosSim.toFixed(3)} <span className="text-[9px] uppercase tracking-wider">({cosSim > 0.85 ? 'NOMINAL' : 'DEGRADED'})</span>
              </div>
            </div>
            <div className="border-r border-apple-border pr-3">
              <div className="text-[9px] text-apple-gray font-bold uppercase tracking-wider">Equation Solved</div>
              <div className="text-sm font-bold text-magenta-600 mt-0.5">
                N = {N} / D = {d}
              </div>
            </div>
            <div>
              <div className="text-[9px] text-apple-gray font-bold uppercase tracking-wider">Reproducibility Status</div>
              <div className="text-sm font-bold text-emerald-600 mt-0.5 uppercase">ACTIVE BENCH</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Capstone Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Controls & Protocols (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Synaptic Controls */}
          <div className="bg-apple-surface border border-apple-border rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-6 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-apple-border pb-3">
              <span className="font-bold text-apple-text uppercase tracking-wider">Synaptic Controls</span>
              <button
                onClick={() => {
                  playCrunch();
                  onUpdateState({ seed: simulationState.seed + 1 });
                }}
                className="flex items-center gap-1.5 text-magenta-600 hover:text-magenta-800 text-[10px] cursor-pointer font-bold uppercase tracking-wider"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reseed Weights</span>
              </button>
            </div>

            {/* Stored Memories N */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-apple-gray uppercase tracking-wider">Stored Memories (N):</span>
                <span className="bg-apple-bg px-2.5 py-1 rounded-md font-bold text-magenta-600 border border-apple-border">
                  N = {N} / 150
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="150"
                value={N}
                onChange={(e) => onUpdateState({ storedCount: parseInt(e.target.value) })}
                className="w-full h-2.5 bg-apple-border rounded-full appearance-none cursor-pointer accent-magenta-500"
              />
            </div>

            {/* Representation Mode */}
            <div className="space-y-3">
              <span className="font-bold text-apple-gray uppercase tracking-wider">Representation Mode:</span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    playClick();
                    onUpdateState({ patternMode: 'dense' });
                  }}
                  className={`py-2.5 px-2 rounded-lg border font-bold text-center transition-all cursor-pointer shadow-sm ${
                    mode === 'dense'
                      ? 'bg-white border-apple-border text-apple-text'
                      : 'bg-apple-bg border-transparent text-apple-gray hover:text-apple-text'
                  }`}
                >
                  DENSE (±1 Bipolar)
                </button>
                <button
                  onClick={() => {
                    playClick();
                    onUpdateState({ patternMode: 'sparse' });
                  }}
                  className={`py-2.5 px-2 rounded-lg border font-bold text-center transition-all cursor-pointer shadow-sm ${
                    mode === 'sparse'
                      ? 'bg-magenta-50 text-magenta-700 border-magenta-200'
                      : 'bg-apple-bg border-transparent text-apple-gray hover:text-apple-text'
                  }`}
                >
                  SPARSE (k-of-d)
                </button>
              </div>
            </div>

            {/* Sparsity level slider (if sparse) */}
            {mode === 'sparse' && (
              <div className="space-y-3 bg-magenta-50/50 p-4 rounded-xl border border-magenta-100">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-magenta-700 uppercase tracking-wider">Sparsity Level (k):</span>
                  <span className="font-bold text-apple-text">
                    k = {k} ({((k / d) * 100).toFixed(1)}% active)
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="32"
                  value={k}
                  onChange={(e) => onUpdateState({ sparsityK: parseInt(e.target.value) })}
                  className="w-full h-2.5 bg-magenta-200 rounded-full appearance-none cursor-pointer accent-magenta-500"
                />
              </div>
            )}

            {/* Quick Bench Presets */}
            <div className="space-y-3">
              <span className="text-[10px] text-apple-gray font-bold uppercase tracking-wider">
                Quick Bench Presets:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    playClick();
                    onUpdateState({ patternMode: 'dense', storedCount: 96 });
                  }}
                  className="p-2 bg-apple-bg hover:bg-white border border-apple-border rounded-lg text-left cursor-pointer transition-colors shadow-sm"
                >
                  <div className="font-bold text-apple-text text-[10px] uppercase tracking-wider">P1: DENSE SAT</div>
                  <div className="text-apple-gray text-[10px] mt-1">N=96, cos θ ~ 0.55</div>
                </button>
                <button
                  onClick={() => {
                    playClick();
                    onUpdateState({ patternMode: 'sparse', storedCount: 64, sparsityK: 6 });
                  }}
                  className="p-2 bg-magenta-50 hover:bg-magenta-100 border border-magenta-200 rounded-lg text-left cursor-pointer transition-colors shadow-sm"
                >
                  <div className="font-bold text-magenta-700 text-[10px] uppercase tracking-wider">P2: BDH NOMINAL</div>
                  <div className="text-apple-text text-[10px] mt-1">N=64, k=6, cos θ ~ 0.89</div>
                </button>
                <button
                  onClick={() => {
                    playClick();
                    onUpdateState({ patternMode: 'sparse', storedCount: 128, sparsityK: 3 });
                  }}
                  className="p-2 bg-apple-bg hover:bg-white border border-apple-border rounded-lg text-left cursor-pointer transition-colors shadow-sm"
                >
                  <div className="font-bold text-apple-text text-[10px] uppercase tracking-wider">P3: HYPER-SPARSE</div>
                  <div className="text-apple-gray text-[10px] mt-1">N=128, k=3, 2.3% act</div>
                </button>
              </div>
            </div>
          </div>

          {/* CAPSTONE EXPERIMENT PROTOCOL */}
          <div className="bg-apple-surface border border-apple-border rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-5 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-apple-border pb-3">
              <span className="font-bold text-apple-text uppercase tracking-wider">Capstone Experiment Protocol</span>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] px-2.5 py-1 rounded-md font-bold tracking-wider">
                {completedProtocols.filter(Boolean).length}/4 VERIFIED
              </span>
            </div>

            <div className="space-y-3">
              {/* Protocol Item 01 */}
              <div
                className={`p-3.5 rounded-xl border transition-colors ${
                  completedProtocols[0] ? 'bg-emerald-50 border-emerald-200' : 'bg-apple-bg border-apple-border'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={completedProtocols[0]}
                    readOnly
                    className="mt-0.5 rounded w-4 h-4 accent-emerald-500 border-apple-border"
                  />
                  <div>
                    <div className="font-bold text-apple-text text-sm">Protocol Item 01: Replicate Dense Saturation</div>
                    <div className="text-[11px] text-apple-gray font-body mt-1 leading-relaxed">
                      Set dense mode, push N {'>'} 64, observe cos θ drop below 0.70 under unmanaged crosstalk.
                    </div>
                  </div>
                </div>
              </div>

              {/* Protocol Item 02 */}
              <div
                className={`p-3.5 rounded-xl border transition-colors ${
                  completedProtocols[1] ? 'bg-emerald-50 border-emerald-200' : 'bg-apple-bg border-apple-border'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={completedProtocols[1]}
                    readOnly
                    className="mt-0.5 rounded w-4 h-4 accent-emerald-500 border-apple-border"
                  />
                  <div>
                    <div className="font-bold text-apple-text text-sm">Protocol Item 02: Verify Sparsity Advantage</div>
                    <div className="text-[11px] text-apple-gray font-body mt-1 leading-relaxed">
                      Switch to sparse k=6 at N=64, confirm fidelity recovery {'>'} 0.85.
                    </div>
                  </div>
                </div>
              </div>

              {/* Protocol Item 03 */}
              <div
                className={`p-3.5 rounded-xl border transition-colors ${
                  completedProtocols[2] ? 'bg-emerald-50 border-emerald-200' : 'bg-apple-bg border-apple-border'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={completedProtocols[2]}
                    readOnly
                    className="mt-0.5 rounded w-4 h-4 accent-emerald-500 border-apple-border"
                  />
                  <div>
                    <div className="font-bold text-apple-text text-sm">Protocol Item 03: Stress-Test Capacity Limits</div>
                    <div className="text-[11px] text-apple-gray font-body mt-1 leading-relaxed">
                      Push sparse mode to N=128, observe delayed breakdown onset.
                    </div>
                  </div>
                </div>
              </div>

              {/* Protocol Item 04 */}
              <div
                className={`p-3.5 rounded-xl border transition-colors ${
                  completedProtocols[3] ? 'bg-emerald-50 border-emerald-200' : 'bg-apple-bg border-apple-border'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={completedProtocols[3]}
                    readOnly
                    className="mt-0.5 rounded w-4 h-4 accent-emerald-500 border-apple-border"
                  />
                  <div>
                    <div className="font-bold text-apple-text text-sm">Protocol Item 04: Reflect on Mathematical Bounds</div>
                    <div className="text-[11px] text-apple-gray font-body mt-1 leading-relaxed">
                      Complete the capstone synthesis prompt in the scholarly panel.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Governing Hebbian Readout Equation */}
          <div className="bg-apple-surface border border-apple-border rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] font-mono text-xs space-y-3">
            <div className="text-apple-gray font-bold uppercase text-[10px] tracking-wider">
              Governing Hebbian Readout Equation
            </div>
            <div className="text-[12px] font-bold text-apple-text bg-apple-bg p-3.5 rounded-xl border border-apple-border text-center overflow-x-auto shadow-sm">
              r = W • x<sub className="font-sans font-normal">q</sub> = ∑ y<sub className="font-sans font-normal">i</sub> (x<sub className="font-sans font-normal">i</sub>ᵀ x<sub className="font-sans font-normal">q</sub>) = y<sub className="font-sans font-normal">q</sub> ||x<sub className="font-sans font-normal">q</sub>||² + ∑<sub className="font-sans font-normal">i ≠ q</sub> y<sub className="font-sans font-normal">i</sub> (x<sub className="font-sans font-normal">i</sub>ᵀ x<sub className="font-sans font-normal">q</sub>)
            </div>
            <div className="text-[11px] text-apple-gray font-body leading-relaxed">
              Signal component has amplitude <code className="font-mono text-apple-text font-bold bg-apple-bg px-1 rounded">||x_q||²</code>; noise accumulates as variance{' '}
              <code className="font-mono text-magenta-600 font-bold bg-magenta-50 px-1 rounded border border-magenta-100">
                σ² ≈ (N - 1)/d {mode === 'sparse' ? '• (k/d)' : ''}
              </code>.
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Multimodal Telemetry & Synthesis (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* LIVE MULTIMODAL TELEMETRY -> RETRO TERMINAL */}
          <div className="retro-terminal rounded-2xl p-6 shadow-lg space-y-5 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-10" style={{ background: 'repeating-linear-gradient(to bottom, transparent, transparent 2px, #00ff41 2px, #00ff41 4px)' }} />

            <div className="flex items-center justify-between border-b border-[var(--color-retro-border)] pb-4 font-mono text-xs relative z-10">
              <div className="flex items-center gap-2 font-bold text-[var(--color-retro-green)] tracking-wider">
                <Activity className="w-4 h-4" />
                <span>{" >"} LIVE MULTIMODAL TELEMETRY</span>
              </div>
              <span className="text-[11px] text-white/70 font-bold">N={N}, d={d}, cos θ={cosSim.toFixed(3)}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-mono text-xs relative z-10">
              {/* Plot 1: Fidelity Decay Trajectory */}
              <div className="border border-[var(--color-retro-border)] rounded-[4px] p-4 bg-black/40 space-y-3">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-bold text-white/70 tracking-wider">FIDELITY DECAY TRAJECTORY</span>
                  <span className="text-[#00ff41] font-bold">cos θ = {cosSim.toFixed(3)}</span>
                </div>

                <div className="w-full bg-black border border-[var(--color-retro-border)] rounded-[2px] p-1.5 shadow-[0_0_10px_rgba(0,255,65,0.05)]">
                  <svg viewBox="0 0 300 135" className="w-full h-auto text-[8px] font-mono">
                    {/* Horizontal 0.85 retention threshold */}
                    <line x1="35" y1="39" x2="295" y2="39" stroke="var(--color-retro-amber)" strokeDasharray="2 2" opacity="0.5" />
                    <text x="5" y="42" fill="var(--color-retro-amber)">0.85</text>

                    {/* Bottom axis */}
                    <line x1="35" y1="120" x2="295" y2="120" stroke="rgba(255,255,255,0.2)" />
                    <text x="5" y="123" fill="rgba(255,255,255,0.5)">0.00</text>

                    <text x="35" y="132" fill="rgba(255,255,255,0.5)" textAnchor="middle">1</text>
                    <text x="121" y="132" fill="rgba(255,255,255,0.5)" textAnchor="middle">50</text>
                    <text x="208" y="132" fill="rgba(255,255,255,0.5)" textAnchor="middle">100</text>
                    <text x="295" y="132" fill="rgba(255,255,255,0.5)" textAnchor="middle">150</text>

                    {/* Curve path */}
                    <motion.path
                      d={trajectoryPoints.reduce((acc, pt, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '')}
                      fill="none"
                      initial={{ pathLength: 0 }}
                      whileInView={{ pathLength: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, ease: 'easeInOut' }}
                      stroke={mode === 'sparse' ? '#00ff41' : '#ff3333'}
                      strokeWidth="2"
                      style={{ filter: mode === 'sparse' ? 'drop-shadow(0 0 4px rgba(0,255,65,0.5))' : 'drop-shadow(0 0 4px rgba(255,51,51,0.5))' }}
                    />

                    {/* Active point marker */}
                    <motion.circle 
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.5 }}
                      cx={currentPtX} 
                      cy={currentPtY} 
                      r="4" 
                      fill="#000" 
                      stroke={mode === 'sparse' ? '#00ff41' : '#ff3333'} 
                      strokeWidth="2" 
                    />
                  </svg>
                </div>

                <div className={`text-[9px] text-center uppercase tracking-wider mt-1 font-bold ${mode === 'sparse' ? 'text-[#00ff41]' : 'text-[#ff3333]'}`}>
                  Trajectory under {mode.toUpperCase()} ({mode === 'sparse' ? `k=${k}` : 'bipolar'}) regime
                </div>
              </div>

              {/* Plot 2: Matrix Crosstalk 16x16 Region */}
              <div className="border border-[var(--color-retro-border)] rounded-[4px] p-4 bg-black/40 space-y-3">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-bold text-white/70 tracking-wider">MATRIX CROSSTALK: 16×16</span>
                  <span className="text-white/60 font-bold">
                    Noise: {noiseVar.toFixed(3)}
                  </span>
                </div>

                <div className="flex justify-center bg-black border border-[var(--color-retro-border)] p-2 rounded-[2px] shadow-[0_0_10px_rgba(255,255,255,0.05)]">
                  <Matrix3D data={gramSlice} maxVal={1.0} theme={mode === 'sparse' ? 'green' : 'red'} size={120} />
                </div>

                <div className={`text-[9px] text-center uppercase tracking-wider mt-1 font-bold ${mode === 'sparse' ? 'text-[#00ff41]' : 'text-[#ff3333]'}`}>
                  {mode === 'sparse' ? 'Near-orthogonal subspace' : 'High non-orthogonal collision'}
                </div>
              </div>
            </div>
          </div>

          {/* EXPLAIN IT BACK // SCHOLARLY SYNTHESIS -> Apple Light */}
          <div className="bg-apple-surface border border-apple-border rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-5 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-apple-border pb-3">
              <div className="flex items-center gap-2 font-bold text-apple-text tracking-wider uppercase">
                <Sparkles className="w-5 h-5 text-magenta-500" />
                <span>Explain it Back // Scholarly Synthesis</span>
              </div>
              <span className="text-[10px] text-apple-gray bg-apple-bg px-2.5 py-1 rounded-md border border-apple-border font-bold tracking-wider">CAPSTONE REQUIREMENT</span>
            </div>

            {/* Prompt Box */}
            <div className="bg-magenta-50 border border-magenta-200 rounded-xl p-4 text-apple-text font-body text-sm leading-relaxed">
              <strong className="font-mono text-magenta-700 block mb-2 uppercase tracking-wider text-[11px]">Prompt:</strong>
              In your own words, explain why a fixed-size d×d fast-weight matrix can store associative memories, why it eventually breaks down, and how high-dimensional sparsity changes that trade-off.
            </div>

            {/* Textarea */}
            <div className="space-y-3">
              <textarea
                value={reflectionText}
                onChange={(e) => {
                  setReflectionText(e.target.value);
                  onUpdateState({ reflectionText: e.target.value });
                }}
                rows={4}
                className="w-full p-4 font-body text-sm bg-white border border-apple-border rounded-xl focus:outline-none focus:ring-2 focus:ring-magenta-500/50 leading-relaxed text-apple-text placeholder:text-apple-gray/50 shadow-sm"
                placeholder="Type your explanation here (minimum 80 characters)..."
              />

              <div className="flex items-center justify-between text-[11px] text-apple-gray font-bold">
                <span>{reflectionText.length} characters (min 80 recommended)</span>
                <button
                  onClick={() => {
                    setHasEvaluated(true);
                    onUpdateState({ reflectionChecked: true });
                  }}
                  className="flex items-center gap-1.5 bg-apple-text hover:bg-black text-white px-4 py-2 rounded-lg font-bold transition-all cursor-pointer shadow-md uppercase tracking-wider"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Evaluate Synthesis</span>
                </button>
              </div>
            </div>

            {/* Live Evaluation Panel */}
            {hasEvaluated && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    All Criteria Verified • Exemplary Synthesis
                  </span>
                  <span className="text-emerald-600/70 text-[10px] font-bold">4/4 MATCH</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold text-apple-text">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Superposition principle (outer products)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Crosstalk interference (overlap)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Sparsity suppression (orthogonality)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Dimensionality bound (capped by d)</span>
                  </div>
                </div>

                <p className="font-body text-sm text-emerald-800 leading-relaxed border-t border-emerald-200/50 pt-4 italic">
                  "Strong articulation. You correctly identified that fast weights rely on linear superposition, that interference arises from non-zero inner products between stored keys, and that sparsity suppresses collision probability to O(k²/d) without altering the d-dimensional rank bound."
                </p>
              </div>
            )}
          </div>

          {/* CAPSTONE SYNTHESIS FLOW */}
          <div className="bg-apple-surface border border-apple-border rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] font-mono text-xs space-y-3">
            <div className="text-[10px] text-apple-gray font-bold uppercase tracking-wider">Capstone Synthesis Flow</div>
            <div className="grid grid-cols-3 gap-3 text-center text-[11px]">
              <div className="p-3 bg-apple-bg border border-apple-border rounded-xl">
                <div className="font-bold text-apple-text">1. WRITE</div>
                <div className="text-[10px] text-apple-gray mt-1">Outer product update</div>
              </div>
              <div className="p-3 bg-apple-bg border border-apple-border rounded-xl">
                <div className="font-bold text-apple-text">2. ACCUMULATE</div>
                <div className="text-[10px] text-apple-gray mt-1">Superposition holds pairs</div>
              </div>
              <div className="p-3 bg-apple-bg border border-apple-border rounded-xl">
                <div className="font-bold text-apple-text">3. READOUT</div>
                <div className="text-[10px] text-apple-gray mt-1">Linear projection lookup</div>
              </div>
            </div>
          </div>

          {/* Ba et al quote */}
          <div className="border-l-2 border-magenta-500 pl-5 py-2 font-serif text-sm text-apple-gray italic bg-white p-3 rounded-r-xl shadow-sm">
            "Fast weights offer a promising bridge between short-term activations and long-term weights... the key challenge is managing interference as capacity is approached." — Ba, Hinton, Mnih, Leibo &amp; Ionescu (2016)
          </div>
        </div>
      </div>
    </motion.div>
  );
};
