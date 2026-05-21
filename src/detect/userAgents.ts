import crawlersData from '../data/crawlers.json' with { type: 'json' };

type CrawlerEntry = { name: string; ua: string; vendor: string };

const builtinCrawlers: CrawlerEntry[] = (crawlersData.crawlers ?? []) as CrawlerEntry[];

export type CrawlerMatch = { matched: false } | { matched: true; name: string };

export function matchCrawler(
  ua: string,
  customCrawlers: string[] = [],
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
  return { matched: false };
}

export function listCrawlers(): CrawlerEntry[] {
  return [...builtinCrawlers];
}
