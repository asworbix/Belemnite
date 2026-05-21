import type { DetectionResult } from '../types.js';

const HEADLESS_MARKERS = [
  'HeadlessChrome',
  'PhantomJS',
  'Selenium',
  'Playwright',
  'Puppeteer',
  'electron',
  'webdriver',
];

export type BehaviorSignals = {
  score: number;
  signals: string[];
};

export function scoreBehavior(req: Request): BehaviorSignals {
  const headers = req.headers;
  const signals: string[] = [];

  const ua = headers.get('user-agent') ?? '';
  if (!ua) signals.push('missing-ua');

  if (!headers.get('accept-language')) signals.push('missing-accept-language');
  if (!headers.get('accept-encoding')) signals.push('missing-accept-encoding');

  const accept = headers.get('accept') ?? '';
  if (accept === '*/*' || accept === '') signals.push('generic-accept');

  for (const marker of HEADLESS_MARKERS) {
    if (ua.toLowerCase().includes(marker.toLowerCase())) {
      signals.push(`headless-ua:${marker}`);
      break;
    }
  }

  // Real browsers send Sec-Fetch-* on top-level navigation. We only score
  // its absence on GET requests where the destination should be a document.
  if (req.method === 'GET' && !headers.get('sec-fetch-mode') && !headers.get('sec-fetch-dest')) {
    signals.push('missing-sec-fetch');
  }

  return { score: signals.length, signals };
}

export function detectByBehavior(req: Request, threshold: number): DetectionResult {
  const { score, signals } = scoreBehavior(req);
  if (score >= threshold) {
    return { matched: true, reason: 'behavior', detail: signals.join(',') };
  }
  return { matched: false };
}
