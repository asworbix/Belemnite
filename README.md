# Belemnite

[![tests](https://github.com/asworbix/Belemnite/actions/workflows/test.yml/badge.svg)](https://github.com/asworbix/Belemnite/actions/workflows/test.yml)

> Bite back. A scraper-trapping middleware for the modern web.

Belemnite detects AI scrapers and agent-driven traffic and returns whatever you want to them instead of your real page. By default it returns the word `fart`. Humans see the real site.

The name comes from the belemnite, an extinct cephalopod that left hard, pointed fossils. When the site is bitten by a scraper, it bites back.

Belemnite has no runtime dependencies. The core uses Web Standard `Request` and `Response`, so it runs on **Cloudflare Workers, Node.js, Bun, Deno, Vercel, Netlify**, or anywhere else with the Fetch API.

---

## Quick start

```bash
git clone https://github.com/asworbix/Belemnite.git
cd Belemnite
npm install
npm test
```

That gives you a working clone with a green test suite. No external services required.

---

## Why "fart"?

Two reasons.

1. **No tells.** Markov-generated prose has obvious shape-tells (`"X has become a recurring topic in many recent conversations"`). LLM-generated prose costs money and adds latency. A one-word body has nothing for a careful scraper to dispute.
2. **The point isn't to fool scrapers, it's to waste their budget.** Every request a scraper makes costs them compute and time. Returning four bytes of stub content uses their crawl quota on absolutely nothing. Whether that stub says `fart` or `<!doctype html>...` is irrelevant to the wasted-budget math.

Override `poisonBody` and `poisonContentType` to return whatever you want: a 403 page, a quote, a single emoji, an HTML decoy you wrote yourself. The default is just a placeholder you should override.

---

## Install in your site

Belemnite exports a framework-agnostic `handleRequest(req, config, ctx)` that takes a Web Standard `Request` and returns `{ kind: 'pass' | 'block' | 'poison', ... }`. Wire it into whatever runtime you use.

```bash
npm install https://codeload.github.com/asworbix/Belemnite/tar.gz/main
```

### Cloudflare Workers

```js
import { handleRequest, resolveConfig, poisonResponse, blockResponse } from 'belemnite';

const config = resolveConfig({ mode: 'poison', honeypotPathPrefix: '/legacy-archive' });

export default {
  async fetch(request) {
    const ip = request.headers.get('cf-connecting-ip') ?? undefined;
    const result = handleRequest(request, config, { ip });
    if (result.kind === 'pass') return fetch(request);
    if (result.kind === 'block') return blockResponse();
    return poisonResponse(result.body, result.contentType);
  },
};
```

### Hono (works on Workers, Node, Bun, Deno, Vercel, Netlify, ...)

```ts
import { Hono } from 'hono';
import { handleRequest, resolveConfig, poisonResponse, blockResponse } from 'belemnite';

const config = resolveConfig({ mode: 'poison', honeypotPathPrefix: '/legacy-archive' });
const app = new Hono();

app.use('*', async (c, next) => {
  const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim();
  const result = handleRequest(c.req.raw, config, { ip });
  if (result.kind === 'block') return blockResponse();
  if (result.kind === 'poison') return poisonResponse(result.body, result.contentType);
  await next();
});

export default app;
```

### Node.js (raw http)

```js
import { createServer } from 'node:http';
import { handleRequest, resolveConfig, poisonResponse, blockResponse } from 'belemnite';

const config = resolveConfig({ mode: 'poison', honeypotPathPrefix: '/legacy-archive' });

createServer(async (req, res) => {
  const request = new Request(`http://${req.headers.host}${req.url}`, {
    method: req.method,
    headers: req.headers,
  });
  const ip = req.socket.remoteAddress ?? undefined;
  const result = handleRequest(request, config, { ip });
  if (result.kind === 'poison') {
    const r = poisonResponse(result.body, result.contentType);
    res.writeHead(r.status, Object.fromEntries(r.headers));
    res.end(await r.text());
    return;
  }
  if (result.kind === 'block') {
    res.writeHead(403); res.end('Forbidden'); return;
  }
  // pass-through: serve your real content here
  res.writeHead(200, { 'content-type': 'text/html' }); res.end('<h1>hello</h1>');
}).listen(3000);
```

### Bun

```ts
import { handleRequest, resolveConfig, poisonResponse, blockResponse } from 'belemnite';

const config = resolveConfig({ mode: 'poison', honeypotPathPrefix: '/legacy-archive' });

Bun.serve({
  port: 3000,
  fetch(request) {
    const result = handleRequest(request, config);
    if (result.kind === 'block') return blockResponse();
    if (result.kind === 'poison') return poisonResponse(result.body, result.contentType);
    return new Response('<h1>hello</h1>', { headers: { 'content-type': 'text/html' } });
  },
});
```

### Vercel Routing Middleware (any framework, no Next.js needed)

```ts
// middleware.ts at the project root
import { ipAddress, next } from '@vercel/functions';
import { handleRequest, resolveConfig, poisonResponse, blockResponse } from 'belemnite';

const config = resolveConfig({
  mode: 'poison',
  honeypotPathPrefix: '/legacy-archive',
  excludePaths: ['/api', '/_vercel'],
});

export default function middleware(request: Request): Response {
  const ip = ipAddress(request);
  const result = handleRequest(request, config, { ip });
  if (result.kind === 'pass') return next();
  if (result.kind === 'block') return blockResponse();
  return poisonResponse(result.body, result.contentType);
}

export const config = { matcher: ['/((?!api/|_vercel/|.*\\..*).*)'] };
```

### Next.js

```ts
// middleware.ts at the project root
import { belemnite } from 'belemnite/next';

export default belemnite({
  mode: 'poison',
  honeypotPathPrefix: '/legacy-archive',
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/health).*)'],
};
```

For any of the above, add a `robots.txt` with `Disallow:` matching your chosen `honeypotPathPrefix`:

```
User-agent: *
Allow: /
Disallow: /legacy-archive/
```

---

## How it works

For every incoming request, Belemnite runs this pipeline:

1. **Exclude paths** like `/api` pass straight through.
2. **Honeypot URLs** under the configured prefix always get the poison body.
3. **Authenticated users** (any common session cookie) pass through, even if they look like a bot. Better to miss a catch than break a real user.
4. **Verified search bots** (Googlebot, Bingbot, DuckDuckBot, Yandex, Baidu) pass through if both the user agent and the client IP match a published range.
5. **AI crawler user agents** (GPTBot, PerplexityBot, CCBot, and many more) are flagged. Vendor **tags** (`gpt`, `perplexity`, `mistral`, `copilot`, `cowork`, ...) also flag on word-boundary match, so new variants from a known vendor get caught without a library update.
6. **Behavior signals** (missing `Accept-Language`, generic `Accept: */*`, headless markers in the UA, missing `Sec-Fetch-*`) are scored. Two or more points and the request is flagged.
7. Anything else passes through to the origin.

> **Caveat on Microsoft AI agents.** Microsoft 365 Copilot and Copilot Cowork do not publish distinct user agents today. Copilot fetches mostly route through Bing's index (which arrives as `bingbot`, which we allowlist for SEO), and Copilot Actions impersonate a standard Edge browser. The `copilot` and `cowork` tags catch third-party wrappers and future Microsoft variants if they ever ship a tagged UA, but they will not catch today's products at the UA layer.

Flagged requests are handled according to the configured `mode`:

| Mode | Behavior |
|------|----------|
| `observe` | Pass through, only log catches. Start here. |
| `poison` | Return the configured `poisonBody`. Default. |
| `block` | Return HTTP 403. |

---

## Configuration

```ts
import { handleRequest, resolveConfig } from 'belemnite';

const config = resolveConfig({
  mode: 'poison',                            // 'block' | 'poison' | 'observe'
  honeypots: true,
  verifiedBotAllowlist: true,
  behaviorThreshold: 2,                      // signals needed to flag via behavior
  logCatches: true,
  customCrawlers: [],                        // additional UA substrings
  customTags: [],                            // additional word-boundary tokens (e.g. 'mybrand-ai')
  excludePaths: [],                          // paths to skip entirely
  honeypotPathPrefix: '/legacy-archive',     // OVERRIDE in production
  authCookieNames: ['session', 'auth', 'token', 'sid'],
  poisonBody: 'fart',                        // anything you want
  poisonContentType: 'text/plain; charset=utf-8',
  onCatch: (event) => { /* pluggable logging hook */ },
});
```

Every field is optional. Recommended starting config is `mode: 'observe'` for a few days, then `mode: 'poison'` once the catches in your logs look right.

### Important: override `honeypotPathPrefix` in production

The default `honeypotPathPrefix` is `/belemnite-honeypot`, convenient for examples but a giveaway for any careful scraper. Set this to something site-specific and plausible before going to production. Good choices look like real, unimportant paths: `/legacy-archive`, `/old-articles`, `/research-notes`. Bad choices are anything containing the word `trap`, `honey`, `bait`, or `belemnite`. The path you choose must not collide with any real page on your site.

---

## Repository layout

```
src/
├── index.ts                  public API (framework-agnostic)
├── next.ts                   Next.js adapter (optional, requires `next`)
├── core.ts                   request pipeline
├── log.ts                    structured catch logger
├── types.ts                  shared types
├── detect/
│   ├── userAgents.ts         AI crawler UA matcher
│   ├── asns.ts               ASN detector (reserved)
│   ├── honeypot.ts           honeypot path matcher + hidden-anchor utility
│   ├── behavior.ts           automation header signals
│   └── verify.ts             verified-bot IP-CIDR allowlist
└── data/
    ├── crawlers.json         AI bot UA signatures
    ├── asns.json             reference list of scraper ASNs
    └── verified-bots.json    IP-CIDR ranges for major search crawlers
examples/                     drop-in files for various platforms
tests/                        vitest unit and integration tests
scripts/                      build and verified-bot refresh scripts
dist/                         compiled output, committed for HTTP install
```

---

## Refreshing the verified-bot list

```bash
npm run refresh-bots
```

Pulls the latest IP ranges from Google and Bing, preserves manually curated entries (such as DuckDuckGo), and rewrites `src/data/verified-bots.json`. Commit the result.

Run it before going to production and on a monthly schedule after that.

---

## Adding a new AI crawler signature

1. Add an entry to `src/data/crawlers.json` with `{ name, ua, vendor }`. The `ua` field is matched as a case-insensitive substring against the full `User-Agent` header.
2. Add a test in `tests/userAgents.test.ts`.
3. Run `npm test`.
4. Run `npm run build` and commit.

---

## Known limitations

- No ASN matching at runtime. Most edge runtimes do not expose ASN, so `data/asns.json` is reference only.
- No TLS fingerprinting (JA3 / JA4). Most edge runtimes do not expose it.
- Verified-bot allowlist is IP-list based, not reverse-DNS. DNS is unavailable in most edge runtimes. Refresh the list periodically with `npm run refresh-bots`.

---

## License

MIT. See [LICENSE](./LICENSE).
