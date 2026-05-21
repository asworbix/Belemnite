type VerifiedBot = {
    name: string;
    uaPatterns: string[];
    cidrs: string[];
};
export type VerifyResult = {
    verified: false;
    reason?: string;
} | {
    verified: true;
    name: string;
};
export declare function verifyClaimedBot(ua: string, ip?: string): VerifyResult;
export declare function ipInCidr(ip: string, cidr: string): boolean;
export declare function listVerifiedBots(): VerifiedBot[];
export {};
