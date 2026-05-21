import { describe, expect, it } from 'vitest';
import { generateMazeSlugs } from '../src/poison/maze.js';

describe('generateMazeSlugs', () => {
  it('returns the requested count of well-formed slugs', () => {
    const slugs = generateMazeSlugs('/articles/widget-history', 5);
    expect(slugs).toHaveLength(5);
    for (const slug of slugs) {
      expect(slug).toMatch(/^[a-z]+-[a-z]+-\d{4}$/);
    }
  });

  it('is deterministic for the same seed', () => {
    const a = generateMazeSlugs('/x', 4);
    const b = generateMazeSlugs('/x', 4);
    expect(a).toEqual(b);
  });

  it('differs for different seeds', () => {
    const a = generateMazeSlugs('/one', 4);
    const b = generateMazeSlugs('/two', 4);
    expect(a).not.toEqual(b);
  });
});
