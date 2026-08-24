/**
 * Build step: pre-renders the conductor hand as a static block of characters.
 *
 * It samples exactly the geometry the browser rasterises at runtime, so the
 * no-JS fallback is the same drawing, only at a fixed resolution.
 *
 * Output: src/generated/ascii-hand.txt
 */
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sampleCoverage, rowsForCols, RAMP, CELL_ASPECT } from '../src/lib/hand-geometry.ts';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const COLS = 60;
const ROWS = rowsForCols(COLS, CELL_ASPECT);

const coverage = sampleCoverage(COLS, ROWS, 4);
const lines = [];
for (let r = 0; r < ROWS; r++) {
  let line = '';
  for (let c = 0; c < COLS; c++) {
    const v = coverage[r * COLS + c];
    line += v < 0.04 ? ' ' : RAMP[Math.min(RAMP.length - 1, Math.max(1, Math.round(v * (RAMP.length - 1))))];
  }
  lines.push(line.replace(/\s+$/, ''));
}

await mkdir(resolve(ROOT, 'src/generated'), { recursive: true });
await writeFile(resolve(ROOT, 'src/generated/ascii-hand.txt'), `${lines.join('\n')}\n`);
console.log(`ascii-hand: ${COLS}x${ROWS} characters`);
