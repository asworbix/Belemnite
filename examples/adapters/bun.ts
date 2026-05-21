// Bun server with Belemnite. Run with `bun examples/adapters/bun.ts`.
import {
  blockResponse,
  handleRequest,
  poisonResponse,
  resolveConfig,
} from 'belemnite';

const config = resolveConfig({
  mode: 'poison',
  honeypotPathPrefix: '/legacy-archive',
});

Bun.serve({
  port: 3000,
  fetch(request, server) {
    const ip = server.requestIP(request)?.address;
    const result = handleRequest(request, config, { ip });
    if (result.kind === 'block') return blockResponse();
    if (result.kind === 'poison') {
      return poisonResponse(result.body, result.contentType);
    }
    return new Response('<h1>Real site</h1>', {
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });
  },
});
