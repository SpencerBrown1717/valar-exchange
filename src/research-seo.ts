import type { ResearchArticle } from './research-types.ts';

export const siteOrigin = 'https://tahoe-cloud-exchange.vercel.app';
const attribute = (value: string) => value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);

export function researchSeo(path: string, title: string, description: string, article?: ResearchArticle): string {
  const url = siteOrigin + (path === '/' ? '/' : path.replace(/\/$/, '') + '/');
  const image = siteOrigin + '/research-share.png';
  const metadata = `<link rel="canonical" href="${attribute(url)}"/><meta property="og:url" content="${attribute(url)}"/><meta name="twitter:card" content="summary_large_image"/><meta name="twitter:title" content="${attribute(title)}"/><meta name="twitter:description" content="${attribute(description)}"/><meta name="twitter:image" content="${image}"/>`;
  if (!article) return metadata;
  const structured = {
    '@context': 'https://schema.org', '@type': 'NewsArticle', headline: article.title,
    description: article.summary, datePublished: article.publishedAt, dateModified: article.updatedAt,
    mainEntityOfPage: url, image: [image], author: { '@type': 'Organization', name: 'VALAR Research', url: siteOrigin + '/research/' },
    publisher: { '@type': 'Organization', name: 'Valar Exchange', url: siteOrigin }, citation: article.source.url,
    articleSection: 'GPU industry research', isAccessibleForFree: true,
  };
  return metadata + `<meta property="article:published_time" content="${attribute(article.publishedAt)}"/><meta property="article:modified_time" content="${attribute(article.updatedAt)}"/><meta property="article:author" content="VALAR Research"/><script type="application/ld+json">${JSON.stringify(structured).replace(/</g, '\\u003c')}</script>`;
}
