# Valar interface foundation

Valar presents GPU assets with the clarity of an institutional research and capital platform. Give the asset, its evidence, and the next useful action priority over decorative effects. The current application remains an illustrative product preview.

## Visual system

`src/institutional.css` owns the shared frame, navigation, homepage, workspace, controls, dialogs, and responsive rules. `src/markets.css` owns asset discovery, deal profiles, and GPU-IQ. `src/editorial.css` owns secondary heroes, reading surfaces, forms, documentation, and the footer. These files follow the existing base styles in `src/main.ts`; avoid placing new overrides in the legacy reference files.

| Token | Value | Purpose |
| --- | --- | --- |
| `--paper` | `#f8f9f7` | Main page surface |
| `--ink` | `#172c25` | Primary text and actions |
| `--muted` | `#5c6b61` | Secondary text |
| `--blue` | `#216b58` | Existing semantic action token; now green |
| `--navy` | `#142521` | Dark surface and structural contrast |
| `--line` | `#dce2dc` | Separators and component boundaries |
| `--surface` | `#eef2ed` | Quiet inset surface |
| `--accent` | `#c1bb8d` | Restrained brass detail |

Use locally bundled Inter for interface text and system monospace for record identifiers and small technical labels. Reserve large, tight type for page titles. Use tabular numbers for comparable financial or hardware metrics. Body text needs enough line height and a bounded measure. Small labels must retain readable contrast; decoration can be lighter when it carries no information.

## Components and behavior

- **Navigation:** show Markets, GPU-IQ, and Research directly. Related company destinations live in a native disclosure. Mark the current section. Escape and outside clicks dismiss the desktop disclosure. Mobile navigation isolates background content and restores focus on close.
- **Asset cards:** keep hardware, geography, strategy, budget assumptions, and evidence coverage in predictable positions. The profile is the primary action; never suggest that a card represents an executable investment.
- **Discovery filters:** combine criteria, show removable active filters, announce the result count, and offer recovery when no records match. Preserve literal search text safely. Reset and chip removal return focus to a useful control.
- **Workspace:** hardware, node configuration, quantity, and condition assumptions drive a consistent local model. Quantity can be typed, stepped, or adjusted with the slider. Tabs follow the native keyboard pattern.
- **Comparisons:** use a semantic table with numeric alignment. Narrow screens retain a keyboard-focusable scroll region and an explicit scrolling hint rather than hiding columns.
- **Forms and downloads:** describe the action precisely. Personal fields remain optional. Validation is native; export confirmation is announced. No-JavaScript forms cannot submit. The current action produces a local file, so it must never imply an external request or account creation.
- **Reading:** keep prose and navigation separate. Mobile documentation uses a native expandable navigation region so the article title appears first. Research pages use consistent covers and reading metadata.
- **Dialogs:** keep the title, close control, and primary action visible and understandable. Support Escape, background isolation, scrolling on small screens, and return focus to the opener.

## Extending toward a financial product

The interface distinguishes asset identity, assumptions, and evidence today. Future integrations should carry source, observation date, verification state, units, and currency alongside each value. Do not turn illustrative record coverage into an approval or credit signal.

Before connecting live services, define loading, empty, stale, partial, unavailable, and error states for each data surface. A financial action should have a reviewable summary, explicit confirmation, a stable reference, and an accurate completion or failure state. Those states should be driven by service results; the current preview does not implement execution, custody, financing, identity verification, billing, or live market feeds.

## Verification

Run `npm run check` for TypeScript, lint, focused DOM/model tests, and the production build. For visual changes, inspect the production preview so bundled fonts and assets match deployment. Check desktop and narrow mobile views, native keyboard controls, modal focus, the discovery-to-profile-to-brief path, comparison exports, and direct documentation links. Respect reduced-motion preferences and avoid horizontal page overflow; comparison-table scrolling is intentional.
