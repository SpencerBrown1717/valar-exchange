import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { publicPaths, renderPage, escapeHtml } from '../src/pages.ts';
import { assertEdition, editionDigest } from './newsletter/editorial.mjs';

const editions = JSON.parse(await readFile('public/newsletter/editions.json', 'utf8'));
if (!Array.isArray(editions) || new Set(editions.map(edition => edition.id)).size !== editions.length) throw new Error('The edition archive must contain unique issue IDs.');
editions.forEach(edition => {
  assertEdition(edition);
  if (edition.state !== 'published') throw new Error('The public archive may contain only published editions.');
});

const template = await readFile('dist/index.html', 'utf8');
for (const path of publicPaths) {
  const page = renderPage(path);
  let html = template.replace('<div id="app"></div>', `<div id="app">${page.markup}</div>`)
    .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(page.title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*"/, `$1${escapeHtml(page.description)}"`)
    .replace(/(<meta property="og:title" content=")[^"]*"/, `$1${escapeHtml(page.title)}"`)
    .replace(/(<meta property="og:description" content=")[^"]*"/, `$1${escapeHtml(page.description)}"`);
  const edition = path.startsWith('/brief/') ? editions.find(issue => issue.id === path.slice(7)) : null;
  if (edition) html = html.replace('</head>', `<meta name="valar-edition-id" content="${escapeHtml(edition.id)}"><meta name="valar-edition-digest" content="${editionDigest(edition)}"></head>`);
  const directory = path === '/' ? 'dist' : join('dist', path.slice(1));
  const file = edition ? join('dist', `${path.slice(1)}.html`) : join(directory, 'index.html');
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, html);
}
await writeFile('dist/404.html', template.replace('<div id="app"></div>', `<div id="app">${renderPage('/not-found').markup}</div>`));
console.log(`Generated ${publicPaths.length} static public routes and 404.html.`);
