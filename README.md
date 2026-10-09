# Valar Exchange

A standalone, responsive Valar Exchange marketing website and product preview. It adapts the high-level institutional structure of the public Stoa website using original Valar copy, a restrained white/stone/ink palette, an original VALAR wordmark and GPU interface graphics. No Stoa logo, customer logo, code, images, documentation, or traction claims are included.

## Run locally

Use Node.js 24 or newer.

```sh
npm ci --ignore-scripts --no-audit --no-fund
npm run dev
```

```sh
npm run check
npm run preview -- --port 4173
```

`npm run check` runs TypeScript, ESLint, focused DOM/model tests, and the production build. The build outputs 46 public route directories and a `404.html` page in `dist/`. Nested routes are actual static HTML files, so a static host can serve direct links without requiring a proprietary rewrite service. All assets and fonts are bundled locally.

## Implemented

- Markets with three fictional deal profiles, combined search/hardware/region/strategy filters, sorting and profile downloads.
- GPU-IQ Free public summaries and an openly accessible Premium demonstration with comparisons, filters, original research and local CSV exports. No secure paywall, pricing, subscription or checkout.
- Data, Research and three original articles.
- About, FAQ, Contact, access chooser, product signup previews, sign-in/recovery availability pages, privacy, terms, security and trust status.
- Original browser-product documentation, CLI availability pages, and reference-route aliases.
- Three synthetic fleets; 4/8 GPUs per node; bounded quantity controls; condition assumptions; Markets/Intelligence/Reporting tabs with keyboard navigation.
- Sample report TXT, synthetic dataset JSON, local review/access/inquiry/reading-preference TXT downloads, with allowlisted deal-to-access preselection.
- Native dialogs, focus restoration, responsive menu, native browser navigation/history, documentation Copy with a download fallback.

## Preview boundaries

There is no trading, quote execution, financing, payments, custody, authentication, account creation, email submission, subscription delivery, uploads, data API, or CLI backend. All amounts, records, and charts are illustrative. Forms create local files and clearly explain that nothing is submitted. The application stores no form content and includes no analytics, cookies, or tracking integrations. Downloads are ordinary unencrypted files on the user's device.

## Release and hosting

This repository was empty when work began; it had no application, `AGENTS.md`, license, deployment configuration, or existing hosting target. The website implementation is on main. A separate Vercel project/default URL was authorized, but the connected credential cannot access the owner’s intended Vercel scope; no public deployment has been verified. No Tahoe Cloud/deck domain, other checkout, network service, or existing hosting project was changed.

Restore access to the intended Vercel scope, then deploy **this repository** to a dedicated project before declaring a public release. Build command: `npm run build`; output directory: `dist`; Node: 24+. No environment variables are required. See [release evidence](docs/RELEASE.md), [reference route/control coverage](docs/REFERENCE_INVENTORY.md), and [asset notices](NOTICE.md).
