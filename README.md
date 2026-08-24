# eliott-portfolio

Personal portfolio of Eliott Marsiglia. One page, bilingual (EN at `/`, FR at `/fr/`),
fully static Astro output with no UI framework and no runtime dependency.

Spec: [`docs/SPEC.md`](docs/SPEC.md).

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Regenerates build data, then starts the dev server |
| `npm run build` | Regenerates build data, then builds to `dist/` |
| `npm run check` | Astro + TypeScript diagnostics |
| `npm run generate` | Regenerates `src/generated/` on its own |
| `node scripts/preview-hand.mjs [cols]` | Prints the conductor hand to the terminal, to judge the silhouette |

## Generated data

`npm run generate` writes into `src/generated/` and runs automatically before `dev` and `build`:

- **`dot-map.json`** — the world dot matrix, sampled from `world-atlas` at build time.
  Cells are tagged with the visited country they belong to; countries too small to
  catch a cell centre get one forced dot so the on-screen count always matches
  `src/i18n/countries.ts`.
- **`ascii-hand.txt`** — the static ASCII fallback of the signature element, sampled
  from the same geometry the browser rasterises at runtime (`src/lib/hand-geometry.ts`).

## Adding a project preview

Drop `src/assets/projects/<slug>.png` (slug from `src/i18n/en.ts`). The floating hover
preview is already wired and turns itself on for that row as soon as the file exists.

## Content

All copy lives in `src/i18n/en.ts` and `src/i18n/fr.ts`; the two locales share one
component tree. Links and addresses are in `src/data/links.ts`.
