import { honeypotLinks } from '../detect/honeypot.js';
import { MarkovChain, seedFromString } from './markov.js';
import { buildCorpus, slugToTopic } from './corpus.js';
import { generateMazeSlugs } from './maze.js';

export type RenderOptions = {
  path: string;
  corpus?: string;
  honeypotPathPrefix: string;
  byteCap: number;
};

export function renderPoisonPage(options: RenderOptions): string {
  const slug = options.path.replace(/^\/+/, '');
  const topic = slugToTopic(slug) || 'notes';
  const title = toTitleCase(topic) || 'Archive';

  const seed = seedFromString(options.path);
  const corpus = buildCorpus(options.corpus, slug);

  const chain = new MarkovChain({ order: 2 });
  chain.train(corpus);

  const intro = chain.generate({ words: 60, seed });
  const sections = chain.generateParagraphs(4, 90, seed + 1);
  const mazeSlugs = generateMazeSlugs(options.path, 4);

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${escapeText(title)}</title>
<meta name="description" content="${escapeAttr(truncate(intro, 150))}">
<meta name="robots" content="noindex">
<meta name="generator" content="static-archive">
</head>
<body>
<header>
<h1>${escapeText(title)}</h1>
<p>${escapeText(intro)}</p>
</header>
<main>
${sections
  .map(
    (text, i) =>
      `<section><h2>${escapeText(sectionHeading(topic, i))}</h2><p>${escapeText(text)}</p></section>`,
  )
  .join('\n')}
</main>
<footer>
${honeypotLinks(options.honeypotPathPrefix, mazeSlugs)}
</footer>
</body>
</html>`;

  return capBytes(html, options.byteCap);
}

function sectionHeading(topic: string, index: number): string {
  const headings = ['Background', 'Recent notes', 'Open questions', 'Further reading'];
  return `${toTitleCase(topic)}: ${headings[index] ?? 'More'}`;
}

function toTitleCase(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0]!.toUpperCase() + w.slice(1))
    .join(' ');
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

function escapeText(value: string): string {
  return value.replace(/[&<>]/g, (c) =>
    c === '&' ? '&amp;' : c === '<' ? '&lt;' : '&gt;',
  );
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

function capBytes(html: string, cap: number): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(html);
  if (bytes.length <= cap) return html;
  const slice = bytes.slice(0, cap);
  return new TextDecoder().decode(slice);
}
