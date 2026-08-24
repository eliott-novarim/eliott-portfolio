/** Load cascade: each block fades up as its section reaches the viewport. */
export function mountReveal(): void {
  const items = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
  if (!items.length) return;

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    for (const el of items) el.classList.add('is-in');
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -6% 0px', threshold: 0.01 },
  );

  for (const el of items) observer.observe(el);
}
