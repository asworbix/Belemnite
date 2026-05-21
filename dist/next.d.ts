import { type NextRequest } from 'next/server';
import type { BelemniteConfig } from './types.js';
export type NextMiddleware = (req: NextRequest) => Response | Promise<Response>;
export declare function belemnite(input?: BelemniteConfig): NextMiddleware;
export declare function honeypotHandler(input?: BelemniteConfig): (_req: Request) => Promise<Response>;
export declare function robotsTxt(options?: {
    siteUrl?: string;
    honeypotPathPrefix?: string;
    allow?: string[];
    disallow?: string[];
}): string;
