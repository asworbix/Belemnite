// Copy this file to your Next.js app at:
//   app/belemnite-honeypot/[...slug]/route.ts
import { honeypotHandler } from 'belemnite/next';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export const GET = honeypotHandler();
export const HEAD = honeypotHandler();
