# Belemnite integration examples

Copy-paste templates for different platforms.

## Adapters

- [`adapters/cloudflare-workers.ts`](adapters/cloudflare-workers.ts). A complete Cloudflare Worker entry point.
- [`adapters/hono.ts`](adapters/hono.ts). A Hono middleware. Runs on Workers, Node, Bun, Deno, Vercel, Netlify, and more.
- [`adapters/node-http.mjs`](adapters/node-http.mjs). Plain Node `http.createServer`. No framework.
- [`adapters/bun.ts`](adapters/bun.ts). Bun's built-in `Bun.serve`.
- [`middleware.ts`](middleware.ts). Next.js root middleware via `belemnite/next`.
- [`app/belemnite-honeypot/[...slug]/route.ts`](app/belemnite-honeypot/[...slug]/route.ts). Next.js Route Handler for the honeypot path.
- [`app/robots.ts`](app/robots.ts) and [`app/robots.txt/route.ts`](app/robots.txt/route.ts). Two flavors of robots route for Next.js.

## Install

```bash
npm install https://codeload.github.com/asworbix/Belemnite/tar.gz/main
```

For the Vercel Routing Middleware path you also need `@vercel/functions`. For the Hono path you also need `hono`. The rest are dep-free beyond Belemnite.

## Modes

Configured in your adapter:

- `mode: 'observe'`. Log catches, do not modify responses. Start here.
- `mode: 'poison'`. Return the configured `poisonBody`. Default.
- `mode: 'block'`. Return 403.

## Customizing the poison body

```ts
resolveConfig({
  poisonBody: 'go away',                    // anything you want
  poisonContentType: 'text/plain; charset=utf-8',
});
```

## Important: override `honeypotPathPrefix`

Pick a site-specific, plausible-looking path before going to production. The default `/belemnite-honeypot` is fine for testing but obvious to a careful scraper. Match the path in your `robots.txt` `Disallow:` line.
