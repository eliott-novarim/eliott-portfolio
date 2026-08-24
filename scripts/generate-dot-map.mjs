/**
 * Build step: turns a simplified world GeoJSON into the dot matrix consumed by
 * the world map component.
 *
 * Every cell of an equirectangular grid whose centre falls on land becomes one
 * dot. Dots that belong to a visited country carry its code so the component
 * can group them, colour them and make them hoverable. Visited countries too
 * small to catch a cell centre (Malta, Luxembourg, Hong Kong, ...) get one
 * forced dot at their centroid, so the count on screen always matches the list.
 *
 * Output: src/generated/dot-map.json
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { feature } from 'topojson-client';
import { VISITED } from '../src/i18n/countries.ts';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const COLS = 200;
const STEP = 360 / COLS;
const ROWS = 76;
const LAT_MAX = 80;
const LON_MIN = -180;

const byUn = new Map(VISITED.map((c) => [c.un, c.code]));

/* ------------------------------------------------------------------ */

function ringsOf(geometry) {
  if (geometry.type === 'Polygon') return [geometry.coordinates];
  if (geometry.type === 'MultiPolygon') return geometry.coordinates;
  return [];
}

function bboxOf(polygons) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const poly of polygons) {
    for (const [x, y] of poly[0]) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  return { minX, minY, maxX, maxY };
}

/** Even-odd ray casting over every ring of one polygon (outer ring + holes). */
function inPolygon(x, y, poly) {
  let inside = false;
  for (const ring of poly) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i];
      const [xj, yj] = ring[j];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
  }
  return inside;
}

function inFeature(x, y, polygons) {
  for (const poly of polygons) if (inPolygon(x, y, poly)) return true;
  return false;
}

/** Centroid of the largest ring — good enough to place a single dot. */
function representativePoint(polygons) {
  let best = null;
  let bestArea = -1;
  for (const poly of polygons) {
    const ring = poly[0];
    let signed = 0;
    let cx = 0;
    let cy = 0;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const a = ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1];
      signed += a;
      cx += (ring[j][0] + ring[i][0]) * a;
      cy += (ring[j][1] + ring[i][1]) * a;
    }
    signed /= 2;
    const area = Math.abs(signed);
    if (area > bestArea) {
      bestArea = area;
      best = signed === 0 ? ring[0] : [cx / (6 * signed), cy / (6 * signed)];
    }
  }
  return best;
}

const lonOf = (col) => LON_MIN + (col + 0.5) * STEP;
const latOf = (row) => LAT_MAX - (row + 0.5) * STEP;
const colOf = (lon) => Math.round((lon - LON_MIN) / STEP - 0.5);
const rowOf = (lat) => Math.round((LAT_MAX - lat) / STEP - 0.5);

/* ------------------------------------------------------------------ */

const topo = JSON.parse(await readFile(resolve(ROOT, 'node_modules/world-atlas/countries-50m.json'), 'utf8'));
const countries = feature(topo, topo.objects.countries).features;

// -1 = sea, 0 = land, > 0 = index of a visited country + 1
const grid = new Int16Array(COLS * ROWS).fill(-1);
const found = new Map();

for (const f of countries) {
  const polygons = ringsOf(f.geometry);
  if (!polygons.length) continue;
  const code = byUn.get(Number(f.id));
  const mark = code ? VISITED.findIndex((c) => c.code === code) + 1 : 0;
  const { minX, minY, maxX, maxY } = bboxOf(polygons);

  const c0 = Math.max(0, colOf(minX) - 1);
  const c1 = Math.min(COLS - 1, colOf(maxX) + 1);
  const r0 = Math.max(0, rowOf(maxY) - 1);
  const r1 = Math.min(ROWS - 1, rowOf(minY) + 1);

  let hits = 0;
  for (let r = r0; r <= r1; r++) {
    const lat = latOf(r);
    for (let c = c0; c <= c1; c++) {
      if (!inFeature(lonOf(c), lat, polygons)) continue;
      hits++;
      const i = r * COLS + c;
      // A visited country outranks plain land; between two of them, first wins.
      if (grid[i] <= 0) grid[i] = mark;
    }
  }
  if (code) found.set(code, (found.get(code) ?? 0) + hits);
}

// Territories and micro-states that fall between two cell centres.
const forced = [];
for (const country of VISITED) {
  if (found.get(country.code)) continue;
  const f = countries.find((x) => Number(x.id) === country.un);
  if (!f) throw new Error(`No geometry for ${country.code} (UN ${country.un})`);
  const point = representativePoint(ringsOf(f.geometry));
  const mark = VISITED.findIndex((c) => c.code === country.code) + 1;
  let col = Math.max(0, Math.min(COLS - 1, colOf(point[0])));
  let row = Math.max(0, Math.min(ROWS - 1, rowOf(point[1])));
  // Never steal a cell from another visited country: step to the closest free one.
  const taken = (c, r) => grid[r * COLS + c] > 0;
  if (taken(col, row)) {
    outer: for (let ring = 1; ring <= 3; ring++) {
      for (let dr = -ring; dr <= ring; dr++) {
        for (let dc = -ring; dc <= ring; dc++) {
          const c = col + dc;
          const r = row + dr;
          if (c < 0 || r < 0 || c >= COLS || r >= ROWS || taken(c, r)) continue;
          col = c;
          row = r;
          break outer;
        }
      }
    }
  }
  grid[row * COLS + col] = mark;
  forced.push(country.code);
}

/* ------------------------------------------------------------------ */

const land = [];
const visited = Object.fromEntries(VISITED.map((c) => [c.code, []]));

for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    const v = grid[r * COLS + c];
    if (v < 0) continue;
    if (v === 0) land.push(c, r);
    else visited[VISITED[v - 1].code].push(c, r);
  }
}

const out = { cols: COLS, rows: ROWS, land, visited };
await mkdir(resolve(ROOT, 'src/generated'), { recursive: true });
await writeFile(resolve(ROOT, 'src/generated/dot-map.json'), `${JSON.stringify(out)}\n`);

const counts = VISITED.map((c) => `${c.code}:${visited[c.code].length / 2}`).join(' ');
console.log(
  `dot-map: ${COLS}x${ROWS}, ${land.length / 2} land dots, ` +
    `${Object.values(visited).reduce((n, a) => n + a.length / 2, 0)} visited dots`,
);
console.log(`dot-map: ${counts}`);
if (forced.length) console.log(`dot-map: forced a single dot for ${forced.join(', ')}`);
