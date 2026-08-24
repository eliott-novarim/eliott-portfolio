export const en = {
  htmlLang: 'en',
  meta: {
    title: 'Eliott Marsiglia',
    description:
      'Eliott Marsiglia — co-founder of Novarim, finance at Omega, building software from Bienne, Switzerland.',
  },
  nav: {
    theme: 'Switch theme',
    language: 'Français',
    languageCode: 'FR',
    skip: 'Skip to content',
  },
  hero: {
    display: 'Human Intent. Machine Intelligence. I conduct what comes next',
    anchor:
      'Eliott Marsiglia, 21 — co-founder of Novarim. Finance at Omega by day, building software the rest of the time. Bienne, Switzerland.',
  },
  experience: {
    label: 'Experience',
    items: [
      {
        years: '2026 –',
        role: 'Co-founder',
        org: 'Novarim',
        detail: 'AI phone agents for Swiss businesses — Aralys answers, qualifies and books appointments 24/7.',
      },
      {
        years: '2024 –',
        role: 'Finance & Accounting',
        org: 'Omega, Bienne',
        detail: 'Boutique accounting, weekly cash forecasting, payment-flow modernization projects.',
      },
      {
        years: '2023 – 24',
        role: 'Commercial apprenticeship (CFC + maturité)',
        org: 'Omega',
        detail: 'Accounting for the six Swiss boutiques.',
      },
      {
        years: '2022 – 23',
        role: 'Pizza delivery',
        org: '',
        detail: 'Weekends — orders, stock, phone.',
      },
      {
        years: '2021 – 22',
        role: 'Delivery & service',
        org: 'Crispy Bilby, Bienne',
        detail: 'First job.',
      },
    ],
  },
  projects: {
    label: 'Projects',
    items: [
      {
        slug: 'alg-club',
        title: 'ALG Club',
        detail: 'Wealth-management platform for an investment company in Bienne.',
        meta: 'Shipped',
      },
      {
        slug: 'nursery-booking',
        title: 'Nursery booking system',
        detail: 'Online reservations for a Swiss nursery.',
        meta: '2026 · in progress',
      },
      {
        slug: 'showcase-website',
        title: 'Showcase website',
        detail: "For a family friend's business.",
        meta: '2026 · in progress',
      },
    ],
  },
  beyond: {
    label: 'Beyond work',
    items: [
      'Fitness & padel — played volleyball for years, stopped to go all-in on Novarim.',
      '2018 GSX-R 1000R — wrapped it myself in baby blue.',
    ],
    counter: (n: number) => `${n} countries`,
    values: 'Work every day. Be good to people.',
  },
  footer: {
    emails: {
      personal: 'personal',
      business: 'business',
    },
  },
};

export type Strings = typeof en;
