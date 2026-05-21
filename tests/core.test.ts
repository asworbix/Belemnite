import { describe, expect, it, vi } from 'vitest';
import { handleRequest, resolveConfig } from '../src/core.js';

function makeRequest(opts: {
  url?: string;
  ua?: string;
  headers?: Record<string, string>;
  cookie?: string;
}): Request {
  const headers: Record<string, string> = {
    'user-agent': opts.ua ?? 'Mozilla/5.0',
    'accept-language': 'en-US,en;q=0.9',
    'accept-encoding': 'gzip, deflate, br',
    accept: 'text/html,application/xhtml+xml',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-dest': 'document',
    ...(opts.headers ?? {}),
  };
  if (opts.cookie) headers.cookie = opts.cookie;
  return new Request(opts.url ?? 'https://example.com/', { headers });
}

describe('handleRequest', () => {
  it('passes a normal browser request through', () => {
    const config = resolveConfig({ logCatches: false });
    const req = makeRequest({});
    expect(handleRequest(req, config).kind).toBe('pass');
  });

  it('poisons a request from GPTBot with the default body', () => {
    const config = resolveConfig({ logCatches: false });
    const req = makeRequest({ ua: 'Mozilla/5.0 GPTBot/1.0 (+https://openai.com/gptbot)' });
    const result = handleRequest(req, config);
    expect(result.kind).toBe('poison');
    if (result.kind === 'poison') {
      expect(result.body).toBe('fart');
      expect(result.contentType).toBe('text/plain; charset=utf-8');
    }
  });

  it('respects a custom poisonBody and contentType', () => {
    const config = resolveConfig({
      logCatches: false,
      poisonBody: 'go away',
      poisonContentType: 'text/plain',
    });
    const req = makeRequest({ ua: 'GPTBot/1.0' });
    const result = handleRequest(req, config);
    expect(result.kind).toBe('poison');
    if (result.kind === 'poison') {
      expect(result.body).toBe('go away');
      expect(result.contentType).toBe('text/plain');
    }
  });

  it('blocks in block mode', () => {
    const config = resolveConfig({ mode: 'block', logCatches: false });
    const req = makeRequest({ ua: 'GPTBot/1.0' });
    expect(handleRequest(req, config).kind).toBe('block');
  });

  it('passes through in observe mode but still calls onCatch', () => {
    const onCatch = vi.fn();
    const config = resolveConfig({ mode: 'observe', logCatches: false, onCatch });
    const req = makeRequest({ ua: 'GPTBot/1.0' });
    expect(handleRequest(req, config).kind).toBe('pass');
    expect(onCatch).toHaveBeenCalledOnce();
  });

  it('poisons a request to a honeypot URL regardless of UA', () => {
    const config = resolveConfig({ logCatches: false });
    const req = makeRequest({
      url: 'https://example.com/belemnite-honeypot/anything',
      ua:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
    });
    expect(handleRequest(req, config).kind).toBe('poison');
  });

  it('passes through verified Googlebot from a Google IP', () => {
    const config = resolveConfig({ logCatches: false });
    const req = makeRequest({
      ua: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    });
    expect(handleRequest(req, config, { ip: '66.249.64.10' }).kind).toBe('pass');
  });

  it('does not pass a Googlebot UA from a non-Google IP (but Googlebot is not on the AI crawler list, so it still passes via behavior check)', () => {
    // Per the brief's acceptance criteria #3: an unverified Googlebot UA from
    // a non-Google IP falls through to other checks. Googlebot is NOT on the
    // AI crawler list, so it should still pass.
    const config = resolveConfig({ logCatches: false });
    const req = makeRequest({
      ua: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    });
    expect(handleRequest(req, config, { ip: '203.0.113.1' }).kind).toBe('pass');
  });

  it('passes when the user appears authenticated', () => {
    const config = resolveConfig({ logCatches: false });
    const req = makeRequest({
      ua: 'GPTBot/1.0',
      cookie: 'session=abc123',
    });
    expect(handleRequest(req, config).kind).toBe('pass');
  });

  it('respects excludePaths', () => {
    const config = resolveConfig({ logCatches: false, excludePaths: ['/api'] });
    const req = makeRequest({
      url: 'https://example.com/api/anything',
      ua: 'GPTBot/1.0',
    });
    expect(handleRequest(req, config).kind).toBe('pass');
  });

  it('catches a low-signal automation request via behavior', () => {
    const config = resolveConfig({ logCatches: false });
    const req = new Request('https://example.com/', {
      headers: { 'user-agent': 'curl/8.0', accept: '*/*' },
    });
    expect(handleRequest(req, config).kind).toBe('poison');
  });

  it('emits a structured CatchEvent via onCatch', () => {
    const onCatch = vi.fn();
    const config = resolveConfig({ logCatches: false, onCatch });
    const req = makeRequest({ ua: 'CCBot/2.0' });
    handleRequest(req, config, { ip: '198.51.100.7' });
    expect(onCatch).toHaveBeenCalledOnce();
    const event = onCatch.mock.calls[0]![0];
    expect(event.reason).toBe('ua');
    expect(event.userAgent).toContain('CCBot');
    expect(event.path).toBe('/');
    expect(event.ip).toBe('198.51.100.7');
    expect(typeof event.timestamp).toBe('string');
  });
});

describe('middleware latency', () => {
  it('handles a request in well under 50ms', () => {
    const config = resolveConfig({ logCatches: false });
    const req = new Request('https://example.com/articles/widget-history', {
      headers: {
        'user-agent': 'Mozilla/5.0 GPTBot/1.0',
        'accept-language': 'en-US',
        'accept-encoding': 'gzip',
        accept: 'text/html',
      },
    });
    const t0 = performance.now();
    handleRequest(req, config);
    const elapsed = performance.now() - t0;
    expect(elapsed).toBeLessThan(50);
  });
});
