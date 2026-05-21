import { NextResponse, type NextRequest } from 'next/server';
import {
  blockResponse,
  handleRequest,
  poisonResponse,
  resolveConfig,
} from './core.js';
import { renderPoisonPage } from './poison/render.js';
import type { BelemniteConfig } from './types.js';

export type NextMiddleware = (
  req: NextRequest,
) => Response | Promise<Response>;

export function belemnite(input: BelemniteConfig = {}): NextMiddleware {
  const config = resolveConfig(input);
  return (req: NextRequest) => {
    const ip = req.ip ?? req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    const result = handleRequest(req, config, { ip });
    switch (result.kind) {
      case 'pass':
        return NextResponse.next();
      case 'block':
        return blockResponse();
      case 'poison':
        return poisonResponse(result.body);
    }
  };
}

// Drop-in Route Handler for app/belemnite-honeypot/[...slug]/route.ts.
// Any request to the honeypot prefix gets a fresh poison maze page.
export function honeypotHandler(input: BelemniteConfig = {}) {
  const config = resolveConfig(input);
  return async (req: Request): Promise<Response> => {
    const url = new URL(req.url);
    const body = renderPoisonPage({
      path: url.pathname,
      corpus: config.corpus || undefined,
      honeypotPathPrefix: config.honeypotPathPrefix,
      byteCap: config.poisonByteCap,
    });
    return poisonResponse(body);
  };
}

// Drop-in robots.ts content. The Disallow entry tells well-behaved crawlers
// to stay out of the honeypot. Misbehaving crawlers ignore robots.txt and
// follow the hidden links and that is the catch.
export function robotsTxt(options: {
  siteUrl?: string;
  honeypotPathPrefix?: string;
  allow?: string[];
  disallow?: string[];
} = {}): string {
  const prefix = options.honeypotPathPrefix ?? '/belemnite-honeypot';
  const lines = ['User-agent: *'];
  for (const a of options.allow ?? []) lines.push(`Allow: ${a}`);
  for (const d of options.disallow ?? []) lines.push(`Disallow: ${d}`);
  lines.push(`Disallow: ${prefix}/`);
  if (options.siteUrl) {
    lines.push('', `Sitemap: ${options.siteUrl.replace(/\/$/, '')}/sitemap.xml`);
  }
  return lines.join('\n');
}
