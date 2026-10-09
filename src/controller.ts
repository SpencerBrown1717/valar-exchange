import { productPanel } from './content.ts';
import { fleetSummary, normalizeQuantity, sampleReport, validFleet, type ProductTab, type NodeSize, type Condition } from './model.ts';

const descriptions: Record<ProductTab, string> = {
  markets: 'A proposed workspace for structured GPU fleet records. See what is documented and what still needs review.',
  intelligence: 'Explore valuation assumptions alongside their context. Synthetic ranges demonstrate how evidence could inform a review.',
  reporting: 'Bring assets, assumptions, and missing records into one review package. Download the illustrative example.',
};

export function initializeSite(doc: Document, download = downloadText, initialTab: ProductTab = 'markets') {
  let tab: ProductTab = initialTab;
  let nodeSize: NodeSize = 8;
  const condition = doc.querySelector<HTMLSelectElement>('#condition-select') ?? { value: 'refurbished' };
  const fleet = doc.querySelector<HTMLSelectElement>('#fleet-select') ?? { value: 'h100' };
  const quantity = doc.querySelector<HTMLInputElement>('#quantity') ?? { value: '64' };
  const panel = doc.querySelector<HTMLElement>('#product-panel');
  const tabs = [...doc.querySelectorAll<HTMLButtonElement>('[data-tab]')];
  const status = doc.querySelector<HTMLElement>('#demo-status');

  function update() {
    if (!panel) return;
    const key = validFleet(fleet.value);
    const count = normalizeQuantity(Number(quantity.value), nodeSize);
    quantity.value = String(count);
    panel.innerHTML = productPanel(tab, key, count, nodeSize, condition.value as Condition);
    panel.setAttribute('aria-labelledby', `tab-${tab}`);
    doc.querySelector('#product-description')!.textContent = descriptions[tab];
    tabs.forEach(button => {
      const selected = button.dataset.tab === tab;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
    doc.querySelectorAll<HTMLElement>('.sidebar-item[data-product]').forEach(button => button.classList.toggle('active', button.dataset.product === tab));
    const summary = fleetSummary(key, count, nodeSize, condition.value as Condition);
    const quantityInput = doc.querySelector<HTMLInputElement>('#quantity')!;
    quantityInput.min = String(nodeSize);
    quantityInput.step = String(nodeSize);
    doc.querySelector<HTMLButtonElement>('#quantity-less')!.disabled = count <= nodeSize;
    doc.querySelector<HTMLButtonElement>('#quantity-less')!.setAttribute('aria-label', `Decrease GPU quantity by ${nodeSize}`);
    doc.querySelector<HTMLButtonElement>('#quantity-more')!.setAttribute('aria-label', `Increase GPU quantity by ${nodeSize}`);
    doc.querySelector<HTMLButtonElement>('#quantity-more')!.disabled = count >= 512;
    if (status) status.textContent = `${tab} example updated: ${summary.name}, ${count} GPUs, ${summary.evidence} of ${summary.total} evidence records. All data illustrative.`;
  }

  doc.querySelector('#fleet-select')?.addEventListener('change', update);
  doc.querySelector('#quantity')?.addEventListener('change', update);
  doc.querySelector('#quantity-less')?.addEventListener('click', () => { quantity.value = String(Number(quantity.value) - nodeSize); update(); });
  doc.querySelector('#quantity-more')?.addEventListener('click', () => { quantity.value = String(Number(quantity.value) + nodeSize); update(); });
  doc.querySelector('#condition-select')?.addEventListener('change', update);
  doc.querySelectorAll<HTMLButtonElement>('[data-node-size]').forEach(button => button.addEventListener('click', () => {
    nodeSize = Number(button.dataset.nodeSize) as NodeSize;
    doc.querySelectorAll<HTMLButtonElement>('[data-node-size]').forEach(control => control.setAttribute('aria-pressed', String(control === button)));
    update();
  }));
  tabs.forEach(button => {
    button.addEventListener('click', () => { tab = button.dataset.tab as ProductTab; update(); });
    button.addEventListener('keydown', event => {
      const index = tabs.indexOf(button);
      const next = event.key === 'ArrowRight' ? (index + 1) % tabs.length : event.key === 'ArrowLeft' ? (index + tabs.length - 1) % tabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : -1;
      if (next < 0) return;
      event.preventDefault();
      tabs[next].click();
      tabs[next].focus();
    });
  });

  const menu = doc.querySelector<HTMLButtonElement>('.menu-toggle')!;
  const nav = doc.querySelector<HTMLElement>('#primary-nav')!;
  function closeMenu() { menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Open navigation'); nav.classList.remove('is-open'); }
  menu.addEventListener('click', () => {
    const expanded = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(expanded));
    menu.setAttribute('aria-label', expanded ? 'Close navigation' : 'Open navigation');
    nav.classList.toggle('is-open', expanded);
  });
  doc.addEventListener('keydown', event => { if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); } });

  let lastFocus: HTMLElement | null = null;
  const reportDialog = doc.querySelector<HTMLDialogElement>('#report-dialog')!;
  const briefDialog = doc.querySelector<HTMLDialogElement>('#brief-dialog')!;
  function openDialog(dialog: HTMLDialogElement) {
    lastFocus = doc.activeElement as HTMLElement;
    dialog.showModal();
    doc.body.classList.add('dialog-open');
  }
  [reportDialog, briefDialog].forEach(dialog => {
    dialog.querySelectorAll('.dialog-close').forEach(button => button.addEventListener('click', () => dialog.close()));
    dialog.addEventListener('click', event => { if (event.target === dialog) { const box = dialog.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close(); } });
    dialog.addEventListener('close', () => { doc.body.classList.remove('dialog-open'); lastFocus?.focus(); });
  });

  doc.addEventListener('click', event => {
    const target = event.target as HTMLElement;
    const productLink = target.closest<HTMLElement>('[data-product]');
    if (productLink) { tab = productLink.dataset.product as ProductTab; update(); }
    if (target.closest('#primary-nav a')) closeMenu();
    if (target.closest('a')) doc.querySelectorAll<HTMLDetailsElement>('.nav-dropdown').forEach(dropdown => { dropdown.open = false; });
    const action = target.closest<HTMLElement>('[data-action]')?.dataset.action;
    if (action === 'report') {
      doc.querySelector('#report-content')!.textContent = sampleReport(validFleet(fleet.value), Number(quantity.value), nodeSize, condition.value as Condition);
      openDialog(reportDialog);
    }
    if (action === 'brief') { doc.querySelector('#brief-status')!.textContent = ''; openDialog(briefDialog); }
    if (action === 'dataset') {
      download('valar-exchange-synthetic-data.json', JSON.stringify({ status: 'illustrative', disclosure: 'Synthetic examples. Not live prices, appraisals, or financing offers.', records: ['h100', 'h200', 'a100'].map(key => fleetSummary(validFleet(key), 64)) }, null, 2));
    }
  });

  doc.querySelector('#download-report')!.addEventListener('click', () => download('valar-exchange-sample-report.txt', sampleReport(validFleet(fleet.value), Number(quantity.value), nodeSize, condition.value as Condition)));
  doc.querySelector<HTMLFormElement>('#brief-form')!.addEventListener('submit', event => {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    if (!form.reportValidity()) return;
    const purpose = doc.querySelector<HTMLSelectElement>('#brief-purpose')!.value;
    const hardware = doc.querySelector<HTMLSelectElement>('#brief-hardware')!.value;
    const count = doc.querySelector<HTMLInputElement>('#brief-quantity')!.value;
    const notes = doc.querySelector<HTMLTextAreaElement>('#brief-notes')!.value.trim();
    const text = ['VALAR EXCHANGE | LOCAL REVIEW BRIEF', '', `Review focus: ${purpose}`, `Hardware: ${hardware}`, `GPU count: ${count}`, '', 'QUESTIONS FOR REVIEW', notes || 'No questions added.', '', 'SUGGESTED EVIDENCE TO ORGANIZE', '[ ] Ownership and purchase records', '[ ] Asset identifiers and configuration', '[ ] Condition and utilization history', '[ ] Dated valuation sources and assumptions', '[ ] Warranty and insurance records', '', 'This brief was created locally. It has not been submitted to Valar Exchange or any third party.', 'Planning only. Not a loan application, appraisal, trade instruction, or financing offer.'].join('\n');
    download('valar-exchange-review-brief.txt', text);
    doc.querySelector('#brief-status')!.textContent = 'Your brief is ready. Check your downloads. Nothing was submitted.';
  });
  update();
}

export function initializePageControls(doc: Document, download = downloadText) {
  doc.querySelectorAll<HTMLFormElement>('[data-local-form]').forEach(form => {
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const lines = [...form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input,select,textarea')].filter(field => field.name && (!('type' in field) || field.type !== 'checkbox' || (field as HTMLInputElement).checked)).map(field => `${field.name}: ${field.value}`);
      download(`valar-exchange-${form.dataset.localForm}-brief.txt`, ['VALAR EXCHANGE | LOCAL PREVIEW BRIEF', '', ...lines, '', 'Saved locally. Nothing was sent or submitted. No account, subscription, inquiry, trade, or financing application was created.', 'Do not include passwords, credentials, or sensitive identity/financial information.'].join('\n'));
      form.querySelector('[role="status"]')!.textContent = 'Your local brief is ready. Nothing was sent; no account or subscription was created.';
    });
    form.querySelectorAll<HTMLButtonElement>('button[type="submit"]').forEach(button => { button.disabled = false; });
  });
  doc.querySelectorAll<HTMLButtonElement>('.copy-code').forEach(button => button.addEventListener('click', async () => {
    const content = doc.querySelector(`#${button.dataset.codeId}`)!.textContent ?? '';
    try {
      const clipboard = doc.defaultView?.navigator.clipboard;
      if (!clipboard) throw new Error('Clipboard unavailable');
      await clipboard.writeText(content);
      button.textContent = 'Copied';
      button.setAttribute('aria-label', 'Example copied to clipboard');
    } catch {
      download('valar-exchange-example.txt', content);
      button.textContent = 'Downloaded';
      button.setAttribute('aria-label', 'Clipboard unavailable; example downloaded instead');
    }
  }));
}

function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
