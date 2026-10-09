import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { renderPage, publicPaths } from '../src/pages.ts';
import { initializeSite, initializePageControls } from '../src/controller.ts';
import { fleetSummary, normalizeQuantity, sampleReport } from '../src/model.ts';

function setup(path = '/') {
  const page = renderPage(path.split('?')[0]);
  const dom = new JSDOM(page.markup, { url: `https://preview.example${path}` });
  const { document: doc, HTMLDialogElement, Event } = dom.window;
  HTMLDialogElement.prototype.showModal = function () { this.open = true; this.querySelector('button,input')?.focus(); };
  HTMLDialogElement.prototype.close = function () { this.open = false; this.dispatchEvent(new Event('close')); };
  const files = [];
  const download = (name, content) => files.push({ name, content });
  initializeSite(doc, download, page.product);
  initializePageControls(doc, download);
  return { dom, doc, files, event: (name, options = {}) => new Event(name, { bubbles: true, cancelable: true, ...options }) };
}

test('every public route renders and every internal link resolves', () => {
  const paths = new Set(publicPaths);
  assert.equal(paths.size, publicPaths.length);
  for (const path of paths) {
    const { doc, dom } = setup(path);
    assert.equal(doc.querySelectorAll('h1').length, 1, path);
    assert.match(doc.body.textContent, /preview/i, path);
    assert.match(renderPage(path).title, /\| Valar Exchange$/, path);
    assert.doesNotMatch(doc.body.textContent, /Tahoe|lake-sculpture|lake-mark|tahoe-lake/i, path);
    const ids = [...doc.querySelectorAll('[id]')].map(node => node.id);
    assert.equal(new Set(ids).size, ids.length, `duplicate ID: ${path}`);
    for (const link of doc.querySelectorAll('a[href]')) {
      const url = new URL(link.getAttribute('href'), dom.window.location.href);
      assert.equal(url.origin, dom.window.location.origin, `unexpected external link: ${path} ${url}`);
      assert.ok(paths.has(url.pathname), `missing route: ${path} -> ${url.pathname}`);
      if (url.hash) {
        const target = url.pathname === path ? doc : new JSDOM(renderPage(url.pathname).markup).window.document;
        assert.ok(target.getElementById(url.hash.slice(1)), `missing hash: ${path} -> ${url}`);
      }
    }
    for (const field of doc.querySelectorAll('input,select,textarea')) {
      const labeled = field.closest('label') || [...doc.querySelectorAll('label')].some(label => label.htmlFor && label.htmlFor === field.id) || field.getAttribute('aria-label');
      assert.ok(labeled, `unlabeled field on ${path}`);
    }
    dom.window.close();
  }
});

test('keyboard tabs wrap and maintain one selected tab', () => {
  const { doc, dom } = setup();
  const first = doc.querySelector('#tab-markets');
  first.focus();
  first.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
  assert.equal(doc.activeElement.id, 'tab-reporting');
  assert.equal(doc.querySelector('#product-panel').getAttribute('aria-labelledby'), 'tab-reporting');
  assert.equal(doc.querySelectorAll('[role=tab][aria-selected=true]').length, 1);
  assert.equal(doc.querySelectorAll('[role=tab][tabindex="0"]').length, 1);
  doc.activeElement.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
  assert.equal(doc.activeElement.id, 'tab-markets');
  dom.window.close();
});

test('fleet, condition, node configuration, and quantity update the report consistently', () => {
  const { doc, dom, files, event } = setup('/intelligence');
  assert.equal(doc.querySelector('#tab-intelligence').getAttribute('aria-selected'), 'true');
  const fleet = doc.querySelector('#fleet-select');
  fleet.value = 'h200'; fleet.dispatchEvent(event('change'));
  doc.querySelector('[data-node-size="4"]').click();
  const count = doc.querySelector('#quantity');
  count.value = '17'; count.dispatchEvent(event('change'));
  assert.equal(count.value, '16');
  assert.equal(count.step, '4');
  const condition = doc.querySelector('#condition-select');
  condition.value = 'new'; condition.dispatchEvent(event('change'));
  doc.querySelector('#tab-reporting').click();
  doc.querySelector('[data-action=report]').click();
  assert.match(doc.querySelector('#report-content').textContent, /H200 SXM/);
  assert.match(doc.querySelector('#report-content').textContent, /16 GPUs \/ 4 nodes/);
  assert.match(doc.querySelector('#report-content').textContent, /New \(assumed\)/);
  assert.match(doc.querySelector('#report-content').textContent, /\$26,400/);
  doc.querySelector('#download-report').click();
  assert.equal(files[0].name, 'valar-exchange-sample-report.txt');
  assert.match(files[0].content, /^VALAR EXCHANGE \| ILLUSTRATIVE ASSET REPORT/);
  assert.match(files[0].content, /synthetic data/i);
  count.value = '99999'; count.dispatchEvent(event('change'));
  assert.equal(count.value, '512');
  assert.equal(doc.querySelector('#quantity-more').disabled, true);
  count.value = '-7'; count.dispatchEvent(event('change'));
  assert.equal(count.value, '4');
  assert.equal(doc.querySelector('#quantity-less').disabled, true);
  dom.window.close();
});

test('model bounds and totals handle invalid and alternate configuration inputs', () => {
  assert.equal(normalizeQuantity(Number.NaN), 64);
  assert.equal(normalizeQuantity(Infinity, 4), 64);
  assert.equal(normalizeQuantity(0, 4), 4);
  assert.equal(normalizeQuantity(23, 8), 24);
  const fleet = fleetSummary('a100', 12, 4, 'used');
  assert.equal(fleet.nodes, 3);
  assert.equal(fleet.lowTotal, 12 * 6300);
  assert.equal(fleet.coverage, 88);
  assert.match(sampleReport('a100', 12, 4, 'used'), /No trade, loan, payment, custody, or external submission was created/);
});

test('navigation menu closes on Escape and returns focus', () => {
  const { doc, dom } = setup('/docs');
  const menu = doc.querySelector('.menu-toggle');
  menu.click();
  assert.equal(menu.getAttribute('aria-expanded'), 'true');
  doc.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  assert.equal(menu.getAttribute('aria-expanded'), 'false');
  assert.equal(doc.activeElement, menu);
  dom.window.close();
});

test('sample modal closes and restores the opener focus', () => {
  const { doc, dom } = setup('/about');
  const opener = doc.querySelector('[data-action=report]') ?? doc.querySelector('[data-action=brief]');
  // Every page shares the report/brief dialogs; the About page uses public navigation.
  const button = opener ?? doc.createElement('button');
  if (!opener) { button.dataset.action = 'report'; doc.body.append(button); }
  button.focus(); button.click();
  const dialog = doc.querySelector('#report-dialog[open],#brief-dialog[open]');
  assert.ok(dialog);
  dialog.querySelector('.dialog-close').click();
  assert.equal(dialog.open, false);
  assert.equal(doc.activeElement, button);
  assert.equal(doc.body.classList.contains('dialog-open'), false);
  dom.window.close();
});

test('brief download keeps entered text as text and makes no submission claim', () => {
  const { doc, dom, files, event } = setup();
  doc.querySelector('[data-action=brief]').click();
  doc.querySelector('#brief-quantity').value = '120';
  doc.querySelector('#brief-notes').value = '<script>alert("example")</script>';
  doc.querySelector('#brief-form').dispatchEvent(event('submit'));
  assert.equal(files[0].name, 'valar-exchange-review-brief.txt');
  assert.match(files[0].content, /^VALAR EXCHANGE \| LOCAL REVIEW BRIEF/);
  assert.match(files[0].content, /GPU count: 120/);
  assert.match(files[0].content, /<script>alert/);
  assert.equal(doc.querySelector('#brief-status script'), null);
  assert.match(doc.querySelector('#brief-status').textContent, /Nothing was submitted/);
  dom.window.close();
});

test('contact, access, subscription, and dataset actions produce honest local exports', () => {
  for (const path of ['/contact', '/marketplace/signup', '/intelligence/signup', '/research']) {
    const { doc, dom, files, event } = setup(path);
    const form = doc.querySelector('[data-local-form]');
    form.dispatchEvent(event('submit'));
    assert.equal(files.length, 1, path);
    assert.equal(files[0].name, `valar-exchange-${form.dataset.localForm}-brief.txt`);
    assert.match(files[0].content, /^VALAR EXCHANGE \| LOCAL PREVIEW BRIEF/);
    assert.match(files[0].content, /Nothing was sent or submitted/);
    assert.match(form.querySelector('[role=status]').textContent, /no account or subscription was created/);
    dom.window.close();
  }
  const { doc, dom, files } = setup('/data');
  doc.querySelector('[data-action=dataset]').click();
  assert.equal(files[0].name, 'valar-exchange-synthetic-data.json');
  const data = JSON.parse(files[0].content);
  assert.equal(data.status, 'illustrative');
  assert.equal(data.records.length, 3);
  dom.window.close();
});

test('unknown routes show an honest not-found page', () => {
  assert.match(renderPage('/missing').title, /Page not found/);
  assert.match(renderPage('/missing').markup, /404 \/ VALAR EXCHANGE/);
});

test('documentation Copy control downloads the example when Clipboard is unavailable', async () => {
  const { doc, dom, files } = setup('/docs/asset-records');
  const button = doc.querySelector('.copy-code');
  assert.ok(button);
  button.click();
  await Promise.resolve();
  assert.equal(button.textContent, 'Downloaded');
  assert.equal(files[0].name, 'valar-exchange-example.txt');
  assert.match(files[0].content, /"status": "illustrative"/);
  dom.window.close();
});


test('deal filters combine, recover from empty results, and sort the fictional profiles', () => {
  const { doc, dom, event } = setup('/marketplace');
  const select = (id, value) => { const field = doc.getElementById(id); field.value = value; field.dispatchEvent(event('change')); };
  select('deal-hardware', 'H100');
  assert.equal(doc.querySelectorAll('#deal-results .deal-card').length, 1);
  select('deal-region', 'Europe');
  assert.equal(doc.querySelectorAll('#deal-results .deal-card').length, 0);
  assert.match(doc.querySelector('#deal-result-count').textContent, /0 fictional profiles/);
  doc.querySelector('#deal-reset').click();
  const search = doc.querySelector('#deal-search'); search.value = 'ROTATION'; search.dispatchEvent(event('input'));
  assert.equal(doc.querySelector('#deal-results h3 a').getAttribute('href'), '/deals/valar-003');
  doc.querySelector('#deal-reset').click(); select('deal-sort', 'budget');
  assert.equal(doc.querySelector('#deal-results h3 a').getAttribute('href'), '/deals/valar-003');
  select('deal-sort', 'evidence');
  assert.equal(doc.querySelector('#deal-results h3 a').getAttribute('href'), '/deals/valar-003');
  dom.window.close();
});

test('deal detail and allowlisted access selection produce only local nonbinding briefs', () => {
  const detail = setup('/deals/valar-002');
  assert.equal(detail.doc.querySelector('.investment-preview a').getAttribute('href'), '/marketplace/signup?deal=valar-002');
  detail.doc.querySelector('[data-deal-download]').click();
  assert.match(detail.files[0].content, /fictional/i);
  assert.match(detail.files[0].content, /No commitment, order, account/i);
  detail.dom.window.close();
  const { doc, dom, files, event } = setup('/marketplace/signup?deal=valar-002');
  assert.equal(doc.querySelector('#access-deal').value, 'valar-002');
  doc.querySelector('[data-local-form]').dispatchEvent(event('submit'));
  assert.match(files[0].content, /Fictional deal: valar-002/);
  assert.match(files[0].content, /Nothing was sent or submitted/);
  dom.window.close();
  const invalid = setup('/marketplace/signup?deal=%3Cscript%3E');
  assert.equal(invalid.doc.querySelector('#access-deal').value, '');
  assert.equal(invalid.doc.querySelector('script'), null);
  invalid.dom.window.close();
});

test('GPU-IQ premium is an open preview with filtered fictional metrics and local exports', () => {
  const { doc, dom, files, event } = setup('/intelligence');
  assert.match(doc.querySelector('#gpu-iq-premium').textContent, /not a secure paywall/);
  assert.match(doc.querySelector('#gpu-iq-premium').textContent, /Paid access, subscriptions and checkout are unavailable/);
  const hardware = doc.querySelector('#intelligence-hardware');
  hardware.value = 'H200'; hardware.dispatchEvent(event('change'));
  assert.match(doc.querySelector('#intelligence-results').textContent, /3,600,000/);
  assert.equal(doc.querySelectorAll('.comparison-row').length, 1);
  doc.querySelector('#iq-export').click();
  assert.equal(files[0].name, 'valar-gpu-iq-fictional-comparison.csv');
  assert.match(files[0].content, /fictional_product_preview/);
  assert.match(files[0].content, /valar-002/);
  assert.doesNotMatch(files[0].content, /valar-001/);
  const region = doc.querySelector('#intelligence-region'); region.value = 'North America'; region.dispatchEvent(event('change'));
  assert.equal(doc.querySelectorAll('.comparison-row').length, 0);
  assert.match(doc.querySelector('#intelligence-results').textContent, /\$0/);
  doc.querySelector('#intelligence-reset').click();
  assert.equal(doc.querySelectorAll('.comparison-row').length, 3);
  doc.querySelector('#iq-research-download').click();
  assert.match(files[1].content, /No live data/);
  assert.match(files[1].content, /does not activate premium access/);
  dom.window.close();
});
