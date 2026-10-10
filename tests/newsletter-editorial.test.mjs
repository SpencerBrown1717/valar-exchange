import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { canonicalEditionUrl, editionDigest, prepareBroadcast, renderEmail, sendEdition, validateEdition, verifyPublishedEdition } from '../scripts/newsletter/editorial.mjs';
import { publishEdition, runCli } from '../scripts/newsletter/cli.mjs';

const segmentId = '78261eea-8f8b-4381-83c6-79fa7120f1cf';
const topicId = 'b6d24b8e-af0b-4c3c-be0c-359bbd97381e';
const broadcastId = '49a3999c-0ce1-4ea6-ab68-afcd6dc2e794';
const env = {
  NEWSLETTER_FROM: 'Valar <brief@valar.exchange>', NEWSLETTER_SITE_URL: 'https://valar.exchange',
  NEWSLETTER_SEGMENT_ID: segmentId, NEWSLETTER_TOPIC_ID: topicId,
  NEWSLETTER_POSTAL_ADDRESS: 'Valar Exchange\n123 Example Avenue\nNew York, NY 10001',
  NEWSLETTER_SEND_ENABLED: 'true', RESEND_API_KEY: 'test-secret',
  UPSTASH_REDIS_REST_URL: 'https://example.upstash.io', UPSTASH_REDIS_REST_TOKEN: 'test-ledger-secret',
};

function fixture(state = 'published') {
  const edition = {
    id: 'gpu-market-foundations', date: new Date().toISOString().slice(0, 10), state,
    title: 'Read demand through the order book',
    summary: 'A useful GPU market view separates product announcements from operating capacity and completed customer demand.',
    stories: [{
      title: 'Follow capacity through deployment',
      summary: 'An H100 deployment announcement provides a starting point for research, while completed delivery and utilization need separate evidence.',
      whyItMatters: 'An equipment order and a paying workload represent different stages of market demand.',
      watch: 'Watch for delivery schedules, operating capacity, and customer contract disclosures.',
      sourceLabel: 'NVIDIA product specifications', sourceUrl: 'https://www.nvidia.com/en-us/data-center/h100/', follow: 'h100',
    }],
  };
  if (state !== 'draft') edition.review = { approvedBy: 'Editorial reviewer', approvedAt: new Date().toISOString(), sourceVerifiedAt: new Date(Date.now() - 1000).toISOString(), contentDigest: editionDigest(edition) };
  return edition;
}

function memoryLedger() {
  const records = new Map();
  let owner;
  return {
    records,
    async acquire(_id, nextOwner) { if (owner) return null; owner = nextOwner; return 'OK'; },
    async release(_id, nextOwner) { if (owner === nextOwner) owner = undefined; },
    async get(id) { return records.has(id) ? structuredClone(records.get(id)) : null; },
    async put(id, record) { records.set(id, structuredClone(record)); },
  };
}

function providerStub() {
  let payload;
  let status = 'draft';
  const calls = { create: 0, send: 0, get: 0, verify: 0 };
  return {
    calls,
    setStatus(value) { status = value; },
    async verifyAudience() { calls.verify += 1; },
    async create(value) { calls.create += 1; payload = structuredClone(value); return { id: broadcastId }; },
    async get() { calls.get += 1; return { ...payload, id: broadcastId, status }; },
    async send() { calls.send += 1; status = 'queued'; return { id: broadcastId }; },
  };
}

function publishedFetch(edition, { digest = editionDigest(edition), status = 200, body, url } = {}) {
  return async (target) => {
    assert.equal(target, `https://valar.exchange/brief/${edition.id}`);
    const response = new Response(body ?? `<html><head><meta content="${edition.id}" name="valar-edition-id"><meta name='valar-edition-digest' content='${digest}'></head><body>Issue</body></html>`, { status, headers: { 'content-type': 'text/html' } });
    if (url) Object.defineProperty(response, 'url', { value: url });
    return response;
  };
}

test('edition validation rejects calendar errors and deceptive or private source URLs', () => {
  const edition = fixture();
  assert.equal(validateEdition(edition).valid, true);
  for (const sourceUrl of ['http://nvidia.com/report', 'https://nvidia.com.evil.com/report', 'https://127.0.0.1/report', 'https://nvidia.com@evil.com/report', 'https://news.example/report', 'https://nvidia.com/?tracking={{{contact.email}}}']) {
    const copy = fixture('draft');
    copy.stories[0].sourceUrl = sourceUrl;
    assert.equal(validateEdition(copy).valid, false, sourceUrl);
  }
  edition.date = '2026-02-30';
  assert.ok(validateEdition(edition).errors.some((error) => error.includes('real YYYY-MM-DD')));
});

test('numbers warn in drafts and cannot silently pass approval without exact source evidence', () => {
  const edition = fixture('draft');
  edition.stories[0].summary = 'The filing reports $20 billion in contracted obligations, which requires delivery and utilization evidence.';
  assert.ok(validateEdition(edition).warnings.some((warning) => warning.includes('$20')));
  edition.state = 'approved';
  edition.review = { approvedBy: 'Editorial reviewer', approvedAt: new Date().toISOString(), sourceVerifiedAt: new Date(Date.now() - 1000).toISOString(), contentDigest: editionDigest(edition) };
  assert.equal(validateEdition(edition).valid, false);
  edition.stories[0].evidence = [{ claim: '$20 billion in contracted obligations', sourceUrl: edition.stories[0].sourceUrl }];
  edition.review.contentDigest = editionDigest(edition);
  assert.equal(validateEdition(edition).valid, true);
  edition.stories[0].evidence[0].sourceUrl = 'https://www.sec.gov/another-source';
  assert.equal(validateEdition(edition).valid, false);
});

test('an approved content digest becomes invalid after an editorial edit', () => {
  const edition = fixture();
  edition.summary += ' This paragraph changed after review.';
  assert.ok(validateEdition(edition).errors.some((error) => error.includes('contentDigest')));
});

test('malformed evidence returns validation errors instead of throwing', () => {
  for (const evidence of [{ claim: 'unexpected object' }, [null], [42]]) {
    const edition = fixture('draft');
    edition.stories[0].summary = 'The filing reports $20 billion in obligations, subject to separate deployment evidence.';
    edition.stories[0].evidence = evidence;
    assert.equal(validateEdition(edition).valid, false);
  }
});

test('email escapes content and includes accessible language, one main action, text and unsubscribe', () => {
  const edition = fixture('draft');
  edition.title = 'Demand <script>alert("x")</script> & supply';
  const rendered = renderEmail(edition);
  assert.match(rendered.html, /Demand &lt;script&gt;alert\(&quot;x&quot;\)&lt;\/script&gt; &amp; supply/);
  assert.doesNotMatch(rendered.html, /<script>/);
  assert.match(rendered.html, /<html lang="en" dir="ltr">/);
  assert.match(rendered.html, /<div lang="en" dir="ltr"/);
  assert.equal((rendered.html.match(/<h1\b/g) ?? []).length, 1);
  assert.equal((rendered.html.match(/background:#57524e/g) ?? []).length, 1);
  assert.match(rendered.html, /\{\{\{RESEND_UNSUBSCRIBE_URL\}\}\}/);
  assert.match(rendered.text, /Watch next:/);
  assert.match(rendered.text, /Editorial preview · not sent/);
  edition.title = 'Demand {{{contact.email}}} injection';
  assert.equal(validateEdition(edition).valid, false);
});

test('prepared payload is a draft scoped to the dedicated segment and topic', () => {
  const payload = prepareBroadcast(fixture(), env);
  assert.equal(payload.segment_id, segmentId);
  assert.equal(payload.topic_id, topicId);
  assert.equal(payload.send, false);
  assert.match(payload.html, /123 Example Avenue/);
  assert.throws(() => prepareBroadcast(fixture(), {}), { code: 'MISSING_CONFIG' });
  assert.throws(() => prepareBroadcast(fixture(), { ...env, NEWSLETTER_POSTAL_ADDRESS: '[Configure address]' }), { code: 'INVALID_ADDRESS' });
});

test('canonical publication requires an exact public origin and matching issue content', async () => {
  const edition = fixture();
  for (const siteUrl of ['http://valar.exchange', 'https://localhost', 'https://127.0.0.1', 'https://valar.exchange/news', 'https://valar.exchange?preview=true', 'https://valar.example']) assert.throws(() => canonicalEditionUrl(edition, siteUrl), { code: 'INVALID_SITE_URL' });
  await verifyPublishedEdition(edition, env.NEWSLETTER_SITE_URL, { fetchImpl: publishedFetch(edition) });
  await assert.rejects(verifyPublishedEdition(edition, env.NEWSLETTER_SITE_URL, { fetchImpl: publishedFetch(edition, { digest: 'stale' }) }), { code: 'UNPUBLISHED_EDITION' });
  await assert.rejects(verifyPublishedEdition(edition, env.NEWSLETTER_SITE_URL, { fetchImpl: publishedFetch(edition, { body: '<html>Generic SPA fallback</html>' }) }), { code: 'UNPUBLISHED_EDITION' });
  await assert.rejects(verifyPublishedEdition(edition, env.NEWSLETTER_SITE_URL, { fetchImpl: publishedFetch(edition, { url: 'https://valar.exchange/login' }) }), { code: 'UNPUBLISHED_EDITION' });
});

test('disabled, incomplete, and unapproved sends fail before any network mutation', async () => {
  const fetchImpl = async () => { assert.fail('No network call expected'); };
  await assert.rejects(sendEdition(fixture(), { ...env, NEWSLETTER_SEND_ENABLED: 'false' }, { fetchImpl }), { code: 'SEND_DISABLED' });
  await assert.rejects(sendEdition(fixture('draft'), env, { fetchImpl }), { code: 'NOT_PUBLISHED' });
  await assert.rejects(sendEdition(fixture(), { NEWSLETTER_SEND_ENABLED: 'true' }, { fetchImpl }), { code: 'MISSING_CONFIG' });
});

test('a durable issue reservation queues once and survives repeated runs without duplicates', async () => {
  const edition = fixture();
  const ledger = memoryLedger();
  const provider = providerStub();
  const options = { ledger, provider, fetchImpl: publishedFetch(edition) };
  assert.equal((await sendEdition(edition, env, options)).status, 'queued');
  assert.equal((await sendEdition(edition, env, options)).status, 'already_queued');
  assert.equal(provider.calls.create, 1);
  assert.equal(provider.calls.send, 1);
  assert.equal(ledger.records.get(edition.id).status, 'queued');
  await assert.rejects(sendEdition(edition, { ...env, NEWSLETTER_SEGMENT_ID: topicId }, options), { code: 'ISSUE_CHANGED' });
});

test('an active issue lock prevents concurrent creation', async () => {
  const edition = fixture();
  const ledger = memoryLedger();
  await ledger.acquire(edition.id, 'another-process');
  const provider = providerStub();
  await assert.rejects(sendEdition(edition, env, { ledger, provider, fetchImpl: publishedFetch(edition) }), { code: 'ISSUE_BUSY' });
  assert.equal(provider.calls.create, 0);
});

test('uncertain creation is durably blocked instead of creating another broadcast', async () => {
  const edition = fixture();
  const ledger = memoryLedger();
  const provider = providerStub();
  provider.create = async () => { provider.calls.create += 1; throw new Error('Connection lost after request'); };
  const options = { ledger, provider, fetchImpl: publishedFetch(edition) };
  await assert.rejects(sendEdition(edition, env, options));
  assert.equal(ledger.records.get(edition.id).status, 'reconciliation_required');
  await assert.rejects(sendEdition(edition, env, options), { code: 'RECONCILIATION_REQUIRED' });
  assert.equal(provider.calls.create, 1);
});

test('uncertain dispatch reconciles a queued provider issue without sending again', async () => {
  const edition = fixture();
  const ledger = memoryLedger();
  const provider = providerStub();
  provider.send = async () => { provider.calls.send += 1; provider.setStatus('queued'); throw new Error('Provider accepted but response lost'); };
  const options = { ledger, provider, fetchImpl: publishedFetch(edition) };
  await assert.rejects(sendEdition(edition, env, options));
  assert.equal((await sendEdition(edition, env, options)).status, 'already_queued');
  assert.equal(provider.calls.send, 1);
});

test('an unresolved dispatch is not retried when the provider still reports draft', async () => {
  const edition = fixture();
  const ledger = memoryLedger();
  const provider = providerStub();
  provider.send = async () => { provider.calls.send += 1; throw new Error('Unknown outcome'); };
  const options = { ledger, provider, fetchImpl: publishedFetch(edition) };
  await assert.rejects(sendEdition(edition, env, options));
  await assert.rejects(sendEdition(edition, env, options), { code: 'RECONCILIATION_REQUIRED' });
  assert.equal(provider.calls.send, 1);
});

test('provider audience or content edits prevent dispatch', async () => {
  const edition = fixture();
  const provider = providerStub();
  const original = provider.get;
  provider.get = async () => ({ ...await original(), topic_id: segmentId });
  await assert.rejects(sendEdition(edition, env, { ledger: memoryLedger(), provider, fetchImpl: publishedFetch(edition) }), { code: 'PROVIDER_DRAFT_CHANGED' });
  assert.equal(provider.calls.send, 0);
});

test('live API adapter requires an opt-out topic and verified sender before creation', async () => {
  const edition = fixture();
  const seen = [];
  const fetchImpl = async (url, options) => {
    seen.push({ url, method: options.method ?? 'GET' });
    if (url.startsWith(env.NEWSLETTER_SITE_URL)) return publishedFetch(edition)(url);
    if (url.endsWith(`/topics/${topicId}`)) return Response.json({ id: topicId, default_subscription: 'opt_in' });
    assert.fail(`Unexpected request: ${url}`);
  };
  await assert.rejects(sendEdition(edition, env, { ledger: memoryLedger(), fetchImpl }), { code: 'UNSAFE_TOPIC' });
  assert.equal(seen.filter((entry) => entry.method === 'POST').length, 0);
});

test('REST adapter verifies sender and retries safe reads while submitting one scoped draft and dispatch', async () => {
  const edition = fixture();
  const requests = [];
  let payload;
  let domainReads = 0;
  const fetchImpl = async (url, options) => {
    requests.push({ url, method: options.method ?? 'GET' });
    if (url.startsWith(env.NEWSLETTER_SITE_URL)) return publishedFetch(edition)(url);
    assert.equal(options.headers.authorization, `Bearer ${env.RESEND_API_KEY}`);
    if (url.endsWith(`/topics/${topicId}`)) return Response.json({ id: topicId, default_subscription: 'opt_out' });
    if (url.endsWith(`/segments/${segmentId}`)) return Response.json({ id: segmentId });
    if (url.includes('/domains?')) {
      domainReads += 1;
      return domainReads === 1 ? Response.json({}, { status: 429, headers: { 'retry-after': '1' } }) : Response.json({ has_more: false, data: [{ id: segmentId, name: 'valar.exchange', status: 'verified', capabilities: { sending: 'enabled' } }] });
    }
    if (url.endsWith('/broadcasts')) {
      payload = JSON.parse(options.body);
      assert.equal(payload.send, false);
      assert.equal(payload.topic_id, topicId);
      assert.equal(payload.segment_id, segmentId);
      assert.equal(options.headers['Idempotency-Key'], undefined, 'Broadcast idempotency support is not documented');
      return Response.json({ id: broadcastId }, { status: 201 });
    }
    if (url.endsWith(`/broadcasts/${broadcastId}/send`)) return Response.json({ id: broadcastId });
    if (url.endsWith(`/broadcasts/${broadcastId}`)) return Response.json({ ...payload, id: broadcastId, status: 'draft' });
    assert.fail(`Unexpected request: ${url}`);
  };
  const waits = [];
  assert.equal((await sendEdition(edition, env, { ledger: memoryLedger(), fetchImpl, sleep: async (delay) => { waits.push(delay); } })).status, 'queued');
  assert.deepEqual(waits, [1000]);
  assert.equal(requests.filter((request) => request.method === 'POST').length, 2);
});

test('an unverified sender blocks REST mutations', async () => {
  const edition = fixture();
  let mutations = 0;
  const fetchImpl = async (url, options) => {
    if (options.method === 'POST') mutations += 1;
    if (url.startsWith(env.NEWSLETTER_SITE_URL)) return publishedFetch(edition)(url);
    if (url.endsWith(`/topics/${topicId}`)) return Response.json({ id: topicId, default_subscription: 'opt_out' });
    if (url.endsWith(`/segments/${segmentId}`)) return Response.json({ id: segmentId });
    if (url.includes('/domains?')) return Response.json({ has_more: false, data: [{ name: 'valar.exchange', status: 'pending' }] });
    assert.fail(`Unexpected request: ${url}`);
  };
  await assert.rejects(sendEdition(edition, env, { ledger: memoryLedger(), fetchImpl }), { code: 'UNVERIFIED_SENDER' });
  assert.equal(mutations, 0);
});

test('publish refuses drafts and changes under an existing immutable issue ID', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'valar-editorial-'));
  try {
    const archive = join(directory, 'editions.json');
    await assert.rejects(publishEdition(fixture('draft'), archive), { code: 'NOT_APPROVED' });
    const approved = fixture('approved');
    const published = await publishEdition(approved, archive);
    assert.equal(published.state, 'published');
    assert.equal(editionDigest(published), editionDigest(approved));
    assert.equal(JSON.parse(await readFile(archive, 'utf8')).length, 1);
    approved.title = 'A changed issue requires a correction';
    approved.review.contentDigest = editionDigest(approved);
    await assert.rejects(publishEdition(approved, archive), { code: 'ISSUE_CHANGED' });
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('CLI draft and previews never send or expose API credentials', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'valar-editorial-cli-'));
  const messages = [];
  try {
    const file = join(directory, 'draft.json');
    await runCli(['draft', file], { env, output: (message) => messages.push(message) });
    assert.equal(JSON.parse(await readFile(file, 'utf8')).state, 'draft');
    await assert.rejects(runCli(['draft', file], { env, output: () => {} }), { code: 'EEXIST' });
    assert.doesNotMatch(messages.join(' '), /test-secret|test-ledger-secret/);
  } finally { await rm(directory, { recursive: true, force: true }); }
});
