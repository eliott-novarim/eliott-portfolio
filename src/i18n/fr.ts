import type { Strings } from './en.ts';

export const fr: Strings = {
  htmlLang: 'fr',
  meta: {
    title: 'Eliott Marsiglia',
    description:
      'Eliott Marsiglia — cofondateur de Novarim, finance chez Omega, développement logiciel depuis Bienne, Suisse.',
  },
  nav: {
    theme: 'Changer de thème',
    language: 'English',
    languageCode: 'EN',
    skip: 'Aller au contenu',
  },
  hero: {
    display: 'Intention humaine. Intelligence des machines. Je dirige ce qui vient',
    anchor:
      'Eliott Marsiglia, 21 ans — cofondateur de Novarim. Finance chez Omega le jour, développement logiciel le reste du temps. Bienne, Suisse.',
  },
  experience: {
    label: 'Expérience',
    items: [
      {
        years: '2026 –',
        role: 'Cofondateur',
        org: 'Novarim',
        detail:
          'Agents téléphoniques IA pour les entreprises suisses — Aralys répond, qualifie et fixe les rendez-vous 24h/24.',
      },
      {
        years: '2024 –',
        role: 'Finance & comptabilité',
        org: 'Omega, Bienne',
        detail:
          'Comptabilité des boutiques, prévision de trésorerie hebdomadaire, projets de modernisation des flux de paiement.',
      },
      {
        years: '2023 – 24',
        role: 'Apprentissage de commerce (CFC + maturité)',
        org: 'Omega',
        detail: 'Comptabilité des six boutiques suisses.',
      },
      {
        years: '2022 – 23',
        role: 'Livraison de pizzas',
        org: '',
        detail: 'Les week-ends — commandes, stock, téléphone.',
      },
      {
        years: '2021 – 22',
        role: 'Livraison & service',
        org: 'Crispy Bilby, Bienne',
        detail: 'Premier emploi.',
      },
    ],
  },
  projects: {
    label: 'Projets',
    items: [
      {
        slug: 'alg-club',
        title: 'ALG Club',
        detail: "Plateforme de gestion de patrimoine pour une société d'investissement à Bienne.",
        meta: 'Livré',
      },
      {
        slug: 'nursery-booking',
        title: 'Système de réservation pour crèche',
        detail: 'Réservations en ligne pour une crèche suisse.',
        meta: '2026 · en cours',
      },
      {
        slug: 'showcase-website',
        title: 'Site vitrine',
        detail: "Pour l'entreprise d'un ami de la famille.",
        meta: '2026 · en cours',
      },
    ],
  },
  beyond: {
    label: 'En dehors du travail',
    items: [
      "Fitness & padel — des années de volleyball, arrêté pour se consacrer entièrement à Novarim.",
      '2018 GSX-R 1000R — recouverte à la main en bleu layette.',
    ],
    counter: (n: number) => `${n} pays`,
    values: 'Travailler chaque jour. Être bon avec les gens.',
  },
  footer: {
    emails: {
      personal: 'personnel',
      business: 'professionnel',
    },
  },
};
