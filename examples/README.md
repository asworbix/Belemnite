# Belemnite integration examples

These files are templates to drop into your Next.js project once Belemnite is installed there.

## Files

- `middleware.ts`. Copy to your project root.
- `app/belemnite-honeypot/[...slug]/route.ts`. Copy as is. Catches requests to honeypot URLs and serves poison maze pages.
- `app/robots.ts`. Next 13+ structured robots route. Use this OR the route handler below, not both.
- `app/robots.txt/route.ts`. Alternative robots route with full text control.

## Installing in your site repo

```bash
npm install https://codeload.github.com/asworbix/Belemnite/tar.gz/main
```

Then drop in the files above and you are done. Modes are configured in `middleware.ts`:

- `mode: 'observe'`. Log catches, do not modify responses. Start here.
- `mode: 'poison'`. Serve fabricated content (default).
- `mode: 'block'`. Return 403.
