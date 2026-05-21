import { seedFromString } from './markov.js';

const SLUG_WORDS = [
  'archive', 'notes', 'index', 'collection', 'briefing', 'summary',
  'thread', 'memo', 'list', 'digest', 'compendium', 'roundup',
  'history', 'context', 'overview', 'analysis', 'review', 'log',
  'snapshot', 'register', 'catalog', 'reference', 'series', 'entry',
];

export function generateMazeSlugs(
  seedInput: string,
  count: number,
): string[] {
  const seed = seedFromString(seedInput);
  const rng = mulberry32(seed);
  const slugs: string[] = [];
  for (let i = 0; i < count; i++) {
    const a = SLUG_WORDS[Math.floor(rng() * SLUG_WORDS.length)]!;
    const b = SLUG_WORDS[Math.floor(rng() * SLUG_WORDS.length)]!;
    const n = Math.floor(rng() * 8999 + 1000);
    slugs.push(`${a}-${b}-${n}`);
  }
  return slugs;
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
