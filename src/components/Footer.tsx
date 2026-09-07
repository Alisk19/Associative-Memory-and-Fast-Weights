import React from 'react';

interface FooterProps {
  onOpenLogs?: () => void;
  onOpenTheory?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenLogs, onOpenTheory }) => {
  return (
    <footer className="border-t border-slate-200 bg-[#f8fafc] py-6 px-4 font-mono text-[11px] text-slate-500">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="font-semibold text-slate-700">
            TEAM SYNTHESIS // DATAFORGE 2026 PATHWAY TRACK
          </span>{' '}
          • PROVENANCE & PEER REVIEW ARCHIVE
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-slate-600">
          <span className="hover:text-blue-700 transition-colors">
            Ba et al. (2016) Fast Weights
          </span>
          <span className="text-slate-300">•</span>
          <span className="hover:text-blue-700 transition-colors">
            Hopfield (1982) Associative Memory
          </span>
          <span className="text-slate-300">•</span>
          <span className="hover:text-blue-700 transition-colors">
            Schlag et al. Linear Transformers
          </span>
          <span className="text-slate-300">•</span>
          <button
            onClick={onOpenTheory}
            className="text-blue-600 hover:underline cursor-pointer"
          >
            BDH Lens Formulation
          </button>
          <span className="text-slate-300">•</span>
          <button
            onClick={onOpenLogs}
            className="text-blue-600 hover:underline cursor-pointer"
          >
            Reproducibility Log
          </button>
        </div>
      </div>
    </footer>
  );
};
