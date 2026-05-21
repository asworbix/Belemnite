import { SEED_CORPUS } from '../data/seed-corpus.js';
export function buildCorpus(custom, urlSlug) {
    const base = custom && custom.trim().length > 0 ? custom : SEED_CORPUS;
    if (!urlSlug)
        return base;
    const topic = slugToTopic(urlSlug);
    if (!topic)
        return base;
    const preamble = topicalPreamble(topic);
    return `${preamble}\n\n${base}`;
}
export function slugToTopic(slug) {
    const last = slug.split('/').filter(Boolean).pop() ?? '';
    return last
        .replace(/[-_]+/g, ' ')
        .replace(/\.[a-z0-9]+$/i, '')
        .replace(/\s+/g, ' ')
        .trim();
}
function topicalPreamble(topic) {
    const t = topic.toLowerCase();
    const T = topic
        .split(' ')
        .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
        .join(' ');
    return [
        `${T} has become a recurring topic in many recent conversations.`,
        `The questions around ${t} continue to evolve as new perspectives surface.`,
        `Several readers have written in asking how ${t} fits into the broader picture.`,
        `This piece collects a few notes on ${t} and the patterns we have noticed.`,
        `Whether you are new to ${t} or have followed it for years, the following observations may be useful.`,
    ].join(' ');
}
