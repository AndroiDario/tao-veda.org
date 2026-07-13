import { SITE } from './site';

export const ENTITY_IDS = {
  organization: `${SITE.mainSite}/#organization`,
  website: `${SITE.url}/#website`,
  course: `${SITE.url}/corsi/${SITE.courseId}#course`,
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
  name: string;
  description: string;
  url: string;
  version: string;
  duration: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    '@id': `${course.url}#course`,
    url: course.url,
    name: course.name,
    description: course.description,
    inLanguage: 'it-IT',
    isAccessibleForFree: true,
    provider: { '@id': ENTITY_IDS.organization },
    courseCode: `${SITE.courseId}-${course.version}`,
    timeRequired: course.duration,
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
