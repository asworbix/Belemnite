export {
  handleRequest,
  resolveConfig,
  poisonResponse,
  blockResponse,
} from './core.js';
export type { HandleContext, HandleResult } from './core.js';
export type {
  BelemniteConfig,
  CatchEvent,
  CatchReason,
  Mode,
  ResolvedConfig,
  DetectionResult,
} from './types.js';
export { matchCrawler, listCrawlers } from './detect/userAgents.js';
export { detectByBehavior, scoreBehavior } from './detect/behavior.js';
export { isHoneypotPath, honeypotLinks } from './detect/honeypot.js';
export { verifyClaimedBot, ipInCidr, listVerifiedBots } from './detect/verify.js';
