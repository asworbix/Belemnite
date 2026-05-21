import type { DetectionResult } from '../types.js';
export declare function detectByAsn(_ip: string | undefined): DetectionResult;
export declare function listKnownAsns(): Array<{
    asn: number;
    name: string;
}>;
