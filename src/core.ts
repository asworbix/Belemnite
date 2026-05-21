import { matchCrawler } from './detect/userAgents.js';
import { detectByBehavior } from './detect/behavior.js';
import { verifyClaimedBot } from './detect/verify.js';
import { isHoneypotPath } from './detect/honeypot.js';
import { renderPoisonPage } from './poison/render.js';
import { logCatch } from './log.js';
import type {
  BelemniteConfig,
  CatchEvent,
  CatchReason,
  ResolvedConfig,
} from './types.js';

const DEFAULT_HONEYPOT_PREFIX = '/belemnite-honeypot';
const DEFAULT_BYTE_CAP = 50 * 1024;
const DEFAULT_AUTH_COOKIES = ['session', 'auth', 'token', 'sid', 'sb-access-token'];

export function resolveConfig(input: BelemniteConfig = {}): ResolvedConfig {
  return {
    mode: input.mode ?? 'poison',
    honeypots: input.honeypots ?? true,
    verifiedBotAllowlist: input.verifiedBotAllowlist ?? true,
    behaviorThreshold: input.behaviorThreshold ?? 2,
    logCatches: input.logCatches ?? true,
    customCrawlers: input.customCrawlers ?? [],
    excludePaths: input.excludePaths ?? [],
    corpus: input.corpus ?? '',
    honeypotPathPrefix: input.honeypotPathPrefix ?? DEFAULT_HONEYPOT_PREFIX,
    poisonByteCap: input.poisonByteCap ?? DEFAULT_BYTE_CAP,
    authCookieNames: input.authCookieNames ?? DEFAULT_AUTH_COOKIES,
    onCatch: input.onCatch,
  };
}

export type HandleContext = {
  ip?: string;
};

export type HandleResult =
  | { kind: 'pass' }
  | { kind: 'block' }
  | { kind: 'poison'; body: string };

export function handleRequest(
  req: Request,
  config: ResolvedConfig,
  ctx: HandleContext = {},
): HandleResult {
  const url = new URL(req.url);
  const pathname = url.pathname;
  const ua = req.headers.get('user-agent') ?? '';

  if (matchesExclude(pathname, config.excludePaths)) return { kind: 'pass' };

  // Honeypot hits short-circuit everything else. Even a human who somehow
  // pasted the URL gets poison, but those URLs are CSS-hidden and disallowed
  // in robots.txt, so legitimate humans should never land here.
  if (config.honeypots && isHoneypotPath(pathname, config.honeypotPathPrefix)) {
    return decide(
      {
        reason: 'honeypot',
        detail: pathname,
        ua,
        ip: ctx.ip,
        path: pathname,
      },
      config,
    );
  }

  // Logged-in users always pass. We'd rather miss a catch than break a real user.
  if (hasAuthCookie(req, config.authCookieNames)) return { kind: 'pass' };

  if (config.verifiedBotAllowlist) {
    const verify = verifyClaimedBot(ua, ctx.ip);
    if (verify.verified) return { kind: 'pass' };
  }

  const uaMatch = matchCrawler(ua, config.customCrawlers);
  if (uaMatch.matched) {
    return decide(
      {
        reason: 'ua',
        detail: uaMatch.name,
        ua,
        ip: ctx.ip,
        path: pathname,
      },
      config,
    );
  }

  const behavior = detectByBehavior(req, config.behaviorThreshold);
  if (behavior.matched) {
    return decide(
      {
        reason: behavior.reason,
        detail: behavior.detail,
        ua,
        ip: ctx.ip,
        path: pathname,
      },
      config,
    );
  }

  return { kind: 'pass' };
}

type CatchInput = {
  reason: CatchReason;
  detail?: string;
  ua: string;
  ip?: string;
  path: string;
};

function decide(input: CatchInput, config: ResolvedConfig): HandleResult {
  const event: CatchEvent = {
    timestamp: new Date().toISOString(),
    ip: input.ip,
    userAgent: input.ua,
    path: input.path,
    reason: input.reason,
    detail: input.detail,
  };
  logCatch(event, config);

  if (config.mode === 'observe') return { kind: 'pass' };
  if (config.mode === 'block') return { kind: 'block' };

  const body = renderPoisonPage({
    path: input.path,
    corpus: config.corpus || undefined,
    honeypotPathPrefix: config.honeypotPathPrefix,
    byteCap: config.poisonByteCap,
  });
  return { kind: 'poison', body };
}

function matchesExclude(pathname: string, excludes: string[]): boolean {
  for (const p of excludes) {
    if (!p) continue;
    if (pathname === p) return true;
    if (p.endsWith('*') && pathname.startsWith(p.slice(0, -1))) return true;
    if (pathname.startsWith(`${p}/`)) return true;
  }
  return false;
}

function hasAuthCookie(req: Request, names: string[]): boolean {
  const cookie = req.headers.get('cookie');
  if (!cookie) return false;
  const lower = cookie.toLowerCase();
  for (const n of names) {
    if (!n) continue;
    if (lower.includes(`${n.toLowerCase()}=`)) return true;
  }
  return false;
}

export function poisonResponse(body: string): Response {
  return new Response(body, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store, no-cache, must-revalidate, max-age=0',
      'x-robots-tag': 'noindex, nofollow',
    },
  });
}

export function blockResponse(): Response {
  return new Response('Forbidden', {
    status: 403,
    headers: { 'cache-control': 'no-store' },
  });
}
