import { describe, expect, it } from 'vitest';
import { detectByBehavior, scoreBehavior } from '../src/detect/behavior.js';

function makeRequest(headers: Record<string, string>, method = 'GET'): Request {
  return new Request('https://example.com/', { method, headers });
}

describe('behavior detection', () => {
  it('does not flag a real-browser-like request', () => {
    const req = makeRequest({
      'user-agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
      'accept-language': 'en-US,en;q=0.9',
      'accept-encoding': 'gzip, deflate, br',
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-dest': 'document',
    });
    const result = detectByBehavior(req, 2);
    expect(result.matched).toBe(false);
  });

  it('flags a bare curl-style request at default threshold', () => {
    const req = makeRequest({
      'user-agent': 'curl/8.4.0',
      accept: '*/*',
    });
    const score = scoreBehavior(req);
    expect(score.score).toBeGreaterThanOrEqual(2);
    expect(detectByBehavior(req, 2).matched).toBe(true);
  });

  it('flags HeadlessChrome via UA marker', () => {
    const req = makeRequest({
      'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) HeadlessChrome/120.0.0.0 Safari/537.36',
      'accept-language': 'en-US',
      'accept-encoding': 'gzip',
      accept: 'text/html',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-dest': 'document',
    });
    const score = scoreBehavior(req);
    expect(score.signals.some((s) => s.startsWith('headless-ua'))).toBe(true);
  });

  it('threshold is configurable upward', () => {
    const req = makeRequest({ 'user-agent': 'curl/8', accept: '*/*' });
    expect(detectByBehavior(req, 99).matched).toBe(false);
  });
});
