import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { renderToday, renderNewsletter, renderWatchlist, renderExposureGuide, renderEditionContent } from '../src/reader-ui.ts';
import { initializeReaderControls, readWatchlist } from '../src/reader-controller.ts';

const tick = () => new Promise(resolve => setTimeout(resolve, 0));
const setup = (markup = renderNewsletter()) => {
  const dom = new JSDOM(markup, { url: 'https://valar.example/newsletter' });
  return { dom, doc: dom.window.document };
};

test('reader pages have a single main heading and a focused subscription form', () => {
  for (const render of [renderToday, renderNewsletter, renderWatchlist, renderExposureGuide]) {
    const { dom, doc } = setup(render());
    assert.equal(doc.querySelectorAll('main#main').length, 1);
    assert.equal(doc.querySelectorAll('h1').length, 1);
    assert.equal(doc.querySelectorAll('button[data-action]').length, 0);
    for (const field of doc.querySelectorAll('input')) {
      assert.ok([...doc.querySelectorAll('label')].some(label => label.htmlFor === field.id));
    }
    dom.window.close();
  }
  const { dom, doc } = setup();
  assert.equal(doc.querySelectorAll('form').length, 1);
  assert.equal(doc.querySelectorAll('button[type=submit]').length, 1);
  assert.equal(doc.querySelector('[name=email]').required, true);
  assert.match(doc.querySelector('.reader-consent').textContent, /daily.*confirm|Confirm.*join/i);
  dom.window.close();
});

test('newsletter accepts a pending request and explains that confirmation is still required', async () => {
  const { dom, doc } = setup();
  let request;
  dom.window.fetch = async (url, options) => {
    request = { url, ...options };
    return { status: 202, ok: true, json: async () => ({ status: 'pending' }) };
  };
  initializeReaderControls(doc);
  doc.querySelector('[name=email]').value = 'reader@example.com';
  doc.querySelector('form').dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }));
  await tick();
  assert.equal(request.url, '/api/newsletter/subscribe');
  assert.deepEqual(JSON.parse(request.body), { email: 'reader@example.com', website: '', source: 'newsletter', consent: true });
  const status = doc.querySelector('[role=status]');
  assert.equal(status.hidden, false);
  assert.match(status.textContent, /only after you confirm your address/);
  assert.doesNotMatch(status.textContent, /you are subscribed|successfully subscribed/i);
  assert.equal(doc.querySelector('button[type=submit]').disabled, false);
  assert.equal(doc.querySelector('form').hasAttribute('aria-busy'), false);
  dom.window.close();
});

test('newsletter configuration, rate limit, and invalid-email failures never imply enrollment', async () => {
  for (const responseStatus of [503, 429, 400, 403]) {
    const { dom, doc } = setup();
    dom.window.fetch = async () => ({ status: responseStatus, ok: false, json: async () => ({ error: 'unavailable' }) });
    initializeReaderControls(doc);
    doc.querySelector('[name=email]').value = 'reader@example.com';
    doc.querySelector('form').dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }));
    await tick();
    const message = doc.querySelector('[role=status]').textContent;
    assert.match(message, responseStatus === 429 ? /Too many requests/ : responseStatus === 400 ? /check your email/ : /has not been added/);
    assert.doesNotMatch(message, /Check your inbox|successfully subscribed/i);
    assert.equal(doc.querySelector('[name=email]').value, 'reader@example.com');
    assert.equal(doc.querySelector('button[type=submit]').disabled, false);
    dom.window.close();
  }
});

test('newsletter transport failure and unexpected success bodies remain unconfirmed', async () => {
  for (const fetcher of [async () => { throw new Error('offline'); }, async () => ({ status: 200, ok: true, json: async () => ({ arbitrary: true }) })]) {
    const { dom, doc } = setup();
    dom.window.fetch = fetcher;
    initializeReaderControls(doc);
    doc.querySelector('[name=email]').value = 'reader@example.com';
    doc.querySelector('form').dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }));
    await tick();
    const message = doc.querySelector('[role=status]').textContent;
    assert.match(message, /not confirmed|could not verify/i);
    assert.doesNotMatch(message, /Check your inbox|successfully subscribed/i);
    assert.equal(doc.querySelector('button[type=submit]').disabled, false);
    dom.window.close();
  }
});

test('following persists only known topics and removing a topic restores focus', () => {
  const { dom, doc } = setup(renderWatchlist());
  initializeReaderControls(doc);
  const button = doc.querySelector('[data-follow=h100]');
  button.click();
  assert.equal(button.getAttribute('aria-pressed'), 'true');
  assert.deepEqual(readWatchlist(dom.window.localStorage), ['h100']);
  assert.equal(doc.querySelectorAll('[data-watchlist] article').length, 1);
  assert.match(doc.querySelector('[data-watchlist-count]').textContent, /1 topic$/);
  doc.querySelector('[data-unfollow=h100]').click();
  assert.deepEqual(readWatchlist(dom.window.localStorage), []);
  assert.equal(doc.activeElement, button);
  assert.equal(button.getAttribute('aria-pressed'), 'false');
  assert.match(doc.querySelector('[data-watchlist-count]').textContent, /0 topics$/);
  dom.window.localStorage.setItem('valar:watchlist:v1', '["h200","h200","<script>",null,{}]');
  assert.deepEqual(readWatchlist(dom.window.localStorage), ['h200']);
  dom.window.localStorage.setItem('valar:watchlist:v1', 'invalid JSON');
  assert.deepEqual(readWatchlist(dom.window.localStorage), []);
  dom.window.close();
});

test('a browser that blocks localStorage does not pretend to save a followed topic', () => {
  const { dom, doc } = setup(renderWatchlist());
  Object.defineProperty(dom.window, 'localStorage', { configurable: true, get() { throw new Error('blocked'); } });
  initializeReaderControls(doc);
  const button = doc.querySelector('[data-follow=h100]');
  button.click();
  assert.equal(button.getAttribute('aria-pressed'), 'false');
  assert.match(doc.querySelector('[data-reader-status]').textContent, /blocking storage.*could not be saved/);
  assert.equal(doc.querySelector('[data-reader-status]').classList.contains('sr-only'), false);
  assert.equal(doc.querySelectorAll('[data-watchlist] article').length, 0);
  dom.window.close();
});

test('edition text is escaped and source links cannot execute a script URL', () => {
  const markup = renderEditionContent({ id: 'test', date: '2026-10-10', title: '<script>alert(1)</script>', summary: '<img src=x onerror=alert(1)>', stories: [{ title: '<img onerror=x>', summary: '<a>test', whyItMatters: 'why & how', watch: '<b>watch</b>', sourceLabel: '<svg onload=x>', sourceUrl: 'javascript:alert(1)', follow: '<script>' }] });
  const { dom, doc } = setup(markup);
  assert.equal(doc.querySelectorAll('script,img,svg').length, 0);
  assert.equal(doc.querySelector('a').getAttribute('href'), '#');
  assert.match(doc.body.textContent, /<script>alert\(1\)<\/script>/);
  assert.equal(doc.querySelector('a').rel, 'noopener noreferrer');
  dom.window.close();
});

test('a foundation edition is identified and every approved story is rendered', () => {
  const stories = Array.from({ length: 5 }, (_, index) => ({ title: `Approved story ${index + 1}`, summary: 'Context', whyItMatters: 'Reason', watch: 'Next development', sourceLabel: 'Source', sourceUrl: 'https://www.sec.gov/search-filings' }));
  const { dom, doc } = setup(renderEditionContent({ id: 'foundation', kind: 'foundation', date: '2026-10-10', title: 'Foundations', summary: 'Start here', stories }));
  assert.match(doc.querySelector('.reader-kicker').textContent, /FOUNDATION BRIEF/);
  assert.equal(doc.querySelectorAll('.reader-story').length, 5);
  assert.match(doc.body.textContent, /Approved story 5/);
  assert.equal(doc.querySelector('time').dateTime, '2026-10-10');
  dom.window.close();
});
