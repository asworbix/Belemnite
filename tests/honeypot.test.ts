import { describe, expect, it } from 'vitest';
import { honeypotLinks, isHoneypotPath } from '../src/detect/honeypot.js';

describe('isHoneypotPath', () => {
  it('matches the prefix itself and any child', () => {
    expect(isHoneypotPath('/belemnite-honeypot', '/belemnite-honeypot')).toBe(true);
    expect(isHoneypotPath('/belemnite-honeypot/anything', '/belemnite-honeypot')).toBe(true);
    expect(isHoneypotPath('/belemnite-honeypot/a/b/c', '/belemnite-honeypot')).toBe(true);
  });

  it('does not match unrelated paths', () => {
    expect(isHoneypotPath('/about', '/belemnite-honeypot')).toBe(false);
    expect(isHoneypotPath('/belemnite-honeypotsomething', '/belemnite-honeypot')).toBe(false);
  });
});

describe('honeypotLinks', () => {
  it('emits CSS-hidden, aria-hidden anchors', () => {
    const html = honeypotLinks('/belemnite-honeypot', ['archive-2019', 'index-2021']);
    expect(html).toContain('href="/belemnite-honeypot/archive-2019"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('tabindex="-1"');
    expect(html).toContain('left:-9999px');
  });

  it('escapes special characters in slugs', () => {
    const html = honeypotLinks('/belemnite-honeypot', ['evil"<script>']);
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });
});
