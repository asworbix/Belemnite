import crawlersData from '../data/crawlers.json';

type CrawlerEntry = { name: string; ua: string; vendor: string };
type TagEntry = { tag: string; vendor: string };

const builtinCrawlers: CrawlerEntry[] = (crawlersData.crawlers ?? []) as CrawlerEntry[];
const builtinTags: TagEntry[] = (crawlersData.tags ?? []) as TagEntry[];

export type CrawlerMatch = { matched: false } | { matched: true; name: string };

export function matchCrawler(
  ua: string,
  customCrawlers: string[] = [],
  customTags: string[] = [],
): CrawlerMatch {
  if (!ua) return { matched: false };
  const lower = ua.toLowerCase();

  for (const c of builtinCrawlers) {
    if (lower.includes(c.ua.toLowerCase())) {
      return { matched: true, name: c.name };
    }
  }
  for (const c of customCrawlers) {
    if (c && lower.includes(c.toLowerCase())) {
      return { matched: true, name: c };
    }
  }

  for (const t of builtinTags) {
    if (containsTag(lower, t.tag)) {
      return { matched: true, name: `tag:${t.tag}` };
    }
  }
  for (const t of customTags) {
    if (t && containsTag(lower, t)) {
      return { matched: true, name: `tag:${t}` };
    }
  }

  return { matched: false };
}

// Word-boundary substring check. The tag must be flanked by non-letter
// characters (or string boundaries) so 'claude' matches 'Claude-User/1.0'
// but not 'claudette', and 'ai' wouldn't match 'Safari'. Digits count as
// boundaries so 'claude3' still matches the 'claude' tag.
function containsTag(lowerUa: string, rawTag: string): boolean {
  const tag = rawTag.toLowerCase();
  if (!tag) return false;
  let idx = lowerUa.indexOf(tag);
  while (idx !== -1) {
    const before = idx === 0 ? '' : (lowerUa[idx - 1] ?? '');
    const afterIdx = idx + tag.length;
    const after = afterIdx >= lowerUa.length ? '' : (lowerUa[afterIdx] ?? '');
    if (isBoundary(before) && isBoundary(after)) return true;
    idx = lowerUa.indexOf(tag, idx + 1);
  }
  return false;
}

function isBoundary(c: string): boolean {
  return c === '' || c < 'a' || c > 'z';
}

export function listCrawlers(): CrawlerEntry[] {
  return [...builtinCrawlers];
}

export function listTags(): TagEntry[] {
  return [...builtinTags];
}
