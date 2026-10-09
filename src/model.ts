export type FleetKey = 'h100' | 'h200' | 'a100';
export type ProductTab = 'markets' | 'intelligence' | 'reporting';
export type NodeSize = 4 | 8;
export type Condition = 'new' | 'refurbished' | 'used';

// Synthetic examples for demonstrating the interface. These are not quotes or market prices.
export const fleets = {
  h100: { name: 'H100 SXM', memory: '80 GB', code: 'TE–014', low: 18000, high: 24000, evidence: 6, total: 8, condition: 'Documented use', months: 18 },
  h200: { name: 'H200 SXM', memory: '141 GB', code: 'TE–021', low: 24000, high: 32000, evidence: 5, total: 8, condition: 'New inventory', months: 6 },
  a100: { name: 'A100 SXM', memory: '80 GB', code: 'TE–008', low: 7000, high: 11000, evidence: 7, total: 8, condition: 'Documented use', months: 30 },
} as const;

export const evidenceItems = ['Ownership record', 'Hardware inventory', 'Configuration record', 'Condition assessment', 'Utilization history', 'Valuation assumptions', 'Warranty record', 'Insurance record'];

export function validFleet(value: string): FleetKey {
  return Object.hasOwn(fleets, value) ? value as FleetKey : 'h100';
}

export function normalizeQuantity(value: number, nodeSize: NodeSize = 8): number {
  return Number.isFinite(value) ? Math.max(nodeSize, Math.min(512, Math.round(value / nodeSize) * nodeSize)) : 64;
}

export function fleetSummary(key: FleetKey, quantity: number, nodeSize: NodeSize = 8, condition?: Condition) {
  const fleet = fleets[key];
  const units = normalizeQuantity(quantity, nodeSize);
  const factor = condition === 'new' ? 1.1 : condition === 'refurbished' ? 1 : condition === 'used' ? .9 : 1;
  const low = Math.round(fleet.low * factor);
  const high = Math.round(fleet.high * factor);
  const conditionLabel = condition ? { new: 'New (assumed)', refurbished: 'Refurbished (assumed)', used: 'Used (assumed)' }[condition] : fleet.condition;
  return { ...fleet, low, high, condition: conditionLabel, units, nodeSize, nodes: units / nodeSize, lowTotal: low * units, highTotal: high * units, coverage: Math.round(fleet.evidence / fleet.total * 100) };
}

export function money(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

export function compactMoney(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 2 }).format(value);
}

export function sampleReport(key: FleetKey, quantity: number, nodeSize: NodeSize = 8, condition?: Condition): string {
  const f = fleetSummary(key, quantity, nodeSize, condition);
  return [
    'TAHOE EXCHANGE | ILLUSTRATIVE ASSET REPORT',
    'Product preview — synthetic data. Not live pricing, an appraisal, a financing offer, or investment advice.',
    '', `Fleet: ${f.code}`, `Asset: ${f.name} (${f.memory})`, `Quantity: ${f.units} GPUs / ${f.nodes} nodes`,
    `Node configuration: ${f.nodeSize} GPUs / node`, `Condition assumption: ${f.condition}`, `Age assumption: ${f.months} months`,
    `Illustrative value range per GPU: ${money(f.low)} – ${money(f.high)}`,
    `Illustrative fleet range: ${money(f.lowTotal)} – ${money(f.highTotal)}`,
    `Evidence coverage: ${f.evidence}/${f.total} example records (${f.coverage}%)`, '',
    'EVIDENCE CHECKLIST',
    ...evidenceItems.map((item, i) => `${i < f.evidence ? '[Attached in example]' : '[Missing in example]'} ${item}`),
    '', 'Method: Quantity × assumed per-unit range. Condition controls apply synthetic factors: new 1.1×, refurbished 1.0×, used 0.9×. All figures are invented to demonstrate the interface.',
    'Actual valuation requires verified ownership, asset condition, comparable transactions, dates, and qualified review.',
    'No trade, loan, payment, custody, or external submission was created.',
  ].join('\n');
}
