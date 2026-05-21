// Cloudflare Workers entry point. Drop in as src/index.ts in your Worker.
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

export default {
  async fetch(request: Request): Promise<Response> {
    const ip = request.headers.get('cf-connecting-ip') ?? undefined;
    const result = handleRequest(request, config, { ip });
    if (result.kind === 'block') return blockResponse();
    if (result.kind === 'poison') {
      return poisonResponse(result.body, result.contentType);
    }
    // Pass-through: serve your real content. For a Worker fronting an origin,
    // this is usually `return fetch(request)`. For Workers Sites or a Pages
    // function, route to your asset handler here.
    return fetch(request);
  },
};
