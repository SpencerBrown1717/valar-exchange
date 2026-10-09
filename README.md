# Valar Exchange

A responsive Valar Exchange marketing website and GPU asset product preview in [SpencerBrown1717/valar-exchange](https://github.com/SpencerBrown1717/valar-exchange). At the owner's request, the interface follows the visual layout of [Stoa Exchange](https://www.stoaexchange.com): white surfaces, slate gray controls, charcoal text, restrained typography, and matching section spacing and illustrations. Valar branding and product content remain specific to this preview; reused reference artwork is identified in [asset notices](NOTICE.md).

The [design foundation](docs/DESIGN_SYSTEM.md) describes the visual tokens, component roles, interaction conventions, and data-state expectations for extending the platform.

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
- Native dialogs, focus restoration, responsive menu, desktop dropdown dismissal, active section navigation, mobile documentation disclosure, native browser navigation/history, and documentation Copy with a download fallback.
- Removable market filters, keyboard-friendly empty-state recovery, a semantic GPU-IQ comparison table, and visible local export feedback.

## Preview boundaries

There is no trading, quote execution, financing, payments, custody, authentication, account creation, email submission, subscription delivery, uploads, data API, or CLI backend. All amounts, records, and charts are illustrative. Forms create local files and clearly explain that nothing is submitted. The application stores no form content and includes no analytics, cookies, or tracking integrations. Downloads are ordinary unencrypted files on the user's device.

## Release and hosting

Verified production: [tahoe-cloud-exchange.vercel.app](https://tahoe-cloud-exchange.vercel.app), deployed from main at [`2fcc81a`](https://github.com/SpencerBrown1717/valar-exchange/commit/2fcc81ae8df686a892f8e3d87f1edea5e25bfe60). The owner deployed this repository through its existing Vercel project. The GitHub repository was renamed in place from `Tahoe_Cloud_Exchange` to `valar-exchange`; preserve that project linkage and its current production URL.

For a new release, verify the served assets and Vercel source commit before reporting it live. Build command: `npm run build`; output directory: `dist`; Node: 24+. No environment variables are required. See [release evidence](docs/RELEASE.md), [reference route/control coverage](docs/REFERENCE_INVENTORY.md), and [asset notices](NOTICE.md).
