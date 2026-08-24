# Handoff — état du chantier au 24.08.2026

Pour reprendre ce chantier dans une session neuve, lire ce fichier puis `docs/SPEC.md`.

## Où on en est

La **v1 complète est mergée sur `main`** (PR #7). Site Astro statique bilingue
(EN à la racine, FR sous `/fr/`), une page : héros avec la devise « Human Intent.
Machine Intelligence. I conduct what comes next » et la main de chef d'orchestre en
ASCII animé, expérience (5 lignes), projets (3), section perso avec carte du monde en
points (32 pays), footer Promethee/LinkedIn/GitHub + e-mails. Thème clair/sombre,
cascade d'apparition, tout coupé sous `prefers-reduced-motion`.

Lancer : `npm install && npm run dev` → http://localhost:4321 et `/fr/`.
Build : `npm run build` (doit sortir `/` et `/fr/` sans erreur).

## Décisions verrouillées (ne pas re-débattre)

- `docs/SPEC.md` est la spec de référence, issue d'un grill complet avec Eliott.
- Inspiration youn.engineer = **principes seulement**. Interdits (trop proches de
  Youn, qu'Eliott a contacté sur Promethee) : buste/statue antique ASCII, fontes
  pixel, palette vert-crème.
- Direction actée : éditorial méditerranéen — Instrument Serif + Geist + Geist Mono,
  ivoire/bleu Égée, sombre bleu encre.
- Domaine + déploiement (Cloudflare Pages) volontairement reportés après finition
  (issue #4).
- Pas de sous-titres/texte d'accompagnement dans l'UI (règle globale d'Eliott).
- Aucune mention de Claude dans les commits ni les PR ; corps de PR auto-suffisant
  avec captures.

## Backlog (issues GitHub du repo)

1. **#1 Captures des projets** — l'aperçu au survol est câblé, il attend des images
   dans `src/assets/projects/<slug>.png` (slugs : voir `src/data/links.ts` /
   composant Projects). C'est la retouche au meilleur rapport effort/effet.
2. **#2 Étude de cas crèche** — contenu problème → solution à rédiger avec Eliott
   (EN + FR), puis une mini-page ou section liée à la ligne projet.
3. **#3 URLs live des projets** (ALG Club, site vitrine).
4. **#4 Domaine + Cloudflare Pages.**
5. **#5 Ajouter X au footer** quand le compte Pro est certifié.
6. **#6 Habiller le profil GitHub** `eliott-novarim` (photo, bio, repos épinglés,
   activer « Include private contributions »).

## Outils propres au chantier

- **Main ASCII** : géométrie unique dans `src/lib/hand-geometry.ts` ; prévisualiser
  en terminal avec `node scripts/preview-hand.mjs` AVANT tout screenshot navigateur.
  Elle a été retravaillée une fois (l'originale ressemblait à un oiseau) ; elle peut
  encore gagner en finesse — à juger avec Eliott sur l'animation réelle.
- **Carte du monde** : régénérée à build time par `scripts/generate-dot-map.mjs`
  (liste des pays visités dans la spec / i18n).
- Captures de référence de la v1 : `docs/screenshots/`.

## Points signalés par la design review, non traités

- La carte est petite sur mobile (grille 200 colonnes à 390 px).
- Le fallback no-JS de la main (`<pre>`) rend plus petit que le canvas animé.
- Le héros ASCII est plafonné à 28 rem — décider s'il grandit sur écrans larges.
- Légères traînées translucides sous le header sticky en mode clair pendant le
  scroll (artefact du masque/blur) — à vérifier, cosmétique.
