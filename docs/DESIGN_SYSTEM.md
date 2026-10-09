# Valar interface foundation

The owner requested visual fidelity to [Stoa Exchange](https://www.stoaexchange.com). Use its restrained slate gray palette, typography, spacing, image proportions, and page composition when extending Valar. Keep Valar's branding and accurate product descriptions: the application remains an illustrative GPU asset preview.

## Visual system

`src/reference.css` and `src/fidelity.css` establish the reference page frame. `src/markets.css` owns asset discovery, profiles, and GPU-IQ; `src/editorial.css` owns secondary pages, reading surfaces, forms, and documentation. `src/neutral.css` follows those styles and sets the neutral palette, shared controls, homepage layout, and reference illustration composition. `src/footer-reference.css` loads last and sets the charcoal closing area and footer. Preserve this order in `src/main.ts`.

| Color | Purpose |
| --- | --- |
| `#ffffff` | Main canvas |
| `#272625` | Primary text and charcoal footer |
| `#706c6a` | Slate gray actions and secondary text |
| `#57524e` | Primary action hover |
| `#e3e1df` | Product and illustration band |
| `#f6f5f5` | Quiet comparison and inset surfaces |
| `#ded6ca` | Announcement strip |
| `#e7e6e6` | Fine component boundaries |

Use locally bundled Inter for interface text and system monospace for record identifiers and small technical labels. Main headings are regular weight: 28px with a 1.3 line height on desktop, 20px with a 26px line height on narrow mobile views. Standard desktop content is bounded at 1080px; the hero uses a wider frame. Homepage sections generally use 148px vertical padding on desktop and 48px with 20px side gutters on mobile. Retain the reference's compact pill buttons, light rules, and ample space around section content. Use tabular numbers for comparable hardware and financial metrics.

Reference PNG illustrations are bundled in `public/reference/`; the Valar engraving is an original SVG counterpart. See [NOTICE.md](../NOTICE.md) for sources and ownership. Treat illustrations as decorative examples, never as evidence of a live service or a verified transaction.

## Components and behavior

- **Navigation:** keep Products, Data, Research, About, and Contact in the shared navigation. Products includes GPU-IQ. Mark the current section. Escape and outside clicks dismiss desktop disclosures; mobile navigation isolates background content and restores focus on close.
- **Asset cards:** keep hardware, geography, strategy, assumptions, and evidence coverage in predictable positions. A profile is the primary action; it does not represent an executable investment.
- **Discovery filters:** combine criteria, show removable active filters, announce the result count, and offer recovery when no records match. Preserve literal search text safely. Reset and chip removal return focus to a useful control.
- **Workspace:** hardware, node configuration, quantity, and condition assumptions drive a consistent local model. Quantity supports typing, stepping, and slider controls. Tabs follow the native keyboard pattern.
- **Comparisons:** use a semantic table with aligned numbers. Narrow screens retain a keyboard-focusable scroll region and an explicit scrolling hint.
- **Forms and downloads:** describe local file creation precisely. Personal fields remain optional; validation is native and export confirmation is announced. No-JavaScript forms cannot submit. Do not imply external requests or account creation.
- **Reading and dialogs:** mobile documentation uses a native expandable navigation region. Dialogs support Escape, background isolation, narrow-screen scrolling, and focus restoration.

## Extending toward a financial product

The interface distinguishes asset identity, assumptions, and evidence today. Future integrations should carry source, observation date, verification state, units, and currency alongside each value. Illustrative record coverage is not an approval or credit signal.

Before connecting live services, define loading, empty, stale, partial, unavailable, and error states for each data surface. Financial actions need a reviewable summary, explicit confirmation, a stable reference, and an accurate completion or failure state driven by service results. The current preview does not implement execution, custody, financing, identity verification, billing, or live market feeds.

## Verification

Run `npm run check` for TypeScript, lint, focused DOM/model tests, and the production build. Inspect the production preview at desktop and narrow mobile widths so bundled fonts and assets match deployment. Check keyboard controls, modal focus, discovery-to-profile-to-brief navigation, comparison exports, and direct documentation links. Respect reduced-motion preferences and avoid horizontal page overflow; comparison-table scrolling is intentional.
