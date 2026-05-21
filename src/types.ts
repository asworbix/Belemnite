export type Mode = 'block' | 'poison' | 'observe';

export type CatchReason = 'ua' | 'honeypot' | 'behavior' | 'asn';

export type CatchEvent = {
  timestamp: string;
  ip?: string;
  userAgent: string;
  path: string;
  reason: CatchReason;
  detail?: string;
};

export type BelemniteConfig = {
  mode?: Mode;
  honeypots?: boolean;
  verifiedBotAllowlist?: boolean;
  behaviorThreshold?: number;
  logCatches?: boolean;
  customCrawlers?: string[];
  excludePaths?: string[];
  honeypotPathPrefix?: string;
  authCookieNames?: string[];
  poisonBody?: string;
  poisonContentType?: string;
  onCatch?: (event: CatchEvent) => void;
};

export type ResolvedConfig = Required<
  Omit<BelemniteConfig, 'onCatch' | 'customCrawlers' | 'excludePaths' | 'authCookieNames'>
> & {
  onCatch?: (event: CatchEvent) => void;
  customCrawlers: string[];
  excludePaths: string[];
  authCookieNames: string[];
};

export type DetectionResult =
  | { matched: false }
  | { matched: true; reason: CatchReason; detail?: string };
