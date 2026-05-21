// Alternative: full text control via a Route Handler at app/robots.txt/route.ts.
// Use this *instead of* app/robots.ts if you want to compose the file yourself.
import { robotsTxt } from 'belemnite/next';

export const runtime = 'edge';

export function GET(): Response {
  const body = robotsTxt({
    honeypotPathPrefix: '/belemnite-honeypot',
    // siteUrl: 'https://yourdomain.com',
  });
  return new Response(body, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
