/**
 * JSON-LD helper per schema.org — richiamati da BaseLayout e dai layout specifici.
 *
 * NB perimetro: Tao Veda è un approccio al benessere / disciplina bionaturale.
 * NON dichiarare mai tipi sanitari/medici (MedicalBusiness, MedicalClinic, ecc.):
 * sarebbe in contrasto con la Carta dei Principi e con la pagina Confini.
 */
import { SITE } from './site';

const abs = (url: string) => (url.startsWith('http') ? url : `${SITE.url}${url}`);

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.name,
    url: SITE.url,
    logo: abs(SITE.logo),
    description: SITE.description,
    inLanguage: SITE.locale,
    email: SITE.contact.email,
    founder: {
      '@type': 'Person',
      name: 'Dario Pagnoni',
      url: `${SITE.url}/percorso-di-dario`,
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
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    inLanguage: SITE.locale,
    publisher: { '@type': 'Organization', name: SITE.name, url: SITE.url },
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
    name: 'Dario Pagnoni',
    url: `${SITE.url}/percorso-di-dario`,
    description:
      'Fondatore e ideatore iniziale di Tao Veda. Non esercita come operatore olistico al pubblico: il suo percorso di studio e pratica è documentato per trasparenza.',
    knowsAbout: [
      'Ayurveda',
      'Medicina tradizionale cinese',
      'Shiatsu',
      'Discipline bionaturali',
      'Yoga',
      'Tarocchi e simbolo',
    ],
    affiliation: { '@type': 'Organization', name: SITE.name, url: SITE.url },
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
  authorName: string;
  image?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.title,
    description: opts.description,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified ?? opts.datePublished,
    author: { '@type': 'Person', name: opts.authorName },
    publisher: {
      '@type': 'Organization',
      name: SITE.name,
      logo: { '@type': 'ImageObject', url: abs(SITE.logo) },
    },
    mainEntityOfPage: abs(opts.url),
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
