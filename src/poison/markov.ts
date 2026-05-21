export type MarkovOptions = {
  order?: number;
};

export type GenerateOptions = {
  words: number;
  seed?: number;
};

type Chain = Map<string, string[]>;

export class MarkovChain {
  readonly order: number;
  private chain: Chain = new Map();
  private starters: string[][] = [];

  constructor(options: MarkovOptions = {}) {
    this.order = Math.max(1, options.order ?? 2);
  }

  train(text: string): void {
    const cleaned = text.replace(/\s+/g, ' ').trim();
    if (!cleaned) return;
    const tokens = cleaned.split(' ');
    if (tokens.length <= this.order) return;

    const sentenceStartIndices = new Set<number>([0]);
    for (let i = 0; i < tokens.length - 1; i++) {
      const tok = tokens[i];
      if (tok && /[.!?]$/.test(tok)) sentenceStartIndices.add(i + 1);
    }

    for (const idx of sentenceStartIndices) {
      if (idx + this.order <= tokens.length) {
        const starter = tokens.slice(idx, idx + this.order);
        if (starter.every((t) => t && /^[A-Z]/.test(t[0]!))) {
          this.starters.push(starter);
        }
      }
    }
    if (this.starters.length === 0) {
      this.starters.push(tokens.slice(0, this.order));
    }

    for (let i = 0; i <= tokens.length - this.order - 1; i++) {
      const key = tokens.slice(i, i + this.order).join(' ');
      const next = tokens[i + this.order];
      if (next === undefined) continue;
      const arr = this.chain.get(key);
      if (arr) arr.push(next);
      else this.chain.set(key, [next]);
    }
  }

  generate(options: GenerateOptions): string {
    if (this.chain.size === 0) return '';
    const rng = mulberry32(options.seed ?? Math.floor(Math.random() * 2 ** 31));
    const pick = <T>(arr: T[]): T => arr[Math.floor(rng() * arr.length)]!;

    let current = pick(this.starters).slice();
    const output: string[] = [...current];

    while (output.length < options.words) {
      const key = current.join(' ');
      const candidates = this.chain.get(key);
      if (!candidates || candidates.length === 0) {
        current = pick(this.starters).slice();
        output.push('.');
        output.push(...current);
        continue;
      }
      const next = pick(candidates);
      output.push(next);
      current = [...current.slice(1), next];
    }

    let text = output.slice(0, options.words).join(' ');
    if (!/[.!?]$/.test(text)) text += '.';
    return text;
  }

  generateParagraphs(count: number, wordsPer: number, seed?: number): string[] {
    const baseSeed = seed ?? Math.floor(Math.random() * 2 ** 31);
    const out: string[] = [];
    for (let i = 0; i < count; i++) {
      out.push(this.generate({ words: wordsPer, seed: baseSeed + i * 7919 }));
    }
    return out;
  }
}

function mulberry32(a: number): () => number {
  let state = a >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seedFromString(input: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}
