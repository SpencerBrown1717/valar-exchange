# Tahoe Exchange release evidence

Repository: `SpencerBrown1717/Tahoe_Cloud_Exchange`. The initial remote repository had no branches, files, application, instructions, license, or deployment configuration. A minimal README bootstrap initializes main; the website is released through one coherent task branch and pull request.

## Candidate checks

- TypeScript and ESLint.
- Ten focused DOM/model tests: all 40 routes/internal links/anchors/labels, keyboard tab wrapping/selection, fleet and condition changes, 4/8 GPU node configuration, quantity bounds, download contents, menu Escape/focus, modal close/focus restoration, local form handling, synthetic data export, documentation Copy fallback and not-found content.
- Production build emits 40 static route directories and `404.html`; fonts/assets are bundled locally.
- All 40 generated route pages and four branding/license assets returned HTTP 200 with the expected prerendered content at the verified Mini-local preview, `http://127.0.0.1:4173/`. This is a local development URL, not a public release.
- GitHub `Website checks / check` runs the same checks on PRs and main using Node 24 and pinned official actions.

The DOM tests exercise event handlers in JSDOM; native dialog methods are polyfilled in those tests. They do not establish real browser rendering, native keyboard focus trapping, or mobile visual acceptance.

## Remaining acceptance and hosting

The Mini was locked, and computer-use automatic unlock could not unlock it. Native browser inspection of the reference and final desktop/mobile layout, screenshots, browser-history navigation, native dialog behavior and actual download behavior remain blocked until the owner unlocks the Mini. No approval action remains pending in this workspace after the approved dependency/network and localhost-preview actions completed.

There is no verified public production or hosted preview URL. The connected Vercel read-only lookup returned no project matching this repository or Exchange name. No existing Tahoe Cloud/deck project or domain was changed. A dedicated host/project for this repository must be chosen and made available before deployment can be completed.

Host configuration: Node 24+, `npm ci --ignore-scripts`, build `npm run build`, output `dist/`, no environment variables. Preserve the generated nested route directories and serve `404.html` for unknown paths. Never point existing Tahoe Cloud/deck domains at this site as part of this release.

## Rollback

Revert the website PR through normal repository review, or restore a prior reviewed commit on a dedicated Exchange host if one is later configured. No database migrations, service settings, credentials, domain changes or financial backend need rollback.
