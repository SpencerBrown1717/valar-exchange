export interface ResearchArticle {
  slug: string;
  title: string;
  summary: string;
  publishedAt: string;
  updatedAt: string;
  eventDate: string;
  source: { title: string; url: string; publisher: string; publishedAt: string };
  facts: string[];
  analysis: string[];
  limitations: string[];
  methodology: string;
}

export const researchMethodology = 'AI-assisted synthesis from linked primary announcements. Source evidence is checked automatically; no human review is implied.';
