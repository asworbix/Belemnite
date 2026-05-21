// Copy this file to your Next.js app at app/robots.ts.
// Uses Next's MetadataRoute.Robots. Structured but reliable.
// If you prefer raw text control, see examples/app/robots.txt/route.ts.
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/'],
        disallow: ['/belemnite-honeypot/'],
      },
    ],
    // sitemap: 'https://yourdomain.com/sitemap.xml',
  };
}
