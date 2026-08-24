/**
 * Floating project preview.
 *
 * The mechanism is always in place; it only mounts for rows that actually carry
 * an image (`src/assets/projects/<slug>.png`), on fine-pointer devices, and
 * never under `prefers-reduced-motion`.
 */
const OFFSET_X = 26;
const SMOOTHING = 0.18;
const MARGIN = 14;

export function mountProjectPreview(): void {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const rows = Array.from(document.querySelectorAll<HTMLElement>('[data-preview]')).filter(
    (row) => (row.dataset.preview ?? '') !== '',
  );
  if (!rows.length) return;

  const card = document.createElement('div');
  card.className = 'project-preview';
  card.setAttribute('aria-hidden', 'true');
  const img = document.createElement('img');
  img.alt = '';
  img.loading = 'lazy';
  img.decoding = 'async';
  card.append(img);
  document.body.append(card);

  let targetX = 0;
  let targetY = 0;
  let x = 0;
  let y = 0;
  let visible = false;
  let placed = false;
  let raf = 0;

  const aim = (event: PointerEvent): void => {
    const width = card.offsetWidth;
    const height = card.offsetHeight;
    targetX = Math.min(Math.max(event.clientX + OFFSET_X, MARGIN), window.innerWidth - width - MARGIN);
    targetY = Math.min(Math.max(event.clientY - height / 2, MARGIN), window.innerHeight - height - MARGIN);
    if (!placed) {
      x = targetX;
      y = targetY;
      placed = true;
    }
  };

  const frame = (): void => {
    x += (targetX - x) * SMOOTHING;
    y += (targetY - y) * SMOOTHING;
    card.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    if (visible || Math.abs(targetX - x) > 0.5 || Math.abs(targetY - y) > 0.5) {
      raf = requestAnimationFrame(frame);
    } else {
      raf = 0;
    }
  };

  const run = (): void => {
    if (!raf) raf = requestAnimationFrame(frame);
  };

  for (const row of rows) {
    row.addEventListener('pointerenter', (event) => {
      const src = row.dataset.preview;
      if (!src) return;
      if (img.getAttribute('src') !== src) img.setAttribute('src', src);
      aim(event as PointerEvent);
      visible = true;
      card.dataset.visible = 'true';
      run();
    });

    row.addEventListener('pointermove', (event) => {
      aim(event as PointerEvent);
      run();
    });

    row.addEventListener('pointerleave', () => {
      visible = false;
      card.dataset.visible = 'false';
      placed = false;
    });
  }
}
