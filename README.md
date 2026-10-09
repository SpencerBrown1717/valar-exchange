# Valar Exchange

A standalone, responsive Valar Exchange marketing website and product preview in [SpencerBrown1717/valar-exchange](https://github.com/SpencerBrown1717/valar-exchange). It uses original Valar copy and graphics, with the public Stoa website as a design reference. No Stoa logo, customer logo, code, images, documentation, or traction claims are included. The visual correction follows fresh desktop and mobile comparisons of the public reference: flat GPU silhouettes, attached calculator controls, gradient result panels, structured workflow rows and a compact dark footer.

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
- Editorial Research index, newest-first source-linked news article rendering, and three original evergreen guides. Daily publishing is implemented and paused pending owner setup.
- About, FAQ, Contact, access chooser, product signup previews, sign-in/recovery availability pages, privacy, terms, security and trust status.
- Original browser-product documentation, CLI availability pages, and reference-route aliases.
- Three synthetic fleets; 4/8 GPUs per node; bounded quantity controls; condition assumptions; Markets/Intelligence/Reporting tabs with keyboard navigation.
- Sample report TXT, synthetic dataset JSON, local review/access/inquiry/reading-preference TXT downloads, with allowlisted deal-to-access preselection.
- Native dialogs, focus restoration, responsive menu, native browser navigation/history, documentation Copy with a download fallback.

## Preview boundaries

There is no trading, quote execution, financing, payments, custody, authentication, account creation, email submission, subscription delivery, uploads, data API, or CLI backend. All amounts, records, and charts are illustrative. Forms create local files and clearly explain that nothing is submitted. The application stores no form content and includes no analytics, cookies, or tracking integrations. Downloads are ordinary unencrypted files on the user's device.

## Release and hosting

Verified production: [tahoe-cloud-exchange.vercel.app](https://tahoe-cloud-exchange.vercel.app), deployed from main at [`2c7792c`](https://github.com/SpencerBrown1717/valar-exchange/commit/2c7792cf4f4bba62d09c49adb98d54db9fceec86). The owner deployed this repository through its existing Vercel project. The GitHub repository was renamed in place from `Tahoe_Cloud_Exchange` to `valar-exchange`; preserve that project linkage and its current production URL.

For a new release, verify the served assets and Vercel source commit before reporting it live. Build command: `npm run build`; output directory: `dist`; Node: 24+. No frontend/Vercel environment variables are required. Daily Research uses server-side GitHub Actions configuration; it is paused until owner setup and first real article validation. See [release evidence](docs/RELEASE.md), [reference route/control coverage](docs/REFERENCE_INVENTORY.md), and [asset notices](NOTICE.md).

## Daily Research

The lean publishing job uses three verified primary RSS feeds, a configured Tahoe Qwen text-chat API, a bounded draft/grounding pass, and Git-backed publication slots/story tombstones. It publishes at most one source-supported article per calendar day, skipping stale, duplicate, uncertain or quiet days. No provider calls have been made. Newest articles appear first with VALAR Research bylines, source/event/publication dates and facts separated from analysis. There is no newsletter or public key/publishing form.

Owner API-key entry, first private draft review, activation gates and pause/edit/remove commands: [Research setup](docs/RESEARCH_SETUP.md). Source/model standards and honest evaluation limits: [editorial playbook v1](docs/RESEARCH_PLAYBOOK.md).
