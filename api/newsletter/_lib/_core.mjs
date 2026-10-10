import { createCipheriv, createDecipheriv, createHmac, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';

export const CONFIRM_TTL = 24 * 60 * 60;
export const UNSUBSCRIBE_TTL = 90 * 24 * 60 * 60;
export const CONSENT_TEXT = 'Send me the Valar GPU market brief. I can unsubscribe at any time.';
export const CONSENT_VERSION = 'valar-brief-v1';
export const ACCEPTED_MESSAGE = 'If this address can receive the brief, a confirmation email is on its way. Check your inbox to finish subscribing.';
const UUID = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i;
const SOURCES = new Set(['today', 'newsletter', 'research', 'article', 'footer']);

export class NewsletterError extends Error {
  constructor(status, code, message) { super(message); this.status = status; this.code = code; }
}
const unavailable = () => new NewsletterError(503, 'unavailable', 'Email signup is not available yet. Please try again later.');

export function loadConfig(env = process.env) {
  const required = ['RESEND_API_KEY', 'NEWSLETTER_FROM', 'NEWSLETTER_SEGMENT_ID', 'NEWSLETTER_TOPIC_ID', 'NEWSLETTER_TOKEN_SECRET', 'NEWSLETTER_SITE_URL', 'NEWSLETTER_POSTAL_ADDRESS', 'UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN'];
  if (required.some(key => typeof env[key] !== 'string' || !env[key].trim())) throw unavailable();
  let site, redis;
  try { site = new URL(env.NEWSLETTER_SITE_URL); redis = new URL(env.UPSTASH_REDIS_REST_URL); } catch { throw unavailable(); }
  if (site.protocol !== 'https:' || site.username || site.password || site.pathname !== '/' || site.search || site.hash || redis.protocol !== 'https:' || redis.username || redis.password || redis.search || redis.hash) throw unavailable();
  if (!UUID.test(env.NEWSLETTER_SEGMENT_ID) || !UUID.test(env.NEWSLETTER_TOPIC_ID) || Buffer.byteLength(env.NEWSLETTER_TOKEN_SECRET) < 32 || /[\r\n]/.test(env.NEWSLETTER_FROM) || env.NEWSLETTER_FROM.length > 320 || env.NEWSLETTER_POSTAL_ADDRESS.length > 500) throw unavailable();
  const origins = new Set([site.origin]);
  for (const candidate of (env.NEWSLETTER_ALLOWED_ORIGINS || '').split(',').map(value => value.trim()).filter(Boolean)) {
    let parsed;
    try { parsed = new URL(candidate); } catch { throw unavailable(); }
    const local = ['127.0.0.1', 'localhost', '[::1]'].includes(parsed.hostname);
    if (parsed.origin !== candidate || parsed.username || parsed.password || (parsed.protocol !== 'https:' && !(local && parsed.protocol === 'http:' && env.NODE_ENV !== 'production'))) throw unavailable();
    origins.add(parsed.origin);
  }
  return { apiKey: env.RESEND_API_KEY, from: env.NEWSLETTER_FROM, segmentId: env.NEWSLETTER_SEGMENT_ID, topicId: env.NEWSLETTER_TOPIC_ID, secret: env.NEWSLETTER_TOKEN_SECRET, site: site.origin, address: env.NEWSLETTER_POSTAL_ADDRESS, redisUrl: redis.href.replace(/\/$/, ''), redisToken: env.UPSTASH_REDIS_REST_TOKEN, origins, onVercel: env.VERCEL === '1' };
}

export function validateEmail(value) {
  if (typeof value !== 'string' || value.length > 254 || /\s/u.test(value) || [...value].some(character => character.codePointAt(0) < 32 || character.codePointAt(0) === 127)) throw new NewsletterError(400, 'invalid_email', 'Enter a valid email address.');
  const email = value.trim().toLowerCase();
  const [local, domain, extra] = email.split('@');
  if (extra !== undefined || !local || local.length > 64 || !domain || !/^[a-z\d.!#$%&'*+\-/=?^_`{|}~]+$/i.test(local) || local.startsWith('.') || local.endsWith('.') || local.includes('..') || !domain.includes('.') || domain.split('.').some(label => !/^[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?$/i.test(label))) throw new NewsletterError(400, 'invalid_email', 'Enter a valid email address.');
  return email;
}

export function validateSignup(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).some(key => !['email', 'source', 'website', 'consent'].includes(key))) throw new NewsletterError(400, 'invalid_request', 'Please submit the signup form again.');
  if (input.consent !== undefined && input.consent !== true) throw new NewsletterError(400, 'consent_required', 'Subscribe only if you want the Valar GPU market brief.');
  if (input.website !== undefined && (typeof input.website !== 'string' || input.website.length > 200)) throw new NewsletterError(400, 'invalid_request', 'Please submit the signup form again.');
  if (input.website) return { honeypot: true };
  if (!SOURCES.has(input.source)) throw new NewsletterError(400, 'invalid_source', 'Please submit the signup form again.');
  return { email: validateEmail(input.email), source: input.source, honeypot: false };
}

export function identifier(secret, value) { return createHmac('sha256', secret).update(value).digest('hex'); }
const derive = (secret, purpose) => createHmac('sha256', secret).update(`valar-newsletter:${purpose}`).digest();
export function issueToken(config, type, email, id = randomUUID(), now = Date.now()) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', derive(config.secret, 'encryption'), iv);
  cipher.setAAD(Buffer.from('valar-newsletter:v1'));
  const exp = Math.floor(now / 1000) + (type === 'confirm' ? CONFIRM_TTL : UNSUBSCRIBE_TTL);
  const data = Buffer.concat([cipher.update(JSON.stringify({ type, email, id, exp }), 'utf8'), cipher.final()]);
  const encrypted = Buffer.concat([iv, cipher.getAuthTag(), data]).toString('base64url');
  const mac = createHmac('sha256', derive(config.secret, 'signature')).update(`v1.${encrypted}`).digest('base64url');
  return `v1.${encrypted}.${mac}`;
}
export function readToken(config, token, expectedType, now = Date.now()) {
  try {
    if (typeof token !== 'string' || token.length > 1200 || !/^v1\.[A-Za-z\d_-]+\.[A-Za-z\d_-]+$/.test(token)) throw new Error();
    const [, data, signature] = token.split('.');
    const expected = createHmac('sha256', derive(config.secret, 'signature')).update(`v1.${data}`).digest();
    const actual = Buffer.from(signature, 'base64url');
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) throw new Error();
    const bytes = Buffer.from(data, 'base64url');
    if (bytes.length < 29) throw new Error();
    const decipher = createDecipheriv('aes-256-gcm', derive(config.secret, 'encryption'), bytes.subarray(0, 12));
    decipher.setAAD(Buffer.from('valar-newsletter:v1')); decipher.setAuthTag(bytes.subarray(12, 28));
    const payload = JSON.parse(Buffer.concat([decipher.update(bytes.subarray(28)), decipher.final()]).toString('utf8'));
    if (payload.type !== expectedType || !UUID.test(payload.id) || !Number.isSafeInteger(payload.exp) || payload.exp <= Math.floor(now / 1000)) throw new Error();
    validateEmail(payload.email);
    return payload;
  } catch { throw new NewsletterError(400, 'invalid_link', 'This link has expired or is invalid. Request a new link from the newsletter page.'); }
}
export const unsubscribeUrl = (config, email, now = Date.now()) => `${config.site}/api/newsletter/unsubscribe?token=${issueToken(config, 'unsubscribe', validateEmail(email), randomUUID(), now)}`;
export const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));

export function createRedis(config, fetchFn = fetch) {
  return async command => {
    try {
      const response = await fetchFn(config.redisUrl, { method: 'POST', headers: { Authorization: `Bearer ${config.redisToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify(command), signal: AbortSignal.timeout(8000) });
      const data = await response.json();
      if (!response.ok || data.error || !Object.hasOwn(data, 'result')) throw new Error();
      return data.result;
    } catch { throw unavailable(); }
  };
}

export function createProvider(config, fetchFn = fetch, wait = delay) {
  async function request(path, method = 'GET', body, idempotencyKey, allowMissing = false) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await fetchFn(`https://api.resend.com${path}`, { method, headers: { Authorization: `Bearer ${config.apiKey}`, 'Content-Type': 'application/json', ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}) }, ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: AbortSignal.timeout(8000) });
        if (allowMissing && response.status === 404) return null;
        if (response.ok) return await response.json();
        if (attempt === 0 && (response.status === 429 || response.status >= 500)) {
          const retryAfter = Number(response.headers.get('retry-after') || 0);
          if (retryAfter > 3) throw unavailable();
          await wait(Math.max(500, retryAfter * 1000));
          continue;
        }
        throw unavailable();
      } catch (error) {
        if (attempt === 0 && !(error instanceof NewsletterError)) { await wait(500); continue; }
        throw unavailable();
      }
    }
    throw unavailable();
  }
  const contactPath = email => `/contacts/${encodeURIComponent(email)}`;
  return {
    request,
    async getContact(email) {
      const contact = await request(contactPath(email), 'GET', undefined, undefined, true);
      if (contact && (typeof contact.id !== 'string' || typeof contact.unsubscribed !== 'boolean')) throw unavailable();
      return contact;
    },
    getSuppression: email => request(`/suppressions/${encodeURIComponent(email)}`, 'GET', undefined, undefined, true),
    async sendConfirmation(email, token, pendingId) {
      const link = `${config.site}/api/newsletter/confirm?token=${token}`;
      return request('/emails', 'POST', { from: config.from, to: [email], subject: 'Confirm your Valar GPU market brief', text: `You requested the Valar GPU market brief.\n\nConfirm your subscription: ${link}\n\nThis link expires in 24 hours. If you did not request this, ignore this email; you have not been added to the mailing list.\n\nValar Exchange\n${config.address}`, html: `<html lang="en"><body style="margin:0;background:#f6f5f5;color:#272625;font-family:Arial,sans-serif"><main style="max-width:520px;margin:32px auto;padding:32px;background:white"><p style="letter-spacing:2px">VALAR</p><h1 style="font-size:24px;font-weight:400">Confirm your GPU market brief</h1><p>You requested the Valar GPU market brief. Confirm below to join the mailing list.</p><p><a href="${escapeHtml(link)}" style="display:inline-block;padding:14px 22px;background:#706c6a;color:white;border-radius:24px">Confirm my subscription</a></p><p>This link expires in 24 hours. If you did not request this, ignore this email; you have not been added to the list.</p><p style="font-size:12px;color:#706c6a">Valar Exchange<br>${escapeHtml(config.address)}</p></main></body></html>` }, `valar-confirm-${pendingId}`);
    },
    async subscribe(email) {
      const suppression = await this.getSuppression(email);
      const existing = await this.getContact(email);
      if (suppression || existing?.unsubscribed === true) return false;
      if (!existing) {
        await request('/contacts', 'POST', { email, unsubscribed: false, topics: [{ id: config.topicId, subscription: 'opt_in' }], segments: [{ id: config.segmentId }] });
      } else {
        await request(`${contactPath(email)}/topics`, 'PATCH', [{ id: config.topicId, subscription: 'opt_in' }]);
        await request(`${contactPath(email)}/segments/${config.segmentId}`, 'POST');
      }
      return true;
    },
    async unsubscribe(email) {
      const existing = await this.getContact(email);
      if (!existing) return;
      await request(`${contactPath(email)}/topics`, 'PATCH', [{ id: config.topicId, subscription: 'opt_out' }]);
      await request(`${contactPath(email)}/segments/${config.segmentId}`, 'DELETE', undefined, undefined, true);
    },
  };
}

const RATE_SCRIPT = `local n = redis.call('INCR', KEYS[1]); if n == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end; return n`;
const UNLOCK_SCRIPT = `if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) end; return 0`;
export function createNewsletterService(config, { redis = createRedis(config), provider = createProvider(config), now = () => Date.now() } = {}) {
  const userKey = email => `valar:newsletter:subscriber:${identifier(config.secret, email)}`;
  const pendingKey = email => `valar:newsletter:pending:${identifier(config.secret, email)}`;
  async function rateLimit(scope, value, limit) {
    const key = `valar:newsletter:rate:${scope}:${identifier(config.secret, value)}:${Math.floor(now() / 3600000)}`;
    const count = await redis(['EVAL', RATE_SCRIPT, 1, key, 3600]);
    if (Number(count) > limit) throw new NewsletterError(429, 'rate_limit', 'Too many attempts. Please try again in an hour.');
  }
  async function locked(email, fn) {
    const key = `valar:newsletter:lock:${identifier(config.secret, email)}`;
    const owner = randomUUID();
    if (await redis(['SET', key, owner, 'NX', 'EX', 300]) !== 'OK') throw new NewsletterError(503, 'busy', 'Your request is being processed. Please try again shortly.');
    try { return await fn(); } finally { await redis(['EVAL', UNLOCK_SCRIPT, 1, key, owner]); }
  }
  async function audit(email, event) {
    // No raw email, token, or IP goes into the consent event history.
    const key = `valar:newsletter:consent:${identifier(config.secret, email)}`;
    await redis(['RPUSH', key, JSON.stringify(event)]);
    await redis(['EXPIRE', key, 3 * 365 * 24 * 60 * 60]);
  }
  return {
    async subscribe(input, ip) {
      const signup = validateSignup(input);
      if (signup.honeypot) return { status: 'pending', confirmed: false, message: ACCEPTED_MESSAGE };
      await rateLimit('ip', ip, 20);
      await rateLimit('email', signup.email, 3);
      await rateLimit('total', 'all', 120);
      await locked(signup.email, async () => {
        const prior = await redis(['GET', pendingKey(signup.email)]);
        let pending = prior ? JSON.parse(prior) : null;
        if (pending?.sent && now() - Date.parse(pending.sentAt) < 60000) return;
        if (!pending || pending.sent) {
          const id = randomUUID();
          pending = { id, token: issueToken(config, 'confirm', signup.email, id, now()), requestedAt: new Date(now()).toISOString(), source: signup.source, sent: false };
          await redis(['SET', pendingKey(signup.email), JSON.stringify(pending), 'EX', CONFIRM_TTL]);
        }
        const suppression = await provider.getSuppression(signup.email);
        const existing = await provider.getContact(signup.email);
        if (suppression || existing?.unsubscribed === true) { await redis(['DEL', pendingKey(signup.email)]); return; }
        await provider.sendConfirmation(signup.email, pending.token, pending.id);
        pending.sent = true;
        pending.sentAt = new Date(now()).toISOString();
        // Keep the original expiry even after a retry.
        const remaining = Math.max(1, CONFIRM_TTL - Math.floor((now() - Date.parse(pending.requestedAt)) / 1000));
        await redis(['SET', pendingKey(signup.email), JSON.stringify(pending), 'EX', remaining]);
      });
      return { status: 'pending', confirmed: false, message: ACCEPTED_MESSAGE };
    },
    async confirm(token) {
      const payload = readToken(config, token, 'confirm', now());
      return locked(payload.email, async () => {
        const stored = await redis(['GET', pendingKey(payload.email)]);
        const pending = stored ? JSON.parse(stored) : null;
        if (!pending || !pending.sent || pending.id !== payload.id || pending.token !== token) throw new NewsletterError(400, 'used_link', 'This confirmation link has already been used or replaced. Request a new link from the newsletter page.');
        const subscribed = await provider.subscribe(payload.email);
        if (!subscribed) { await redis(['DEL', pendingKey(payload.email)]); throw new NewsletterError(409, 'suppressed', 'This address cannot be subscribed. Its existing email opt-out or delivery suppression has been preserved.'); }
        const event = { event: 'confirmed', id: payload.id, requestedAt: pending.requestedAt, confirmedAt: new Date(now()).toISOString(), source: pending.source, consentVersion: CONSENT_VERSION, consentText: CONSENT_TEXT };
        await redis(['SET', userKey(payload.email), JSON.stringify({ status: 'subscribed', ...event })]);
        await audit(payload.email, event);
        // Completion is committed only after provider success and a durable consent record.
        await redis(['DEL', pendingKey(payload.email)]);
        return { status: 'confirmed', confirmed: true, message: 'You are subscribed to the Valar GPU market brief.' };
      });
    },
    async unsubscribe(token) {
      const payload = readToken(config, token, 'unsubscribe', now());
      return locked(payload.email, async () => {
        // Invalidate all outstanding confirmations before updating the provider.
        await redis(['DEL', pendingKey(payload.email)]);
        const previous = await redis(['GET', userKey(payload.email)]);
        const event = { event: 'unsubscribed', id: payload.id, unsubscribedAt: new Date(now()).toISOString() };
        await redis(['SET', userKey(payload.email), JSON.stringify({ ...(previous ? JSON.parse(previous) : {}), status: 'unsubscribed', ...event })]);
        await provider.unsubscribe(payload.email);
        await audit(payload.email, event);
        return { status: 'unsubscribed', message: 'You have been unsubscribed from the Valar GPU market brief.' };
      });
    },
  };
}
