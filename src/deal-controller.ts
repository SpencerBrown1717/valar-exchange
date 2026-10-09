import { filterDeals, validDeal, dealBrief } from './deals.ts';
import { dealCards, intelligencePanel } from './deal-ui.ts';

export function initializeDealControls(doc: Document, download: (name: string, content: string) => void) {
  const value = (id: string) => doc.querySelector<HTMLInputElement | HTMLSelectElement>('#' + id)?.value ?? '';
  const browser = doc.querySelector('#deal-results');
  if (browser) {
    const filters = ['deal-search', 'deal-hardware', 'deal-region', 'deal-strategy', 'deal-sort'];
    const activeFilters = doc.querySelector<HTMLDivElement>('#deal-active-filters');
    const filterNames: Record<string, string> = { 'deal-search': 'Search', 'deal-hardware': 'Hardware', 'deal-region': 'Region', 'deal-strategy': 'Strategy' };
    const renderActiveFilters = () => {
      if (!activeFilters) return;
      activeFilters.replaceChildren();
      const selected = Object.entries(filterNames).filter(([id]) => value(id).trim());
      activeFilters.hidden = !selected.length;
      if (!selected.length) return;
      const label = doc.createElement('span');
      label.textContent = 'Filtered by';
      activeFilters.append(label);
      selected.forEach(([id, name]) => {
        const button = doc.createElement('button');
        button.type = 'button';
        button.dataset.removeFilter = id;
        button.textContent = `${name}: ${value(id).trim()} ×`;
        button.setAttribute('aria-label', `Remove ${name.toLowerCase()} filter: ${value(id).trim()}`);
        activeFilters.append(button);
      });
    };
    const update = () => {
      const records = filterDeals({ query: value('deal-search'), hardware: value('deal-hardware'), region: value('deal-region'), strategy: value('deal-strategy'), sort: value('deal-sort') });
      browser.innerHTML = dealCards(records);
      doc.querySelector('#deal-result-count')!.textContent = `${records.length} fictional ${records.length === 1 ? 'profile' : 'profiles'}`;
      renderActiveFilters();
    };
    const reset = () => {
      filters.forEach(id => { (doc.querySelector('#' + id) as HTMLInputElement).value = ''; });
      update();
    };
    doc.querySelector('#deal-search')!.addEventListener('input', update);
    ['deal-hardware', 'deal-region', 'deal-strategy', 'deal-sort'].forEach(id => doc.querySelector('#' + id)!.addEventListener('change', update));
    doc.querySelector('#deal-reset')!.addEventListener('click', reset);
    browser.addEventListener('click', event => {
      const target = event.target as HTMLElement;
      if (target.closest('[data-reset-deals]')) {
        reset();
        doc.querySelector<HTMLInputElement>('#deal-search')?.focus();
      }
    });
    activeFilters?.addEventListener('click', event => {
      const target = event.target as HTMLElement;
      const id = target.closest<HTMLButtonElement>('[data-remove-filter]')?.dataset.removeFilter;
      if (!id || !Object.hasOwn(filterNames, id)) return;
      const field = doc.getElementById(id) as HTMLInputElement | HTMLSelectElement;
      field.value = '';
      update();
      field.focus();
    });
  }
  const intelligence = doc.querySelector('#intelligence-results');
  if (intelligence) {
    const update = () => {
      const records = filterDeals({ hardware: value('intelligence-hardware'), region: value('intelligence-region') });
      intelligence.innerHTML = intelligencePanel(records);
      doc.querySelector('#intelligence-status')!.textContent = `Showing ${records.length} fictional profiles. All metrics are invented.`;
    };
    ['intelligence-hardware', 'intelligence-region'].forEach(id => doc.querySelector('#' + id)!.addEventListener('change', update));
    doc.querySelector('#intelligence-reset')!.addEventListener('click', () => {
      ['intelligence-hardware', 'intelligence-region'].forEach(id => { (doc.querySelector('#' + id) as HTMLSelectElement).value = ''; });
      update();
    });
  }
  doc.querySelectorAll<HTMLButtonElement>('[data-deal-download]').forEach(button => button.addEventListener('click', () => {
    const deal = validDeal(button.dataset.dealDownload);
    if (deal) download(`valar-exchange-${deal.id}-fictional-profile.txt`, dealBrief(deal));
  }));
  doc.querySelector('#iq-export')?.addEventListener('click', () => {
    const records = filterDeals({ hardware: value('intelligence-hardware'), region: value('intelligence-region') });
    const rows = [['status', 'example_id', 'scenario', 'hardware', 'assumed_region', 'invented_gpu_count', 'invented_project_budget_usd', 'unverified_sample_records'], ...records.map(deal => ['fictional_product_preview', deal.id, deal.title, deal.hardware, deal.region, deal.gpus, deal.budget, `${deal.evidence}/8`])];
    const csv = rows.map(row => row.map(cell => '"' + String(cell).replaceAll('"', '""') + '"').join(',')).join('\n');
    download('valar-gpu-iq-fictional-comparison.csv', csv);
    doc.querySelector('#intelligence-status')!.textContent = 'Fictional comparison downloaded locally. No subscription or external request was created.';
  });
  doc.querySelector('#iq-research-download')?.addEventListener('click', () => download('valar-gpu-iq-sample-research.txt', ['GPU-IQ | ORIGINAL RESEARCH PREVIEW', 'Fictional examples only. No live data, recommendations, verified observations or return forecasts.', '', 'THE QUESTIONS BEHIND A GPU OPPORTUNITY', 'Hardware: document identifiers, configuration, condition and service history.', 'Operations: distinguish operating evidence from assumptions about power, demand and utilization.', 'Capital: explain an assumed project budget before using it in a real discussion.', 'Sources: record provenance, observation dates, missing evidence and review limits.', '', 'This local sample does not activate premium access or create an investment, subscription or account.'].join('\n')));
  const deal = validDeal(new URL(doc.URL).searchParams.get('deal'));
  const selection = doc.querySelector<HTMLSelectElement>('#access-deal');
  if (deal && selection) selection.value = deal.id;
}
