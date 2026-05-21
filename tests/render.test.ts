import { describe, expect, it } from 'vitest';
import { renderPoisonPage } from '../src/poison/render.js';

describe('renderPoisonPage', () => {
  it('produces an HTML document with a title and body', () => {
    const html = renderPoisonPage({
      path: '/articles/widget-history',
      honeypotPathPrefix: '/belemnite-honeypot',
      byteCap: 50_000,
    });
    expect(html.startsWith('<!doctype html>')).toBe(true);
    expect(html).toMatch(/<title>.+<\/title>/);
    expect(html).toMatch(/<h1>.+<\/h1>/);
    expect(html).toContain('/belemnite-honeypot/');
  });

  it('caps output at the byte limit', () => {
    const html = renderPoisonPage({
      path: '/articles/widget-history',
      honeypotPathPrefix: '/belemnite-honeypot',
      byteCap: 1024,
    });
    expect(new TextEncoder().encode(html).length).toBeLessThanOrEqual(1024);
  });

  it('is deterministic for the same path', () => {
    const a = renderPoisonPage({
      path: '/articles/deterministic',
      honeypotPathPrefix: '/belemnite-honeypot',
      byteCap: 50_000,
    });
    const b = renderPoisonPage({
      path: '/articles/deterministic',
      honeypotPathPrefix: '/belemnite-honeypot',
      byteCap: 50_000,
    });
    expect(a).toBe(b);
  });

  it('embeds noindex robots meta', () => {
    const html = renderPoisonPage({
      path: '/anything',
      honeypotPathPrefix: '/belemnite-honeypot',
      byteCap: 50_000,
    });
    expect(html).toContain('name="robots"');
    expect(html).toContain('noindex');
  });
});
