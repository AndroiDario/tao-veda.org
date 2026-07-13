/**
 * JSON-LD helper per schema.org — richiamati da BaseLayout e dai layout specifici.
 *
 * NB perimetro: Tao Veda è un approccio al benessere / disciplina bionaturale.
 * NON dichiarare mai tipi sanitari/medici (MedicalBusiness, MedicalClinic, ecc.):
 * sarebbe in contrasto con la Carta dei Principi e con la pagina Confini.
 */
import { AUTHOR, SITE } from './site';

const abs = (url: string) => (url.startsWith('http') ? url : `${SITE.url}${url}`);

export const ENTITY_IDS = {
  organization: `${SITE.url}/#organization`,
  website: `${SITE.url}/#website`,
  author: `${AUTHOR.url}#person`,
} as const;

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ENTITY_IDS.organization,
    name: SITE.name,
    url: SITE.url,
    logo: abs(SITE.logo),
    description: SITE.description,
    inLanguage: SITE.locale,
    email: SITE.contact.email,
    founder: {
      '@type': 'Person',
      '@id': ENTITY_IDS.author,
      name: AUTHOR.name,
      url: AUTHOR.url,
    },
    sameAs: Object.values(SITE.social).filter(Boolean),
  };
}

/**
 * WebSite per la homepage. Niente SearchAction: il sito non ha una ricerca interna.
 */
export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': ENTITY_IDS.website,
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    inLanguage: SITE.locale,
    publisher: { '@id': ENTITY_IDS.organization },
  };
}

/**
 * Person per la pagina del fondatore. Nessun jobTitle: Dario non opera al
 * pubblico e la pagina esiste per trasparenza, non come profilo professionale.
 */
export function personSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': ENTITY_IDS.author,
    name: AUTHOR.name,
    url: AUTHOR.url,
    description: AUTHOR.description,
    knowsAbout: [
      'Ayurveda',
      'Medicina tradizionale cinese',
      'Shiatsu',
      'Discipline bionaturali',
      'Yoga',
      'Tarocchi e simbolo',
    ],
    affiliation: { '@id': ENTITY_IDS.organization },
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: it.name,
      item: abs(it.url),
    })),
  };
}

export function articleSchema(opts: {
  title: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  authorName?: string;
  authorUrl?: string;
  image?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.title,
    description: opts.description,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified ?? opts.datePublished,
    author: {
      '@type': 'Person',
      '@id': opts.authorUrl ? `${opts.authorUrl}#person` : ENTITY_IDS.author,
      name: opts.authorName ?? AUTHOR.name,
      url: opts.authorUrl ?? AUTHOR.url,
    },
    publisher: {
      '@type': 'Organization',
      '@id': ENTITY_IDS.organization,
      name: SITE.name,
      logo: { '@type': 'ImageObject', url: abs(SITE.logo) },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': abs(opts.url) },
    image: opts.image ? abs(opts.image) : abs(SITE.defaultOgImage),
    inLanguage: SITE.locale,
  };
}

export function faqPageSchema(items: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.question,
      acceptedAnswer: { '@type': 'Answer', text: it.answer },
    })),
  };
}

/**
 * Cuore della strategia GEO: ogni voce di glossario è un DefinedTerm citabile.
 */
export function definedTermSchema(opts: {
  name: string;
  description: string;
  url: string;
  termSet?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    name: opts.name,
    description: opts.description,
    url: abs(opts.url),
    inDefinedTermSet: opts.termSet ? abs(opts.termSet) : `${SITE.url}/conoscenza/glossario`,
  };
}
