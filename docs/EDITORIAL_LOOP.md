# The Valar Daily Brief loop

The email must be useful before a reader clicks: a small set of verified developments, why each matters, and what evidence to watch next. Its main action opens the full issue on Valar, where a reader can follow GPUs, examine the market, and understand ways to participate. Newsletter engagement is not evidence of investment suitability, and neither the newsletter nor a watchlist executes a trade.

## Daily operation

1. Read original vendor announcements, operator disclosures, published provider prices, and filings. Open the actual sources and record publication dates. Distinguish an announced order, delivered equipment, operating capacity, and revenue; a capital expenditure plan does not establish a completed GPU purchase.
2. Create a dated draft with `draft`, then fill the edition. Select up to five developments. Explain uncertainty and use plain language. If there is no verified new development, produce a clearly identified educational brief or skip the issue; never invent activity to fill a schedule.
3. Run `validate` and `render`. Review factual claims against their sources, the HTML and plain text, mobile legibility, and the single main action. Numerical claims need explicit evidence. The validator checks structure and provenance; it cannot decide whether a source actually supports an interpretation.
4. An authorized editor approves the exact content. Set `state: "approved"` and record `review.approvedBy`, ISO `approvedAt`, ISO `sourceVerifiedAt`, and `contentDigest: editionDigest(edition)`. Approval is invalid after a content change. No CLI command approves its own draft.
5. Run `publish`, which writes the approved issue into `public/newsletter/editions.json` with state `published`. Build and deploy the website. Verify the exact canonical `/brief/<id>` page is publicly available and shows the approved content.
6. Run `prepare` to inspect the scoped broadcast payload. When production setup is complete and sending is enabled, run `send`. It checks the public issue, sender domain, topic, audience, and durable issue ledger before queueing the broadcast.
7. Monitor provider delivery, hard bounces, complaints, and unsubscribes. Resend Broadcasts handles the managed unsubscribe URL and topic preferences. Keep global suppression and other newsletter preferences intact. The opt-in API enrolls contacts only after mailbox confirmation.

A recurring Codex task can research and produce a reviewable draft each day. Until deployment, sender configuration, and editorial authority are established, the recurring task remains in draft mode. It must not infer approval from elapsed time or label a payload or queued issue as an inbox delivery. A production scheduler should call the same commands and respect the same gates.

## Commands

Run from the repository root with Node 24 or newer. The initial foundation issue demonstrates the schema; it is dated research, not a live price feed.

```sh
node scripts/newsletter/cli.mjs draft work/brief.json
node scripts/newsletter/cli.mjs validate work/brief.json
node scripts/newsletter/cli.mjs render work/brief.json work/brief-preview
node scripts/newsletter/cli.mjs publish work/brief.json
npm run build
```

After a reviewed website deployment:

```sh
node --env-file=.env.local scripts/newsletter/cli.mjs prepare work/brief.json work/brief-preview
node --env-file=.env.local scripts/newsletter/cli.mjs send work/brief.json
```

`render` also accepts an archive file plus `--id <id>`. `validate` checks every edition in an archive. `publish --archive <path>` supports an isolated archive during review. `draft` refuses to overwrite an existing file. `prepare` writes HTML, text, and a JSON payload locally and makes no external API call.

If `publish` was run on a standalone approved file, its original state stays approved; `send` should read the published issue from the website archive:

```sh
node --env-file=.env.local scripts/newsletter/cli.mjs send public/newsletter/editions.json --id gpu-market-foundations
```

## Schema and source review

An edition contains `id`, `date`, `state`, `title`, `summary`, and `stories`. Each story contains `title`, `summary`, `whyItMatters`, `watch`, `sourceLabel`, and a primary HTTPS `sourceUrl`; optional `publishedAt` records the source date and `follow` is one of `h100`, `h200`, `b200`, or `ai-demand`. An optional `signal` contains a title, summary, source label, and primary source URL.

For a numerical claim, add `evidence: [{ "claim": "the exact supported phrase", "sourceUrl": "the story source URL" }]` to that story or signal. The claim must appear in its text. Unsourced numerical claims produce draft warnings and block approved or published editions. GPU model names such as H100 do not count as numerical claims. Non-numerical claims still require real editorial verification.

Primary source hosts are explicitly allowed in `PRIMARY_SOURCE_HOSTS` in `scripts/newsletter/editorial.mjs`. Add a new host only after verifying it is the original publisher. HTTPS alone does not establish that a site is a primary source. The validator rejects private hosts, IP addresses, credential-bearing URLs, provider template injection, and deceptive lookalike host suffixes.

The `editionDigest` export computes SHA-256 over the issue content, excluding state and review metadata. Static issue pages expose `valar-edition-id` and `valar-edition-digest` meta tags. The send verifier requires HTTP 200 HTML at the exact public canonical URL, without redirects, and matching markers. A generic SPA fallback or deployment login page fails this check.

## Production configuration

Keep secrets in server environments or an ignored `.env.local`, never in `VITE_*` variables, website JSON, email payloads, or git. `NEWSLETTER_SEND_ENABLED` defaults to `false`.

| Variable | Purpose |
| --- | --- |
| `NEWSLETTER_FROM` | Valar identity at a verified sender domain |
| `NEWSLETTER_SITE_URL` | Public canonical HTTPS origin, with no path or query |
| `NEWSLETTER_POSTAL_ADDRESS` | Real physical mailing address shown in every issue |
| `NEWSLETTER_SEGMENT_ID` | Dedicated segment populated by confirmed Valar signups |
| `NEWSLETTER_TOPIC_ID` | Dedicated Valar topic with `default_subscription: "opt_out"` |
| `RESEND_API_KEY` | Server credential that can read the configured audience and send broadcasts |
| `UPSTASH_REDIS_REST_URL` | Dedicated Upstash HTTPS REST database endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | Server credential for the durable issue ledger |
| `NEWSLETTER_SEND_ENABLED` | Exact `true` enables dispatch after every other check passes |

The opt-in endpoints additionally require `NEWSLETTER_TOKEN_SECRET`; see [NEWSLETTER_SETUP.md](./NEWSLETTER_SETUP.md). Verify sender DNS and sender identity, address, newsletter consent, and audience/topic ownership before enabling production. Development and preview environments should retain sending disabled.

## Duplicate protection and failures

The ledger stores immutable content and audience payload hashes under `valar:issue:<id>` and an atomic owner lease under `valar:issue-lock:<id>`. Issue records have no automatic expiration. A lease expires after fifteen minutes; releasing it compares the owner token so an old process cannot remove another process's lock.

The pipeline records a creation reservation before calling Resend. It creates a draft (`send: false`), persists its broadcast ID, verifies the provider draft still matches the issue and audience, records dispatch intent, and then sends that saved draft. A `queued` result means provider acceptance; it does not prove delivery. Repeated runs return `already_queued` without another send. Content, sender, address, or audience changes under the same issue ID are blocked.

Safe GET requests retry transient network errors, HTTP 429, and HTTP 5xx with short backoff. Longer requested rate-limit delays stop the run for later retry. Broadcast POST requests are not blindly retried: Resend's documented idempotency support covers email endpoints, not broadcasts. An uncertain create or dispatch is recorded as `reconciliation_required`. A subsequent run can recognize a saved provider broadcast already queued, scheduled, or sent; otherwise it stops for operator reconciliation.

On an uncertain result, inspect the existing broadcast and ledger record. Do not clear the record, create another broadcast, or reuse the issue ID to force a send. An operator must establish the actual provider outcome and reconcile the existing issue. A failed ledger write stops dispatch; a failure after provider acceptance leaves enough saved broadcast identity for status reconciliation. Corrections require a new issue identifier and fresh editorial approval.

## API references checked

- [Resend Create Broadcast](https://resend.com/docs/api-reference/broadcasts/create-broadcast), [Send Broadcast](https://resend.com/docs/api-reference/broadcasts/send-broadcast), and [Retrieve Broadcast](https://resend.com/docs/api-reference/broadcasts/get-broadcast).
- [Resend topics and subscription preferences](https://resend.com/blog/unsubscribe-topics) and [domain status](https://resend.com/docs/api-reference/domains/list-domains).
- [Resend idempotency support and its time window](https://resend.com/docs/dashboard/emails/idempotency-keys).

No broadcast, contact mutation, or subscriber email was sent while implementing and testing this pipeline. Tests use fake network and ledger boundaries.
