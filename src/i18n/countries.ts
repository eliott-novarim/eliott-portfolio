/**
 * The 32 countries and territories visited, in the order they are listed in the
 * spec. `un` is the UN M49 numeric code used by Natural Earth / world-atlas,
 * which is how the build-time dot map resolves each shape.
 */
export interface Country {
  readonly code: string;
  readonly un: number;
  readonly en: string;
  readonly fr: string;
}

export const VISITED: readonly Country[] = [
  { code: 'cv', un: 132, en: 'Cape Verde', fr: 'Cap-Vert' },
  { code: 'ma', un: 504, en: 'Morocco', fr: 'Maroc' },
  { code: 'sc', un: 690, en: 'Seychelles', fr: 'Seychelles' },
  { code: 'kh', un: 116, en: 'Cambodia', fr: 'Cambodge' },
  { code: 'hk', un: 344, en: 'Hong Kong', fr: 'Hong Kong' },
  { code: 'id', un: 360, en: 'Indonesia', fr: 'Indonésie' },
  { code: 'jp', un: 392, en: 'Japan', fr: 'Japon' },
  { code: 'jo', un: 400, en: 'Jordan', fr: 'Jordanie' },
  { code: 'la', un: 418, en: 'Laos', fr: 'Laos' },
  { code: 'mm', un: 104, en: 'Myanmar', fr: 'Myanmar' },
  { code: 'lk', un: 144, en: 'Sri Lanka', fr: 'Sri Lanka' },
  { code: 'th', un: 764, en: 'Thailand', fr: 'Thaïlande' },
  { code: 'tr', un: 792, en: 'Turkey', fr: 'Turquie' },
  { code: 'vn', un: 704, en: 'Vietnam', fr: 'Vietnam' },
  { code: 'be', un: 56, en: 'Belgium', fr: 'Belgique' },
  { code: 'hr', un: 191, en: 'Croatia', fr: 'Croatie' },
  { code: 'fr', un: 250, en: 'France', fr: 'France' },
  { code: 'de', un: 276, en: 'Germany', fr: 'Allemagne' },
  { code: 'gr', un: 300, en: 'Greece', fr: 'Grèce' },
  { code: 'is', un: 352, en: 'Iceland', fr: 'Islande' },
  { code: 'it', un: 380, en: 'Italy', fr: 'Italie' },
  { code: 'lu', un: 442, en: 'Luxembourg', fr: 'Luxembourg' },
  { code: 'mt', un: 470, en: 'Malta', fr: 'Malte' },
  { code: 'nl', un: 528, en: 'Netherlands', fr: 'Pays-Bas' },
  { code: 'pt', un: 620, en: 'Portugal', fr: 'Portugal' },
  { code: 'es', un: 724, en: 'Spain', fr: 'Espagne' },
  { code: 'ch', un: 756, en: 'Switzerland', fr: 'Suisse' },
  { code: 'gb', un: 826, en: 'United Kingdom', fr: 'Royaume-Uni' },
  { code: 'cu', un: 192, en: 'Cuba', fr: 'Cuba' },
  { code: 'mx', un: 484, en: 'Mexico', fr: 'Mexique' },
  { code: 'us', un: 840, en: 'United States', fr: 'États-Unis' },
  { code: 'br', un: 76, en: 'Brazil', fr: 'Brésil' },
];

export const VISITED_COUNT = VISITED.length;
