/**
 * Dev helper: prints the conductor hand silhouette to the terminal so the
 * proportions can be judged in the medium they ship in.
 *
 *   node scripts/preview-hand.mjs [cols]
 */
import { sampleCoverage, rowsForCols } from '../src/lib/hand-geometry.ts';

const cols = Number(process.argv[2] ?? 72);
const rows = rowsForCols(cols, 0.55);
const cov = sampleCoverage(cols, rows, 4);

const RAMP = ' .:-=+*#%@';
let out = '';
for (let r = 0; r < rows; r++) {
  let line = '';
  for (let c = 0; c < cols; c++) {
    const v = cov[r * cols + c];
    line += v === 0 ? ' ' : RAMP[Math.min(RAMP.length - 1, Math.max(1, Math.round(v * (RAMP.length - 1))))];
  }
  out += line.replace(/\s+$/, '') + '\n';
}
process.stdout.write(`${cols} x ${rows}\n${out}`);
