import React from 'react';
import { X, Scale, BookOpen } from 'lucide-react';

interface TheoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TheoryModal: React.FC<TheoryModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-[8px] max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl font-mono text-xs">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <Scale className="w-4 h-4 text-blue-600" />
            <span>MATHEMATICAL FOUNDATIONS &amp; CAPACITY THEOREMS</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 text-slate-700 font-sans leading-relaxed">
          {/* Section 1 */}
          <div className="space-y-2">
            <h3 className="font-mono font-bold text-slate-900 text-sm">
              1. Hebbian Outer-Product Storage Rule
            </h3>
            <p className="text-xs">
              Let <code className="font-mono text-slate-900">x_i ∈ ℝ^d</code> be key vectors with unit norm{' '}
              <code className="font-mono text-slate-900">||x_i|| = 1</code>, and let{' '}
              <code className="font-mono text-slate-900">y_i ∈ {'{-1, +1}'}^d</code> be value vectors.
              The collective synaptic matrix after storing <code className="font-mono text-slate-900">N</code> associations is:
            </p>
            <div className="bg-slate-50 p-3 rounded border border-slate-200 font-mono text-xs text-center font-bold text-slate-900">
              W = ∑_{'{i=1}'}^N y_i x_i^T ∈ ℝ^{'{d × d}'}
            </div>
          </div>

          {/* Section 2 */}
          <div className="space-y-2">
            <h3 className="font-mono font-bold text-slate-900 text-sm">
              2. Readout Projection &amp; Crosstalk Decomposition
            </h3>
            <p className="text-xs">
              Querying the memory with key <code className="font-mono text-slate-900">x_q</code> produces:
            </p>
            <div className="bg-slate-50 p-3 rounded border border-slate-200 font-mono text-xs text-center font-bold text-slate-900">
              r = W x_q = y_q (x_q^T x_q) + ∑_{'{i ≠ q}'} y_i (x_i^T x_q)
            </div>
            <p className="text-xs">
              For independent random isotropic keys, each inner product <code className="font-mono text-slate-900">x_i^T x_q</code> has zero mean and variance{' '}
              <code className="font-mono text-slate-900">1/d</code>. The sum of <code className="font-mono text-slate-900">N - 1</code> independent cross-terms forms a Gaussian noise field with total variance:
            </p>
            <div className="bg-slate-50 p-3 rounded border border-slate-200 font-mono text-xs text-center font-bold text-red-700">
              σ²_{'{noise}'} = (N - 1) / d
            </div>
          </div>

          {/* Section 3 */}
          <div className="space-y-2">
            <h3 className="font-mono font-bold text-slate-900 text-sm">
              3. The Classical Hopfield Capacity Bound
            </h3>
            <p className="text-xs">
              Amit, Gutfreund &amp; Sompolinsky (1985) derived the spin-glass phase transition for associative recall:
            </p>
            <div className="bg-amber-50 p-3 rounded border border-amber-200 font-mono text-xs text-center font-bold text-amber-900">
              α_c = N_max / d ≈ 0.138
            </div>
            <p className="text-xs text-slate-600">
              When <code className="font-mono text-slate-900">N &gt; 0.138 • d</code>, spurious attractor states proliferate, triggering catastrophic recall breakdown.
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-2">
            <h3 className="font-mono font-bold text-slate-900 text-sm">
              4. High-Dimensional Sparsity Mitigation (BDH Formulation)
            </h3>
            <p className="text-xs">
              By enforcing <code className="font-mono text-slate-900">k-of-d</code> binary sparsity on address keys, the collision probability between any two active coordinates is:
            </p>
            <div className="bg-emerald-50 p-3 rounded border border-emerald-200 font-mono text-xs text-center font-bold text-emerald-900">
              P(x_{'{i,m}'} x_{'{j,m}'} ≠ 0) = (k / d)²
            </div>
            <p className="text-xs text-slate-600">
              This suppresses the crosstalk noise variance by a factor of <code className="font-mono text-slate-900">k/d</code>:
            </p>
            <div className="bg-slate-50 p-3 rounded border border-slate-200 font-mono text-xs text-center font-bold text-blue-700">
              σ²_{'{sparse}'} ≈ ((N - 1) / d) • (k / d)
            </div>
            <p className="text-xs text-slate-600">
              For biological envelopes (<code className="font-mono text-slate-900">k/d ≈ 0.047</code>), this delays the interference breakdown threshold by approximately 3.5× to 4×.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-[4px] font-mono text-xs font-bold transition-colors cursor-pointer"
          >
            CLOSE THEOREM VIEWER
          </button>
        </div>
      </div>
    </div>
  );
};
