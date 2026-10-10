import { createHash, randomUUID } from 'node:crypto';

export const PRIMARY_SOURCE_HOSTS = Object.freeze([
  'nvidia.com', 'amd.com', 'intel.com', 'tsmc.com', 'aws.amazon.com',
  'amazon.com', 'microsoft.com', 'google.com', 'meta.com', 'coreweave.com',
  'lambda.ai', 'runpod.io', 'vast.ai', 'datacrunch.io', 'openai.com',
  'sec.gov', 'bls.gov', 'bea.gov', 'fred.stlouisfed.org', 'energy.gov',
]);
const STATES = new Set(['draft', 'approved', 'published']);
const FOLLOW_KEYS = new Set(['h100', 'h200', 'b200', 'ai-demand']);
const UUID = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i;
const NUMERICAL_CLAIM = /(?<![A-Za-z\d])(?:[$£€]\s*)?\d[\d,.]*(?:\s*%)?/g;
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

export class EditorialError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'EditorialError';
    this.code = code;
  }
}

function publicHttpsUrl(value) {
  try {
    if (typeof value !== 'string' || value.length > 2000 || /\{\{\{|\}\}\}/.test(value)) return null;
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    if (url.protocol !== 'https:' || url.username || url.password || url.port || !host.includes('.') ||
      host.includes(':') || /^[\d.]+$/.test(host) || /(?:^|\.)(?:localhost|local|internal|test|example|invalid)$/.test(host)) return null;
    return url;
  } catch { return null; }
}

export function isPrimarySourceUrl(value, hosts = PRIMARY_SOURCE_HOSTS) {
  const url = publicHttpsUrl(value);
  return Boolean(url && hosts.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`)));
}

function validDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(`${value}T00:00:00Z`)) && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
}

function validInstant(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T.+(?:Z|[+-]\d{2}:\d{2})$/.test(value) && Number.isFinite(Date.parse(value));
}

export function validateEdition(edition, { now = new Date(), sourceHosts = PRIMARY_SOURCE_HOSTS } = {}) {
  const errors = [];
  const warnings = [];
  if (!isObject(edition)) return { valid: false, errors: ['Edition must be an object.'], warnings };
  const text = (value, name, min, max) => {
    if (typeof value !== 'string' || value.trim().length < min || value.length > max || [...value].some((character) => character.charCodeAt(0) < 32 && ![9, 10, 13].includes(character.charCodeAt(0)))) errors.push(`${name} must contain ${min}–${max} readable characters.`);
    if (typeof value === 'string' && /\{\{\{|\}\}\}/.test(value)) errors.push(`${name} cannot contain provider template variables.`);
  };
  if (typeof edition.id !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(edition.id) || edition.id.length > 80) errors.push('id must be a lowercase hyphenated identifier, at most 80 characters.');
  if (!validDate(edition.date)) errors.push('date must be a real YYYY-MM-DD date.');
  else if (Date.parse(`${edition.date}T00:00:00Z`) > now.getTime() + 86_400_000) errors.push('date cannot be more than a day in the future.');
  text(edition.title, 'title', 5, 120);
  text(edition.summary, 'summary', 20, 600);
  const state = edition.state ?? 'draft';
  if (!STATES.has(state)) errors.push('state must be draft, approved, or published.');
  const allEvidence = [];
  const numericFields = [{ value: edition.title, name: 'title' }, { value: edition.summary, name: 'summary' }];
  const evidence = (entries, prefix, sourceUrl) => {
    if (entries === undefined) return;
    if (!Array.isArray(entries) || entries.length > 20) { errors.push(`${prefix}.evidence must be an array of at most 20 verified claims.`); return; }
    entries.forEach((entry, index) => {
      if (!isObject(entry)) { errors.push(`${prefix}.evidence[${index}] must be an object.`); return; }
      text(entry.claim, `${prefix}.evidence[${index}].claim`, 1, 400);
      if (!isPrimarySourceUrl(entry.sourceUrl, sourceHosts)) errors.push(`${prefix}.evidence[${index}].sourceUrl must be a primary HTTPS source.`);
      if (sourceUrl && entry.sourceUrl !== sourceUrl) errors.push(`${prefix}.evidence[${index}] must reference its story source URL.`);
      if (typeof entry.claim === 'string') allEvidence.push(entry.claim);
    });
  };
  if (!Array.isArray(edition.stories) || edition.stories.length < 1 || edition.stories.length > 5) errors.push('stories must contain between one and five sourced developments.');
  else edition.stories.forEach((story, index) => {
    const prefix = `stories[${index}]`;
    if (!isObject(story)) { errors.push(`${prefix} must be an object.`); return; }
    text(story.title, `${prefix}.title`, 5, 140);
    text(story.summary, `${prefix}.summary`, 20, 700);
    text(story.whyItMatters, `${prefix}.whyItMatters`, 15, 500);
    text(story.watch, `${prefix}.watch`, 15, 500);
    text(story.sourceLabel, `${prefix}.sourceLabel`, 2, 100);
    if (!isPrimarySourceUrl(story.sourceUrl, sourceHosts)) errors.push(`${prefix}.sourceUrl must be a genuine primary HTTPS source on the source allowlist.`);
    if (story.publishedAt !== undefined && !validDate(story.publishedAt) && !validInstant(story.publishedAt)) errors.push(`${prefix}.publishedAt must be a date or ISO timestamp.`);
    else if (story.publishedAt && Date.parse(story.publishedAt) > now.getTime() + 86_400_000) errors.push(`${prefix}.publishedAt cannot claim a future source publication.`);
    if (story.follow !== undefined && !FOLLOW_KEYS.has(story.follow)) errors.push(`${prefix}.follow must be h100, h200, b200, or ai-demand.`);
    evidence(story.evidence, prefix, story.sourceUrl);
    for (const key of ['title', 'summary', 'whyItMatters', 'watch']) numericFields.push({ value: story[key], name: `${prefix}.${key}`, evidence: story.evidence ?? [] });
  });
  if (edition.signal !== undefined) {
    if (!isObject(edition.signal)) errors.push('signal must be an object.');
    else {
      text(edition.signal.title, 'signal.title', 5, 140);
      text(edition.signal.summary, 'signal.summary', 20, 700);
      text(edition.signal.sourceLabel, 'signal.sourceLabel', 2, 100);
      if (!isPrimarySourceUrl(edition.signal.sourceUrl, sourceHosts)) errors.push('signal.sourceUrl must be a primary HTTPS source.');
      evidence(edition.signal.evidence, 'signal', edition.signal.sourceUrl);
      numericFields.push({ value: edition.signal.title, name: 'signal.title', evidence: edition.signal.evidence ?? [] }, { value: edition.signal.summary, name: 'signal.summary', evidence: edition.signal.evidence ?? [] });
    }
  }
  for (const field of numericFields) {
    if (typeof field.value !== 'string') continue;
    for (const match of field.value.matchAll(NUMERICAL_CLAIM)) {
      const verified = field.evidence ? Array.isArray(field.evidence) && field.evidence.some((entry) => isObject(entry) && typeof entry.claim === 'string' && entry.claim.includes(match[0]) && field.value.includes(entry.claim)) : allEvidence.some((claim) => claim.includes(match[0]));
      if (!verified) {
        const problem = `${field.name} contains a numerical claim (${match[0]}) without explicit source evidence.`;
        if (state === 'draft') warnings.push(problem); else errors.push(problem);
      }
    }
  }
  if (state !== 'draft') {
    if (!isObject(edition.review)) errors.push('Approved and published editions require editorial review provenance.');
    else {
      text(edition.review.approvedBy, 'review.approvedBy', 2, 100);
      for (const key of ['approvedAt', 'sourceVerifiedAt']) {
        if (!validInstant(edition.review[key]) || Date.parse(edition.review[key]) > now.getTime() + 60_000) errors.push(`review.${key} must be an ISO timestamp no later than now.`);
      }
      if (validInstant(edition.review.approvedAt) && validInstant(edition.review.sourceVerifiedAt) && Date.parse(edition.review.sourceVerifiedAt) > Date.parse(edition.review.approvedAt)) errors.push('Sources must be verified before editorial approval.');
      if (Array.isArray(edition.stories) && edition.stories.every(isObject) && edition.review.contentDigest !== editionDigest(edition)) errors.push('review.contentDigest must match this edition; content changes require renewed approval.');
    }
  }
  return { valid: errors.length === 0, errors, warnings };
}

export function assertEdition(edition, options) {
  const result = validateEdition(edition, options);
  if (!result.valid) throw new EditorialError('INVALID_EDITION', result.errors.join('\n'));
  return edition;
}

export function editionDigest(edition) {
  const content = {
    id: edition.id, date: edition.date, title: edition.title, summary: edition.summary,
    stories: edition.stories.map((story) => ({
      title: story.title, summary: story.summary, whyItMatters: story.whyItMatters, watch: story.watch,
      sourceLabel: story.sourceLabel, sourceUrl: story.sourceUrl, publishedAt: story.publishedAt ?? null,
      follow: story.follow ?? null, evidence: story.evidence ?? [],
    })), signal: edition.signal ?? null,
  };
  return createHash('sha256').update(JSON.stringify(content)).digest('hex');
}

export function canonicalEditionUrl(edition, siteUrl) {
  const base = publicHttpsUrl(siteUrl);
  if (!base || base.pathname !== '/' || base.search || base.hash) throw new EditorialError('INVALID_SITE_URL', 'NEWSLETTER_SITE_URL must be the public canonical HTTPS origin, without a path, port, query, or fragment.');
  return new URL(`/brief/${edition.id}`, base).href;
}

export function renderEmail(edition, { siteUrl = 'https://valar.example', postalAddress = '', preview = true } = {}) {
  assertEdition(edition);
  let url;
  if (preview && siteUrl === 'https://valar.example') url = `${siteUrl}/brief/${edition.id}`;
  else url = canonicalEditionUrl(edition, siteUrl);
  if (!preview && !postalAddress.trim()) throw new EditorialError('MISSING_ADDRESS', 'A real postal address is required before preparing a broadcast.');
  const address = postalAddress.trim() || '[Configure the Valar postal address before sending]';
  const unsubscribe = '{{{RESEND_UNSUBSCRIBE_URL}}}';
  const date = new Date(`${edition.date}T12:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  const sections = edition.stories.map((story) => `<section style="border-top:1px solid #ded6ca;padding:24px 0 0;margin-top:28px"><h2 style="font-size:21px;line-height:1.4;font-weight:500;margin:0 0 12px">${escapeHtml(story.title)}</h2><p style="margin:0 0 16px">${escapeHtml(story.summary)}</p><p style="margin:0 0 12px"><strong>Why it matters.</strong> ${escapeHtml(story.whyItMatters)}</p><p style="margin:0 0 16px"><strong>Watch next.</strong> ${escapeHtml(story.watch)}</p><p style="font-size:14px;line-height:1.6;margin:0"><a href="${escapeHtml(story.sourceUrl)}" style="color:#57524e;text-decoration:underline">Source: ${escapeHtml(story.sourceLabel)}</a>${story.publishedAt ? ` · Published ${escapeHtml(story.publishedAt)}` : ''}</p></section>`).join('');
  const signal = edition.signal ? `<section style="background:#f6f5f5;border:1px solid #e3e1df;padding:24px;margin-top:28px"><h2 style="font-size:21px;font-weight:500;margin:0 0 12px">${escapeHtml(edition.signal.title)}</h2><p style="margin:0 0 16px">${escapeHtml(edition.signal.summary)}</p><a href="${escapeHtml(edition.signal.sourceUrl)}" style="font-size:14px;color:#57524e">Source: ${escapeHtml(edition.signal.sourceLabel)}</a></section>` : '';
  const html = `<!doctype html><html lang="en" dir="ltr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light"><title>${escapeHtml(edition.title)} — Valar Daily Brief</title></head><body style="margin:0;background:#f6f5f5;color:#272625;font-family:Arial,Helvetica,sans-serif"><div lang="en" dir="ltr" style="max-width:600px;margin:0 auto;background:#fff;padding:32px 24px;font-size:16px;line-height:1.65"><p style="letter-spacing:2px;font-size:14px;font-weight:bold;margin:0 0 24px">VALAR <span style="font-weight:normal;letter-spacing:0">Daily Brief</span></p>${preview ? '<p style="color:#57524e;font-size:14px">Editorial preview · not sent</p>' : ''}<p style="color:#57524e;font-size:14px;margin:0 0 12px">${escapeHtml(date)}</p><h1 style="font-size:28px;line-height:1.3;font-weight:400;margin:0 0 20px">${escapeHtml(edition.title)}</h1><p style="font-size:18px;margin:0 0 24px">${escapeHtml(edition.summary)}</p><a href="${escapeHtml(url)}" style="display:inline-block;background:#57524e;color:#fff;padding:14px 22px;border-radius:4px;text-decoration:none;line-height:1.4">Read the full GPU market brief</a>${sections}${signal}<footer style="border-top:1px solid #ded6ca;margin-top:36px;padding-top:24px;color:#57524e;font-size:14px;line-height:1.7"><p style="margin:0 0 12px">Market research and education. Prices, capacity announcements, and forecasts are evidence to examine; they do not guarantee returns.</p><p style="margin:0 0 12px">You receive the Valar Daily Brief because you confirmed your subscription. <a href="${unsubscribe}" style="color:#57524e;text-decoration:underline">Unsubscribe from the Valar Daily Brief</a>.</p><p style="margin:0">Valar Exchange<br>${escapeHtml(address).replace(/\n/g, '<br>')}</p></footer></div></body></html>`;
  const text = [
    'VALAR DAILY BRIEF', preview ? 'Editorial preview · not sent' : '', date, edition.title, edition.summary,
    `Read the full GPU market brief: ${url}`,
    ...edition.stories.map((story) => `${story.title}\n${story.summary}\nWhy it matters: ${story.whyItMatters}\nWatch next: ${story.watch}\nSource: ${story.sourceLabel}\n${story.sourceUrl}${story.publishedAt ? `\nPublished: ${story.publishedAt}` : ''}`),
    edition.signal ? `${edition.signal.title}\n${edition.signal.summary}\nSource: ${edition.signal.sourceLabel}\n${edition.signal.sourceUrl}` : '',
    'Market research and education. Evidence and forecasts do not guarantee returns.',
    `You confirmed your subscription to the Valar Daily Brief. Unsubscribe: ${unsubscribe}`,
    `Valar Exchange\n${address}`,
  ].filter(Boolean).join('\n\n');
  return { html, text, url, digest: editionDigest(edition) };
}

function requireConfig(env, sending = false) {
  const required = ['NEWSLETTER_FROM', 'NEWSLETTER_SEGMENT_ID', 'NEWSLETTER_TOPIC_ID', 'NEWSLETTER_SITE_URL', 'NEWSLETTER_POSTAL_ADDRESS'];
  if (sending) required.push('RESEND_API_KEY', 'UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN');
  const missing = required.filter((key) => typeof env[key] !== 'string' || !env[key].trim());
  if (missing.length) throw new EditorialError('MISSING_CONFIG', `Newsletter configuration is missing: ${missing.join(', ')}.`);
  for (const key of ['NEWSLETTER_SEGMENT_ID', 'NEWSLETTER_TOPIC_ID']) if (!UUID.test(env[key])) throw new EditorialError('INVALID_CONFIG', `${key} must be a Resend UUID.`);
  if (env.NEWSLETTER_POSTAL_ADDRESS.trim().length < 12 || /configure|placeholder|\[|\]|\{\{\{|\}\}\}/i.test(env.NEWSLETTER_POSTAL_ADDRESS)) throw new EditorialError('INVALID_ADDRESS', 'NEWSLETTER_POSTAL_ADDRESS must be a real physical mailing address.');
  if (!/^(?:[^<>\r\n]+\s<)?[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+>?$/.test(env.NEWSLETTER_FROM) || /\{\{\{|\}\}\}/.test(env.NEWSLETTER_FROM)) throw new EditorialError('INVALID_SENDER', 'NEWSLETTER_FROM must contain a valid sender email.');
}

export function prepareBroadcast(edition, env = process.env) {
  assertEdition(edition);
  requireConfig(env);
  const rendered = renderEmail(edition, { siteUrl: env.NEWSLETTER_SITE_URL, postalAddress: env.NEWSLETTER_POSTAL_ADDRESS, preview: false });
  return {
    name: `Valar ${edition.id}`.slice(0, 70),
    segment_id: env.NEWSLETTER_SEGMENT_ID,
    topic_id: env.NEWSLETTER_TOPIC_ID,
    from: env.NEWSLETTER_FROM,
    subject: edition.title,
    preview_text: edition.summary.slice(0, 150),
    html: rendered.html, text: rendered.text, send: false,
  };
}

async function timedFetch(fetchImpl, url, options = {}) {
  return fetchImpl(url, { ...options, signal: AbortSignal.timeout(15_000), redirect: 'manual' });
}

function metaContent(html, name) {
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    const attributes = Object.fromEntries([...tag.matchAll(/([\w-]+)\s*=\s*(["'])(.*?)\2/g)].map((match) => [match[1].toLowerCase(), match[3]]));
    if (attributes.name === name) return attributes.content;
  }
  return null;
}

export async function verifyPublishedEdition(edition, siteUrl, { fetchImpl = fetch } = {}) {
  const url = canonicalEditionUrl(edition, siteUrl);
  const response = await timedFetch(fetchImpl, url, { headers: { accept: 'text/html', 'cache-control': 'no-cache' } });
  if (response.status !== 200 || !response.headers.get('content-type')?.includes('text/html')) throw new EditorialError('UNPUBLISHED_EDITION', 'The exact public issue page is not available as HTML with HTTP 200.');
  if (response.url && response.url !== url) throw new EditorialError('UNPUBLISHED_EDITION', 'The public issue page must resolve at its canonical URL without redirects.');
  const html = await response.text();
  if (html.length > 2_000_000 || metaContent(html, 'valar-edition-id') !== edition.id || metaContent(html, 'valar-edition-digest') !== editionDigest(edition)) throw new EditorialError('UNPUBLISHED_EDITION', 'The public issue page does not match this approved edition and content digest.');
  return url;
}

export function createUpstashLedger(env, { fetchImpl = fetch } = {}) {
  const endpoint = publicHttpsUrl(env.UPSTASH_REDIS_REST_URL);
  if (!endpoint || !endpoint.hostname.endsWith('.upstash.io')) throw new EditorialError('INVALID_REDIS', 'Use the HTTPS REST URL of the dedicated Upstash database.');
  const command = async (args) => {
    const response = await timedFetch(fetchImpl, endpoint.href, { method: 'POST', headers: { authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`, 'content-type': 'application/json' }, body: JSON.stringify(args) });
    if (!response.ok) throw new EditorialError('LEDGER_UNAVAILABLE', 'The durable newsletter ledger is unavailable. No unrecorded send will proceed.');
    const data = await response.json();
    if (data.error) throw new EditorialError('LEDGER_UNAVAILABLE', 'The durable newsletter ledger rejected an operation.');
    return data.result;
  };
  return {
    acquire: (id, owner) => command(['SET', `valar:issue-lock:${id}`, owner, 'NX', 'PX', 900_000]),
    release: (id, owner) => command(['EVAL', "if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) else return 0 end", 1, `valar:issue-lock:${id}`, owner]),
    get: async (id) => { const result = await command(['GET', `valar:issue:${id}`]); return result ? JSON.parse(result) : null; },
    put: (id, record) => command(['SET', `valar:issue:${id}`, JSON.stringify(record)]),
  };
}

function createProvider(env, { fetchImpl = fetch, sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)) } = {}) {
  const request = async (path, method = 'GET', body) => {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const response = await timedFetch(fetchImpl, `https://api.resend.com${path}`, { method, headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) });
        if (response.ok) return await response.json();
        if (method === 'GET' && (response.status === 429 || response.status >= 500) && attempt < 2) {
          const retryAfter = Number(response.headers.get('retry-after'));
          if (retryAfter > 5) throw new EditorialError('PROVIDER_RATE_LIMIT', 'Resend requested a longer retry delay. Run the issue again after the provider limit resets.');
          await sleep(Math.max(500 * 2 ** attempt, Number.isFinite(retryAfter) ? retryAfter * 1000 : 0));
          continue;
        }
        throw new EditorialError('PROVIDER_ERROR', `Resend ${method} request failed with HTTP ${response.status}.`);
      } catch (error) {
        if (method === 'GET' && !(error instanceof EditorialError) && attempt < 2) { await sleep(500 * 2 ** attempt); continue; }
        if (error instanceof EditorialError) throw error;
        throw new EditorialError('PROVIDER_UNCERTAIN', `Resend ${method} response could not be verified. Reconcile the existing issue before any retry.`);
      }
    }
  };
  return {
    async verifyAudience() {
      const topic = await request(`/topics/${env.NEWSLETTER_TOPIC_ID}`);
      if (topic.id !== env.NEWSLETTER_TOPIC_ID || topic.default_subscription !== 'opt_out') throw new EditorialError('UNSAFE_TOPIC', 'The dedicated Valar topic must default to opt_out so only confirmed subscribers receive it.');
      const segment = await request(`/segments/${env.NEWSLETTER_SEGMENT_ID}`);
      if (segment.id !== env.NEWSLETTER_SEGMENT_ID) throw new EditorialError('INVALID_SEGMENT', 'The dedicated Valar segment could not be verified.');
      const sender = env.NEWSLETTER_FROM.match(/([^\s<>@]+@[^\s<>@]+\.[^\s<>@]+)/)?.[1];
      const domain = sender?.split('@')[1].toLowerCase();
      let after = '';
      for (let page = 0; page < 10; page += 1) {
        const domains = await request(`/domains?limit=100${after ? `&after=${encodeURIComponent(after)}` : ''}`);
        const match = domains.data?.find((entry) => entry.name?.toLowerCase() === domain);
        if (match) {
          if (match.status !== 'verified' || match.capabilities?.sending === 'disabled') throw new EditorialError('UNVERIFIED_SENDER', 'The Valar sender domain is not verified for sending.');
          return;
        }
        if (!domains.has_more || !domains.data?.length) break;
        after = domains.data.at(-1).id;
      }
      throw new EditorialError('UNVERIFIED_SENDER', 'The Valar sender domain is not verified in this Resend account.');
    },
    create: (payload) => request('/broadcasts', 'POST', payload),
    get: (id) => request(`/broadcasts/${encodeURIComponent(id)}`),
    send: (id) => request(`/broadcasts/${encodeURIComponent(id)}/send`, 'POST', {}),
  };
}

/** A queued result means provider acceptance, never proof of inbox delivery. */
export async function sendEdition(edition, env = process.env, options = {}) {
  if (env.NEWSLETTER_SEND_ENABLED !== 'true') throw new EditorialError('SEND_DISABLED', 'Sending is disabled. Set NEWSLETTER_SEND_ENABLED=true only after launch setup and editorial approval.');
  assertEdition(edition);
  if (edition.state !== 'published') throw new EditorialError('NOT_PUBLISHED', 'Only an approved edition published on the public website can be sent.');
  requireConfig(env, true);
  const payload = prepareBroadcast(edition, env);
  const payloadDigest = createHash('sha256').update(JSON.stringify(payload)).digest('hex');
  const digest = editionDigest(edition);
  const ledger = options.ledger ?? createUpstashLedger(env, options);
  const provider = options.provider ?? createProvider(env, options);
  const owner = randomUUID();
  if (!await ledger.acquire(edition.id, owner)) throw new EditorialError('ISSUE_BUSY', 'Another operation owns this issue. No duplicate broadcast was created.');
  let record;
  const save = async (updates) => {
    record = { ...record, ...updates, updatedAt: new Date().toISOString() };
    await ledger.put(edition.id, record);
  };
  try {
    record = await ledger.get(edition.id);
    if (record && (record.digest !== digest || record.payloadDigest !== payloadDigest)) throw new EditorialError('ISSUE_CHANGED', 'This issue already has a different content or audience payload. Reconcile it; do not reuse the issue ID.');
    if (record?.status === 'queued') return { status: 'already_queued', broadcastId: record.broadcastId, issueId: edition.id };
    await verifyPublishedEdition(edition, env.NEWSLETTER_SITE_URL, options);
    await provider.verifyAudience();
    if (record && !record.broadcastId) throw new EditorialError('RECONCILIATION_REQUIRED', 'A prior broadcast creation has an uncertain outcome. Inspect Resend and the issue ledger before retrying.');
    if (record?.broadcastId) {
      const existing = await provider.get(record.broadcastId);
      if (['queued', 'sent', 'scheduled'].includes(existing.status)) {
        await save({ status: 'queued', providerStatus: existing.status });
        return { status: 'already_queued', broadcastId: record.broadcastId, issueId: edition.id };
      }
      if (record.status !== 'draft' || existing.status !== 'draft') throw new EditorialError('RECONCILIATION_REQUIRED', 'A prior dispatch is uncertain or the provider draft changed. Reconcile the saved broadcast before retrying.');
    } else {
      await save({ id: edition.id, digest, payloadDigest, status: 'creating', createdAt: new Date().toISOString() });
      let created;
      try { created = await provider.create(payload); }
      catch (error) { await save({ status: 'reconciliation_required', errorCode: error.code ?? 'PROVIDER_UNCERTAIN' }); throw error; }
      if (!UUID.test(created.id)) { await save({ status: 'reconciliation_required' }); throw new EditorialError('PROVIDER_UNCERTAIN', 'The provider did not return a valid broadcast ID. Reconcile before retrying.'); }
      await save({ status: 'draft', broadcastId: created.id });
    }
    const current = await provider.get(record.broadcastId);
    if (current.status !== 'draft' || current.segment_id !== payload.segment_id || current.topic_id !== payload.topic_id || current.from !== payload.from || current.subject !== payload.subject || current.html !== payload.html || current.text !== payload.text) throw new EditorialError('PROVIDER_DRAFT_CHANGED', 'The saved provider draft does not match the verified issue and audience. No email was dispatched.');
    await save({ status: 'dispatching' });
    try { await provider.send(record.broadcastId); }
    catch (error) { await save({ status: 'reconciliation_required', errorCode: error.code ?? 'PROVIDER_UNCERTAIN' }); throw error; }
    await save({ status: 'queued', providerStatus: 'accepted' });
    return { status: 'queued', broadcastId: record.broadcastId, issueId: edition.id };
  } finally {
    // A failed release is intentionally surfaced; the lease still expires and the issue record remains.
    await ledger.release(edition.id, owner);
  }
}
