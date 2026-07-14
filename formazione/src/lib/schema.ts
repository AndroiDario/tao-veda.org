import { SITE } from './site';

export const ENTITY_IDS = {
  organization: `${SITE.mainSite}/#organization`,
  website: `${SITE.url}/#website`,
} as const;

export function organizationRef() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ENTITY_IDS.organization,
    name: 'Tao Veda',
    url: SITE.mainSite,
    logo: `${SITE.mainSite}/assets/logo/tao-veda-logo-oro-su-nero.svg`,
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': ENTITY_IDS.website,
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    inLanguage: 'it-IT',
    publisher: { '@id': ENTITY_IDS.organization },
  };
}

export function courseSchema(course: {
  id: string;
  name: string;
  description: string;
  url: string;
  version: string;
  duration: string;
  access: 'donazione_libera' | 'pagamento_unico';
  priceCents?: number;
  currency: string;
}) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    '@id': `${course.url}#course`,
    url: course.url,
    name: course.name,
    description: course.description,
    inLanguage: 'it-IT',
    isAccessibleForFree: course.access === 'donazione_libera',
    provider: { '@id': ENTITY_IDS.organization },
    courseCode: `${course.id}-${course.version}`,
    timeRequired: course.duration,
  };
  if (course.access === 'pagamento_unico' && course.priceCents) {
    schema.offers = {
      '@type': 'Offer',
      url: course.url,
      price: (course.priceCents / 100).toFixed(2),
      priceCurrency: course.currency,
      availability: 'https://schema.org/InStock',
    };
  }
  return schema;
}

export function learningResourceSchema(lesson: {
  name: string;
  description: string;
  url: string;
  minutes: number;
  courseUrl: string;
  courseName: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    '@id': `${lesson.url}#lezione`,
    url: lesson.url,
    name: lesson.name,
    description: lesson.description,
    inLanguage: 'it-IT',
    isAccessibleForFree: true,
    timeRequired: `PT${lesson.minutes}M`,
    learningResourceType: 'Lesson',
    provider: { '@id': ENTITY_IDS.organization },
    isPartOf: {
      '@type': 'Course',
      '@id': `${lesson.courseUrl}#course`,
      name: lesson.courseName,
    },
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE.url}${item.url}`,
    })),
  };
}
