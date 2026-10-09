# Tahoe Exchange

A standalone, responsive Tahoe Exchange marketing website and product preview. It adapts the high-level institutional structure of the public Stoa website using original Tahoe copy, Tahoe's authorized blue lake/silver assets, and original interface graphics. No Stoa logo, customer logo, code, images, documentation, or traction claims are included.

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

`npm run check` runs TypeScript, ESLint, focused DOM/model tests, and the production build. The build outputs 40 public route directories and a `404.html` page in `dist/`. Nested routes are actual static HTML files, so a static host can serve direct links without requiring a proprietary rewrite service. All assets and fonts are bundled locally.

## Implemented

- Markets, Intelligence, Data, Research and three original articles.
- About, FAQ, Contact, access chooser, product signup previews, sign-in/recovery availability pages, privacy, terms, security and trust status.
- Original browser-product documentation, CLI availability pages, and reference-route aliases.
- Three synthetic fleets; 4/8 GPUs per node; bounded quantity controls; condition assumptions; Markets/Intelligence/Reporting tabs with keyboard navigation.
- Sample report TXT, synthetic dataset JSON, local review/access/inquiry/reading-preference TXT downloads.
- Native dialogs, focus restoration, responsive menu, native browser navigation/history, documentation Copy with a download fallback.

## Preview boundaries

There is no trading, quote execution, financing, payments, custody, authentication, account creation, email submission, subscription delivery, uploads, data API, or CLI backend. All amounts, records, and charts are illustrative. Forms create local files and clearly explain that nothing is submitted. The application stores no form content and includes no analytics, cookies, or tracking integrations. Downloads are ordinary unencrypted files on the user's device.

## Release and hosting

This repository was empty when work began; it had no application, `AGENTS.md`, license, deployment configuration, or existing hosting target. The connected Vercel project lookup found no project for this repository or Exchange name. No Tahoe Cloud/deck domain, other checkout, network service, or existing hosting project was changed.

Select a dedicated host/project for **this repository** before declaring a public release. Build command: `npm run build`; output directory: `dist`; Node: 24+. No environment variables are required. See [release evidence](docs/RELEASE.md), [reference route/control coverage](docs/REFERENCE_INVENTORY.md), and [asset notices](NOTICE.md).
