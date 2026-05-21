import verifiedBotsData from '../data/verified-bots.json' with { type: 'json' };

type VerifiedBot = {
  name: string;
  uaPatterns: string[];
  cidrs: string[];
};

const VERIFIED: VerifiedBot[] = (verifiedBotsData.bots ?? []) as VerifiedBot[];

export type VerifyResult =
  | { verified: false; reason?: string }
  | { verified: true; name: string };

// Returns { verified: true } only when the UA matches a known good crawler
// AND the client IP falls inside one of that crawler's published ranges.
// Anything else (no IP, claimed-but-not-verified, unknown UA) returns
// { verified: false }, so the caller can decide whether to fall through.
export function verifyClaimedBot(ua: string, ip?: string): VerifyResult {
  if (!ua) return { verified: false };
  const claim = findClaim(ua);
  if (!claim) return { verified: false };
  if (!ip) return { verified: false, reason: 'no-ip' };
  for (const cidr of claim.cidrs) {
    if (ipInCidr(ip, cidr)) return { verified: true, name: claim.name };
  }
  return { verified: false, reason: 'ip-not-in-range' };
}

function findClaim(ua: string): VerifiedBot | undefined {
  const lower = ua.toLowerCase();
  for (const bot of VERIFIED) {
    for (const pattern of bot.uaPatterns) {
      if (lower.includes(pattern.toLowerCase())) return bot;
    }
  }
  return undefined;
}

export function ipInCidr(ip: string, cidr: string): boolean {
  const [range, bitsStr] = cidr.split('/');
  if (!range || !bitsStr) return false;
  const bits = Number(bitsStr);
  if (!Number.isFinite(bits)) return false;

  const isIpV6 = ip.includes(':') || range.includes(':');
  if (isIpV6) {
    // v0.1 IPv6 support: exact match only. Most major-bot ranges we ship
    // are v4. Production deployments should refresh and add v6 support.
    return ip === range;
  }
  const ipNum = ipv4ToInt(ip);
  const rangeNum = ipv4ToInt(range);
  if (ipNum === null || rangeNum === null) return false;
  if (bits === 0) return true;
  const mask = bits === 32 ? 0xffffffff : (~0 << (32 - bits)) >>> 0;
  return (ipNum & mask) === (rangeNum & mask);
}

function ipv4ToInt(ip: string): number | null {
  const parts = ip.split('.');
  if (parts.length !== 4) return null;
  let result = 0;
  for (const part of parts) {
    const n = Number(part);
    if (!Number.isInteger(n) || n < 0 || n > 255) return null;
    result = ((result << 8) | n) >>> 0;
  }
  return result;
}

export function listVerifiedBots(): VerifiedBot[] {
  return [...VERIFIED];
}
