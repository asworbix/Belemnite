import { NextResponse } from 'next/server';
import { blockResponse, handleRequest, poisonResponse, resolveConfig, } from './core.js';
export function belemnite(input = {}) {
    const config = resolveConfig(input);
    return (req) => {
        const ip = req.ip ?? req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
        const result = handleRequest(req, config, { ip });
        switch (result.kind) {
            case 'pass':
                return NextResponse.next();
            case 'block':
                return blockResponse();
            case 'poison':
                return poisonResponse(result.body, result.contentType);
        }
    };
}
// Drop-in Route Handler for the honeypot path. Always serves the configured
// poison body, regardless of UA.
export function honeypotHandler(input = {}) {
    const config = resolveConfig(input);
    return async (_req) => {
        return poisonResponse(config.poisonBody, config.poisonContentType);
    };
}
// Drop-in robots.txt content. The Disallow entry tells well-behaved crawlers
// to stay out of the honeypot. Misbehaving crawlers ignore robots.txt and
// follow the hidden links and that is the catch.
export function robotsTxt(options = {}) {
    const prefix = options.honeypotPathPrefix ?? '/belemnite-honeypot';
    const lines = ['User-agent: *'];
    for (const a of options.allow ?? [])
        lines.push(`Allow: ${a}`);
    for (const d of options.disallow ?? [])
        lines.push(`Disallow: ${d}`);
    lines.push(`Disallow: ${prefix}/`);
    if (options.siteUrl) {
        lines.push('', `Sitemap: ${options.siteUrl.replace(/\/$/, '')}/sitemap.xml`);
    }
    return lines.join('\n');
}
