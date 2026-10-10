import '@fontsource-variable/inter';
import './styles.css';
import './pages.css';
import './reference.css';
import './fidelity.css';
import './editorial.css';
import './markets.css';
import './neutral.css';
import './footer-reference.css';
import './reader.css';
import './journey.css';
import { initializeReaderControls } from './reader-controller.ts';
import { renderPage } from './pages.ts';
import { initializeSite, initializePageControls } from './controller.ts';

const root = document.querySelector<HTMLDivElement>('#app');
if (!root) throw new Error('App root is missing');
const page = renderPage(window.location.pathname);
root.innerHTML = page.markup;
document.title = page.title;
document.querySelector('meta[name="description"]')?.setAttribute('content', page.description);
initializeSite(document, undefined, page.product);
initializePageControls(document);
initializeReaderControls(document);
if (new URLSearchParams(window.location.search).has('data_partner')) {
  const checkbox = document.querySelector<HTMLInputElement>('#data-partner-interest');
  if (checkbox) checkbox.checked = true;
}
document.querySelectorAll<HTMLAnchorElement>('#primary-nav a').forEach(link => {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  const current = path === '/today' || path.startsWith('/brief/') || path === '/research' ? '/' : path === '/markets' ? '/market' : path;
  if (link.pathname === current) link.setAttribute('aria-current', 'page');
  else if (link.pathname !== '/' && current.startsWith(`${link.pathname}/`) || (current.startsWith('/deals/') && link.pathname === '/marketplace')) link.setAttribute('aria-current', 'location');
});
if (window.location.hash) requestAnimationFrame(() => document.getElementById(window.location.hash.slice(1))?.scrollIntoView());

const topic = new URLSearchParams(window.location.search).get('topic');
if (window.location.pathname === '/market' && topic && ['h100', 'h200', 'b200', 'ai-demand'].includes(topic)) requestAnimationFrame(() => document.getElementById(topic === 'ai-demand' ? 'cycle' : topic)?.scrollIntoView());
