import type { BelemniteConfig, ResolvedConfig } from './types.js';
export declare function resolveConfig(input?: BelemniteConfig): ResolvedConfig;
export type HandleContext = {
    ip?: string;
};
export type HandleResult = {
    kind: 'pass';
} | {
    kind: 'block';
} | {
    kind: 'poison';
    body: string;
    contentType: string;
};
export declare function handleRequest(req: Request, config: ResolvedConfig, ctx?: HandleContext): HandleResult;
export declare function poisonResponse(body: string, contentType?: string): Response;
export declare function blockResponse(): Response;
