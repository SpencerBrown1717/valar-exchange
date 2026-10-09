export interface SampleDeal {
  id: string;
  title: string;
  hardware: 'H100' | 'H200' | 'A100';
  region: 'North America' | 'Europe' | 'Asia Pacific';
  strategy: 'Compute infrastructure' | 'Hardware resale';
  gpus: number;
  budget: number;
  evidence: number;
  summary: string;
  questions: string[];
}

// Entirely invented product fixtures. No real project, offering or market observation.
export const sampleDeals: SampleDeal[] = [
  { id: 'valar-001', title: 'H100 compute fleet', hardware: 'H100', region: 'North America', strategy: 'Compute infrastructure', gpus: 64, budget: 1350000, evidence: 6, summary: 'A fictional acquisition and operation scenario for an eight-node GPU fleet.', questions: ['Confirm hardware ownership and condition.', 'Review power availability and operating costs.', 'Document the assumptions behind utilization and demand.'] },
  { id: 'valar-002', title: 'H200 capacity expansion', hardware: 'H200', region: 'Europe', strategy: 'Compute infrastructure', gpus: 128, budget: 3600000, evidence: 5, summary: 'A fictional sixteen-node capacity expansion with several diligence inputs still missing.', questions: ['Review the proposed delivery schedule.', 'Check site capacity and contractual assumptions.', 'Obtain condition, warranty and insurance records.'] },
  { id: 'valar-003', title: 'A100 fleet rotation', hardware: 'A100', region: 'Asia Pacific', strategy: 'Hardware resale', gpus: 96, budget: 850000, evidence: 7, summary: 'A fictional fleet rotation scenario exploring the evidence needed for a hardware resale review.', questions: ['Check identifiers and service history.', 'Document condition and resale assumptions.', 'Review logistics, warranty and ownership records.'] },
];

export interface DealFilters { query?: string; hardware?: string; region?: string; strategy?: string; sort?: string; }
export function filterDeals(filters: DealFilters): SampleDeal[] {
  const query = (filters.query ?? '').trim().toLocaleLowerCase();
  const matches = sampleDeals.filter(deal => (!query || `${deal.title} ${deal.hardware} ${deal.region} ${deal.strategy} ${deal.id}`.toLocaleLowerCase().includes(query))
    && (!filters.hardware || deal.hardware === filters.hardware)
    && (!filters.region || deal.region === filters.region)
    && (!filters.strategy || deal.strategy === filters.strategy));
  if (filters.sort === 'evidence') matches.sort((a, b) => b.evidence - a.evidence);
  if (filters.sort === 'budget') matches.sort((a, b) => a.budget - b.budget);
  return matches;
}
export function validDeal(id: string | null | undefined): SampleDeal | undefined { return sampleDeals.find(deal => deal.id === id); }
export const budgetLabel = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);

export function intelligenceSummary(records: SampleDeal[]) {
  return {
    profiles: records.length,
    gpus: records.reduce((total, deal) => total + deal.gpus, 0),
    budget: records.reduce((total, deal) => total + deal.budget, 0),
    coverage: records.length ? Math.round(records.reduce((total, deal) => total + deal.evidence, 0) / (records.length * 8) * 100) : 0,
  };
}

export function dealBrief(deal: SampleDeal): string {
  return ['VALAR EXCHANGE | FICTIONAL DEAL PROFILE', 'Product preview. This is an invented scenario, not an available investment or offering.', '', `Example: ${deal.id}`, `Scenario: ${deal.title}`, `Hardware: ${deal.hardware}`, `Region (assumed): ${deal.region}`, `Strategy (example): ${deal.strategy}`, `GPU count (invented): ${deal.gpus}`, `Project budget (invented): ${budgetLabel(deal.budget)}`, `Sample records present: ${deal.evidence} of 8; presence is not verification.`, '', 'QUESTIONS FOR REVIEW', ...deal.questions.map(question => '- ' + question), '', 'No returns, financing terms, investment eligibility, counterparty verification, or valuation are established.', 'No commitment, order, account, payment or external submission was created.'].join('\n');
}
