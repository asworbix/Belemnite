// Refresh src/data/verified-bots.json from upstream search-engine feeds.
// Run with: npm run refresh-bots
import { writeFileSync, readFileSync } from 'node:fs';

const TARGET = 'src/data/verified-bots.json';

const SOURCES = [
  {
    name: 'Googlebot',
    uaPatterns: ['Googlebot', 'Storebot-Google', 'Google-InspectionTool'],
    urls: [
      'https://developers.google.com/search/apis/ipranges/googlebot.json',
      'https://developers.google.com/search/apis/ipranges/special-crawlers.json',
    ],
  },
  {
    name: 'Bingbot',
    uaPatterns: ['bingbot', 'BingPreview', 'adidxbot', 'MicrosoftPreview'],
    urls: ['https://www.bing.com/toolbox/bingbot.json'],
  },
];

async function fetchPrefixes(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  const json = await res.json();
  const prefixes = json.prefixes ?? [];
  const out = [];
  for (const p of prefixes) {
    if (p.ipv4Prefix) out.push(p.ipv4Prefix);
    else if (p.ipv6Prefix) out.push(p.ipv6Prefix);
  }
  return out;
}

async function main() {
  const existing = JSON.parse(readFileSync(TARGET, 'utf8'));
  const bots = [];

  for (const source of SOURCES) {
    const cidrs = new Set();
    for (const url of source.urls) {
      try {
        const got = await fetchPrefixes(url);
        for (const c of got) cidrs.add(c);
        console.log(`  ${source.name}: ${got.length} from ${url}`);
      } catch (err) {
        console.warn(`  WARN ${source.name} ${url}: ${err.message}`);
      }
    }
    bots.push({
      name: source.name,
      uaPatterns: source.uaPatterns,
      cidrs: [...cidrs],
    });
  }

  // Preserve manually curated entries (e.g. DuckDuckGo) for which we don't
  // have a programmatic source.
  const automated = new Set(bots.map((b) => b.name));
  for (const b of existing.bots ?? []) {
    if (!automated.has(b.name)) bots.push(b);
  }

  const updated = {
    _comment: existing._comment,
    _updated: new Date().toISOString().slice(0, 10),
    _sources: existing._sources,
    bots,
  };
  writeFileSync(TARGET, JSON.stringify(updated, null, 2) + '\n');
  console.log(`wrote ${TARGET}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
