import '@fontsource-variable/inter';
import './styles.css';
import './pages.css';
import './valar.css';
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
if (new URLSearchParams(window.location.search).has('data_partner')) {
  const checkbox = document.querySelector<HTMLInputElement>('#data-partner-interest');
  if (checkbox) checkbox.checked = true;
}
document.querySelectorAll<HTMLAnchorElement>('#primary-nav a').forEach(link => {
  if (link.pathname === window.location.pathname) link.setAttribute('aria-current', 'page');
});
if (window.location.hash) requestAnimationFrame(() => document.getElementById(window.location.hash.slice(1))?.scrollIntoView());
