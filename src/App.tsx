import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { ChapterId, SimulationState, PatternMode } from './types';
import { Header } from './components/Header';
import { ChapterNav } from './components/ChapterNav';
import { Footer } from './components/Footer';

// Chapters
import { Chapter0Open } from './components/chapters/Chapter0Open';
import { Chapter1Mechanism } from './components/chapters/Chapter1Mechanism';
import { Chapter2Load } from './components/chapters/Chapter2Load';
import { Chapter3Interference } from './components/chapters/Chapter3Interference';
import { Chapter4Sparsify } from './components/chapters/Chapter4Sparsify';
import { Chapter5BdhLens } from './components/chapters/Chapter5BdhLens';
import { Chapter6Sandbox } from './components/chapters/Chapter6Sandbox';

// Modals
import { TheoryModal } from './components/modals/TheoryModal';
import { LogModal } from './components/modals/LogModal';
import { GuideModal } from './components/modals/GuideModal';

// Features
import { BootSequence } from './components/BootSequence';
import { CustomCursor } from './components/CustomCursor';
import { playClick } from './utils/audio';
import { motion, AnimatePresence } from 'framer-motion';

const PATH_MAP: Record<string, ChapterId> = {
  '/': 0,
  '/mechanism': 1,
  '/load-memory': 2,
  '/break-memory': 3,
  '/sparsify': 4,
  '/bdh-lens': 5,
  '/sandbox': 6,
};

const CHAPTER_MAP: Record<ChapterId, string> = {
  0: '/',
  1: '/mechanism',
  2: '/load-memory',
  3: '/break-memory',
  4: '/sparsify',
  5: '/bdh-lens',
  6: '/sandbox',
};

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentChapter = PATH_MAP[location.pathname] ?? 0;

  const [isBooting, setIsBooting] = useState(true);

  const [simulationState, setSimulationState] = useState<SimulationState>({
    dimension: 128,
    storedCount: 96,
    patternMode: 'sparse',
    sparsityK: 6,
    activeQueryIndex: 0,
    seed: 42,
    checklist: [true, true, true, true],
    reflectionText:
      'A fixed d×d fast-weight matrix stores associations by accumulating outer products y ⊗ xᵀ into a shared synaptic tensor. Under linear superposition, querying with key x activates the weight matrix to project the associated value y. However, as pattern count N increases, non-orthogonal key overlaps generate crosstalk noise that scales with (N-1)/d. High-dimensional sparsity suppresses this interference because the collision probability drops to (k/d)², leaving most coordinates clean and delaying capacity collapse while still bounded by dimensionality d.',
    reflectionChecked: true,
  });

  const [theoryOpen, setTheoryOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  // Track global mouse position for CSS variables (used by retro-terminal spotlights)
  useEffect(() => {
    const updateMouse = (e: MouseEvent) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', updateMouse);
    return () => window.removeEventListener('mousemove', updateMouse);
  }, []);

  const handleUpdateState = (updates: Partial<SimulationState>) => {
    setSimulationState((prev) => ({ ...prev, ...updates }));
  };

  const handleReset = () => {
    setSimulationState({
      dimension: 128,
      storedCount: currentChapter === 3 ? 96 : 64,
      patternMode: currentChapter === 3 ? 'dense' : 'sparse',
      sparsityK: 6,
      activeQueryIndex: 0,
      seed: 42,
      checklist: [true, true, true, true],
      reflectionText: simulationState.reflectionText,
      reflectionChecked: true,
    });
  };

  const handleSelectChapter = (ch: ChapterId) => {
    playClick();
    navigate(CHAPTER_MAP[ch]);
  };

  const handleDownloadLogs = () => {
    setLogOpen(true);
  };

  return (
    <>
      <CustomCursor />
      
      <AnimatePresence mode="wait">
        {isBooting ? (
          <BootSequence key="boot" onComplete={() => setIsBooting(false)} />
        ) : (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="min-h-screen bg-apple-bg text-apple-text flex flex-col selection:bg-apple-blue selection:text-white"
          >
            {/* Top Header */}
            <Header
              currentChapter={currentChapter}
              onSelectChapter={handleSelectChapter}
              simulationState={simulationState}
              onReset={handleReset}
              onOpenTheory={() => setTheoryOpen(true)}
              onOpenLogs={() => setLogOpen(true)}
              onOpenGuide={() => setGuideOpen(true)}
            />

            {/* Main Chapter Content */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                >
                  <Routes location={location} key={location.pathname}>
                    <Route path="/" element={<Chapter0Open onStart={() => handleSelectChapter(1)} />} />
                    <Route path="/mechanism" element={<Chapter1Mechanism simulationState={simulationState} />} />
                    <Route path="/load-memory" element={<Chapter2Load simulationState={simulationState} onProceedToInterference={() => handleSelectChapter(3)} />} />
                    <Route path="/break-memory" element={<Chapter3Interference simulationState={simulationState} onUpdateN={(n) => handleUpdateState({ storedCount: n })} />} />
                    <Route path="/sparsify" element={<Chapter4Sparsify simulationState={simulationState} onUpdateMode={(mode: PatternMode) => handleUpdateState({ patternMode: mode })} onUpdateK={(k: number) => handleUpdateState({ sparsityK: k })} />} />
                    <Route path="/bdh-lens" element={<Chapter5BdhLens />} />
                    <Route path="/sandbox" element={<Chapter6Sandbox simulationState={simulationState} onUpdateState={handleUpdateState} />} />
                  </Routes>
                </motion.div>
              </AnimatePresence>
            </main>

            {/* Persistent Chapter Bottom Navigation Bar */}
            <ChapterNav
              currentChapter={currentChapter}
              onSelectChapter={handleSelectChapter}
              onResetAll={handleReset}
              onDownloadLogs={handleDownloadLogs}
            />

            {/* Academic Paper Footer */}
            <Footer
              onOpenTheory={() => setTheoryOpen(true)}
              onOpenLogs={() => setLogOpen(true)}
            />

            {/* Modals */}
            <TheoryModal isOpen={theoryOpen} onClose={() => setTheoryOpen(false)} />
            <LogModal
              isOpen={logOpen}
              onClose={() => setLogOpen(false)}
              simulationState={simulationState}
            />
            <GuideModal isOpen={guideOpen} onClose={() => setGuideOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
