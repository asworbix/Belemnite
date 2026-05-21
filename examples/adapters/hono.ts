// Hono works on Workers, Node, Bun, Deno, Vercel, Netlify, and more.
// This middleware factory plugs into c.use('*', belemniteMw).
import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';
import {
  blockResponse,
  handleRequest,
  poisonResponse,
  resolveConfig,
} from 'belemnite';
import type { BelemniteConfig } from 'belemnite';

export function belemniteMw(input: BelemniteConfig = {}): MiddlewareHandler {
  const config = resolveConfig(input);
  return async (c, next) => {
    const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim();
    const result = handleRequest(c.req.raw, config, { ip });
    if (result.kind === 'block') return blockResponse();
    if (result.kind === 'poison') {
      return poisonResponse(result.body, result.contentType);
    }
    await next();
  };
}

const app = new Hono();
app.use('*', belemniteMw({ mode: 'poison', honeypotPathPrefix: '/legacy-archive' }));
app.get('/', (c) => c.html('<h1>Real site</h1>'));

export default app;
