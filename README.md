# Valar Exchange

Valar starts with a daily GPU market brief and takes readers from evidence to a personal view of the market. The visual system retains the owner's slate-gray Stoa reference, with white surfaces, charcoal text, restrained typography, and locally bundled fonts. Reused artwork remains identified in [asset notices](NOTICE.md).

## Reader journey

- **Today:** a sourced brief and one-field email signup.
- **Market:** hardware families, the AI cycle research framework, and how to interpret prices and purchases.
- **Watchlist:** device-local follow/remove with no account required.
- **Participate:** the economics and availability of hardware ownership, public securities, private projects, and bearish exposure.
- **Archive:** every published brief has a stable `/brief/<id>` page and matching content digest.

The first edition is explicitly a foundation brief, not live news. Live price feeds, purchase ledgers, volatility calculations, and trading execution are not yet connected. Legacy fictional product demonstrations remain accessible through their original routes.

## Run locally

Use Node.js 24 or newer.

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm run dev
```

```sh
npm run check
npm run preview -- --port 4175
```

Development and preview use the same server-only newsletter handlers as Vercel. An unconfigured API returns a real `503`; the browser does not claim enrollment. Server secrets never use a `VITE_` prefix. The build outputs 52 public static routes plus a `404.html`; new published issues automatically add routes.

## Mailing list and daily operations

A dedicated **Valar Daily Brief** segment and default-opt-out topic have been created in Resend. Signup requires mailbox confirmation before enrollment. Provider-managed unsubscribe preferences and delivery suppressions remain authoritative.

Configure a verified Valar sender, physical postal address, canonical HTTPS site, server-only Resend key, token secret, and dedicated Upstash database before enabling subscriptions. Use `.env.example` as the variable inventory. Production and test configuration must remain separate. See [newsletter setup](docs/NEWSLETTER_SETUP.md).

```sh
npm run newsletter -- validate public/newsletter/editions.json
npm run newsletter -- draft content/drafts/new-issue.json
npm run newsletter -- render public/newsletter/editions.json work/email-preview --id gpu-market-foundations
```

The editorial pipeline validates sources and approval provenance, renders HTML/plain-text previews, publishes approved issues into the site archive, and sends only after checking the exact public page and dedicated audience. Durable issue locks and delivery records prevent blind duplicate dispatch after uncertain provider responses. `NEWSLETTER_SEND_ENABLED=false` is the default. See [editorial loop](docs/EDITORIAL_LOOP.md).

## Availability and data handling

Watchlists stay on the reader's device. Newsletter email addresses are submitted only to the configured API and delivery services. Legacy review/inquiry forms remain local downloads. There is no brokerage, order execution, short-selling connection, lending, custody, payment, authentication, or live market-data backend. Educational exposure pages do not create investments. See the site's privacy notice and [design foundation](docs/DESIGN_SYSTEM.md).

## Hosting

Preserve the existing repository linkage to the owner's Vercel project and production URL. This implementation is reviewed on the existing preview branch; production is unchanged. Vercel serves the Vite static build and the three newsletter Node functions. New releases must be checked against their source commit before being reported live.
