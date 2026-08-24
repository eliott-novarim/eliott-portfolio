/**
 * Conductor's hand — signature silhouette.
 *
 * Single source of truth for the shape. It is expressed as a union of simple
 * primitives (round-capped polylines, tapered polylines, circles, polygons) so
 * that the exact same geometry can be
 *
 *  - emitted as an SVG string and rasterised off-screen in the browser
 *    (`handSvg()` -> <img> -> canvas -> luminance -> character grid), and
 *  - sampled analytically at build time (`sampleCoverage()`) to pre-render the
 *    static ASCII fallback.
 *
 * Both paths therefore produce the same drawing.
 */

export type Point = readonly [number, number];

export type Shape =
  /** Polyline with round caps and round joins, constant radius. */
  | { kind: 'stroke'; pts: readonly Point[]; r: number }
  /** Polyline whose radius interpolates from `r0` (first point) to `r1` (last). */
  | { kind: 'taper'; pts: readonly Point[]; r0: number; r1: number }
  | { kind: 'circle'; c: Point; r: number }
  | { kind: 'polygon'; pts: readonly Point[] };

export const VIEW_W = 120;
export const VIEW_H = 120;

/** Density ramp, sparse to solid. */
export const RAMP = ' .:-=+*#%@';

/** width / height of one character cell in Geist Mono at line-height 1.08. */
export const CELL_ASPECT = 0.6 / 1.08;

/**
 * The hand is authored in its own frame — wrist at the origin, fingers along
 * +Y, thumb side along +X — then placed in the view box by `place()`. Working
 * in hand space keeps the anatomy readable and the pose adjustable.
 */
const ORIGIN: Point = [50, 116];
const SCALE = 1.45;
const ANGLE = (-10 * Math.PI) / 180; // fingers lean slightly to the left
const COS = Math.cos(ANGLE);
const SIN = Math.sin(ANGLE);

/** Hand space -> view box. +X is the thumb side, +Y points up along the fingers. */
function place([lx, ly]: Point): Point {
  return [
    ORIGIN[0] + SCALE * (lx * COS + ly * SIN),
    ORIGIN[1] + SCALE * (lx * SIN - ly * COS),
  ];
}

function toView(s: Shape): Shape {
  switch (s.kind) {
    case 'circle':
      return { kind: 'circle', c: place(s.c), r: s.r * SCALE };
    case 'polygon':
      return { kind: 'polygon', pts: s.pts.map(place) };
    case 'stroke':
      return { kind: 'stroke', pts: s.pts.map(place), r: s.r * SCALE };
    case 'taper':
      return { kind: 'taper', pts: s.pts.map(place), r0: s.r0 * SCALE, r1: s.r1 * SCALE };
  }
}

/**
 * Pose: the forearm enters from the bottom, the hand opens upwards with the
 * four fingers fanned and slightly curved, and the baton leaves the grip
 * between thumb and index towards the upper right, well clear of the fingers.
 */
const LOCAL: readonly Shape[] = [
  // Forearm, cropped by the bottom edge of the frame.
  { kind: 'polygon', pts: [[-6, 1], [6, 1], [8.5, -30], [-8.5, -30]] },
  // Palm — narrow at the wrist, widening to the knuckles.
  { kind: 'taper', pts: [[0, -1], [0, 9], [0.5, 18]], r0: 6.5, r1: 10 },

  // Baton: cork handle inside the palm, shaft leaving past the thumb.
  { kind: 'taper', pts: [[4, 7], [13, 11.5]], r0: 3, r1: 2 },
  { kind: 'taper', pts: [[13, 11.5], [58, 47]], r0: 2, r1: 0.4 },

  // Thumb, curving up so that only its tip presses on the shaft.
  { kind: 'taper', pts: [[6.5, 2], [13, 4.5], [18.5, 10]], r0: 3.6, r1: 2.2 },

  // Index, middle, ring, little — long, slender, gently fanned.
  { kind: 'taper', pts: [[7.5, 18], [10, 30], [11.5, 41]], r0: 3, r1: 1.9 },
  { kind: 'taper', pts: [[2.5, 19], [3.5, 34], [4, 48]], r0: 3.1, r1: 2 },
  { kind: 'taper', pts: [[-2.8, 18.5], [-4.2, 32], [-5, 44]], r0: 3, r1: 1.9 },
  { kind: 'taper', pts: [[-8, 17], [-10, 26], [-11.5, 34]], r0: 2.6, r1: 1.7 },
];

/**
 * Subtractive shapes. They carve the thin separations a pure union cannot
 * express: the shirt cuff and the creases where two fingers meet.
 */
const LOCAL_CUTS: readonly Shape[] = [
  { kind: 'stroke', pts: [[-7.5, -6], [7.5, -6]], r: 0.9 },
  { kind: 'stroke', pts: [[5.2, 20], [6.6, 27]], r: 1.1 },
  { kind: 'stroke', pts: [[0, 20.5], [0, 28]], r: 1.1 },
  { kind: 'stroke', pts: [[-5.2, 20], [-6.4, 27]], r: 1.1 },
];

export const SHAPES: readonly Shape[] = LOCAL.map(toView);
export const CUTS: readonly Shape[] = LOCAL_CUTS.map(toView);

/** Tip of the baton and the grip it pivots around, in view-box coordinates. */
export const BATON_TIP: Point = place([58, 47]);
export const BATON_GRIP: Point = place([13, 11.5]);

/* ------------------------------------------------------------------ *
 * Geometry helpers
 * ------------------------------------------------------------------ */

function polylineLengths(pts: readonly Point[]): { seg: number[]; total: number } {
  const seg: number[] = [];
  let total = 0;
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i]![0] - pts[i - 1]![0];
    const dy = pts[i]![1] - pts[i - 1]![1];
    const d = Math.hypot(dx, dy);
    seg.push(d);
    total += d;
  }
  return { seg, total };
}

/** Radius of a tapered polyline at each of its vertices. */
function taperRadii(pts: readonly Point[], r0: number, r1: number): number[] {
  const { seg, total } = polylineLengths(pts);
  const out = [r0];
  let acc = 0;
  for (let i = 0; i < seg.length; i++) {
    acc += seg[i]!;
    out.push(r0 + (r1 - r0) * (total === 0 ? 1 : acc / total));
  }
  return out;
}

/** Squared distance from a point to a segment. */
function distToSegment(px: number, py: number, a: Point, b: Point): number {
  const vx = b[0] - a[0];
  const vy = b[1] - a[1];
  const wx = px - a[0];
  const wy = py - a[1];
  const len2 = vx * vx + vy * vy;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, (wx * vx + wy * vy) / len2));
  return Math.hypot(wx - t * vx, wy - t * vy);
}

/** Signed "inside" test for a round cone (segment with a radius at each end). */
function insideRoundCone(px: number, py: number, a: Point, b: Point, ra: number, rb: number): boolean {
  const vx = b[0] - a[0];
  const vy = b[1] - a[1];
  const len2 = vx * vx + vy * vy;
  if (len2 === 0) return Math.hypot(px - a[0], py - a[1]) <= Math.max(ra, rb);
  const wx = px - a[0];
  const wy = py - a[1];
  const t = Math.max(0, Math.min(1, (wx * vx + wy * vy) / len2));
  const cx = a[0] + t * vx;
  const cy = a[1] + t * vy;
  return Math.hypot(px - cx, py - cy) <= ra + (rb - ra) * t;
}

function insidePolygon(px: number, py: number, pts: readonly Point[]): boolean {
  let hit = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i]!;
    const [xj, yj] = pts[j]!;
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

function inUnion(shapes: readonly Shape[], x: number, y: number): boolean {
  for (const s of shapes) {
    switch (s.kind) {
      case 'circle':
        if (Math.hypot(x - s.c[0], y - s.c[1]) <= s.r) return true;
        break;
      case 'stroke':
        for (let i = 1; i < s.pts.length; i++) {
          if (distToSegment(x, y, s.pts[i - 1]!, s.pts[i]!) <= s.r) return true;
        }
        break;
      case 'taper': {
        const radii = taperRadii(s.pts, s.r0, s.r1);
        for (let i = 1; i < s.pts.length; i++) {
          if (insideRoundCone(x, y, s.pts[i - 1]!, s.pts[i]!, radii[i - 1]!, radii[i]!)) return true;
        }
        break;
      }
      case 'polygon':
        if (insidePolygon(x, y, s.pts)) return true;
        break;
    }
  }
  return false;
}

/** True when the point is inside the silhouette (union of shapes, minus cuts). */
export function isInside(x: number, y: number): boolean {
  return inUnion(SHAPES, x, y) && !inUnion(CUTS, x, y);
}

/**
 * Coverage of a `cols x rows` grid over the view box, in [0, 1].
 * `sub` is the supersampling factor per axis.
 */
export function sampleCoverage(cols: number, rows: number, sub = 4): Float32Array {
  const out = new Float32Array(cols * rows);
  const cw = VIEW_W / cols;
  const ch = VIEW_H / rows;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let hits = 0;
      for (let sy = 0; sy < sub; sy++) {
        const y = r * ch + ((sy + 0.5) / sub) * ch;
        for (let sx = 0; sx < sub; sx++) {
          const x = c * cw + ((sx + 0.5) / sub) * cw;
          if (isInside(x, y)) hits++;
        }
      }
      out[r * cols + c] = hits / (sub * sub);
    }
  }
  return out;
}

/**
 * Number of rows that keeps the drawing undistorted for a given number of
 * columns, knowing the aspect ratio (width / height) of one character cell.
 */
export function rowsForCols(cols: number, cellAspect: number): number {
  return Math.max(1, Math.round((cols * cellAspect * VIEW_H) / VIEW_W));
}

/* ------------------------------------------------------------------ *
 * SVG emission — the same primitives, drawn as a filled silhouette.
 * ------------------------------------------------------------------ */

function taperPath(pts: readonly Point[], r0: number, r1: number): string {
  // A tapered polyline is emitted as a dense run of circles so that the
  // rasterised result matches `insideRoundCone` exactly.
  const radii = taperRadii(pts, r0, r1);
  const parts: string[] = [];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1]!;
    const b = pts[i]!;
    const ra = radii[i - 1]!;
    const rb = radii[i]!;
    const steps = Math.max(8, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) * 1.5));
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const x = a[0] + (b[0] - a[0]) * t;
      const y = a[1] + (b[1] - a[1]) * t;
      const r = ra + (rb - ra) * t;
      parts.push(`<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${r.toFixed(2)}"/>`);
    }
  }
  return parts.join('');
}

function emit(shapes: readonly Shape[], paint: string): string {
  return shapes
    .map((s) => {
      switch (s.kind) {
        case 'circle':
          return `<circle cx="${s.c[0]}" cy="${s.c[1]}" r="${s.r}"/>`;
        case 'polygon':
          return `<polygon points="${s.pts.map((p) => p.join(',')).join(' ')}"/>`;
        case 'stroke':
          return `<polyline points="${s.pts.map((p) => p.join(',')).join(' ')}" fill="none" stroke="${paint}" stroke-width="${
            s.r * 2
          }" stroke-linecap="round" stroke-linejoin="round"/>`;
        case 'taper':
          return taperPath(s.pts, s.r0, s.r1);
      }
    })
    .join('');
}

/**
 * The silhouette as a standalone SVG document string. It is emitted at four
 * times the view box so that the browser rasterises it well above the size of
 * the character grid — downsampling from there is what gives clean edges and
 * keeps the gaps between the fingers open.
 */
export function handSvg(): string {
  const body = emit(SHAPES, '#fff');
  const cuts = CUTS.length ? `<g fill="#000" stroke="#000">${emit(CUTS, '#000')}</g>` : '';
  const px = VIEW_W * 4;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW_W} ${VIEW_H}" width="${px}" height="${px}">` +
    `<mask id="m" maskUnits="userSpaceOnUse" x="0" y="0" width="${VIEW_W}" height="${VIEW_H}">` +
    `<g fill="#fff" stroke="#fff">${body}</g>${cuts}</mask>` +
    `<rect width="${VIEW_W}" height="${VIEW_H}" fill="#000" mask="url(#m)"/></svg>`
  );
}
