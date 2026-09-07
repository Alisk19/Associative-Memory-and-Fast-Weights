import React from 'react';
import { X, HelpCircle, Key, BookOpen, Compass } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-[8px] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl font-mono text-xs">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <span>LABORATORY GUIDE &amp; INTERACTIVE CONTROLS</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-slate-700 font-sans leading-relaxed">
          <div className="space-y-2">
            <h4 className="font-mono font-bold text-slate-900 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-blue-600" />
              <span>Pedagogical Objective</span>
            </h4>
            <p className="text-xs">
              This laboratory provides an intuitive yet mathematically grounded investigation into
              Fast Weights (Ba et al., 2016) and Modern Hopfield Associative Memories. You will
              experience firsthand why linear superposition is so elegant at low loads, how crosstalk
              inevitably breaks it, and how high-dimensional sparsity (BDH / Dragon Hatchling)
              delays associative collapse.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-mono font-bold text-slate-900 flex items-center gap-1.5">
              <Key className="w-4 h-4 text-blue-600" />
              <span>Interactive Controls</span>
            </h4>
            <ul className="text-xs space-y-1.5 list-disc pl-5">
              <li>
                <strong>Sliders:</strong> Adjust memory capacity <code className="font-mono text-slate-900">N</code> and sparsity level <code className="font-mono text-slate-900">k</code> dynamically.
              </li>
              <li>
                <strong>Heatmaps:</strong> Hover over any 16×16 cell to inspect exact coordinate indices and floating-point weight magnitudes.
              </li>
              <li>
                <strong>Presets:</strong> Click regime jump buttons (e.g. N=16, N=64, N=96, N=150) to observe phase transitions immediately.
              </li>
              <li>
                <strong>Synthesis Evaluator:</strong> In the capstone sandbox (Chapter 6), write your explanation and click "Check My Explanation" to test your grasp against the formal criteria.
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-mono font-bold text-slate-900 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>Primary Literature Citations</span>
            </h4>
            <div className="text-[11px] font-mono text-slate-600 space-y-1 bg-slate-50 p-3 rounded border border-slate-200">
              <div>• Ba et al. (2016) "Using Fast Weights to Attend to the Recent Past"</div>
              <div>• Hopfield (1982) "Neural networks and physical systems with emergent computational abilities"</div>
              <div>• Kosowski &amp; Dragon (2024) "BDH: Dragon Hatchling Dynamic Sparse Fast Weights", arXiv:2509.26507</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-[4px] font-bold cursor-pointer"
          >
            DISMISS GUIDE
          </button>
        </div>
      </div>
    </div>
  );
};
