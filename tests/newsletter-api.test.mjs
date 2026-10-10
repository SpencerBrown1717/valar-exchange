import test from 'node:test';
import assert from 'node:assert/strict';
import { ACCEPTED_MESSAGE, CONFIRM_TTL, createNewsletterService, createProvider, createRedis, identifier, issueToken, loadConfig, readToken, unsubscribeUrl, validateSignup } from '../api/newsletter/_lib/_core.mjs';
import { createHandler } from '../api/newsletter/_lib/_http.mjs';

const env = {
  RESEND_API_KEY: 'test-key', NEWSLETTER_FROM: 'Valar <brief@example.com>', NEWSLETTER_SEGMENT_ID: '11111111-1111-4111-8111-111111111111', NEWSLETTER_TOPIC_ID: '22222222-2222-4222-8222-222222222222', NEWSLETTER_TOKEN_SECRET: 'test-only-32-byte-key-do-not-use-this-in-production', NEWSLETTER_SITE_URL: 'https://example.com', NEWSLETTER_POSTAL_ADDRESS: 'Test postal address', UPSTASH_REDIS_REST_URL: 'https://test.upstash.io', UPSTASH_REDIS_REST_TOKEN: 'redis-test-key', NODE_ENV: 'production',
};
const config = loadConfig(env);
const email = 'reader@example.com';
function memoryRedis() {
  const entries = new Map(); const commands = [];
  const redis = async command => {
    commands.push(command);
    const [name, key, value, ...args] = command;
    if (name === 'GET') return entries.get(key) ?? null;
    if (name === 'DEL') return Number(entries.delete(key));
    if (name === 'SET') { if ([value, ...args].includes('NX') && entries.has(key)) return null; entries.set(key, value); return 'OK'; }
    if (name === 'RPUSH') { const items = entries.get(key) || []; items.push(value); entries.set(key, items); return items.length; }
    if (name === 'EXPIRE') return 1;
    if (name === 'EVAL') {
      const actualKey = command[3];
      if (key.includes("redis.call('INCR'")) { const count = Number(entries.get(actualKey) || 0) + 1; entries.set(actualKey, count); return count; }
      if (entries.get(actualKey) === command[4]) { entries.delete(actualKey); return 1; }
      return 0;
    }
    throw new Error(`Unsupported mock command ${name}`);
  };
  return { redis, entries, commands };
}
function setup(overrides = {}) {
  const store = memoryRedis(); const sent = []; const changes = []; let time = Date.parse('2026-10-10T12:00:00Z');
  const provider = { getSuppression: async () => null, getContact: async () => null, sendConfirmation: async (...args) => { sent.push(args); return { id: 'mail-1' }; }, subscribe: async value => { changes.push(['subscribe', value]); return true; }, unsubscribe: async value => { changes.push(['unsubscribe', value]); }, ...overrides };
  const service = createNewsletterService(config, { redis: store.redis, provider, now: () => time });
  return { ...store, provider, service, sent, changes, now: () => time, advance: ms => { time += ms; } };
}
const signup = { email, source: 'today', website: '' };
function request({ method = 'POST', url = '/api/newsletter/subscribe', origin = config.site, contentType = 'application/json', body = signup } = {}) {
  return { method, url, headers: { ...(origin === null ? {} : { origin }), 'content-type': contentType }, body, socket: { remoteAddress: '127.0.0.1' } };
}
function response() { return { headers: {}, statusCode: 200, setHeader(key, value) { this.headers[key] = value; }, end(body = '') { this.body = body; } }; }

// These tests exercise state transitions and provider boundaries, not real sends.
test('signup config fails closed and rejects unsafe origins/keys', async () => {
  assert.throws(() => loadConfig({}), { status: 503 });
  assert.throws(() => loadConfig({ ...env, NEWSLETTER_SITE_URL: 'http://example.com' }), { status: 503 });
  assert.throws(() => loadConfig({ ...env, NEWSLETTER_TOKEN_SECRET: 'short' }), { status: 503 });
  assert.throws(() => loadConfig({ ...env, NEWSLETTER_ALLOWED_ORIGINS: 'http://localhost:4175' }), { status: 503 });
  const res = response(); await createHandler('subscribe', { env: {} })(request(), res);
  assert.equal(res.statusCode, 503); assert.equal(JSON.parse(res.body).error, 'unavailable');
});

test('signup accepts only bounded validated form input and explicit known source', () => {
  assert.equal(validateSignup(signup).email, email);
  for (const invalid of [{ ...signup, email: 'reader@example.com\r\nBcc: other@example.com' }, { ...signup, email: 'x..x@example.com' }, { ...signup, email: 'x@-example.com' }, { ...signup, consent: false }, { ...signup, source: '<script>' }, { ...signup, extra: true }, null]) assert.throws(() => validateSignup(invalid), { status: 400 });
});

test('tokens hide email, bind purpose, reject tampering and expire after 24 hours', () => {
  const now = Date.now(); const token = issueToken(config, 'confirm', email, undefined, now);
  assert.ok(!token.includes(email)); assert.equal(readToken(config, token, 'confirm', now).email, email);
  assert.throws(() => readToken(config, token, 'unsubscribe', now), { status: 400 });
  assert.throws(() => readToken(config, `${token.slice(0, -2)}xx`, 'confirm', now), { status: 400 });
  assert.throws(() => readToken(config, token, 'confirm', now + CONFIRM_TTL * 1000), { status: 400 });
  const url = unsubscribeUrl(config, email, now); assert.equal(new URL(url).pathname, '/api/newsletter/unsubscribe');
});

test('signup never enrolls before mailbox confirmation; confirms once with durable consent', async () => {
  const state = setup(); const result = await state.service.subscribe(signup, 'ip-1');
  assert.deepEqual(result, { status: 'pending', confirmed: false, message: ACCEPTED_MESSAGE });
  assert.equal(state.sent.length, 1); assert.equal(state.changes.length, 0);
  const token = state.sent[0][1]; const confirmed = await state.service.confirm(token);
  assert.equal(confirmed.confirmed, true); assert.deepEqual(state.changes, [['subscribe', email]]);
  const key = `valar:newsletter:subscriber:${identifier(config.secret, email)}`;
  const record = JSON.parse(state.entries.get(key)); assert.equal(record.status, 'subscribed'); assert.equal(record.source, 'today'); assert.ok(record.consentText);
  await assert.rejects(state.service.confirm(token), { status: 400 });
});

test('confirmation failures preserve token for retry and unsubscribe invalidates pending tokens', async () => {
  let fail = true; const state = setup({ subscribe: async () => { if (fail) throw new Error('provider unavailable'); return true; } });
  await state.service.subscribe(signup, 'ip-1'); const token = state.sent[0][1];
  await assert.rejects(state.service.confirm(token));
  fail = false; await state.service.confirm(token);
  state.advance(61000); await state.service.subscribe(signup, 'ip-1'); const next = state.sent.at(-1)[1];
  const unsubscribe = issueToken(config, 'unsubscribe', email, undefined, state.now());
  await state.service.unsubscribe(unsubscribe);
  await assert.rejects(state.service.confirm(next), { status: 400 });
  assert.equal(JSON.parse(state.entries.get(`valar:newsletter:subscriber:${identifier(config.secret, email)}`)).status, 'unsubscribed');
});

test('pending send retries reuse provider idempotency identity; new resend replaces old token after 60 seconds', async () => {
  let fail = true; const attempts = []; const state = setup({ sendConfirmation: async (...args) => { attempts.push(args); if (fail) throw new Error('timeout'); return { id: 'mail' }; } });
  await assert.rejects(state.service.subscribe(signup, 'ip-1'));
  fail = false; await state.service.subscribe(signup, 'ip-1'); assert.equal(attempts[0][2], attempts[1][2]); assert.equal(attempts[0][1], attempts[1][1]);
  await state.service.subscribe(signup, 'ip-1'); assert.equal(attempts.length, 2);
  const other = setup(); await other.service.subscribe(signup, 'ip-2'); const first = other.sent[0][1]; other.advance(61000); await other.service.subscribe(signup, 'ip-2');
  assert.notEqual(first, other.sent[1][1]); await assert.rejects(other.service.confirm(first), { status: 400 });
});

test('honeypot, suppressed, and globally unsubscribed addresses do not receive confirmation or enroll', async () => {
  for (const overrides of [{ getSuppression: async () => ({ origin: 'bounce' }) }, { getContact: async () => ({ id: 'contact', unsubscribed: true }) }]) {
    const state = setup(overrides); assert.equal((await state.service.subscribe(signup, 'ip-1')).message, ACCEPTED_MESSAGE); assert.equal(state.sent.length, 0); assert.equal(state.changes.length, 0);
  }
  const state = setup(); assert.equal((await state.service.subscribe({ ...signup, website: 'bot' }, 'ip-1')).message, ACCEPTED_MESSAGE); assert.equal(state.commands.length, 0);
});

test('durable rate limits and per-address locks reject abuse and concurrent mutations', async () => {
  const state = setup(); for (let attempt = 0; attempt < 3; attempt++) await state.service.subscribe(signup, 'ip-1');
  await assert.rejects(state.service.subscribe(signup, 'ip-1'), { status: 429 });
  const locked = setup(); locked.entries.set(`valar:newsletter:lock:${identifier(config.secret, email)}`, 'another-request');
  await assert.rejects(locked.service.subscribe(signup, 'ip-2'), { status: 503 }); assert.equal(locked.sent.length, 0);
});

test('subscribe HTTP requires same origin JSON and never returns enrollment success before confirmation', async () => {
  const state = setup(); const handler = createHandler('subscribe', { env, serviceFactory: () => state.service });
  for (const options of [{ origin: 'https://evil.example' }, { origin: null }, { contentType: 'text/plain' }, { body: '{invalid' }]) {
    const res = response(); await handler(request(options), res); assert.ok([400, 403, 415].includes(res.statusCode));
  }
  const res = response(); await handler(request(), res); assert.equal(res.statusCode, 202); assert.equal(JSON.parse(res.body).confirmed, false); assert.equal(res.headers['Cache-Control'], 'no-store, max-age=0');
});

test('GET confirmation and unsubscribe are scanner-safe; one-click POST works without origin', async () => {
  let mutations = 0; const token = issueToken(config, 'confirm', email); const service = { confirm: async () => { mutations++; return { message: 'Confirmed' }; }, unsubscribe: async () => { mutations++; return { message: 'Unsubscribed' }; } };
  const confirm = createHandler('confirm', { env, serviceFactory: () => service }); const res = response();
  await confirm(request({ method: 'GET', url: `/api/newsletter/confirm?token=${token}` }), res); assert.equal(res.statusCode, 200); assert.match(res.body, /method="post"/); assert.equal(mutations, 0); assert.equal(res.headers['Referrer-Policy'], 'no-referrer');
  const post = response(); await confirm(request({ url: '/api/newsletter/confirm', contentType: 'application/x-www-form-urlencoded', body: { token } }), post); assert.equal(post.statusCode, 200); assert.equal(mutations, 1);
  const unsubToken = issueToken(config, 'unsubscribe', email); const unsubscribe = createHandler('unsubscribe', { env, serviceFactory: () => service });
  const get = response(); await unsubscribe(request({ method: 'GET', url: `/api/newsletter/unsubscribe?token=${unsubToken}` }), get); assert.equal(get.statusCode, 200); assert.equal(mutations, 1);
  const oneClick = response(); await unsubscribe(request({ url: `/api/newsletter/unsubscribe?token=${unsubToken}`, origin: null, contentType: 'application/x-www-form-urlencoded', body: { 'List-Unsubscribe': 'One-Click' } }), oneClick); assert.equal(oneClick.statusCode, 200); assert.equal(oneClick.body, ''); assert.equal(mutations, 2);
});

test('Resend enrollment scopes topic and segment; preserves global suppression and other topic settings', async () => {
  const requests = []; let globalUnsubscribed = false;
  const fetchFn = async (url, options) => {
    requests.push({ path: new URL(url).pathname, method: options.method, body: options.body ? JSON.parse(options.body) : null });
    const path = new URL(url).pathname;
    if (path.startsWith('/suppressions/')) return Response.json({}, { status: 404 });
    if (options.method === 'GET') return Response.json({ id: 'existing-contact', unsubscribed: globalUnsubscribed });
    return Response.json({ id: 'ok' });
  };
  const provider = createProvider(config, fetchFn); await provider.subscribe(email);
  assert.deepEqual(requests.find(item => item.method === 'PATCH').body, [{ id: config.topicId, subscription: 'opt_in' }]);
  assert.ok(requests.some(item => item.path.endsWith(`/segments/${config.segmentId}`) && item.method === 'POST'));
  requests.length = 0; await provider.unsubscribe(email);
  assert.deepEqual(requests.find(item => item.method === 'PATCH').body, [{ id: config.topicId, subscription: 'opt_out' }]);
  assert.ok(requests.some(item => item.method === 'DELETE')); assert.ok(!requests.some(item => item.body?.unsubscribed !== undefined));
  requests.length = 0; globalUnsubscribed = true; assert.equal(await provider.subscribe(email), false); assert.ok(requests.every(item => item.method === 'GET'));
});

test('provider and Redis failures fail closed without exposing provider payloads; email retries keep idempotency key', async () => {
  const headers = []; let count = 0;
  const provider = createProvider(config, async (_url, options) => { headers.push(options.headers); count++; return count === 1 ? Response.json({ message: email }, { status: 500 }) : Response.json({ id: 'mail' }); }, async () => {});
  const token = issueToken(config, 'confirm', email); await provider.sendConfirmation(email, token, 'pending-id'); assert.equal(headers.length, 2); assert.equal(headers[0]['Idempotency-Key'], headers[1]['Idempotency-Key']);
  const broken = createProvider(config, async () => Response.json({ message: email }, { status: 403 })); await assert.rejects(broken.getContact(email), error => error.status === 503 && !error.message.includes(email));
  const redis = createRedis(config, async () => Response.json({ error: 'bad credential' }, { status: 401 })); await assert.rejects(redis(['GET', 'key']), { status: 503 });
});
