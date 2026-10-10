import { createNewsletterService, escapeHtml, loadConfig, NewsletterError, readToken } from './_core.mjs';

export function setHeaders(res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'");
}
export function json(res, status, body) {
  setHeaders(res); res.statusCode = status; res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.end(JSON.stringify(body));
}
export function checkOrigin(req, config, required = true) {
  const origin = req.headers.origin;
  if ((!origin && required) || (origin && (typeof origin !== 'string' || !config.origins.has(origin)))) throw new NewsletterError(403, 'origin_not_allowed', 'Please use the Valar website to submit this request.');
}
export async function readBody(req, type = 'json') {
  const contentType = String(req.headers['content-type'] || '').split(';')[0].trim().toLowerCase();
  if (contentType !== (type === 'json' ? 'application/json' : 'application/x-www-form-urlencoded')) throw new NewsletterError(415, 'invalid_content_type', 'Please submit the form again.');
  if (Number(req.headers['content-length'] || 0) > 2048) throw new NewsletterError(413, 'too_large', 'Please submit the form again.');
  let input;
  if (typeof req.body === 'object' && req.body !== null && !Buffer.isBuffer(req.body)) {
    if (Buffer.byteLength(JSON.stringify(req.body)) > 2048) throw new NewsletterError(413, 'too_large', 'Please submit the form again.');
    return req.body;
  }
  if (typeof req.body === 'string' || Buffer.isBuffer(req.body)) input = req.body.toString();
  else {
    let size = 0; const chunks = [];
    for await (const chunk of req) {
      size += Buffer.byteLength(chunk);
      if (size > 2048) throw new NewsletterError(413, 'too_large', 'Please submit the form again.');
      chunks.push(Buffer.from(chunk));
    }
    input = Buffer.concat(chunks).toString('utf8');
  }
  if (Buffer.byteLength(input) > 2048) throw new NewsletterError(413, 'too_large', 'Please submit the form again.');
  try {
    if (type === 'json') return JSON.parse(input);
    const params = new URLSearchParams(input);
    if ([...params.keys()].some(key => params.getAll(key).length !== 1)) throw new Error();
    return Object.fromEntries(params);
  } catch { throw new NewsletterError(400, 'invalid_request', 'Please submit the form again.'); }
}
export function clientIp(req, config) {
  // Vercel overwrites this header at its proxy; never trust arbitrary x-forwarded-for.
  const forwarded = config.onVercel && req.headers['x-vercel-forwarded-for'];
  return typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : (req.socket?.remoteAddress || 'unknown');
}
export function tokenFromUrl(req) {
  try {
    const values = new URL(req.url, 'https://valar.invalid').searchParams.getAll('token');
    return values.length === 1 ? values[0] : undefined;
  } catch { return undefined; }
}
export function page(res, status, title, message, { action, token, label, site = '/' } = {}) {
  setHeaders(res); res.statusCode = status; res.setHeader('Content-Type', 'text/html; charset=utf-8');
  const newsletterHref = site === '/' ? '/newsletter' : `${site}/newsletter`;
  const form = action ? `<form action="${escapeHtml(action)}" method="post"><input type="hidden" name="token" value="${escapeHtml(token)}"><button type="submit">${escapeHtml(label)}</button></form>` : '';
  res.end(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)} · Valar</title><style>body{margin:0;padding:24px;background:#f6f5f5;color:#272625;font:16px/1.6 Arial,sans-serif}main{max-width:520px;margin:64px auto;background:#fff;padding:32px;border:1px solid #e7e6e6}h1{font-size:28px;line-height:1.3;font-weight:400}a{color:#57524e}button{font:inherit;cursor:pointer;border:0;border-radius:28px;color:#fff;background:#706c6a;padding:12px 24px}button:focus-visible,a:focus-visible{outline:2px solid #272625;outline-offset:4px}.brand{letter-spacing:2px;font-size:20px}@media(max-width:500px){main{margin:24px auto;padding:24px}}</style></head><body><main><a class="brand" href="${escapeHtml(site)}">VALAR</a><h1>${escapeHtml(title)}</h1><p>${escapeHtml(message)}</p>${form}<p><a href="${escapeHtml(newsletterHref)}">Return to the newsletter</a></p></main></body></html>`);
}
export function createHandler(kind, { env = process.env, serviceFactory = createNewsletterService } = {}) {
  return async (req, res) => {
    try {
      const allowed = kind === 'subscribe' ? ['POST'] : ['GET', 'POST'];
      if (!allowed.includes(req.method)) { res.setHeader('Allow', allowed.join(', ')); return json(res, 405, { error: 'method_not_allowed', message: 'This method is not supported.' }); }
      const config = loadConfig(env);
      if (kind === 'subscribe') {
        checkOrigin(req, config);
        const body = await readBody(req);
        const result = await serviceFactory(config).subscribe(body, clientIp(req, config));
        return json(res, 202, result);
      }
      const fromUrl = tokenFromUrl(req);
      if (req.method === 'GET') {
        readToken(config, fromUrl, kind);
        return page(res, 200, kind === 'confirm' ? 'Confirm your subscription' : 'Unsubscribe from the brief', kind === 'confirm' ? 'One more step: confirm that you want to receive the Valar GPU market brief.' : 'Use the button below to stop receiving the Valar GPU market brief.', { action: `/api/newsletter/${kind}`, token: fromUrl, label: kind === 'confirm' ? 'Confirm my subscription' : 'Unsubscribe', site: config.site });
      }
      const oneClick = kind === 'unsubscribe' && fromUrl;
      checkOrigin(req, config, !oneClick);
      const body = await readBody(req, 'form');
      if (oneClick) {
        if (Object.keys(body).length !== 1 || body['List-Unsubscribe'] !== 'One-Click') throw new NewsletterError(400, 'invalid_request', 'Please submit the unsubscribe form again.');
      } else if (Object.keys(body).length !== 1 || typeof body.token !== 'string') throw new NewsletterError(400, 'invalid_request', 'Please submit the form again.');
      const result = await serviceFactory(config)[kind](oneClick ? fromUrl : body.token);
      if (oneClick) { setHeaders(res); res.statusCode = 200; return res.end(); }
      return page(res, 200, kind === 'confirm' ? 'You are on the list' : 'You are unsubscribed', result.message, { site: config.site });
    } catch (error) {
      const known = error instanceof NewsletterError;
      const status = known ? error.status : 503;
      const message = known ? error.message : 'Email signup is not available yet. Please try again later.';
      if (status === 429) res.setHeader('Retry-After', '3600');
      if (kind === 'subscribe') return json(res, status, { error: known ? error.code : 'unavailable', message });
      return page(res, status, status === 503 ? 'Please try again later' : 'We could not complete that request', message);
    }
  };
}
