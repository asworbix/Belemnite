// Plain Node http server with Belemnite running before your real handler.
// No framework required. Works with Node 20+.
import { createServer } from 'node:http';
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

createServer(async (req, res) => {
  const url = `http://${req.headers.host}${req.url}`;
  const request = new Request(url, {
    method: req.method,
    headers: req.headers,
  });

  const ip = req.socket.remoteAddress ?? undefined;
  const result = handleRequest(request, config, { ip });

  if (result.kind === 'block') {
    const r = blockResponse();
    res.writeHead(r.status, Object.fromEntries(r.headers));
    res.end(await r.text());
    return;
  }

  if (result.kind === 'poison') {
    const r = poisonResponse(result.body, result.contentType);
    res.writeHead(r.status, Object.fromEntries(r.headers));
    res.end(await r.text());
    return;
  }

  // Pass-through: serve your real content here.
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  res.end('<h1>Real site</h1>');
}).listen(3000, () => {
  console.log('http://localhost:3000');
});
