import type { DetectionResult } from '../types.js';
export type BehaviorSignals = {
    score: number;
    signals: string[];
};
export declare function scoreBehavior(req: Request): BehaviorSignals;
export declare function detectByBehavior(req: Request, threshold: number): DetectionResult;
