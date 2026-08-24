/** Dot map: highlight the hovered country and name it next to the pointer. */
export function mountWorldMap(root: HTMLElement): void {
  const frame = root.querySelector<HTMLElement>('.worldmap-frame');
  const tooltip = root.querySelector<HTMLElement>('[data-tooltip]');
  if (!frame || !tooltip) return;

  let active: Element | null = null;

  const place = (event: PointerEvent): void => {
    const box = frame.getBoundingClientRect();
    const x = Math.min(Math.max(event.clientX - box.left, 42), box.width - 42);
    tooltip.style.transform = `translate(${x}px, ${event.clientY - box.top}px) translate(-50%, -150%)`;
  };

  const leave = (): void => {
    active = null;
    tooltip.dataset.visible = 'false';
    for (const paint of root.querySelectorAll<SVGElement>('[data-paint]')) delete paint.dataset.active;
  };

  frame.addEventListener('pointermove', (event) => {
    const target = (event.target as Element | null)?.closest('[data-country]');
    if (!target) {
      if (active) leave();
      return;
    }
    if (target !== active) {
      leave();
      active = target;
      const code = (target as HTMLElement).dataset.country;
      tooltip.textContent = (target as HTMLElement).dataset.name ?? '';
      tooltip.dataset.visible = 'true';
      const paint = root.querySelector<SVGElement>(`[data-paint="${code}"]`);
      if (paint) paint.dataset.active = 'true';
    }
    place(event);
  });

  frame.addEventListener('pointerleave', leave);
}
