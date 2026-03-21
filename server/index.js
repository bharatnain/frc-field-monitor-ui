import 'dotenv/config';
import { createReadStream, existsSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import httpProxy from 'http-proxy';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const indexFile = path.join(distDir, 'index.html');
const host = process.env.HOST?.trim() || '0.0.0.0';
const port = Number.parseInt(process.env.PORT || '3000', 10);
const upstreamTarget = (process.env.FIELD_MONITOR_UPSTREAM_URL || 'http://10.0.100.5').trim().replace(/\/+$/, '');
const proxyRoutePrefixes = ['/api/v1.0/fieldMonitor', '/fieldMonitorHub', '/infrastructureHub'];
const mimeTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.map', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
]);

const proxy = httpProxy.createProxyServer({
  changeOrigin: true,
  target: upstreamTarget,
  ws: true,
  xfwd: true,
});

proxy.on('error', (error, request, response) => {
  const message = JSON.stringify({
    error: 'Unable to reach FIELD_MONITOR_UPSTREAM_URL',
    details: error.message,
  });

  if (response?.writeHead) {
    response.writeHead(502, {
      'Content-Length': Buffer.byteLength(message),
      'Content-Type': 'application/json; charset=utf-8',
    });
    response.end(message);
    return;
  }

  if (request?.socket) {
    request.socket.destroy(error);
  }
});

function hasValidBuildOutput() {
  return existsSync(indexFile);
}

function getContentType(filePath) {
  return mimeTypes.get(path.extname(filePath).toLowerCase()) || 'application/octet-stream';
}

function normalizeAssetPath(pathname) {
  const decodedPath = decodeURIComponent(pathname);
  const relativePath = decodedPath.replace(/^\/+/, '');
  const assetPath = path.normalize(path.join(distDir, relativePath));

  if (!assetPath.startsWith(distDir)) {
    return null;
  }

  return assetPath;
}

function isProxyRequest(pathname) {
  return proxyRoutePrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

async function serveFile(response, filePath, statusCode = 200) {
  const fileStats = await stat(filePath);
  response.writeHead(statusCode, {
    'Content-Length': fileStats.size,
    'Content-Type': getContentType(filePath),
  });
  createReadStream(filePath).pipe(response);
}

function serveJson(response, statusCode, payload) {
  const body = JSON.stringify(payload);
  response.writeHead(statusCode, {
    'Content-Length': Buffer.byteLength(body),
    'Content-Type': 'application/json; charset=utf-8',
  });
  response.end(body);
}

async function serveApp(request, response) {
  if (!hasValidBuildOutput()) {
    serveJson(response, 503, {
      error: 'Build output not found',
      details: 'Run "npm run build" before starting the proxy server.',
    });
    return;
  }

  const requestUrl = new URL(request.url || '/', 'http://localhost');
  const pathname = requestUrl.pathname === '/' ? '/index.html' : requestUrl.pathname;
  const assetPath = normalizeAssetPath(pathname);

  if (!assetPath) {
    serveJson(response, 400, {
      error: 'Invalid asset path',
    });
    return;
  }

  try {
    const assetStats = await stat(assetPath);
    if (assetStats.isFile()) {
      await serveFile(response, assetPath);
      return;
    }
  } catch {
    // Fall back to the SPA entrypoint for app routes.
  }

  await serveFile(response, indexFile);
}

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url || '/', 'http://localhost');

  if (requestUrl.pathname === '/health') {
    serveJson(response, 200, {
      upstreamTarget,
      status: 'ok',
    });
    return;
  }

  if (isProxyRequest(requestUrl.pathname)) {
    proxy.web(request, response, { target: upstreamTarget });
    return;
  }

  try {
    await serveApp(request, response);
  } catch (error) {
    serveJson(response, 500, {
      error: 'Unable to serve application shell',
      details: error instanceof Error ? error.message : 'Unknown server error',
    });
  }
});

server.on('upgrade', (request, socket, head) => {
  const requestUrl = new URL(request.url || '/', 'http://localhost');

  if (!isProxyRequest(requestUrl.pathname)) {
    socket.destroy();
    return;
  }

  proxy.ws(request, socket, head, { target: upstreamTarget });
});

server.listen(port, host, () => {
  console.log(`Field Monitor proxy listening on http://${host}:${port}`);
  console.log(`Proxying FMS traffic to ${upstreamTarget}`);
});
