export type ChapterId = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type PatternMode = 'dense' | 'sparse';

export interface VectorRegister {
  id: string;
  name: string;
  dimension: number;
  norm: number;
  values: number[];
}

export interface ReadoutResult {
  queryIndex: number;
  yTarget: number[];
  rReadout: number[];
  cosineSimilarity: number;
  bitFlips: number;
  bitFlipRate: number;
  noiseVariance: number;
  signalToNoiseRatio: number;
}

export interface PresetConfig {
  id: string;
  label: string;
  description: string;
  n: number;
  mode: PatternMode;
  k: number;
}

export interface ExperimentProtocolItem {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  autoCheck?: (state: SimulationState) => boolean;
}

export interface SimulationState {
  dimension: number; // 128
  storedCount: number; // N
  patternMode: PatternMode;
  sparsityK: number; // k
  activeQueryIndex: number;
  seed: number;
  checklist: boolean[];
  reflectionText: string;
  reflectionChecked: boolean;
}

export interface ReproducibilityLogEntry {
  timestamp: string;
  stage: string;
  chapter: number;
  n: number;
  d: number;
  mode: PatternMode;
  k: number;
  cosineSim: number;
  noiseVar: number;
  errorRate: number;
}
