import type { CatchEvent, ResolvedConfig } from './types.js';

export function logCatch(event: CatchEvent, config: ResolvedConfig): void {
  if (config.onCatch) {
    try {
      config.onCatch(event);
    } catch {
      // user hook errors must not affect the request
    }
  }
  if (config.logCatches) {
    // Single-line JSON for log aggregator friendliness
    console.log(JSON.stringify({ belemnite: event }));
  }
}
