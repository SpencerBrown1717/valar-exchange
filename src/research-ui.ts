import type { ResearchArticle } from './research-types.ts';

const dateFormat = new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: 'UTC' });
const timeFormat = new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeStyle: 'short', timeZone: 'UTC' });

function escapeHtml(value: string): string {
  return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);
}

function time(value: string, includeTime = false): string {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return escapeHtml(value);
  const hasTime = includeTime && /T\d{2}:\d{2}/.test(value);
  const label = hasTime ? `${timeFormat.format(date)} UTC` : dateFormat.format(date);
  return `<time datetime="${escapeHtml(value)}">${escapeHtml(label)}</time>`;
}

function sourceUrl(value: string): string | undefined {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password) return undefined;
    return url.href;
  } catch {
    return undefined;
  }
}

function sourceLink(article: ResearchArticle, label = article.source.title): string {
  const url = sourceUrl(article.source.url);
  return url
    ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}<span class="research-external" aria-hidden="true"> ↗</span><span class="sr-only"> (opens in a new tab)</span></a>`
    : `<span>${escapeHtml(label)}</span>`;
}

function articleLink(article: ResearchArticle, className = ''): string {
  const title = escapeHtml(article.title);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug)) return title;
  return `<a${className ? ` class="${className}"` : ''} href="/research/${escapeHtml(article.slug)}/">${title}</a>`;
}

function card(article: ResearchArticle, featured: boolean): string {
  return `<article class="research-news-card${featured ? ' research-news-card-featured' : ''}">
    <div class="research-card-topline"><span>INDUSTRY COVERAGE</span>${time(article.publishedAt)}</div>
    <h3>${articleLink(article)}</h3>
    <p class="research-card-summary">${escapeHtml(article.summary)}</p>
    <p class="research-card-byline">VALAR Research</p>
    <div class="research-card-source"><span>Primary source</span>${sourceLink(article, article.source.publisher)}</div>
  </article>`;
}

export function renderResearchIndex(news: ResearchArticle[], paused: boolean): string {
  const sorted = [...news].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  return `<div class="research-index">
    <header class="research-index-header">
      <p class="research-kicker">VALAR RESEARCH</p>
      <h1>Research</h1>
      <p class="research-index-deck">GPU infrastructure. Industry context.</p>
      <p class="research-index-intro">Primary announcements, the facts they establish, and what they could mean for the assets behind AI.</p>
    </header>
    <div class="research-index-layout">
      <section class="research-coverage" aria-labelledby="research-latest-title">
        <div class="research-section-heading"><h2 id="research-latest-title">Latest industry coverage</h2><span>VALAR Research</span></div>
        ${paused ? `<aside class="research-pause"><p>New industry coverage is paused.${sorted.length ? ' Published coverage remains available below.' : ''}</p></aside>` : ''}
        ${sorted.length
          ? `<div class="research-news-grid">${sorted.map((article, index) => card(article, index === 0)).join('')}</div>`
          : `<div class="research-empty"><span class="research-empty-line" aria-hidden="true"></span><h3>Industry coverage is being prepared.</h3><p>New reporting will appear here with its source, dates and a clear distinction between reported facts and Valar analysis.</p></div>`}
      </section>
      <aside class="research-index-sidebar" aria-labelledby="research-lens-title">
        <h2 id="research-lens-title">Our lens</h2>
        <p>Follow the evidence behind GPU infrastructure and capital decisions.</p>
        <dl class="research-lens-list">
          <div><dt>Infrastructure</dt><dd>Hardware, capacity and the operating picture.</dd></div>
          <div><dt>Asset evidence</dt><dd>Records and context that support a closer review.</dd></div>
          <div><dt>Capital context</dt><dd>Industry developments and the questions they raise.</dd></div>
        </dl>
        <p class="research-editorial-note">Each article links to its primary announcement. Analysis is identified separately and may change as more evidence becomes available.</p>
        <a class="research-context-link" href="/docs/valuation-evidence">How we frame evidence <span aria-hidden="true">↗</span></a>
      </aside>
    </div>
  </div>`;
}

function paragraphs(values: string[], empty: string): string {
  return values.length ? values.map(value => `<p>${escapeHtml(value)}</p>`).join('') : `<p>${empty}</p>`;
}

export function renderNewsArticle(article: ResearchArticle): string {
  return `<main id="main"><article class="research-article research-news-article section-container">
    <nav class="research-breadcrumb" aria-label="Breadcrumb"><a href="/research/"><span aria-hidden="true">←</span> Research</a><span aria-hidden="true">/</span><span>Industry coverage</span></nav>
    <header class="research-article-header">
      <p class="research-kicker">INDUSTRY COVERAGE</p>
      <h1>${escapeHtml(article.title)}</h1>
      <p class="research-article-summary">${escapeHtml(article.summary)}</p>
      <p class="research-article-byline">By <span>VALAR Research</span></p>
      <dl class="research-article-dates">
        <div><dt>Published</dt><dd>${time(article.publishedAt, true)}</dd></div>
        ${article.updatedAt !== article.publishedAt ? `<div><dt>Updated</dt><dd>${time(article.updatedAt, true)}</dd></div>` : ''}
        <div><dt>Event date</dt><dd>${time(article.eventDate)}</dd></div>
        <div><dt>Source published</dt><dd>${time(article.source.publishedAt)}</dd></div>
      </dl>
    </header>
    <div class="research-article-layout">
      <div class="research-story">
        <section id="confirmed-facts" aria-labelledby="confirmed-facts-title">
          <p class="research-section-label">01 / SOURCE EVIDENCE</p><h2 id="confirmed-facts-title">What happened and the disclosed economics</h2>
          <p class="research-section-intro">Issuer-reported facts from ${sourceLink(article, article.source.publisher)}.</p>
          ${article.facts.length ? `<ul class="research-facts">${article.facts.map(fact => `<li>${escapeHtml(fact)}</li>`).join('')}</ul>` : '<p>No confirmed facts are available for this item.</p>'}
        </section>
        <section id="valar-analysis" aria-labelledby="valar-analysis-title">
          <p class="research-section-label">02 / VALAR ANALYSIS</p><h2 id="valar-analysis-title">Why it matters</h2>
          ${paragraphs(article.analysis, 'No analysis is available for this item.')}
        </section>
        <section id="limits-and-questions" aria-labelledby="limits-and-questions-title">
          <p class="research-section-label">03 / OPEN QUESTIONS</p><h2 id="limits-and-questions-title">Risks and unknowns</h2>
          ${paragraphs(article.limitations, 'No additional limitations are recorded for this item.')}
        </section>
        <footer class="research-source-footer" id="source-and-method">
          <h2>Source and method</h2>
          <div class="research-source-record"><p>${sourceLink(article)}</p><p>${escapeHtml(article.source.publisher)} · Published ${time(article.source.publishedAt)}</p></div>
          <p class="research-methodology">${escapeHtml(article.methodology)}</p>
          <p class="research-disclosure">For information only. This article is not investment advice, an appraisal or a financing offer.</p>
        </footer>
      </div>
      <aside class="research-article-sidebar" aria-labelledby="research-reading-title">
        <div class="research-reading-panel"><h2 id="research-reading-title">In this article</h2><nav aria-label="Article sections"><a href="#confirmed-facts">What happened and the disclosed economics</a><a href="#valar-analysis">Why it matters</a><a href="#limits-and-questions">Risks and unknowns</a><a href="#source-and-method">Source and method</a></nav></div>
        <div class="research-primary-panel"><p class="research-section-label">PRIMARY ANNOUNCEMENT</p><p>${sourceLink(article)}</p><span>${escapeHtml(article.source.publisher)}</span></div>
        <a class="research-context-link" href="/research/">All research <span aria-hidden="true">→</span></a>
      </aside>
    </div>
  </article></main>`;
}
