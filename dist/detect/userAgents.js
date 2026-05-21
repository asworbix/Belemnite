import crawlersData from '../data/crawlers.json';
const builtinCrawlers = (crawlersData.crawlers ?? []);
const builtinTags = (crawlersData.tags ?? []);
export function matchCrawler(ua, customCrawlers = [], customTags = []) {
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
function containsTag(lowerUa, rawTag) {
    const tag = rawTag.toLowerCase();
    if (!tag)
        return false;
    let idx = lowerUa.indexOf(tag);
    while (idx !== -1) {
        const before = idx === 0 ? '' : (lowerUa[idx - 1] ?? '');
        const afterIdx = idx + tag.length;
        const after = afterIdx >= lowerUa.length ? '' : (lowerUa[afterIdx] ?? '');
        if (isBoundary(before) && isBoundary(after))
            return true;
        idx = lowerUa.indexOf(tag, idx + 1);
    }
    return false;
}
function isBoundary(c) {
    return c === '' || c < 'a' || c > 'z';
}
export function listCrawlers() {
    return [...builtinCrawlers];
}
export function listTags() {
    return [...builtinTags];
}
