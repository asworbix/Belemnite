import { describe, expect, it } from 'vitest';
import { matchCrawler, listCrawlers } from '../src/detect/userAgents.js';

describe('matchCrawler', () => {
  it('matches GPTBot', () => {
    const result = matchCrawler('Mozilla/5.0 GPTBot/1.0 (+https://openai.com/gptbot)');
    expect(result.matched).toBe(true);
    if (result.matched) expect(result.name).toBe('GPTBot');
  });

  it('matches ClaudeBot case-insensitively', () => {
    const result = matchCrawler('some-prefix claudebot suffix');
    expect(result.matched).toBe(true);
  });

  it('matches Claude-User (user-initiated fetch from Claude.ai)', () => {
    const result = matchCrawler('Mozilla/5.0 (compatible; Claude-User/1.0; +Claude-User@anthropic.com)');
    expect(result.matched).toBe(true);
    if (result.matched) expect(result.name).toBe('Claude-User');
  });

  it('matches Claude-SearchBot', () => {
    const result = matchCrawler('Mozilla/5.0 (compatible; Claude-SearchBot/1.0; +https://anthropic.com)');
    expect(result.matched).toBe(true);
    if (result.matched) expect(result.name).toBe('Claude-SearchBot');
  });

  it('does not match a vanilla browser UA', () => {
    const ua =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';
    expect(matchCrawler(ua).matched).toBe(false);
  });

  it('respects customCrawlers', () => {
    const result = matchCrawler('Mozilla/5.0 MyCustomScraper/2.0', ['MyCustomScraper']);
    expect(result.matched).toBe(true);
  });

  it('treats empty UA as no match', () => {
    expect(matchCrawler('').matched).toBe(false);
  });

  it('ships a non-empty crawler list', () => {
    expect(listCrawlers().length).toBeGreaterThan(10);
  });
});
