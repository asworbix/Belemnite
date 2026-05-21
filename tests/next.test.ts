import { describe, expect, it } from 'vitest';
import { belemnite, robotsTxt } from '../src/next.js';

describe('next adapter', () => {
  it('robotsTxt includes the honeypot Disallow', () => {
    const text = robotsTxt({ siteUrl: 'https://example.com' });
    expect(text).toContain('User-agent: *');
    expect(text).toContain('Disallow: /belemnite-honeypot/');
    expect(text).toContain('Sitemap: https://example.com/sitemap.xml');
  });

  it('robotsTxt accepts a custom prefix', () => {
    const text = robotsTxt({ honeypotPathPrefix: '/trap', disallow: ['/admin'] });
    expect(text).toContain('Disallow: /admin');
    expect(text).toContain('Disallow: /trap/');
  });

  it('belemnite factory returns a function', () => {
    const mw = belemnite({ logCatches: false });
    expect(typeof mw).toBe('function');
  });
});
