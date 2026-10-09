# Tahoe Exchange release evidence

Repository: `SpencerBrown1717/Tahoe_Cloud_Exchange`. The initial remote repository had no branches, files, application, instructions, license, or deployment configuration. A minimal README bootstrap initializes main; the website is released through one coherent task branch and pull request.

## Candidate checks

- TypeScript and ESLint.
- Ten focused DOM/model tests: all 40 routes/internal links/anchors/labels, keyboard tab wrapping/selection, fleet and condition changes, 4/8 GPU node configuration, quantity bounds, download contents, menu Escape/focus, modal close/focus restoration, local form handling, synthetic data export, documentation Copy fallback and not-found content.
- Production build emits 40 static route directories and `404.html`; fonts/assets are bundled locally.
- All 40 generated route pages and four branding/license assets returned HTTP 200 with the expected prerendered content at the verified Mini-local preview, `http://127.0.0.1:4173/`. This is a local development URL, not a public release.
- Headless Chrome 154.0.8037.98: all 40 routes passed at 1440, 390, and 320 pixels (120 route/viewport checks), with no page overflow, missing images, JavaScript errors, or external network requests. Home, Intelligence, docs, access, contact, research, menus, and dialogs were captured; an independent screenshot review found no remaining visual blocker.
- Native keyboard product tabs, fleet/node/condition/quantity updates, dialogs with Escape/focus restoration, mobile navigation, browser Back, actual report/brief/form/dataset downloads, and the documentation Copy fallback passed in Chrome. No financial operation or external submission was performed.
- Additional checks passed for the home page at nine widths from 320 to 1920 pixels, plus product/docs/access pages at 768 and 1024 pixels. Native modal traversal kept focus away from the underlying page, and the desktop Resources menu worked with Enter and followed its Documentation link.
- Visual QA found and corrected a lake-image aspect-ratio error and contained its decorative phone/tablet canvas. The final screenshots show the authorized lake icon with its original proportions.
- GitHub `Website checks / check` is configured to run the same checks on PRs and main using Node 24 and pinned official actions. The hosted run failed before executing any steps; no job logs were available, and its cause is unconfirmed. The repository's main branch reports `protected: false`; this workflow is newly added and is not an established required branch check.

The DOM tests use JSDOM with polyfilled dialog methods. The separate headless Chrome checks establish real rendering and native browser interaction. Screenshots and detailed results are retained in the Mini's isolated task workspace at `qa/tahoe-exchange/`, outside the repository.

## Remaining acceptance and hosting

The Mini desktop remains locked. Visual acceptance was completed using the installed Chrome with its browser sandbox enabled and a fresh temporary headless profile. The locked desktop and the owner's browser profile were not accessed or changed.

An attempted normal squash merge was rejected by automatic approval review because the hosted check remains failed. No merge or alternate main update was performed. The candidate remains in PR #1; main contains only the bootstrap README. Explicit owner approval to merge this locally verified candidate despite the unresolved hosted check is pending.

There is no verified public production or hosted preview URL. The connected Vercel read-only lookup returned no project matching this repository or Exchange name. No existing Tahoe Cloud/deck project or domain was changed. A dedicated host/project for this repository must be chosen and made available before deployment can be completed.

Host configuration: Node 24+, `npm ci --ignore-scripts`, build `npm run build`, output `dist/`, no environment variables. Preserve the generated nested route directories and serve `404.html` for unknown paths. Never point existing Tahoe Cloud/deck domains at this site as part of this release.

## Rollback

Revert the website PR through normal repository review, or restore a prior reviewed commit on a dedicated Exchange host if one is later configured. No database migrations, service settings, credentials, domain changes or financial backend need rollback.
