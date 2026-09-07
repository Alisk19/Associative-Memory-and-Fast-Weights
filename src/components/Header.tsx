import React from 'react';
import { ChapterId, SimulationState } from '../types';
import { RotateCcw, Scale, FileText, HelpCircle, Check, Lock, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface HeaderProps {
  currentChapter: ChapterId;
  onSelectChapter: (ch: ChapterId) => void;
  simulationState: SimulationState;
  onReset: () => void;
  onOpenTheory: () => void;
  onOpenLogs: () => void;
  onOpenGuide: () => void;
}

const CHAPTER_LABELS: { id: ChapterId; label: string; short: string }[] = [
  { id: 0, label: 'OPEN', short: 'Intro' },
  { id: 1, label: 'MECHANISM', short: 'Mechanism' },
  { id: 2, label: 'LOAD', short: 'Load' },
  { id: 3, label: 'INTERFERENCE', short: 'Interference' },
  { id: 4, label: 'SPARSIFY', short: 'Sparsify' },
  { id: 5, label: 'BDH LENS', short: 'BDH Lens' },
  { id: 6, label: 'SANDBOX', short: 'Sandbox' },
];

export const Header: React.FC<HeaderProps> = ({
  currentChapter,
  onSelectChapter,
  simulationState,
  onReset,
  onOpenTheory,
  onOpenLogs,
  onOpenGuide,
}) => {
  const getStatusBadge = () => {
    switch (currentChapter) {
      case 0:
      case 1:
        return {
          text: `D=${simulationState.dimension}`,
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
        };
      case 2:
        return {
          text: `N=${Math.min(16, simulationState.storedCount)}, d=${simulationState.dimension}`,
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          dot: 'bg-blue-500',
        };
      case 3:
        return {
          text: `SATURATED: N=${simulationState.storedCount}`,
          bg: 'bg-orange-50 text-orange-700 border-orange-200',
          dot: 'bg-orange-500',
        };
      case 4:
        return {
          text: `SPARSE: k=${simulationState.sparsityK}`,
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
        };
      case 5:
        return {
          text: 'arXiv:2509.26507',
          bg: 'bg-slate-100 text-slate-700 border-slate-300',
          dot: 'bg-slate-500',
        };
      case 6:
      default:
        return {
          text: 'SANDBOX UNLOCKED',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
        };
    }
  };

  const badge = getStatusBadge();

  return (
    <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-md border-b border-apple-border shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Logo & Academic Track */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 font-bold tracking-tight text-apple-text font-display text-[14px]">
              <span className="inline-block w-2.5 h-2.5 bg-apple-blue rounded-full" />
              <span>Fast Weights Recall</span>
            </div>
          </div>

          {/* Dynamic Synapse State Badge */}
          <div
            className={`hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded-full border font-mono text-[10px] font-medium transition-colors ${badge.bg}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
            <span>{badge.text}</span>
          </div>
        </div>

        {/* Chapter Steps Navigation Pills */}
        <nav className="flex items-center gap-1 overflow-x-auto py-1 max-w-full relative">
          {CHAPTER_LABELS.map((ch, idx) => {
            const isActive = currentChapter === ch.id;
            const isCompleted = currentChapter > ch.id;

            return (
              <React.Fragment key={ch.id}>
                <button
                  onClick={() => onSelectChapter(ch.id)}
                  className={`relative px-3 py-1.5 rounded-full font-display text-[12px] font-medium flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'text-apple-text bg-black/5'
                      : 'text-apple-gray hover:text-apple-text hover:bg-black/5'
                  }`}
                  title={`Chapter ${ch.id}: ${ch.label}`}
                >
                  <span className="relative z-10 flex items-center gap-1.5">
                    {isCompleted ? (
                      <Check className="w-3.5 h-3.5 text-apple-blue stroke-[2.5]" />
                    ) : isActive ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-apple-blue" />
                    ) : ch.id > currentChapter + 1 && currentChapter < 5 ? (
                      <Lock className="w-3 h-3 text-apple-gray/50" />
                    ) : null}
                    <span>{ch.short}</span>
                  </span>
                </button>
                {idx < CHAPTER_LABELS.length - 1 && (
                  <ChevronRight className="w-3 h-3 text-apple-gray/40 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </nav>

        {/* Right Tools */}
        <div className="flex items-center gap-1">
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-apple-border hover:bg-black/5 text-apple-text font-display text-[11px] font-medium transition-colors cursor-pointer"
            title="Reset parameters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <div className="h-4 w-[1px] bg-apple-border mx-1" />

          <button
            onClick={onOpenTheory}
            className="p-1.5 rounded-full border border-transparent hover:bg-black/5 text-apple-gray hover:text-apple-text transition-colors cursor-pointer"
            title="Mathematical Formulations"
          >
            <Scale className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenLogs}
            className="p-1.5 rounded-full border border-transparent hover:bg-black/5 text-apple-gray hover:text-apple-text transition-colors cursor-pointer"
            title="Experimental Telemetry"
          >
            <FileText className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenGuide}
            className="p-1.5 rounded-full border border-transparent hover:bg-black/5 text-apple-gray hover:text-apple-text transition-colors cursor-pointer"
            title="Interactive Laboratory Guide"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
