import { defineConfig, loadEnv } from 'vite';
import { createHandler, json } from './api/newsletter/_lib/_http.mjs';

// Run the same newsletter handlers in local development and preview.
// These server-only values never become client-side VITE variables.
export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env };
  const handlers = Object.fromEntries(['subscribe', 'confirm', 'unsubscribe'].map(kind => [`/api/newsletter/${kind}`, createHandler(kind, { env })]));
  const middleware = (request, response, next) => {
    const path = new URL(request.url, 'http://localhost').pathname;
    if (!path.startsWith('/api/')) return next();
    const handler = handlers[path];
    if (!handler) return json(response, 404, { error: 'not_found', message: 'This endpoint is unavailable.' });
    return handler(request, response);
  };
  return { plugins: [{ name: 'valar-newsletter-api', configureServer(server) { server.middlewares.use(middleware); }, configurePreviewServer(server) {
    server.middlewares.use(middleware);
    server.middlewares.use((request, response, next) => {
      // Match Vercel clean URLs so issue metadata is served before hydration.
      const url = new URL(request.url, 'http://localhost');
      if (request.method === 'GET' && /^\/brief\/[a-z0-9-]+$/.test(url.pathname)) request.url = `${url.pathname}.html${url.search}`;
      next();
    });
  } }] };
});
