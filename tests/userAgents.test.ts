import { describe, expect, it } from 'vitest';
import { matchCrawler, listCrawlers, listTags } from '../src/detect/userAgents.js';

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

  it('ships a non-empty tag list', () => {
    expect(listTags().length).toBeGreaterThan(0);
  });
});

describe('matchCrawler tag fallback', () => {
  it('catches an unknown Claude variant via the claude tag', () => {
    // Hypothetical future UA we have not added to the crawlers list.
    const result = matchCrawler('Mozilla/5.0 (compatible; Claude-Researcher/2.0)');
    expect(result.matched).toBe(true);
    if (result.matched) expect(result.name.toLowerCase()).toContain('claude');
  });

  it('catches a UA mentioning GPT as a token', () => {
    const result = matchCrawler('Some-Wrapper/1.0 (gpt powered)');
    expect(result.matched).toBe(true);
  });

  it('catches a third-party copilot wrapper via the copilot tag', () => {
    const result = matchCrawler('SomeCompany-Copilot/1.0');
    expect(result.matched).toBe(true);
    if (result.matched) expect(result.name.toLowerCase()).toContain('copilot');
  });

  it('catches a cowork variant via the cowork tag', () => {
    const result = matchCrawler('Foo-Cowork-Researcher/1.0');
    expect(result.matched).toBe(true);
  });

  it('matches across digit boundaries (claude3 should match claude)', () => {
    const result = matchCrawler('NewVendor-claude3-agent/1.0');
    expect(result.matched).toBe(true);
  });

  it('does NOT false-positive on look-alike words (Claudette)', () => {
    const result = matchCrawler('Mozilla/5.0 ClaudetteBrowser/1.0');
    expect(result.matched).toBe(false);
  });

  it('does NOT false-positive on Safari (ai is not a tag, but guard against future short tags)', () => {
    const ua =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';
    expect(matchCrawler(ua).matched).toBe(false);
  });

  it('respects customTags', () => {
    const result = matchCrawler('CompanyXBot/1.0 (sneaky-agent)', [], ['sneaky-agent']);
    expect(result.matched).toBe(true);
  });
});
