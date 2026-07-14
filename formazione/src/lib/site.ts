import tracking from '../../../tracking.config.json';

export const SITE = {
  name: 'Formazione Tao Veda',
  url: import.meta.env.PUBLIC_SITE_URL || 'https://formazione.tao-veda.org',
  mainSite: 'https://www.tao-veda.org',
  description: 'Percorsi culturali e pratiche personali per conoscere Tao Veda attraverso il corpo.',
  analytics: {
    gtmId: tracking.gtmId,
  },
  foundationalCourseId: 'via-tao-veda',
  donation: {
    iban: import.meta.env.PUBLIC_DONATION_IBAN?.trim() || '',
    accountHolder: import.meta.env.PUBLIC_DONATION_ACCOUNT_HOLDER?.trim() || '',
    reason: 'Donazione libera Formazione Tao Veda',
  },
} as const;

export function courseProgressKey(courseId: string, version: string) {
  return `tao-veda-formazione:${courseId}:${version}`;
}

export function formatPrice(cents: number, currency = 'EUR') {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency,
  }).format(cents / 100);
}

export function paymentReason(courseId: string, enrollmentId: string) {
  return `Formazione ${courseId} ${enrollmentId.slice(0, 8)}`;
}

export const accessLabels = {
  donazione_libera: 'Accesso libero con registrazione · donazione volontaria',
  pagamento_unico: 'Accesso con iscrizione e pagamento unico',
} as const;

export const deliveryLabels = {
  autonomo: 'Online, con ritmo personale',
  accompagnato: 'Online, con accompagnamento',
  coorte: 'Percorso guidato in gruppo',
} as const;

export const typeLabels = {
  studio: 'Lezione',
  pratica: 'Pratica personale',
  integrazione: 'Integrazione',
} as const;
