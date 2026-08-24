/**
 * Hover indicator: one soft rectangle per list that slides from row to row
 * instead of being re-created, and follows keyboard focus as well.
 */
export function mountRows(): void {
  for (const list of document.querySelectorAll<HTMLElement>('[data-rows]')) {
    const marker = list.querySelector<HTMLElement>('.row-marker');
    if (!marker) continue;

    const moveTo = (row: HTMLElement): void => {
      marker.style.setProperty('--marker-y', `${row.offsetTop}px`);
      marker.style.height = `${row.offsetHeight}px`;
      list.dataset.marker = 'on';
    };

    const clear = (): void => {
      list.dataset.marker = 'off';
    };

    for (const row of list.querySelectorAll<HTMLElement>('[data-row]')) {
      row.addEventListener('pointerenter', () => moveTo(row));
      row.addEventListener('focusin', () => moveTo(row));
    }

    list.addEventListener('pointerleave', clear);
    list.addEventListener('focusout', (event) => {
      const next = (event as FocusEvent).relatedTarget;
      if (!(next instanceof Node) || !list.contains(next)) clear();
    });
  }
}
