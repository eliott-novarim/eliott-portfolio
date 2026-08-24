/** Header behaviour: theme toggle, hairline on scroll, section-aware language switch. */
const STORAGE_KEY = 'theme';

function currentTheme(): 'light' | 'dark' {
  const set = document.documentElement.dataset.theme;
  if (set === 'light' || set === 'dark') return set;
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function mountChrome(): void {
  const toggle = document.querySelector<HTMLButtonElement>('[data-theme-toggle]');
  toggle?.addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* private mode — the choice simply does not persist */
    }
  });

  const header = document.querySelector<HTMLElement>('[data-header]');
  if (header) {
    const sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    header.before(sentinel);
    new IntersectionObserver(
      ([entry]) => {
        header.dataset.stuck = String(!(entry?.isIntersecting ?? true));
      },
      { threshold: 1 },
    ).observe(sentinel);
  }

  // The language switch keeps the section the reader is on.
  const switcher = document.querySelector<HTMLAnchorElement>('[data-lang-switch]');
  const sections = Array.from(document.querySelectorAll<HTMLElement>('main section[id]'));
  if (switcher && sections.length) {
    const base = switcher.getAttribute('href') ?? '/';
    let current = '';
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) current = entry.target.id;
        }
        switcher.setAttribute('href', current ? `${base}#${current}` : base);
      },
      { rootMargin: '-25% 0px -60% 0px' },
    );
    for (const section of sections) observer.observe(section);
  }
}
