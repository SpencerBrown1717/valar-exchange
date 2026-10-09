# Valar Exchange release evidence

Canonical repository: [SpencerBrown1717/valar-exchange](https://github.com/SpencerBrown1717/valar-exchange). It was renamed in place from `Tahoe_Cloud_Exchange`, preserving its history. The initial repository was empty, with no application, instructions, license, or hosting configuration. No pre-existing repository license was removed.

## Verified production baseline

Production: [tahoe-cloud-exchange.vercel.app](https://tahoe-cloud-exchange.vercel.app), verified at main [`2fcc81ae8df686a892f8e3d87f1edea5e25bfe60`](https://github.com/SpencerBrown1717/valar-exchange/commit/2fcc81ae8df686a892f8e3d87f1edea5e25bfe60). The owner deployed the repository through Vercel. Preserve the existing Git-connected project and production URL when releasing further changes.

This baseline includes GPU deal discovery and GPU-IQ previews. The owner subsequently requested a visual correction. This change uses a fresh side-by-side rendered comparison at 1440 and 390 pixels to correct the hero silhouettes, calculator rails and result panels, workflow heading, participant grid, comparison panels and dark closing/footer. Deal discovery and GPU-IQ remain available through their dedicated routes. Earlier reference measurements and functional browser checks did not establish accepted Stoa visual fidelity. The site uses original copy and graphics rather than Stoa assets, customer logos, or traction claims.

- Baseline TypeScript, ESLint, all thirteen focused DOM/model tests and production build passed. The build emitted 46 public static route directories and `404.html`.
- Three fictional deal scenarios support combined search/hardware/region/strategy filtering, budget/evidence sorting, empty/reset states, detail navigation, fictional profile downloads and allowlisted deal-to-access brief selection.
- GPU-IQ Free offers public summaries/basic profiles. Premium is an openly accessible demonstration of comparisons, filters, original research and local CSV/TXT exports. It is explicitly not a secure paywall; paid access, prices, subscriptions, billing and checkout are unavailable.
- All deal budgets, GPU counts, regions, valuation figures and evidence statuses are invented. There are zero verified market observations. No live offering, actual eligibility decision, financial account, external submission or binding commitment is created.
- Baseline native Chrome verification covered all 46 routes at 1440, 390 and 320 pixels (138 route/viewport checks), desktop/mobile screenshots, product keyboard controls, native dialogs, mobile navigation, browser history, downloads and documentation Copy fallback. Checks rejected viewport overflow, failed images, browser errors and unexpected external requests.
- Baseline native static-page verification covered the four local forms with JavaScript disabled/enabled. Submit controls remained disabled until their local handlers attached. Enter with JavaScript disabled made no query request.
- Independent focused source review approved the deal/controller/disclosure changes. Earlier visual checks addressed layout defects; the subsequent visual correction receives its own independent review and final captures in `qa/valar-fidelity-release/`.

Baseline browser checks used installed Chrome with its sandbox enabled and an isolated temporary profile. The locked Mini desktop and owner's browser profile were not accessed. Evidence and reference measurements remain in `qa/valar-gpu-fintech/` outside the repository, including `results.json`, `nojs-results.json`, and screenshots. These results apply to the baseline, not the later visual correction.

## Historical repository checks

GitHub `Website checks / check` runs the same local checks using Node 24 and pinned official actions. Earlier hosted runs failed before executing any steps, without available job logs; their cause is unconfirmed. At the earlier check, main reported `protected: false` and no required status checks. Earlier PRs were merged normally following owner release authorization. No branch protections, native status results or security settings were changed. Check the current PR/run outcome before treating hosted CI as successful.

## Historical release authorization and hosting

The earlier browser checks used Chrome with its sandbox enabled and a fresh temporary headless profile. They did not access or change the locked Mini desktop or the owner's browser profile.

Automatic approval review initially rejected the squash merge while the hosted check remained failed. After explicit owner approval to release despite that failure, the normal merge of PR #1 succeeded. PRs #1 and #2 were merged normally. No branch protections or check configuration were changed. This authorization is historical evidence; check the current candidate's hosted CI and release authorization before merging.

The earlier Vercel connector lookup returned 403 and prevented an agent-managed deployment. The owner subsequently deployed this repository, establishing the verified production URL above. That earlier access failure is not evidence that hosting remains unconfigured. No alternate project or existing Tahoe Cloud/deck domain was substituted.

Host configuration: Node 24+, `npm ci --ignore-scripts`, build `npm run build`, output `dist/`, no environment variables. Preserve the generated nested route directories and serve `404.html` for unknown paths. Never point existing Tahoe Cloud/deck domains at this site as part of this release.

## Rollback

Revert the affected website PR through normal repository review, or restore the prior reviewed source on the existing Vercel project. For this visual correction, `2fcc81ae8df686a892f8e3d87f1edea5e25bfe60` is the verified deployed source to retain. No database migration or financial backend needs rollback.
