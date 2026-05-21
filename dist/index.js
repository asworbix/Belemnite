export { handleRequest, resolveConfig, poisonResponse, blockResponse, } from './core.js';
export { matchCrawler, listCrawlers } from './detect/userAgents.js';
export { detectByBehavior, scoreBehavior } from './detect/behavior.js';
export { isHoneypotPath, honeypotLinks } from './detect/honeypot.js';
export { verifyClaimedBot, ipInCidr, listVerifiedBots } from './detect/verify.js';
export { renderPoisonPage } from './poison/render.js';
export { MarkovChain, seedFromString } from './poison/markov.js';
export { buildCorpus, slugToTopic } from './poison/corpus.js';
export { generateMazeSlugs } from './poison/maze.js';
