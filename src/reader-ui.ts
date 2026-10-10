export const followedTopics = ['h100', 'h200', 'b200', 'ai-demand'] as const;
export type FollowedTopic = typeof followedTopics[number];

export interface ReaderStory {
  title: string;
  summary: string;
  whyItMatters: string;
  watch: string;
  sourceLabel: string;
  sourceUrl: string;
  publishedAt?: string;
  follow?: FollowedTopic;
}

export interface ReaderEdition {
  id: string;
  date: string;
  kind?: 'foundation' | 'daily';
  title: string;
  summary: string;
  stories: ReaderStory[];
  signal?: { title: string; summary: string; sourceLabel: string; sourceUrl: string };
}

export const topicDetails: Record<FollowedTopic, { label: string; summary: string; question: string }> = {
  h100: { label: 'H100', summary: 'The Hopper generation: hardware specifications, cloud rental offers, and operating context.', question: 'What happens to older hardware as new capacity arrives?' },
  h200: { label: 'H200', summary: 'Memory capacity, bandwidth, and the economics of a newer Hopper configuration.', question: 'Which workloads benefit, and what is the cost of that improvement?' },
  b200: { label: 'B200', summary: 'Blackwell hardware and the infrastructure required to bring it into service.', question: 'When does announced capacity become usable, revenue-generating capacity?' },
  'ai-demand': { label: 'AI demand', summary: 'Capital spending, customer demand, new capacity, and the funding behind the AI buildout.', question: 'Are customer commitments keeping pace with investment?' },
};

export function escapeReaderText(value: string): string {
  return value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]!));
}

function safeSourceUrl(value: string): string {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? escapeReaderText(url.href) : '#';
  } catch { return '#'; }
}

const arrow = '<span aria-hidden="true">↗</span>';
const forward = '<span aria-hidden="true">→</span>';
const mailIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 6 8 7 8-7"/></svg>';

function sourceLink(label: string, url: string): string {
  return `<a class="reader-source" href="${safeSourceUrl(url)}" target="_blank" rel="noopener noreferrer">${escapeReaderText(label)} ${arrow}<span class="sr-only"> (opens in a new tab)</span></a>`;
}

export function followButton(topic: FollowedTopic): string {
  if (!followedTopics.includes(topic)) return '';
  return `<button class="reader-follow" type="button" data-follow="${escapeReaderText(topic)}" aria-pressed="false" aria-label="Follow ${escapeReaderText(topicDetails[topic].label)} on this device"><span aria-hidden="true">+</span> Follow ${escapeReaderText(topicDetails[topic].label)}</button>`;
}

export function newsletterForm(source: 'today' | 'newsletter', compact = false): string {
  const id = `reader-email-${source}`;
  return `<form class="reader-subscribe${compact ? ' reader-subscribe-compact' : ''}" data-newsletter-form="${source}" action="/api/newsletter/subscribe" method="post">
    <label for="${id}">Email address</label><div class="reader-email-row"><input id="${id}" name="email" type="email" autocomplete="email" inputmode="email" maxlength="254" placeholder="you@example.com" required/><button class="button button-primary" type="submit">Get the daily brief ${forward}</button></div>
    <div class="reader-honeypot" aria-hidden="true"><label for="${id}-website">Leave this field empty</label><input id="${id}-website" name="website" tabindex="-1" autocomplete="off"/></div>
    <p class="reader-consent">By subscribing, you request Valar’s daily GPU market email. Confirm your address to join. Unsubscribe in any edition. <a href="/privacy">Privacy</a></p>
    <p class="reader-form-status" role="status" aria-live="polite" hidden></p>
    <noscript><p class="reader-consent">JavaScript is needed to show your signup result. You can still read the brief below.</p></noscript>
  </form>`;
}

function formattedDate(value: string): string {
  const date = new Date(`${value.slice(0, 10)}T12:00:00Z`);
  return Number.isNaN(date.getTime()) ? escapeReaderText(value) : new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(date);
}

export function renderEditionContent(edition: ReaderEdition): string {
  return `<div class="reader-edition-heading"><div><p class="reader-kicker">${edition.kind === 'foundation' ? 'FOUNDATION BRIEF / START HERE' : 'THE GPU BRIEF'}</p><h2>${escapeReaderText(edition.title)}</h2><p>${escapeReaderText(edition.summary)}</p></div><div class="reader-edition-date"><time datetime="${escapeReaderText(edition.date)}">${formattedDate(edition.date)}</time><span>${Math.max(3, edition.stories.length * 2)} minute read</span></div></div>
    <div class="reader-stories">${edition.stories.map((story, index) => `<article class="reader-story"><div class="reader-story-index" aria-hidden="true">0${index + 1}</div><div class="reader-story-copy"><h3>${escapeReaderText(story.title)}</h3><p class="reader-story-summary">${escapeReaderText(story.summary)}</p><dl><div><dt>Why it matters</dt><dd>${escapeReaderText(story.whyItMatters)}</dd></div><div><dt>Watch next</dt><dd>${escapeReaderText(story.watch)}</dd></div></dl><div class="reader-story-bottom"><div>${sourceLink(story.sourceLabel, story.sourceUrl)}${story.publishedAt ? `<span class="reader-source-date">Source date: ${formattedDate(story.publishedAt)}</span>` : ''}</div>${story.follow ? followButton(story.follow) : ''}</div></div></article>`).join('')}</div>
    ${edition.signal ? `<aside class="reader-signal"><p class="reader-kicker">THE SIGNAL TO FOLLOW</p><h3>${escapeReaderText(edition.signal.title)}</h3><p>${escapeReaderText(edition.signal.summary)}</p>${sourceLink(edition.signal.sourceLabel, edition.signal.sourceUrl)}</aside>` : ''}
    <p class="reader-editorial-note">Sources are linked so you can inspect the evidence. Publication dates describe the edition and its sources; they are not live market timestamps. Educational research, not a trade recommendation.</p>`;
}

function startingBrief(): string {
  return `<div class="reader-edition-heading"><div><p class="reader-kicker">START HERE</p><h2>Three lenses on the GPU market.</h2><p>A useful starting point while the first daily edition is prepared.</p></div><div class="reader-edition-date"><span>Foundations</span><span>3 minute read</span></div></div><div class="reader-stories">
    <article class="reader-story"><div class="reader-story-index" aria-hidden="true">01</div><div class="reader-story-copy"><h3>Know what is actually being priced.</h3><p class="reader-story-summary">A GPU purchase, an hour of rented compute, and a share in a company are different kinds of exposure. Begin by identifying the asset and the unit.</p><dl><div><dt>Why it matters</dt><dd>A rental rate cannot tell you the resale price of the underlying hardware.</dd></div><div><dt>Watch next</dt><dd>Compare the same hardware, region, contract length, and availability before drawing a conclusion.</dd></div></dl><div class="reader-story-bottom">${sourceLink('AWS · How published cloud prices work', 'https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/price-changes.html')}${followButton('h100')}</div></div></article>
    <article class="reader-story"><div class="reader-story-index" aria-hidden="true">02</div><div class="reader-story-copy"><h3>Look behind the model name.</h3><p class="reader-story-summary">Architecture, memory, networking, and the surrounding system all shape what a GPU can do. A product name alone is an incomplete comparison.</p><dl><div><dt>Why it matters</dt><dd>Technical differences are part of the cost and usefulness of a compute system.</dd></div><div><dt>Watch next</dt><dd>Read the specifications alongside the workloads the system is meant to serve.</dd></div></dl><div class="reader-story-bottom">${sourceLink('NVIDIA · Data center GPU specifications', 'https://www.nvidia.com/en-us/data-center/h100/')}${followButton('h200')}</div></div></article>
    <article class="reader-story"><div class="reader-story-index" aria-hidden="true">03</div><div class="reader-story-copy"><h3>Follow the money and the commitments.</h3><p class="reader-story-summary">Company filings provide a place to investigate capital spending, contractual commitments, financing, and operating results.</p><dl><div><dt>Why it matters</dt><dd>An announcement is the beginning of a question. The operating and financial record adds context.</dd></div><div><dt>Watch next</dt><dd>Track what was announced, what is disclosed as committed, and what has entered service.</dd></div></dl><div class="reader-story-bottom">${sourceLink('SEC · Search company filings', 'https://www.sec.gov/search-filings')}${followButton('ai-demand')}</div></div></article>
  </div><p class="reader-editorial-note">This is an evergreen introduction, not today’s news or a live price feed. Each daily edition will carry its publication date and source links.</p>`;
}

export function renderToday(edition: ReaderEdition | null = null): string {
  return `<main id="main" class="reader-main reader-today"><section class="reader-masthead section-container" aria-labelledby="reader-title"><div class="reader-masthead-copy"><p class="reader-kicker">VALAR EXCHANGE / THE GPU BRIEF</p><h1 id="reader-title">Understand the assets<br/>behind AI.</h1><p>A daily perspective on GPU supply, prices, and the AI investment cycle. Read the evidence. Follow what matters. Build your own view.</p><a class="reader-inline-link" href="#daily-brief">Read the brief ${forward}</a></div><aside class="reader-mail-card" aria-labelledby="reader-mail-title"><div class="reader-mail-card-heading">${mailIcon}<span class="reader-kicker">IN YOUR INBOX</span></div><h2 id="reader-mail-title">The GPU market.<br/>A clearer morning.</h2><p>Three developments, why they matter, and what to watch next. For curious readers and people working in the market.</p>${newsletterForm('today', true)}</aside></section><section id="daily-brief" class="reader-edition section-container" aria-label="Latest GPU brief"><div data-edition-target>${edition ? renderEditionContent(edition) : startingBrief()}</div></section><section class="reader-next-band"><div class="section-container reader-next-layout"><div><p class="reader-kicker">FROM READING TO UNDERSTANDING</p><h2>Follow the story over time.</h2><p>Save a hardware family or market theme, then come back to the questions behind it.</p></div><a class="reader-inline-link" href="/watchlist">Your watchlist ${forward}</a></div></section><p class="reader-live-status sr-only" data-reader-status role="status" aria-live="polite"></p></main>`;
}

export function renderNewsletter(): string {
  return `<main id="main" class="reader-main"><section class="reader-newsletter section-container"><div class="reader-newsletter-copy"><p class="reader-kicker">THE VALAR DAILY BRIEF</p><h1>The GPU market,<br/>in your inbox.</h1><p class="reader-lead">A few minutes to understand what changed, why it matters, and what deserves a closer look.</p><div class="reader-newsletter-benefits"><div><span aria-hidden="true">01</span><h2>Useful context.</h2><p>Hardware, cloud prices, major purchases, and the money behind the AI buildout.</p></div><div><span aria-hidden="true">02</span><h2>Evidence you can inspect.</h2><p>Source links and dates, with uncertainty kept in view.</p></div><div><span aria-hidden="true">03</span><h2>A reason to come back.</h2><p>Follow the topics that matter to you and learn how different forms of exposure work.</p></div></div></div><aside class="reader-newsletter-signup"><div class="reader-mail-card-heading">${mailIcon}<span class="reader-kicker">ONE EMAIL. A BETTER VIEW.</span></div><h2>Start with the daily brief.</h2><p>No account required to read. Confirm your email to subscribe.</p>${newsletterForm('newsletter')}<a class="reader-inline-link" href="/#daily-brief">Read before you subscribe ${forward}</a></aside></section><section class="reader-editorial-standards section-container"><p class="reader-kicker">OUR EDITORIAL STANDARD</p><h2>Clarity before conviction.</h2><p>Separate hardware prices from rental rates and investment returns. Tell readers what is observed, what is inferred, and what we still do not know. A quiet news day deserves a quiet edition.</p></section></main>`;
}

export function renderWatchlist(): string {
  return `<main id="main" class="reader-main reader-watchlist"><section class="reader-page-heading section-container"><div><p class="reader-kicker">YOUR PERSPECTIVE</p><h1>Your GPU watchlist.</h1><p>Follow hardware and market themes as the story develops.</p></div><span class="reader-availability">Saved on this device</span></section><section class="reader-watchlist-section section-container" aria-labelledby="watchlist-title"><div class="reader-subheading"><h2 id="watchlist-title">Your saved topics.</h2><span data-watchlist-count>0 topics</span></div><div data-watchlist><div class="reader-watchlist-empty"><p>No topics saved yet. Choose a starting point below.</p></div></div><p class="reader-device-note">This watchlist does not sync across devices or send alerts. Clearing browser storage removes it.</p><noscript><p class="reader-device-note">Enable JavaScript to save and manage topics on this device.</p></noscript></section><section class="reader-discover section-container" aria-labelledby="reader-discover-title"><div class="reader-subheading"><div><h2 id="reader-discover-title">What would you like to follow?</h2></div></div><div class="reader-topic-grid">${followedTopics.map(topic => `<article><span class="reader-topic-label">${escapeReaderText(topic === 'ai-demand' ? 'MARKET THEME' : 'HARDWARE FAMILY')}</span><h3>${escapeReaderText(topicDetails[topic].label)}</h3><p>${escapeReaderText(topicDetails[topic].summary)}</p>${followButton(topic)}</article>`).join('')}</div></section><p class="reader-live-status sr-only" data-reader-status role="status" aria-live="polite"></p></main>`;
}

export function renderSavedTopics(topics: FollowedTopic[]): string {
  if (!topics.length) return '<div class="reader-watchlist-empty"><p>No topics saved yet. Choose a starting point below.</p></div>';
  return `<div class="reader-saved-list">${topics.map(topic => `<article class="reader-saved-topic"><div class="reader-saved-label"><span class="reader-topic-label">${topic === 'ai-demand' ? 'MARKET THEME' : 'HARDWARE FAMILY'}</span><h3>${escapeReaderText(topicDetails[topic].label)}</h3></div><div class="reader-saved-copy"><p>${escapeReaderText(topicDetails[topic].summary)}</p><span>${escapeReaderText(topicDetails[topic].question)}</span><a class="reader-inline-link" href="/market?topic=${encodeURIComponent(topic)}">Explore the market ${forward}</a></div><button type="button" class="reader-remove" data-unfollow="${escapeReaderText(topic)}" aria-label="Remove ${escapeReaderText(topicDetails[topic].label)} from your device watchlist">Remove</button></article>`).join('')}</div>`;
}

export function renderExposureGuide(): string {
  return `<main id="main" class="reader-main"><section class="reader-page-heading section-container"><div><p class="reader-kicker">UNDERSTAND YOUR EXPOSURE</p><h1>From a market view<br/>to an informed decision.</h1><p>Hardware, public companies, and private projects expose you to different parts of the AI economy. Start with what you would own and how it could gain or lose value.</p></div><span class="reader-availability">Education / Trading unavailable</span></section><section class="reader-exposure section-container" aria-label="Ways to participate in the GPU economy"><div class="reader-subheading"><h2>Four routes. Different economics.</h2><span>For individual and institutional readers</span></div><div class="reader-exposure-grid">
    <article><span class="reader-topic-label">01 / PHYSICAL ASSETS</span><h3>Own the hardware.</h3><p>Purchase GPUs or systems and take responsibility for the underlying equipment.</p><dl><div><dt>What drives the outcome</dt><dd>Purchase cost, useful life, resale value, and operating economics if the hardware is rented out.</dd></div><div><dt>What to investigate</dt><dd>Ownership records, condition, warranty, power, networking, customer contracts, and a realistic exit.</dd></div></dl><span class="reader-route-status">Hardware checkout is not available on Valar.</span></article>
    <article><span class="reader-topic-label">02 / PUBLIC MARKETS</span><h3>Own a company or a fund.</h3><p>Listed securities offer exposure to businesses participating in the AI economy.</p><dl><div><dt>What drives the outcome</dt><dd>Business performance, valuation, market conditions, and the terms of the particular security.</dd></div><div><dt>What to investigate</dt><dd>The company’s actual AI exposure, financial statements, concentration, fees, and liquidity.</dd></div></dl><span class="reader-route-status">Valar has no brokerage or trading connection.</span></article>
    <article><span class="reader-topic-label">03 / PRIVATE PROJECTS</span><h3>Finance an operating project.</h3><p>A private investment could have its own ownership structure, cash-flow rights, and eligibility requirements.</p><dl><div><dt>What drives the outcome</dt><dd>Project performance, debt, operating costs, contractual rights, and the manager’s execution.</dd></div><div><dt>What to investigate</dt><dd>Offering documents, fees, investor eligibility, conflicts, and whether and when you can exit. Private placements can be highly illiquid.</dd></div></dl>${sourceLink('SEC · Private placement investor bulletin', 'https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/private-placements-under-regulation-d-updated-investor-bulletin')}<span class="reader-route-status">No live investment offering is available on Valar.</span></article>
    <article><span class="reader-topic-label">04 / BEARISH EXPOSURE</span><h3>Understand a short position.</h3><p>A bearish position expresses a view about a specific instrument. It is not a direct bet on every part of the GPU market.</p><dl><div><dt>What drives the outcome</dt><dd>Price movement, borrowing costs, timing, and the structure of the instrument.</dd></div><div><dt>What to investigate</dt><dd>Margin, borrow availability, forced closure, and liquidity. A stock short sale can incur theoretically unlimited losses.</dd></div></dl>${sourceLink('SEC · Short selling explained', 'https://www.sec.gov/investor/pubs/regsho.htm')}<span class="reader-route-status">Short selling and derivatives are not available on Valar.</span></article>
  </div></section><section class="reader-next-band"><div class="section-container reader-next-layout"><div><p class="reader-kicker">BUILD THE VIEW FIRST</p><h2>Keep the thesis connected to the evidence.</h2><p>Read the brief and follow a topic as its technical and financial story develops.</p></div><a class="reader-inline-link" href="/watchlist">Build your watchlist ${forward}</a></div></section></main>`;
}
