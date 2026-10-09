import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { publicPaths, renderPage, escapeHtml } from '../src/pages.ts';

const template = await readFile('dist/index.html', 'utf8');
for (const path of publicPaths) {
  const page = renderPage(path);
  const html = template.replace('<div id="app"></div>', `<div id="app">${page.markup}</div>`)
    .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(page.title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*"/, `$1${escapeHtml(page.description)}"`)
    .replace(/(<meta property="og:title" content=")[^"]*"/, `$1${escapeHtml(page.title)}"`)
    .replace(/(<meta property="og:description" content=")[^"]*"/, `$1${escapeHtml(page.description)}"`);
  const directory = path === '/' ? 'dist' : join('dist', path.slice(1));
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, 'index.html'), html);
}
await writeFile('dist/404.html', template.replace('<div id="app"></div>', `<div id="app">${renderPage('/not-found').markup}</div>`));
console.log(`Generated ${publicPaths.length} static public routes and 404.html.`);
