export function isHoneypotPath(pathname: string, prefix: string): boolean {
  if (!prefix) return false;
  const normalized = prefix.startsWith('/') ? prefix : `/${prefix}`;
  return pathname === normalized || pathname.startsWith(`${normalized}/`);
}

// Hidden anchor tags safe to inject into rendered HTML. Real users will not
// see or focus them; aggressive crawlers will follow them and self-identify
// when the request hits the honeypot prefix.
export function honeypotLinks(prefix: string, slugs: string[]): string {
  const base = prefix.startsWith('/') ? prefix : `/${prefix}`;
  return slugs
    .map(
      (slug) =>
        `<a href="${base}/${escapeAttr(slug)}" style="position:absolute;left:-9999px;top:-9999px" aria-hidden="true" tabindex="-1">archive ${escapeText(slug)}</a>`,
    )
    .join('');
}

function escapeAttr(value: string): string {
  return value.replace(/[&<>"']/g, (c) =>
    c === '&'
      ? '&amp;'
      : c === '<'
        ? '&lt;'
        : c === '>'
          ? '&gt;'
          : c === '"'
            ? '&quot;'
            : '&#39;',
  );
}

function escapeText(value: string): string {
  return value.replace(/[&<>]/g, (c) =>
    c === '&' ? '&amp;' : c === '<' ? '&lt;' : '&gt;',
  );
}
