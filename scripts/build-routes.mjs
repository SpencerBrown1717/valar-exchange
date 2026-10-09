import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { publicPaths, renderPage, escapeHtml, newsArticles } from '../src/pages.ts';
import { researchSeo, siteOrigin } from '../src/research-seo.ts';

const template = await readFile('dist/index.html', 'utf8');
for (const path of publicPaths) {
  const page = renderPage(path);
  const article = newsArticles.find(article => path === '/research/' + article.slug);
  const isResearch = path.startsWith('/research');
  const html = template.replace('<div id="app"></div>', `<div id="app">${page.markup}</div>`)
    .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(page.title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*"/, `$1${escapeHtml(page.description)}"`)
    .replace(/(<meta property="og:title" content=")[^"]*"/, `$1${escapeHtml(page.title)}"`)
    .replace(/(<meta property="og:description" content=")[^"]*"/, `$1${escapeHtml(page.description)}"`)
    .replace('content="website"', `content="${article ? 'article' : 'website'}"`)
    .replace('content="/valar-mark.svg"', isResearch ? `content="${siteOrigin}/research-share.png"` : 'content="/valar-mark.svg"')
    .replace('</head>', `${isResearch ? researchSeo(path, page.title, page.description, article) : ''}</head>`);
  const directory = path === '/' ? 'dist' : join('dist', path.slice(1));
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, 'index.html'), html);
}
await writeFile('dist/404.html', template.replace('<div id="app"></div>', `<div id="app">${renderPage('/not-found').markup}</div>`));
await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${publicPaths.map(path => `<url><loc>${siteOrigin}${path === '/' ? '/' : path + '/'}</loc></url>`).join('')}</urlset>`);
await writeFile('dist/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${siteOrigin}/sitemap.xml\n`);
console.log(`Generated ${publicPaths.length} static public routes and 404.html.`);
