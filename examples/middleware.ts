// Copy this file to the root of your Next.js project as `middleware.ts`.
import { belemnite } from 'belemnite/next';

export default belemnite({
  mode: 'poison',
  honeypots: true,
  verifiedBotAllowlist: true,
  behaviorThreshold: 2,
  logCatches: true,
});

export const config = {
  matcher: [
    // Run on all paths except Next internals and static assets.
    '/((?!_next/static|_next/image|favicon.ico|api/health).*)',
  ],
};
