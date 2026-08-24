import { en, type Strings } from './en.ts';
import { fr } from './fr.ts';

export type Locale = 'en' | 'fr';
export const LOCALES: readonly Locale[] = ['en', 'fr'];
export const DEFAULT_LOCALE: Locale = 'en';

const dictionaries: Record<Locale, Strings> = { en, fr };

export function t(locale: Locale): Strings {
  return dictionaries[locale];
}

/** Root-relative URL of the given locale (the site is a single page). */
export function localeUrl(locale: Locale): string {
  return locale === DEFAULT_LOCALE ? '/' : `/${locale}/`;
}

export function otherLocale(locale: Locale): Locale {
  return locale === 'en' ? 'fr' : 'en';
}

export type { Strings };
