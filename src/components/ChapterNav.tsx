import React from 'react';
import { ChapterId } from '../types';
import { ArrowLeft, ArrowRight, Download, RotateCcw } from 'lucide-react';

interface ChapterNavProps {
  currentChapter: ChapterId;
  onSelectChapter: (ch: ChapterId) => void;
  onResetAll?: () => void;
  onDownloadLogs?: () => void;
}

export const ChapterNav: React.FC<ChapterNavProps> = ({
  currentChapter,
  onSelectChapter,
  onResetAll,
  onDownloadLogs,
}) => {
  const getPrevLabel = () => {
    switch (currentChapter) {
      case 1:
        return 'PREVIOUS (CHAPTER 0: OPEN)';
      case 2:
        return 'PREVIOUS (CHAPTER 1: MECHANISM)';
      case 3:
        return 'PREVIOUS (CHAPTER 2: LOAD THE MEMORY)';
      case 4:
        return 'PREVIOUS (CHAPTER 3: BREAK IT ON PURPOSE)';
      case 5:
        return 'PREVIOUS (CHAPTER 4: SPARSIFY)';
      case 6:
        return 'PREVIOUS (CHAPTER 5: BDH LENS)';
      default:
        return null;
    }
  };

  const getNextConfig = () => {
    switch (currentChapter) {
      case 0:
        return { label: 'START INQUIRY: CHAPTER 01 (MECHANISM)', next: 1 as ChapterId };
      case 1:
        return { label: 'NEXT CHAPTER: LOAD THE MEMORY (02)', next: 2 as ChapterId };
      case 2:
        return { label: 'NEXT CHAPTER: OVERLOAD & BREAK (03)', next: 3 as ChapterId };
      case 3:
        return { label: 'NEXT CHAPTER: SPARSIFY THE MEMORY (04)', next: 4 as ChapterId };
      case 4:
        return { label: 'NEXT CHAPTER: EXAMINE THE BDH LENS (05)', next: 5 as ChapterId };
      case 5:
        return { label: 'NEXT CHAPTER: ENTER THE SANDBOX (06)', next: 6 as ChapterId };
      default:
        return null;
    }
  };

  const getStageMeta = () => {
    switch (currentChapter) {
      case 0:
        return { stage: 'STAGE 00 / 06', text: 'STATUS: PREVIEW READY • d = 128' };
      case 1:
        return { stage: 'STAGE 01 / 06', text: 'STATUS: MECHANISM VERIFIED • d = 128' };
      case 2:
        return { stage: 'STAGE 02 / 06', text: 'STATUS: ACCUMULATION MONITORED • N = 16' };
      case 3:
        return { stage: 'STAGE 03 / 06', text: 'N = 96 PAIRS • STATUS: SATURATION DEMONSTRATED' };
      case 4:
        return { stage: 'STAGE 04 / 06', text: 'K = 6 • DELAYED COLLAPSE VERIFIED' };
      case 5:
        return { stage: 'STAGE 05 / 06', text: 'EVIDENCE VERIFIED • PRIMARY SOURCES ANCHORED' };
      case 6:
        return { stage: 'ALL 7 CHAPTERS COMPLETE', text: 'EXPERIMENT VERIFIED' };
      default:
        return { stage: '', text: '' };
    }
  };

  const prev = getPrevLabel();
  const next = getNextConfig();
  const meta = getStageMeta();

  return (
    <div className="bg-white/80 backdrop-blur-md border-t border-apple-border mt-12 py-3 px-4 shadow-sm relative z-10">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
        {/* Previous Button */}
        {prev ? (
          <button
            onClick={() => onSelectChapter((currentChapter - 1) as ChapterId)}
            className="group flex items-center gap-1.5 text-apple-gray hover:text-apple-text font-medium px-3 py-1.5 rounded-full hover:bg-black/5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>{prev}</span>
          </button>
        ) : (
          <div className="w-24 hidden sm:block" />
        )}

        {/* Center Stage Indicator */}
        <div className="flex items-center gap-2 text-apple-gray">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="font-semibold text-apple-text">{meta.stage}</span>
          <span className="text-apple-border">•</span>
          <span className="text-apple-gray text-[11px]">{meta.text}</span>
        </div>

        {/* Next or Sandbox Completion Actions */}
        {next ? (
          <button
            onClick={() => onSelectChapter(next.next)}
            className="group flex items-center gap-2 bg-apple-blue hover:bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-full shadow-[0_4px_14px_rgba(0,102,204,0.3)] transition-all cursor-pointer"
          >
            <span>{next.label}</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-1 transition-transform" />
          </button>
        ) : (
          <div className="flex items-center gap-2">
            {onResetAll && (
              <button
                onClick={onResetAll}
                className="flex items-center gap-1.5 px-4 py-2 border border-apple-border hover:bg-black/5 text-apple-text font-medium rounded-full transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>RESET ALL EXPERIMENTS</span>
              </button>
            )}
            {onDownloadLogs && (
              <button
                onClick={onDownloadLogs}
                className="group flex items-center gap-1.5 bg-apple-blue hover:bg-blue-600 text-white font-semibold px-5 py-2 rounded-full shadow-[0_4px_14px_rgba(0,102,204,0.3)] transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 stroke-[2.5] group-hover:-translate-y-0.5 transition-transform" />
                <span>DOWNLOAD LOG</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
