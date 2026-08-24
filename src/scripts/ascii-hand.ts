/**
 * Signature element: the conductor's hand, rasterised from the SVG silhouette
 * and redrawn as a grid of Geist Mono characters.
 *
 *  1. `handSvg()` is rendered off-screen into a canvas one pixel per character.
 *  2. That bitmap is sampled in luminance to get a coverage value per cell.
 *  3. Each frame draws the cells with a slow shimmer, a sparse pulsing aura
 *     around the silhouette, and a light arc traced at the tip of the baton.
 *
 * Everything animated is skipped under `prefers-reduced-motion`, where a single
 * static frame is drawn instead.
 */
import { handSvg, VIEW_W, VIEW_H, RAMP, BATON_TIP, BATON_GRIP } from '../lib/hand-geometry.ts';

const MONO = '"Geist Mono", ui-monospace, monospace';
const LINE_HEIGHT = 1.08;
const ALPHA_LEVELS = 10;
const FPS = 18;
const SS = 4;
const AURA_CHARS = ['.', '·', ':'];

interface AuraDot {
  x: number;
  y: number;
  phase: number;
  amp: number;
  char: string;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Two-pass chamfer distance to the silhouette, in cell units. */
function distanceField(cov: Float32Array, cols: number, rows: number): Float32Array {
  const d = new Float32Array(cols * rows).fill(1e6);
  for (let i = 0; i < d.length; i++) if (cov[i]! > 0.3) d[i] = 0;
  const at = (c: number, r: number) => (c < 0 || r < 0 || c >= cols || r >= rows ? 1e6 : d[r * cols + c]!);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      d[i] = Math.min(d[i]!, at(c - 1, r) + 1, at(c, r - 1) + 1, at(c - 1, r - 1) + 1.414, at(c + 1, r - 1) + 1.414);
    }
  }
  for (let r = rows - 1; r >= 0; r--) {
    for (let c = cols - 1; c >= 0; c--) {
      const i = r * cols + c;
      d[i] = Math.min(d[i]!, at(c + 1, r) + 1, at(c, r + 1) + 1, at(c + 1, r + 1) + 1.414, at(c - 1, r + 1) + 1.414);
    }
  }
  return d;
}

export async function mountAsciiHand(root: HTMLElement): Promise<void> {
  const canvasNode = root.querySelector('canvas');
  const context = canvasNode?.getContext('2d');
  if (!canvasNode || !context) return;
  const canvas: HTMLCanvasElement = canvasNode;
  const ctx: CanvasRenderingContext2D = context;

  const image = new Image();
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(handSvg())}`;
  try {
    await image.decode();
    if (document.fonts) {
      await document.fonts.load(`12px ${MONO}`);
      await document.fonts.ready;
    }
  } catch {
    return; // keep the pre-rendered fallback
  }

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  let cols = 0;
  let rows = 0;
  let cellW = 0;
  let cellH = 0;
  let fontSize = 0;
  let cov = new Float32Array(0);
  let shimmer = new Float32Array(0);
  let aura: AuraDot[] = [];
  let arc: { x: number; y: number }[] = [];
  let ink = '#000';

  ctx.font = `100px ${MONO}`;
  const advance = ctx.measureText('M').width / 100 || 0.6;

  function readInk(): void {
    ink = getComputedStyle(root).color || '#000';
  }

  function build(): boolean {
    const w = root.clientWidth;
    const h = root.clientHeight;
    if (w < 40 || h < 40) return false;

    cols = Math.round(Math.min(72, Math.max(38, w / 6.4)));
    cellW = w / cols;
    fontSize = cellW / advance;
    cellH = fontSize * LINE_HEIGHT;
    rows = Math.max(8, Math.floor(h / cellH));

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);

    // Rasterise the silhouette at SS x SS samples per character cell, then box
    // average each cell. Letting the browser downscale straight to the grid
    // spreads the shape by half a cell and closes the gaps between the fingers.
    const off = document.createElement('canvas');
    off.width = cols * SS;
    off.height = rows * SS;
    const octx = off.getContext('2d', { willReadFrequently: true });
    if (!octx) return false;
    octx.imageSmoothingEnabled = true;
    octx.imageSmoothingQuality = 'high';
    octx.fillStyle = '#ffffff';
    octx.fillRect(0, 0, off.width, off.height);

    const scale = Math.min((cols * cellW) / VIEW_W, (rows * cellH) / VIEW_H);
    const dw = (VIEW_W * scale) / cellW;
    const dh = (VIEW_H * scale) / cellH;
    const dx = (cols - dw) / 2;
    const dy = (rows - dh) / 2;
    octx.drawImage(image, dx * SS, dy * SS, dw * SS, dh * SS);

    const pixels = octx.getImageData(0, 0, off.width, off.height).data;
    cov = new Float32Array(cols * rows);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let sum = 0;
        for (let sy = 0; sy < SS; sy++) {
          const base = ((r * SS + sy) * off.width + c * SS) * 4;
          for (let sx = 0; sx < SS; sx++) sum += 1 - pixels[base + sx * 4]! / 255;
        }
        cov[r * cols + c] = sum / (SS * SS);
      }
    }

    // View-box point -> cell coordinates.
    const toCell = (p: readonly [number, number]) => ({
      x: dx + (p[0] * scale) / cellW,
      y: dy + (p[1] * scale) / cellH,
    });

    const rand = mulberry32(0x51ff);
    shimmer = new Float32Array(cols * rows * 2);
    for (let i = 0; i < cols * rows; i++) {
      shimmer[i * 2] = rand() * Math.PI * 2;
      shimmer[i * 2 + 1] = 0.35 + rand() * 0.5;
    }

    // Sparse aura: a thinning halo of characters around the silhouette.
    const dist = distanceField(cov, cols, rows);
    aura = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        const d = dist[i]!;
        if (cov[i]! > 0.05 || d < 1.2 || d > 7) continue;
        if (rand() > 0.22 * Math.exp(-(d - 1.2) / 3)) continue;
        aura.push({
          x: c,
          y: r,
          phase: rand() * Math.PI * 2,
          amp: (0.3 + rand() * 0.35) * Math.exp(-d / 6),
          char: AURA_CHARS[Math.floor(rand() * AURA_CHARS.length)]!,
        });
      }
    }

    // Light arc traced by the tip of the baton.
    const tip = toCell(BATON_TIP);
    const grip = toCell(BATON_GRIP);
    const vx = tip.x - grip.x;
    const vy = tip.y - grip.y;
    const len = Math.hypot(vx, vy) || 1;
    const radius = Math.max(4, cols * 0.2);
    const cx = tip.x - (vx / len) * radius;
    const cy = tip.y - (vy / len) * radius;
    const a0 = Math.atan2(tip.y - cy, tip.x - cx);
    arc = [];
    const steps = 40;
    for (let s = 0; s < steps; s++) {
      const a = a0 - 0.85 + (1.5 * s) / (steps - 1);
      const x = Math.round(cx + radius * Math.cos(a));
      const y = Math.round(cy + radius * Math.sin(a) * (cellW / cellH));
      const last = arc[arc.length - 1];
      if (x < 0 || y < 0 || x >= cols || y >= rows) continue;
      if (last && last.x === x && last.y === y) continue;
      arc.push({ x, y });
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    return true;
  }

  const batchChars: string[][] = Array.from({ length: ALPHA_LEVELS }, () => []);
  const batchXY: number[][] = Array.from({ length: ALPHA_LEVELS }, () => []);

  function push(level: number, char: string, col: number, row: number): void {
    const l = Math.max(0, Math.min(ALPHA_LEVELS - 1, level));
    batchChars[l]!.push(char);
    batchXY[l]!.push(col * cellW, (row + 0.5) * cellH);
  }

  function draw(time: number, animate: boolean): void {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${fontSize.toFixed(2)}px ${MONO}`;
    ctx.fillStyle = ink;
    for (let l = 0; l < ALPHA_LEVELS; l++) {
      batchChars[l]!.length = 0;
      batchXY[l]!.length = 0;
    }

    const t = time / 1000;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        const base = cov[i]!;
        if (base < 0.05) continue;
        // The shimmer rides on the opacity only: the silhouette itself stays put.
        const flicker = animate ? 0.84 + 0.16 * Math.sin(t * shimmer[i * 2 + 1]! + shimmer[i * 2]!) : 1;
        const density = Math.min(1, base);
        const char = RAMP[Math.max(1, Math.round(density * (RAMP.length - 1)))]!;
        push(Math.round((0.48 + 0.52 * density) * flicker * (ALPHA_LEVELS - 1)), char, c, r);
      }
    }

    if (animate) {
      const breath = 0.6 + 0.4 * Math.sin(t * 0.45);
      for (const dot of aura) {
        const a = dot.amp * breath * (0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 0.7 + dot.phase)));
        if (a < 0.06) continue;
        push(Math.round(a * (ALPHA_LEVELS - 1)), dot.char, dot.x, dot.y);
      }

      if (arc.length) {
        const period = 5.2;
        const head = ((t % period) / period) * arc.length;
        const tail = arc.length * 0.3;
        for (let k = 0; k < arc.length; k++) {
          const age = (head - k + arc.length) % arc.length;
          if (age > tail) continue;
          const a = (1 - age / tail) ** 1.6;
          if (a < 0.08) continue;
          const point = arc[k]!;
          push(Math.round(a * (ALPHA_LEVELS - 1)), a > 0.62 ? '*' : a > 0.3 ? '+' : '·', point.x, point.y);
        }
      }
    }

    for (let l = ALPHA_LEVELS - 1; l >= 0; l--) {
      const chars = batchChars[l]!;
      if (!chars.length) continue;
      ctx.globalAlpha = (l + 1) / ALPHA_LEVELS;
      const xy = batchXY[l]!;
      for (let n = 0; n < chars.length; n++) ctx.fillText(chars[n]!, xy[n * 2]!, xy[n * 2 + 1]!);
    }
    ctx.globalAlpha = 1;
  }

  let raf = 0;
  let last = 0;
  let visible = true;
  let running = false;

  function loop(time: number): void {
    raf = requestAnimationFrame(loop);
    if (time - last < 1000 / FPS) return;
    last = time;
    draw(time, true);
  }

  function stop(): void {
    if (!running) return;
    running = false;
    cancelAnimationFrame(raf);
  }

  function start(): void {
    if (running || reduced.matches || !visible || document.hidden) return;
    running = true;
    last = 0;
    raf = requestAnimationFrame(loop);
  }

  function render(): void {
    readInk();
    if (!build()) return;
    root.dataset.live = 'true';
    stop();
    draw(performance.now(), !reduced.matches);
    start();
  }

  render();

  let resizeTimer = 0;
  const observer = new ResizeObserver(() => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(render, 160);
  });
  observer.observe(root);

  new IntersectionObserver(
    (entries) => {
      visible = entries[0]?.isIntersecting ?? true;
      if (visible) start();
      else stop();
    },
    { rootMargin: '120px' },
  ).observe(root);

  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  reduced.addEventListener('change', render);
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    readInk();
    draw(performance.now(), false);
  });
  new MutationObserver(() => {
    readInk();
    if (!running) draw(performance.now(), false);
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
}
