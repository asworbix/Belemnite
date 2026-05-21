import crawlersData from '../data/crawlers.json' with { type: 'json' };
const builtinCrawlers = (crawlersData.crawlers ?? []);
export function matchCrawler(ua, customCrawlers = []) {
    if (!ua)
        return { matched: false };
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
export function listCrawlers() {
    return [...builtinCrawlers];
}
