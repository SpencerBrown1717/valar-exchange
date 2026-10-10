import { escapeReaderText, followedTopics, topicDetails, renderSavedTopics, type FollowedTopic } from './reader-ui.ts';

const storageKey = 'valar:watchlist:v1';
const isTopic = (value: unknown): value is FollowedTopic => typeof value === 'string' && followedTopics.includes(value as FollowedTopic);

export function readWatchlist(storage: Pick<Storage, 'getItem'>): FollowedTopic[] {
  try {
    const value: unknown = JSON.parse(storage.getItem(storageKey) ?? '[]');
    return Array.isArray(value) ? [...new Set(value.filter(isTopic))] : [];
  } catch { return []; }
}

function getStorage(doc: Document): Storage | null {
  try { return doc.defaultView?.localStorage ?? null; } catch { return null; }
}

function announce(doc: Document, message: string, visible = false): void {
  const status = doc.querySelector<HTMLElement>('[data-reader-status]');
  if (status) {
    status.textContent = message;
    status.classList.toggle('sr-only', !visible);
  }
}

function refreshWatchlist(doc: Document, topics: FollowedTopic[]): void {
  doc.querySelectorAll<HTMLButtonElement>('[data-follow]').forEach(button => {
    const key = button.dataset.follow;
    if (!isTopic(key)) return;
    const followed = topics.includes(key);
    const label = topicDetails[key].label;
    button.setAttribute('aria-pressed', String(followed));
    button.setAttribute('aria-label', `${followed ? 'Unfollow' : 'Follow'} ${label} on this device`);
    button.innerHTML = `<span aria-hidden="true">${followed ? '✓' : '+'}</span> ${followed ? 'Following' : `Follow ${escapeReaderText(label)}`}`;
  });
  doc.querySelectorAll<HTMLElement>('[data-watchlist]').forEach(container => { container.innerHTML = renderSavedTopics(topics); });
  doc.querySelectorAll<HTMLElement>('[data-watchlist-count]').forEach(count => { count.textContent = `${topics.length} ${topics.length === 1 ? 'topic' : 'topics'}`; });
}

function setFormStatus(form: HTMLFormElement, message: string): void {
  const status = form.querySelector<HTMLElement>('[role="status"]');
  if (status) { status.hidden = false; status.textContent = message; }
}

export function initializeReaderControls(doc: Document = document): void {
  const storage = getStorage(doc);
  let topics = storage ? readWatchlist(storage) : [];
  refreshWatchlist(doc, topics);
  const updateTopics = (next: FollowedTopic[], message: string): boolean => {
    if (!storage) { announce(doc, 'Your browser is blocking storage. This topic could not be saved.', true); return false; }
    try {
      storage.setItem(storageKey, JSON.stringify(next));
      topics = next;
      refreshWatchlist(doc, topics);
      announce(doc, message);
      return true;
    } catch { announce(doc, 'Your browser could not save this watchlist. Check available storage or privacy settings.', true); return false; }
  };

  doc.addEventListener('click', event => {
    const target = event.target as Element | null;
    if (!target || typeof target.closest !== 'function') return;
    const follow = target?.closest<HTMLButtonElement>('button[data-follow]');
    if (follow && isTopic(follow.dataset.follow)) {
      const key = follow.dataset.follow;
      const exists = topics.includes(key);
      updateTopics(exists ? topics.filter(topic => topic !== key) : [...topics, key], `${topicDetails[key].label} ${exists ? 'removed from' : 'saved to'} your device watchlist.`);
      return;
    }
    const remove = target?.closest<HTMLButtonElement>('button[data-unfollow]');
    if (remove && isTopic(remove.dataset.unfollow)) {
      const key = remove.dataset.unfollow;
      if (updateTopics(topics.filter(topic => topic !== key), `${topicDetails[key].label} removed from your device watchlist.`)) {
        doc.querySelector<HTMLButtonElement>(`[data-follow="${key}"]`)?.focus();
      }
    }
  });

  doc.defaultView?.addEventListener('storage', event => {
    if (event.key === storageKey || event.key === null) {
      topics = storage ? readWatchlist(storage) : [];
      refreshWatchlist(doc, topics);
    }
  });

  doc.querySelectorAll<HTMLFormElement>('[data-newsletter-form]').forEach(form => {
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
      if (!button || button.disabled) return;
      const email = form.querySelector<HTMLInputElement>('[name="email"]')?.value.trim();
      const website = form.querySelector<HTMLInputElement>('[name="website"]')?.value ?? '';
      if (!email) return;
      const fetcher = doc.defaultView?.fetch?.bind(doc.defaultView);
      if (!fetcher) { setFormStatus(form, 'Signup is unavailable in this browser. You can still read every published brief here.'); return; }
      button.disabled = true;
      form.setAttribute('aria-busy', 'true');
      setFormStatus(form, 'Requesting your confirmation email…');
      try {
        const response = await fetcher('/api/newsletter/subscribe', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, website, source: 'newsletter', consent: true }),
        });
        const data: unknown = await response.json().catch(() => null);
        const result = data && typeof data === 'object' ? data as Record<string, unknown> : {};
        if (!response.ok) {
          setFormStatus(form, response.status === 429 ? 'Too many requests. Please wait before trying again.' : response.status === 400 ? 'Please check your email address and try again.' : 'The mailing list is not available yet. Your address has not been added. You can read the brief here and try again later.');
        } else if (response.status === 202 || result.status === 'pending' || result.confirmed === false || result.ok === true) {
          setFormStatus(form, 'Check your inbox for a confirmation link. You join the daily mailing list only after you confirm your address.');
          form.querySelector<HTMLInputElement>('[name="email"]')!.value = '';
        } else {
          setFormStatus(form, 'We could not verify that a confirmation email was requested. Please try again later.');
        }
      } catch {
        setFormStatus(form, 'The signup service could not be reached. Your subscription is not confirmed. Please try again.');
      } finally {
        button.disabled = false;
        form.removeAttribute('aria-busy');
      }
    });
  });
}
