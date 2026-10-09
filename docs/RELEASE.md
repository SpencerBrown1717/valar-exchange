# Valar Exchange release evidence

Repository: `SpencerBrown1717/Tahoe_Cloud_Exchange`. The initial remote repository had no branches, files, application, instructions, license, or deployment configuration. A minimal README bootstrap initializes main; the website changes use one task branch and normal pull-request merges. The site was renamed to Valar Exchange at the owner’s request. The GitHub repository name and authorized Tahoe asset provenance are preserved.

## Candidate checks

- TypeScript and ESLint.
- Ten focused DOM/model tests: all 40 routes/internal links/anchors/labels, keyboard tab wrapping/selection, fleet and condition changes, 4/8 GPU node configuration, quantity bounds, download contents, menu Escape/focus, modal close/focus restoration, local form handling, synthetic data export, documentation Copy fallback and not-found content.
- Production build emits 40 static route directories and `404.html`; fonts/assets are bundled locally.
- All 40 generated route pages and four branding/license assets returned HTTP 200 with the expected prerendered content at the verified Mini-local preview, `http://127.0.0.1:4180/`. This is a local development URL, not a public release.
- Headless Chrome 154.0.8037.98: all 40 routes passed at 1440, 390, and 320 pixels (120 route/viewport checks), with no page overflow, missing images, JavaScript errors, or external network requests. Home, Intelligence, docs, access, contact, research, menus, and dialogs were captured; an independent screenshot review found no remaining visual blocker.
- Native keyboard product tabs, fleet/node/condition/quantity updates, dialogs with Escape/focus restoration, mobile navigation, browser Back, actual report/brief/form/dataset downloads, and the documentation Copy fallback passed in Chrome. No financial operation or external submission was performed.
- Native static-page checks verified contact, both access forms, and research with JavaScript disabled and enabled. Submit controls stay disabled until local download handlers attach; Enter without JavaScript causes no query request. Enabled controls download local briefs and report that nothing was sent.
- Additional checks passed for the home page at nine widths from 320 to 1920 pixels, plus product/docs/access pages at 768 and 1024 pixels. Native modal traversal kept focus away from the underlying page, and the desktop Resources menu worked with Enter and followed its Documentation link.
- The Valar redesign introduces a midnight navy hero, luminous blue actions, generous type, silver workspace chrome, dark sidebar, evidence diagram, and coordinated inner pages. Mobile fleet records become labeled cards. Visual QA corrected inherited phone positioning and explicitly set `overflow-clip-margin: 0px` for the decorative tablet canvas. The authorized lake asset retains its original proportions.
- GitHub `Website checks / check` is configured to run the same checks on PRs and main using Node 24 and pinned official actions. The hosted run failed before executing any steps; no job logs were available, and its cause is unconfirmed. The repository's main branch reports `protected: false`; this workflow is newly added and is not an established required branch check.

The DOM tests use JSDOM with polyfilled dialog methods. The separate headless Chrome checks establish real rendering and native browser interaction. Screenshots and detailed results are retained in the Mini's isolated task workspace at `qa/valar-exchange/`, outside the repository.

## Remaining acceptance and hosting

The Mini desktop remains locked. Visual acceptance was completed using the installed Chrome with its browser sandbox enabled and a fresh temporary headless profile. The locked desktop and the owner's browser profile were not accessed or changed.

Automatic approval review initially rejected the squash merge while the hosted check remained failed. After explicit owner approval to release despite that failure, the normal merge of PR #1 succeeded. PRs #1 and #2 were merged normally. The Valar visual release starts from verified main `a29662579f9f87608961bca9da3587071088ac00`. No branch protections or check configuration were changed.

There is no verified public production or hosted preview URL. A separate Vercel project/default URL is authorized. The connected Vercel credential cannot access the owner's default `spencer-brown-s-projects` scope (`team_NSX21X4XJnRs0BDISWaiinS5`): its project lookup returns 403. No Vercel CLI is installed for the supported fallback. Access to that intended scope must be made available before deployment; no alternate scope or existing Tahoe Cloud/deck project/domain was changed.

Host configuration: Node 24+, `npm ci --ignore-scripts`, build `npm run build`, output `dist/`, no environment variables. Preserve the generated nested route directories and serve `404.html` for unknown paths. Never point existing Tahoe Cloud/deck domains at this site as part of this release.

## Rollback

Revert the website PR through normal repository review, or restore a prior reviewed commit on a dedicated Exchange host if one is later configured. No database migrations, service settings, credentials, domain changes or financial backend need rollback.
