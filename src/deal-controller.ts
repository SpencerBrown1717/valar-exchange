import { filterDeals, validDeal, dealBrief } from './deals.ts';
import { dealCards, intelligencePanel } from './deal-ui.ts';

export function initializeDealControls(doc: Document, download: (name: string, content: string) => void) {
  const value = (id: string) => doc.querySelector<HTMLInputElement | HTMLSelectElement>('#' + id)?.value ?? '';
  const browser = doc.querySelector('#deal-results');
  if (browser) {
    const update = () => {
      const records = filterDeals({ query: value('deal-search'), hardware: value('deal-hardware'), region: value('deal-region'), strategy: value('deal-strategy'), sort: value('deal-sort') });
      browser.innerHTML = dealCards(records);
      doc.querySelector('#deal-result-count')!.textContent = `${records.length} fictional ${records.length === 1 ? 'profile' : 'profiles'}`;
    };
    doc.querySelector('#deal-search')!.addEventListener('input', update);
    ['deal-hardware', 'deal-region', 'deal-strategy', 'deal-sort'].forEach(id => doc.querySelector('#' + id)!.addEventListener('change', update));
    doc.querySelector('#deal-reset')!.addEventListener('click', () => {
      ['deal-search', 'deal-hardware', 'deal-region', 'deal-strategy', 'deal-sort'].forEach(id => { (doc.querySelector('#' + id) as HTMLInputElement).value = ''; });
      update();
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
