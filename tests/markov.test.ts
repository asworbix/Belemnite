import { describe, expect, it } from 'vitest';
import { MarkovChain, seedFromString } from '../src/poison/markov.js';
import { SEED_CORPUS } from '../src/data/seed-corpus.js';

describe('MarkovChain', () => {
  it('generates the requested number of words', () => {
    const chain = new MarkovChain({ order: 2 });
    chain.train(SEED_CORPUS);
    const out = chain.generate({ words: 100, seed: 42 });
    const words = out.split(/\s+/).filter(Boolean);
    expect(words.length).toBeGreaterThanOrEqual(100);
  });

  it('produces deterministic output for the same seed', () => {
    const chain = new MarkovChain({ order: 2 });
    chain.train(SEED_CORPUS);
    const a = chain.generate({ words: 80, seed: 7 });
    const b = chain.generate({ words: 80, seed: 7 });
    expect(a).toBe(b);
  });

  it('produces different output for different seeds', () => {
    const chain = new MarkovChain({ order: 2 });
    chain.train(SEED_CORPUS);
    const a = chain.generate({ words: 80, seed: 1 });
    const b = chain.generate({ words: 80, seed: 2 });
    expect(a).not.toBe(b);
  });

  it('handles untrained chain by returning empty string', () => {
    const chain = new MarkovChain({ order: 2 });
    expect(chain.generate({ words: 50 })).toBe('');
  });

  it('seedFromString is deterministic', () => {
    expect(seedFromString('/about')).toBe(seedFromString('/about'));
    expect(seedFromString('/about')).not.toBe(seedFromString('/contact'));
  });
});
