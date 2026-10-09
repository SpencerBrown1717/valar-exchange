import { sampleDeals, budgetLabel, intelligenceSummary, type SampleDeal } from './deals.ts';

const arrow = '<span aria-hidden="true">↗</span>';
const number = (value: number) => new Intl.NumberFormat('en-US').format(value);
const evidenceTrack = (count: number) => `<span class="evidence-track" aria-hidden="true">${Array.from({ length: 8 }, (_, index) => `<i${index < count ? ' class="is-present"' : ''}></i>`).join('')}</span>`;
const hardwareVisual = (deal: SampleDeal) => `<div class="deal-hardware" aria-hidden="true"><div class="hardware-caption"><span>NVIDIA / ${deal.hardware}</span><span>ASSET STUDY</span></div><div class="hardware-module"><i></i><i></i><i></i><i></i><span class="hardware-chip">${deal.hardware}<small>GPU</small></span><i></i><i></i><i></i><i></i></div><div class="hardware-footer"><span>${String(deal.gpus).padStart(3, '0')} UNITS</span><span>ILLUSTRATIVE</span></div></div>`;

export function sampleNotice(): string {
  return '<p class="sample-notice"><span class="notice-symbol" aria-hidden="true">i</span><span><strong>Product preview · Fictional examples.</strong> No live deals, verified market data, investment offers or commitments.</span></p>';
}

export function dealCards(records: SampleDeal[]): string {
  if (!records.length) return `<div class="empty-results"><span class="empty-symbol" aria-hidden="true">⌕</span><p class="eyebrow">REFINE YOUR SEARCH</p><h3>No profiles match these filters.</h3><p>Try another hardware family or region, or clear your filters to explore all three fictional profiles.</p><button class="button button-secondary" type="button" data-reset-deals>Clear all filters <span aria-hidden="true">↻</span></button></div>`;
  return records.map(deal => `<article class="deal-card">
    <div class="deal-card-top"><span class="deal-id">${deal.id.toUpperCase()}</span><span class="sample-pill">Fictional example</span></div>
    ${hardwareVisual(deal)}
    <div class="deal-card-copy"><p class="tiny-label">${deal.strategy}</p><h3><a href="/deals/${deal.id}">${deal.title}</a></h3><p>${deal.summary}</p></div>
    <dl><div><dt>Assumed region</dt><dd>${deal.region}</dd></div><div><dt>Invented GPU count</dt><dd>${number(deal.gpus)} <span>GPUs</span></dd></div><div class="deal-budget"><dt>Invented project budget</dt><dd>${budgetLabel(deal.budget)} <span>USD</span></dd></div></dl>
    <div class="deal-evidence"><span>Sample records <strong>${deal.evidence} / 8</strong></span>${evidenceTrack(deal.evidence)}<small>Presence is not verification</small></div>
    <a class="deal-card-action text-button" href="/deals/${deal.id}">View asset profile ${arrow}</a>
  </article>`).join('');
}

export function featuredDeals(): string {
  return `<section class="deals-section section-container" id="deals" aria-labelledby="deals-title"><div class="platform-heading"><div><p class="eyebrow">THE OPPORTUNITY SET / PREVIEW</p><h2 id="deals-title">A closer look at<br/>the underlying asset.</h2></div><a class="button button-secondary" href="/marketplace#deal-browser">Explore the marketplace ${arrow}</a></div>${sampleNotice()}<div class="deal-grid">${dealCards(sampleDeals)}</div></section>`;
}

export function dealBrowser(): string {
  return `<section class="deals-section section-container" id="deal-browser" aria-labelledby="browse-title">
    <div class="platform-heading"><div><p class="eyebrow">VALAR MARKETS / ASSET DISCOVERY</p><h2 id="browse-title">Find your next perspective.</h2><p class="market-section-description">Explore the hardware, assumptions and evidence behind each GPU asset profile.</p></div><a class="text-button" href="/docs/deal-discovery">A guide to these profiles ${arrow}</a></div>
    ${sampleNotice()}
    <div class="market-filter-panel"><div class="market-filter-heading"><span class="tiny-label">EXPLORE THE UNIVERSE</span><span>3 fictional asset profiles</span></div><div class="deal-filters" aria-label="Filter fictional deal profiles">
      <label class="deal-search-label">Search profiles<span class="deal-search-field"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg><input id="deal-search" type="search" placeholder="Hardware, region or scenario" autocomplete="off"/></span></label>
      <label>Hardware<select id="deal-hardware"><option value="">All hardware</option><option>A100</option><option>H100</option><option>H200</option></select></label>
      <label>Region<select id="deal-region"><option value="">All regions</option><option>North America</option><option>Europe</option><option>Asia Pacific</option></select></label>
      <label>Strategy<select id="deal-strategy"><option value="">All strategies</option><option>Compute infrastructure</option><option>Hardware resale</option></select></label>
    </div><div class="market-active-filters" id="deal-active-filters" aria-label="Active filters" hidden></div></div>
    <div class="market-results-toolbar"><div><span class="result-indicator" aria-hidden="true"></span><p id="deal-result-count" role="status" aria-live="polite">3 fictional profiles</p></div><div><label class="market-sort-label" for="deal-sort">Sort by<select id="deal-sort"><option value="">Profile order</option><option value="evidence">Record coverage</option><option value="budget">Budget: low to high</option></select></label><button class="text-button" id="deal-reset" type="button">Reset filters <span aria-hidden="true">↻</span></button></div></div>
    <div class="deal-grid" id="deal-results">${dealCards(sampleDeals)}</div>
    <p class="market-data-note"><span aria-hidden="true">◇</span> Designed for informed review. Every figure above is an invented project assumption.</p>
  </section>`;
}

export function dealDetail(deal: SampleDeal): string {
  return `<main id="main"><section class="deal-detail section-container">
    <a class="breadcrumb" href="/marketplace#deal-browser">← Marketplace <span>/ Asset profile</span></a>
    <div class="detail-title"><div><p class="eyebrow">${deal.id.toUpperCase()} / FICTIONAL DEAL PROFILE</p><h1>${deal.title}</h1><p>${deal.summary}</p></div><span class="sample-pill">Fictional example</span></div>
    ${sampleNotice()}
    <div class="detail-layout"><article>
      <div class="detail-asset">${hardwareVisual(deal)}<div class="detail-asset-facts"><p class="eyebrow">ASSET AT A GLANCE</p><dl><div><dt>Hardware scenario</dt><dd>NVIDIA ${deal.hardware}</dd></div><div><dt>Invented fleet size</dt><dd>${number(deal.gpus)} GPUs</dd></div><div><dt>Assumed region</dt><dd>${deal.region}</dd></div><div><dt>Example strategy</dt><dd>${deal.strategy}</dd></div><div><dt>Invented project budget</dt><dd>${budgetLabel(deal.budget)} <small>USD</small></dd></div></dl></div></div>
      <section class="detail-section"><p class="eyebrow">01 / THE CONTEXT</p><h2>Understand the scenario.</h2><p>${deal.summary} The region, quantity and budget are invented for this interface. There is no operating project or available investment behind this profile.</p></section>
      <section class="detail-section"><p class="eyebrow">02 / DILIGENCE PRIORITIES</p><h2>The questions behind the asset.</h2><ul class="review-questions">${deal.questions.map((question, index) => `<li><span aria-hidden="true">0${index + 1}</span><span>${question}</span><span class="review-question-status">To review</span></li>`).join('')}</ul></section>
      <section class="detail-section"><p class="eyebrow">03 / SOURCE COVERAGE</p><h2>An evidence-first review.</h2><div class="detail-evidence"><div><span>Sample records present</span><strong>${deal.evidence} <small>/ 8</small></strong></div>${evidenceTrack(deal.evidence)}<span class="sample-pill">Unverified example</span></div><p>Document presence is not verification. Ownership, condition, utilization and contractual assumptions would require independent review for any real opportunity.</p><button class="text-button" data-deal-download="${deal.id}">Download fictional profile <span aria-hidden="true">↓</span></button></section>
    </article><aside class="investment-preview"><div class="investment-preview-top"><span class="eyebrow">YOUR NEXT STEP</span><span aria-hidden="true">↗</span></div><h2>From asset review<br/>to a clearer brief.</h2><p>Explore the proposed path to access with a local, nonbinding interest brief.</p><dl class="access-preview-facts"><div><dt>Profile</dt><dd>${deal.id.toUpperCase()}</dd></div><div><dt>Access status</dt><dd>Product preview</dd></div></dl><a class="button button-primary" href="/marketplace/signup?deal=${deal.id}">Build an interest brief ${arrow}</a><a class="text-button" href="/intelligence#market-overview">Compare in GPU-IQ ${arrow}</a><p class="investment-fineprint">Nothing is submitted. No account, offering, eligibility assessment, investment, checkout or binding agreement is created.</p></aside></div>
    <div class="page-inline-actions"><a class="text-button" href="/research">Read the research notes ${arrow}</a><a class="text-button" href="/docs/investment-access">Access preview explained ${arrow}</a></div>
  </section></main>`;
}

export function intelligencePanel(records: SampleDeal[]): string {
  const summary = intelligenceSummary(records);
  return `<div class="intelligence-metrics"><div><span>Fictional profiles</span><strong>${summary.profiles}<small>profiles</small></strong><p>In the selected view</p></div><div><span>Invented GPU fleet</span><strong>${number(summary.gpus)}<small>GPUs</small></strong><p>Across selected profiles</p></div><div><span>Invented aggregate budget</span><strong class="budget-metric">${budgetLabel(summary.budget)}</strong><p>USD · Project assumptions</p></div><div><span>Sample record coverage</span><strong>${summary.coverage}<small>%</small></strong><p>Presence, not verification</p></div></div>
    <div class="intelligence-comparison"><div class="comparison-heading"><div><p class="eyebrow">SIDE BY SIDE</p><h3>A common lens on every asset.</h3></div><span>${records.length} ${records.length === 1 ? 'profile' : 'profiles'}</span></div><p class="comparison-note">Budgets are invented project assumptions, not prices, valuations, capital raised or returns.</p>
    ${records.length ? `<p class="comparison-scroll-hint">Swipe or scroll to compare all metrics <span aria-hidden="true">→</span></p><div class="comparison-table-scroll" tabindex="0" role="region" aria-label="Fictional GPU asset comparison"><table class="comparison-table"><caption class="sr-only">Selected fictional GPU profiles, assumed regions, invented GPU counts and project budgets, and unverified sample record coverage.</caption><thead><tr><th scope="col">Asset profile</th><th scope="col">GPU count</th><th scope="col">Project budget <small>USD · Invented</small></th><th scope="col">Sample records</th></tr></thead><tbody>${records.map(deal => `<tr class="comparison-row"><th scope="row"><a href="/deals/${deal.id}"><span class="comparison-hardware" aria-hidden="true">${deal.hardware}</span><span><strong>${deal.title}</strong><small>${deal.region} · Fictional example</small></span>${arrow}</a></th><td>${number(deal.gpus)}<small>Invented GPUs</small></td><td>${budgetLabel(deal.budget)}</td><td><span class="comparison-coverage">${deal.evidence} / 8 ${evidenceTrack(deal.evidence)}</span></td></tr>`).join('')}</tbody></table></div>` : '<div class="empty-results intelligence-empty"><h3>No profiles in this view.</h3><p>Choose another hardware or region combination, or use Reset view above.</p></div>'}
    <p class="comparison-footnote"><span aria-hidden="true">◇</span> Fictional product fixtures · No verified market observations</p></div>`;
}

export function marketIntelligence(): string {
  const summary = intelligenceSummary(sampleDeals);
  return `<section class="deals-section section-container" id="market-overview" aria-labelledby="market-overview-title"><div class="platform-heading"><div><p class="eyebrow">GPU-IQ / THE INTELLIGENCE LAYER</p><h2 id="market-overview-title">More context.<br/>A clearer view of the asset.</h2><p class="market-section-description">Bring hardware, capital assumptions and evidence into one considered view.</p></div><span class="sample-pill">Free product preview</span></div>${sampleNotice()}
    <div class="intelligence-metrics intelligence-overview"><div><span>Fictional asset profiles</span><strong>0${summary.profiles}</strong><p>A100 · H100 · H200</p></div><div><span>Invented GPU universe</span><strong>${number(summary.gpus)}</strong><p>Across three scenarios</p></div><div><span>Example regions</span><strong>03</strong><p>Americas · Europe · APAC</p></div><div><span>Verified observations</span><strong>00</strong><p>All current records are invented</p></div></div>
    <div class="iq-free-links"><p>A consistent starting point for the questions that matter.</p><a class="text-button" href="/marketplace#deal-browser">Explore asset profiles ${arrow}</a></div>
    <details class="gpu-iq-premium" id="gpu-iq-premium" open><summary><span><span class="eyebrow">GPU-IQ WORKSPACE / PREMIUM PREVIEW</span><strong>Look beneath the headline.</strong><small>Compare scenarios. Inspect the evidence. Take your analysis with you.</small></span><span class="iq-toggle"><span class="iq-toggle-open">Collapse workspace</span><span class="iq-toggle-closed">Explore workspace</span><span class="iq-toggle-icon" aria-hidden="true">−</span></span></summary><div class="iq-premium-body">
      <p class="sample-notice"><span class="notice-symbol" aria-hidden="true">i</span><span><strong>Open demonstration, not a secure paywall.</strong> Try fictional comparisons, filters and local exports. Paid access, subscriptions and checkout are unavailable.</span></p>
      <div class="intelligence-filters"><label>Hardware<select id="intelligence-hardware"><option value="">All hardware</option><option>A100</option><option>H100</option><option>H200</option></select></label><label>Region<select id="intelligence-region"><option value="">All regions</option><option>North America</option><option>Europe</option><option>Asia Pacific</option></select></label><button class="text-button" id="intelligence-reset">Reset view <span aria-hidden="true">↻</span></button><button class="button button-secondary" id="iq-export">Export fictional CSV <span aria-hidden="true">↓</span></button></div>
      <p id="intelligence-status" class="intelligence-status" role="status" aria-live="polite"></p><div id="intelligence-results">${intelligencePanel(sampleDeals)}</div>
      <div class="intelligence-reading" id="premium-research"><div><p class="eyebrow">01 / RESEARCH PREVIEW</p><h3>The questions behind a GPU opportunity.</h3><p>An original preview brief on hardware, operating assumptions and source quality. No live research, recommendations or return forecasts.</p><button class="text-button" id="iq-research-download">Download sample research ${arrow}</button></div><div><p class="eyebrow">02 / WHAT COMES NEXT</p><h3>A foundation for deeper intelligence.</h3><p>A future paid offering could add richer source comparisons, research and exports. No prices or working subscriptions are offered here.</p><a class="text-button" href="/intelligence/signup">Explore GPU-IQ access status ${arrow}</a></div></div>
    </div></details><div class="intelligence-reading intelligence-principles"><div><p class="eyebrow">THE STANDARD</p><h3>Source quality comes first.</h3><p>Profiles carry their evidence gaps. These fixtures contain no verified counterparties, price history, operating performance or investment terms.</p><a class="text-button" href="/docs/gpu-iq">Read the GPU-IQ guide ${arrow}</a></div><div><p class="eyebrow">THE PERSPECTIVE</p><h3>Start with the research.</h3><p>Read original notes about asset documentation, valuation assumptions and readiness for a capital conversation.</p><a class="text-button" href="/research">Explore research ${arrow}</a></div></div>
  </section>`;
}

export function gpuArchitecture(): string {
  const heights = [114, 167, 148, 213, 190, 243, 224, 274, 304, 262, 328, 370];
  const mobileHeights = [32, 55, 44, 113, 86, 131, 224, 154, 176, 150, 190, 204];
  const striped = new Set([1, 3, 5, 8, 10]);
  const stone = new Set([0, 3, 6, 7, 10]);
  const labels: Record<number, [string, number, number]> = {
    3: ['A100 80GB · SAMPLE', 222, 115], 5: ['H100 SXM5 · SAMPLE', 252, 133],
    8: ['H200 SXM · SAMPLE', 316, 178], 10: ['B200 · SAMPLE', 337, 192],
    11: ['GB200 NVL · SAMPLE', 379, 209],
  };
  return `<div class="gpu-architecture reference-gpu-art" role="img" aria-label="GPU heatsink illustration. Decorative sample labels; no live market values."><img class="reference-plinth" src="/reference/home-hero-surface-plinth.png" alt="" fetchpriority="high"/><div class="reference-pillars" aria-hidden="true">${heights.map((height, index) => `<div class="reference-pillar${striped.has(index) ? ' is-striped' : ''}${index === 6 ? ' desktop-pillar' : ''}" style="--pillar-height:${height}px;--mobile-pillar-height:${mobileHeights[index]}px;--pillar-color:${stone.has(index) ? '#aba297' : '#232323'}"><i class="pillar-cap"></i>${striped.has(index) ? Array.from({ length: 11 }, () => '<i class="pillar-fin"></i>').join('') : ''}${labels[index] ? `<span class="pillar-caption" style="--label-bottom:${labels[index][1]}px;--mobile-label-bottom:${labels[index][2]}px">${labels[index][0]}</span>` : ''}</div>`).join('')}</div></div>`;
}
