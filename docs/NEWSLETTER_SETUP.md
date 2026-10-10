# Valar newsletter signup and delivery setup

The website submits email signup to a real server-side API. This code does not claim that a local file download enrolls a reader. Until the services below are configured, the API returns `503 unavailable` and the website must show that signup is unavailable. No email was sent as part of implementation or testing.

## Required services

Use a verified Resend sending domain and a durable Upstash Redis database. The API uses native Node.js `fetch` and `crypto`; no mail or database SDK is required. On Vercel, `api/newsletter/subscribe.mjs`, `confirm.mjs`, and `unsubscribe.mjs` become Node.js functions alongside the static Vite build. Underscore helper files are imported code, not additional endpoints.

Create a **dedicated Valar GPU market brief segment** and a **dedicated topic with `default_subscription: "opt_out"`**. Store their IDs in the environment. Every Valar broadcast must target both this segment and this topic. Use a dedicated Resend account for Valar where possible; in a shared account, also review all existing default topics and campaigns so creating a new global contact cannot enroll it into unrelated campaigns.

Existing contacts' global `unsubscribed` status and provider suppression are preserved. Confirmation never removes a bounce/complaint/manual suppression and never clears a global opt-out. Only Valar's topic and segment are changed. A globally opted-out address must be handled through an explicit, separately reviewed provider preference process; this API cannot override it.

| Environment variable | Purpose |
| --- | --- |
| `RESEND_API_KEY` | Server-only Resend key with contact, topic, segment, suppression, and email access. |
| `NEWSLETTER_FROM` | Verified sender, for example `Valar <brief@your-domain.com>`. |
| `NEWSLETTER_SEGMENT_ID` | UUID of the dedicated Valar segment. |
| `NEWSLETTER_TOPIC_ID` | UUID of the dedicated, default-opt-out Valar topic. |
| `NEWSLETTER_TOKEN_SECRET` | Unique, cryptographically random secret with at least 32 bytes. Generate with `openssl rand -base64 48`. |
| `NEWSLETTER_SITE_URL` | Canonical HTTPS origin, for example `https://your-domain.com`; no path, query, credentials, or fragment. |
| `NEWSLETTER_POSTAL_ADDRESS` | Actual sender postal address displayed in email footers. |
| `UPSTASH_REDIS_REST_URL` | Durable database HTTPS REST endpoint. |
| `UPSTASH_REDIS_REST_TOKEN` | Server-only read/write Redis token. |
| `NEWSLETTER_ALLOWED_ORIGINS` | Optional comma-separated exact additional HTTPS origins, such as a specific preview URL. No wildcard. HTTP localhost is accepted only outside production. |

Do not prefix secrets with `VITE_`. Keep production and test contacts, Redis databases, and sender configuration separate. Ensure function duration accommodates provider calls; requests have bounded individual timeouts and retry only transient email-provider failures once. The Redis mutation lock expires after five minutes if an invocation is terminated.

Configure SPF, DKIM, and DMARC for the verified sending domain before opening signup. Test delivery and the spam folder with your own designated test inbox. Confirm the actual postal address and update the site's privacy notice to describe email subscription, Resend, Upstash, consent history, and deletion requests before launch. This is a setup checklist, not a claim of legal compliance.

## Reader flow

1. The visible form explains that submitting requests **Valar's GPU market brief** and that readers can unsubscribe. It posts JSON to `/api/newsletter/subscribe`:

   ```json
   { "email": "reader@example.com", "source": "today", "website": "" }
   ```

   `source` is one of `today`, `newsletter`, `research`, `article`, or `footer`. `website` is a hidden honeypot field. An optional `consent` field, when present, must be `true`.

2. The API validates input and exact browser origin, checks durable IP/email/global rate limits and Resend suppression, then sends a transactional confirmation email. It **does not create a contact or add anyone to the newsletter segment at this stage**. The response is always generic `202` with `status: "pending"`, `confirmed: false`, and an inbox instruction for accepted requests; it does not disclose whether an address is already known or suppressed.
3. The encrypted, signed confirmation link expires after 24 hours. Its GET displays an explicit confirmation button. Only the button's POST enrolls the reader, so email scanners opening links cannot subscribe them.
4. Confirmation checks the durable pending nonce and serializes mutations per address. It opts into only the Valar topic and segment, records confirmation timestamp, requested timestamp, source, consent text/version, and consumes the pending token. Provider failures leave the token available for a retry. Replaying a completed token fails.
5. Unsubscribe GET displays a confirmation form. A human POST or a valid standards-based one-click POST opts out of Valar's topic and removes Valar's segment. It invalidates pending confirmation links. There is no login requirement and other lists remain unchanged.

Resend sends accepted provider requests; a `202` signup response does not guarantee inbox delivery. Sending domain configuration, delivery monitoring, suppressed contacts, and provider capacity still matter.

## Unsubscribe in daily issues

The editorial pipeline uses Resend Broadcasts with the dedicated topic and segment and its managed `{{{RESEND_UNSUBSCRIBE_URL}}}`. Resend's managed preference and delivery suppression remain authoritative; always send through the topic/segment pairing.

If a future sender delivers individual marketing emails instead, `unsubscribeUrl(config, email)` from `api/newsletter/_lib/_core.mjs` creates a capability URL valid for 90 days. Every such email must include the visible link, postal address, and these headers:

```text
List-Unsubscribe: <https://your-domain.com/api/newsletter/unsubscribe?token=...>
List-Unsubscribe-Post: List-Unsubscribe=One-Click
```

For that URL, the endpoint accepts POST with `application/x-www-form-urlencoded` body `List-Unsubscribe=One-Click` and returns a blank `200`. The POST needs the valid token and does not require a browser Origin header. It never unsubscribes on GET. Preserve token-secret validity for at least the unsubscribe validity window when rotating keys, or use managed Resend unsubscribe links for all marketing sends.

## Storage and abuse controls

Pending entries live for 24 hours. Confirmation and unsubscribe tokens use authenticated encryption and a separate HMAC key derived from the configured secret; plaintext email addresses are not placed in the token URL or Redis keys. Keys use keyed hashes of normalized email/IP identifiers. Pending token bodies are encrypted. Consent history contains the address hash, timestamps, source, and consent wording without raw email or IP values. Confirmed and unsubscribed state remains durable; consent event history expires three years after its latest event. Define and implement the owner's retention and deletion policy for this data and Resend contacts before production.

A reader may request another confirmation after 60 seconds, with a maximum of three requests per address per hour. Failed sends retry with the same provider idempotency key. A successful resend uses a new pending nonce and replaces the older link. There are also 20 form attempts per IP per hour and 120 total attempts per hour. These limits intentionally bound a new public list's abuse/cost exposure; adjust based on observed legitimate volume, rather than bypassing them client-side. Rate limiting and state mutation fail closed when Redis is unavailable. Vercel's overwritten forwarding header is used for IP limits only when running on Vercel; arbitrary forwarded headers are not trusted elsewhere.

The API does not log emails, tokens, IPs, or provider error payloads. Link tokens still pass through URL requests, so apply restricted access and retention to platform request logs. Responses are not cached and link pages send `Referrer-Policy: no-referrer`, noindex, and a restrictive content security policy.

## Verification

`node --test tests/newsletter-api.test.mjs` exercises validation, missing configuration, origin and content-type rejection, encryption/purpose/expiry, confirmation/replay, provider retry identity, resends, suppression preservation, Valar-only preference changes, rate limiting, concurrent locks, scanner-safe GETs, and one-click POSTs without sending mail or creating real contacts.

The Vite dev/preview middleware invokes the same newsletter handlers locally. With no server configuration it returns a real `503` and exercises the unavailable frontend state. For an actual form → inbox → confirmation → contact/segment/topic → unsubscribe check, use isolated test configuration with local middleware, `vercel dev`, or a configured preview deployment. Test both the provider-managed broadcast unsubscribe and the custom one-click endpoint before launch. Review delivery failures and spam complaints through Resend; this scaffold does not implement a delivery-event webhook or its monitoring alerts.

## Official references

- [Resend contact creation](https://resend.com/docs/api-reference/contacts/create-contact), [contact topics](https://resend.com/docs/api-reference/contacts/update-contact-topics), and [segment membership](https://resend.com/docs/api-reference/contacts/add-contact-to-segment).
- [Resend suppression lookup](https://resend.com/docs/api-reference/suppressions/get-suppression) and [email sending/idempotency](https://resend.com/docs/api-reference/emails/send-email).
- [Upstash Redis REST commands](https://upstash.com/docs/redis/features/restapi).
- [Vercel Node.js runtime](https://vercel.com/docs/functions/runtimes/node-js) and [utility-file exclusion](https://vercel.com/docs/functions/configuring-functions/advanced-configuration).
- [Email best practices](https://resend.com/docs/email-best-practices-skill).
