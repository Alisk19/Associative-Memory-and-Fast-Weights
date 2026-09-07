import React, { useState } from 'react';
import { X, FileText, Copy, Download, Check } from 'lucide-react';
import { SimulationState } from '../../types';

interface LogModalProps {
  isOpen: boolean;
  onClose: () => void;
  simulationState: SimulationState;
}

export const LogModal: React.FC<LogModalProps> = ({
  isOpen,
  onClose,
  simulationState,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const logPayload = {
    laboratory: 'FAST WEIGHTS // RECALL LAB',
    track: 'DataForge 2026 Pathway Track',
    framework: 'Associative Memory Benchmark Engine',
    timestamp: new Date().toISOString(),
    parameters: {
      dimension: simulationState.dimension,
      storedCount: simulationState.storedCount,
      patternMode: simulationState.patternMode,
      sparsityK: simulationState.sparsityK,
      seed: simulationState.seed,
    },
    theoreticalMetrics: {
      noiseVariance:
        simulationState.patternMode === 'dense'
          ? (simulationState.storedCount - 1) / simulationState.dimension
          : ((simulationState.storedCount - 1) / simulationState.dimension) *
            (simulationState.sparsityK / simulationState.dimension),
      hopfieldBound: Math.floor(0.138 * simulationState.dimension),
      sparsityRatio: simulationState.sparsityK / simulationState.dimension,
    },
    protocols: {
      denseSaturation: simulationState.storedCount >= 64,
      sparsityMitigation: simulationState.patternMode === 'sparse',
      capstoneChecklist: simulationState.checklist,
      scholarlySynthesis: simulationState.reflectionText,
    },
    provenanceCitations: [
      'Ba, J., Hinton, G. E., Mnih, V., Leibo, J. Z., & Ionescu, C. (2016). Using Fast Weights to Attend to the Recent Past. NeurIPS.',
      'Hopfield, J. J. (1982). Neural networks and physical systems with emergent collective computational abilities. PNAS.',
      'Schlag, I., Irie, K., & Schmidhuber, J. (2021). Linear Transformers Are Secretly Fast Weight Programmers. ICML.',
      'Kosowski, M., & Dragon, S. (2024). BDH: Dragon Hatchling Dynamic Sparse Fast Weights. arXiv:2509.26507.',
    ],
  };

  const jsonString = JSON.stringify(logPayload, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fast-weights-provenance-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-[8px] max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl font-mono text-xs">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>EXPERIMENTAL TELEMETRY &amp; REPRODUCIBILITY LOG</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-bold uppercase text-[10px]">
              JSON Provenance Record (RFC 8259 Compliant)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded hover:bg-slate-50 text-slate-700 font-bold cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'COPIED' : 'COPY JSON'}</span>
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>DOWNLOAD FILE</span>
              </button>
            </div>
          </div>

          <pre className="bg-[#0f172a] text-[#38bdf8] p-4 rounded-[6px] overflow-x-auto text-[11px] leading-relaxed max-h-[50vh]">
            {jsonString}
          </pre>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-[4px] font-bold cursor-pointer"
          >
            CLOSE TELEMETRY
          </button>
        </div>
      </div>
    </div>
  );
};
