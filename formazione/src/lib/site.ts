import tracking from '../../../tracking.config.json';

export const SITE = {
  name: 'Formazione Tao Veda',
  url: import.meta.env.PUBLIC_SITE_URL || 'https://formazione.tao-veda.org',
  mainSite: 'https://www.tao-veda.org',
  description: 'Percorsi culturali e pratiche personali per conoscere Tao Veda attraverso il corpo.',
  analytics: {
    gtmId: tracking.gtmId,
  },
  courseId: 'via-tao-veda',
  courseVersion: '1.1',
  progressKey: 'tao-veda-formazione:via-tao-veda:1.1',
  donation: {
    iban: import.meta.env.PUBLIC_DONATION_IBAN?.trim() || '',
    accountHolder: import.meta.env.PUBLIC_DONATION_ACCOUNT_HOLDER?.trim() || '',
    reason: 'Offerta libera Formazione Tao Veda',
  },
} as const;

export const typeLabels = {
  studio: 'Lezione',
  pratica: 'Pratica personale',
  integrazione: 'Integrazione',
} as const;
