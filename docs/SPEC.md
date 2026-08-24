# eliott-portfolio — Spécification v1

Portfolio personnel d'Eliott Marsiglia. Une page, bilingue, statique.
Inspiration de principes (PAS d'exécution) : youn.engineer — sobriété, typo display
forte, micro-animations soignées, mélange pro/perso. Toute l'exécution visuelle est
propre à ce site.

## Stack

- **Astro**, sortie 100 % statique, zéro framework UI. Animations en CSS/JS vanilla.
- i18n via le routing intégré d'Astro : anglais par défaut (`/`), français (`/fr/`).
  Une seule arborescence de composants ; chaînes dans `src/i18n/en.ts` et `src/i18n/fr.ts`.
  Bascule de langue dans le header (conserve l'ancre de section).
- Fontes auto-hébergées via `@fontsource` :
  - Display : **Instrument Serif** (regular + italic) — titres, phrase du héros.
  - Corps : **Geist** — tout le texte courant.
  - Mono : **Geist Mono** — labels de sections, métadonnées, rendu ASCII.
- Pas d'analytics, pas de cookies, pas de dépendance runtime externe.

## Design system

### Palette (variables CSS, thème clair par défaut + thème sombre)

Direction « éditorial méditerranéen » : ivoire + bleu Égée. Valeurs indicatives,
à ajuster pour un contraste AA minimum :

- Clair : canvas ivoire `#F4F1E8`, encre `#1B1F26`, muted `#5C6470`,
  hairline `#D9D4C5`, accent bleu Égée `#1F4E68`, surface `#FAF8F1`.
- Sombre (bleu encre, pas gris) : canvas `#0E141C`, encre `#E8E6DD`,
  muted `#9AA3AD`, hairline `#2A3441`, accent `#7FAEC9`, surface `#141C26`.
- Toggle thème : respecte `prefers-color-scheme`, persistance localStorage,
  transition douce (~500 ms) désactivée si `prefers-reduced-motion`.

### Typographie

- Phrase héros en Instrument Serif, très grande (clamp ~2.5rem → 4.5rem), interlignage serré.
- Labels de sections en Geist Mono, petites capitales, tracking large, couleur muted.
- Corps en Geist, 1rem/1.6, mesure ~65ch max.

### Animations (toutes désactivées sous `prefers-reduced-motion`)

1. **Cascade au chargement** : chaque bloc apparaît en fondu + translation 8-10px +
   léger blur, délais échelonnés (~70 ms par élément, sections ~200 ms).
2. **Indicateur de survol** : un rectangle doux qui glisse d'une ligne à l'autre
   sur les listes expérience/projets (position animée, pas re-créé).
3. **Aperçu projet au survol** : mécanisme d'image flottante qui suit le curseur
   sur les lignes de projets. Actif uniquement `(hover: hover) and (pointer: fine)`.
   Les images ne sont pas encore fournies : le mécanisme est codé, branché sur
   `src/assets/projects/<slug>.png` — s'active dès qu'un fichier existe, sinon rien.
4. **ASCII signature** (voir ci-dessous).
5. **Carte du monde** (voir ci-dessous).

### Élément signature — main de chef d'orchestre en ASCII

- Sujet : une main tenant une baguette de chef d'orchestre, incarnation de
  « I conduct what comes next ». Sobre, pas gadget.
- Réalisation : silhouette SVG (main + baguette) rasterisée hors écran,
  échantillonnée en luminance → grille de caractères (Geist Mono),
  rendue dans un `<canvas>` ou une grille de `<span>`.
- Animation : scintillement doux des caractères (variation aléatoire lente de
  densité), et une **aura** : halo de caractères clairsemés qui pulse lentement
  autour de la main + la pointe de la baguette trace un léger arc lumineux.
- Fallback : bloc ASCII statique pré-rendu si JS échoue ; `aria-hidden`.
- Position : héros, à droite du texte (desktop), au-dessus (mobile).

### Carte du monde — pays visités

- Carte en **matrice de points** (dot grid) générée à build time depuis un
  GeoJSON monde simplifié : chaque point = une cellule terrestre ; les points des
  pays visités en couleur accent, les autres en hairline.
- Interaction : survol d'un pays visité → son nom en tooltip ; compteur affiché
  (« 32 countries »).
- Pays visités : Cap-Vert, Maroc, Seychelles, Cambodge, Hong Kong, Indonésie,
  Japon, Jordanie, Laos, Myanmar, Sri Lanka, Thaïlande, Turquie, Vietnam,
  Belgique, Croatie, France, Allemagne, Grèce, Islande, Italie, Luxembourg,
  Malte, Pays-Bas, Portugal, Espagne, Suisse, Royaume-Uni, Cuba, Mexique,
  États-Unis, Brésil.

## Contenu (version EN de référence ; FR = traduction fidèle, tutoiement exclu)

### Header

Nom (« Eliott Marsiglia »), bascule EN/FR, bascule thème. Pas de menu — la page
tient en un scroll.

### Héros

- Display : **« Human Intent. Machine Intelligence. I conduct what comes next »**
  (phrase exacte, ponctuation comprise).
- Ligne d'ancrage : « Eliott Marsiglia, 21 — co-founder of Novarim. Finance at
  Omega by day, building software the rest of the time. Bienne, Switzerland. »
- ASCII main d'orchestre.

### Experience (une ligne par entrée, plus récent en premier)

| Années | Rôle | Détail (1 ligne max) |
|---|---|---|
| 2026 – | Co-founder, **Novarim** | AI phone agents for Swiss businesses — Aralys answers, qualifies and books appointments 24/7. |
| 2024 – | Finance & Accounting, **Omega**, Bienne | Boutique accounting, weekly cash forecasting, payment-flow modernization projects. |
| 2023 – 24 | Commercial apprenticeship (CFC + maturité), **Omega** | Accounting for the six Swiss boutiques. |
| 2022 – 23 | Pizza delivery | Weekends — orders, stock, phone. |
| 2021 – 22 | Delivery & service, **Crispy Bilby**, Bienne | First job. |

### Projects (3 lignes, mécanisme d'aperçu au survol prêt)

1. **ALG Club** — wealth-management platform for an investment company in Bienne.
   Shipped. (Lien live : à fournir — issue ouverte.)
2. **Nursery booking system** — online reservations for a Swiss nursery.
   2026 · in progress. Ouvrira une mini étude de cas (problème → solution) quand
   le contenu sera fourni (issue ouverte) ; d'ici là, ligne simple sans lien.
3. **Showcase website** — for a family friend's business. 2026 · in progress.

### Beyond work

- Fitness & padel — « played volleyball for years, stopped to go all-in on Novarim ».
- La moto : **2018 GSX-R 1000R**, covering baby blue fait main
  (« wrapped it myself in baby blue »).
- **Carte du monde** des 32 pays visités.
- Ligne de valeurs (une seule, sèche) : EN « Work every day. Be good to people. » /
  FR « Travailler chaque jour. Être bon avec les gens. »

### Footer

- Liens : **Promethee** (https://www.promethee.io/@eliott) · **LinkedIn**
  (https://www.linkedin.com/in/eliott-marsiglia-244a4b298/) · **GitHub**
  (https://github.com/eliott-novarim).
- E-mails étiquetés : personal `marsigliaeliott@gmail.com` ·
  business `eliott.marsiglia@novarim.ch`.
- X sera ajouté quand le compte sera prêt (issue ouverte).

## Contraintes

- Accessibilité : navigation clavier complète, focus visibles, contrastes AA,
  `prefers-reduced-motion` respecté partout, ASCII décoratif en `aria-hidden`.
- Performance : pas de librairie d'animation, images en lazy-loading,
  Lighthouse ≥ 95 sur les quatre axes visé.
- Pas de texte d'accompagnement superflu dans l'UI (règle globale du repo owner) :
  un titre ou label concis par élément, pas de sous-titres descriptifs.
- Déploiement : plus tard (Cloudflare Pages + domaine) — hors périmètre v1.
