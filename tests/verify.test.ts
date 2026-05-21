import { describe, expect, it } from 'vitest';
import { ipInCidr, verifyClaimedBot } from '../src/detect/verify.js';

describe('ipInCidr', () => {
  it('matches /32 exactly', () => {
    expect(ipInCidr('66.249.64.1', '66.249.64.1/32')).toBe(true);
    expect(ipInCidr('66.249.64.2', '66.249.64.1/32')).toBe(false);
  });

  it('matches /24 by network', () => {
    expect(ipInCidr('66.249.64.123', '66.249.64.0/24')).toBe(true);
    expect(ipInCidr('66.249.65.1', '66.249.64.0/24')).toBe(false);
  });

  it('matches the broad Googlebot /19', () => {
    expect(ipInCidr('66.249.64.10', '66.249.64.0/19')).toBe(true);
    expect(ipInCidr('66.249.95.255', '66.249.64.0/19')).toBe(true);
    expect(ipInCidr('66.249.96.0', '66.249.64.0/19')).toBe(false);
  });

  it('rejects malformed inputs without throwing', () => {
    expect(ipInCidr('not-an-ip', '66.249.64.0/24')).toBe(false);
    expect(ipInCidr('66.249.64.1', 'bogus')).toBe(false);
  });
});

describe('verifyClaimedBot', () => {
  it('verifies a Googlebot UA from a Google IP', () => {
    const result = verifyClaimedBot(
      'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      '66.249.64.10',
    );
    expect(result.verified).toBe(true);
  });

  it('rejects a Googlebot UA from a non-Google IP', () => {
    const result = verifyClaimedBot(
      'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      '203.0.113.10',
    );
    expect(result.verified).toBe(false);
  });

  it('returns not-verified for an unknown UA', () => {
    const result = verifyClaimedBot('curl/8', '66.249.64.10');
    expect(result.verified).toBe(false);
  });

  it('returns not-verified when no IP is provided', () => {
    const result = verifyClaimedBot('Googlebot/2.1');
    expect(result.verified).toBe(false);
  });
});
