// Deterministic mathematical engine for Fast Weights & Hebbian Associative Memory

export function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface KeyValuePair {
  key: number[];
  value: number[]; // bipolar {-1, +1}
  activeIndices?: number[];
}

export function generateKeyVector(
  dim: number,
  mode: 'dense' | 'sparse',
  k: number,
  rng: () => number
): { vector: number[]; activeIndices: number[] } {
  const vector = new Array(dim).fill(0);
  const activeIndices: number[] = [];

  if (mode === 'dense') {
    // Dense bipolar {-1, +1} normalized to unit norm
    const scale = 1 / Math.sqrt(dim);
    for (let i = 0; i < dim; i++) {
      const bit = rng() > 0.5 ? 1 : -1;
      vector[i] = bit * scale;
      activeIndices.push(i);
    }
  } else {
    // Sparse k-of-d non-negative binary vector
    const indices: number[] = [];
    while (indices.length < Math.min(k, dim)) {
      const idx = Math.floor(rng() * dim);
      if (!indices.includes(idx)) {
        indices.push(idx);
      }
    }
    indices.sort((a, b) => a - b);
    const scale = 1 / Math.sqrt(indices.length);
    indices.forEach((idx) => {
      vector[idx] = scale;
      activeIndices.push(idx);
    });
  }

  return { vector, activeIndices };
}

export function generateValueVector(dim: number, rng: () => number): number[] {
  const v = new Array(dim);
  for (let i = 0; i < dim; i++) {
    v[i] = rng() > 0.5 ? 1 : -1;
  }
  return v;
}

export function generateMemorySet(
  count: number,
  dim: number,
  mode: 'dense' | 'sparse',
  k: number,
  baseSeed: number = 42
): KeyValuePair[] {
  const rng = mulberry32(baseSeed);
  const pairs: KeyValuePair[] = [];

  for (let i = 0; i < count; i++) {
    const { vector: key, activeIndices } = generateKeyVector(dim, mode, k, rng);
    const value = generateValueVector(dim, rng);
    pairs.push({ key, value, activeIndices });
  }

  return pairs;
}

export function computeOuterProduct(y: number[], x: number[]): number[][] {
  const dim = y.length;
  const matrix: number[][] = [];
  for (let i = 0; i < dim; i++) {
    const row = new Array(dim);
    for (let j = 0; j < dim; j++) {
      row[j] = y[i] * x[j];
    }
    matrix.push(row);
  }
  return matrix;
}

export function computeSynapticMatrix(pairs: KeyValuePair[], dim: number): number[][] {
  const W: number[][] = Array.from({ length: dim }, () => new Array(dim).fill(0));

  for (const pair of pairs) {
    for (let i = 0; i < dim; i++) {
      const yi = pair.value[i];
      for (let j = 0; j < dim; j++) {
        W[i][j] += yi * pair.key[j];
      }
    }
  }

  return W;
}

export function matrixVectorMultiply(W: number[][], x: number[]): number[] {
  const dim = x.length;
  const result = new Array(dim).fill(0);
  for (let i = 0; i < dim; i++) {
    let sum = 0;
    const row = W[i];
    for (let j = 0; j < dim; j++) {
      sum += row[j] * x[j];
    }
    result[i] = sum;
  }
  return result;
}

export function dotProduct(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * b[i];
  }
  return sum;
}

export function vectorNorm(a: number[]): number {
  return Math.sqrt(dotProduct(a, a));
}

export function cosineSimilarity(a: number[], b: number[]): number {
  const normA = vectorNorm(a);
  const normB = vectorNorm(b);
  if (normA === 0 || normB === 0) return 0;
  return dotProduct(a, b) / (normA * normB);
}

// Compute pairwise inner product matrix K * K^T for a subset of keys
export function computeKeyGramMatrix(keys: number[][], subSize: number = 16): number[][] {
  const count = Math.min(keys.length, subSize);
  const matrix: number[][] = Array.from({ length: count }, () => new Array(count).fill(0));

  for (let i = 0; i < count; i++) {
    for (let j = 0; j < count; j++) {
      matrix[i][j] = dotProduct(keys[i], keys[j]);
    }
  }

  return matrix;
}

// Compute theoretical expected fidelity: E[cos θ] ≈ 1 / sqrt(1 + (N-1)/d) for dense
export function theoreticalFidelity(N: number, d: number, mode: 'dense' | 'sparse', k: number): number {
  if (N <= 1) return 1.0;
  let noiseVar: number;
  if (mode === 'dense') {
    noiseVar = (N - 1) / d;
  } else {
    // Sparse overlap variance scales with (k/d)^2 * d = k^2 / d
    const sparsityRatio = k / d;
    noiseVar = ((N - 1) / d) * sparsityRatio;
  }
  return 1 / Math.sqrt(1 + noiseVar);
}
