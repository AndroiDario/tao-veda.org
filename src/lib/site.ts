/**
 * Costanti globali del sito. Leggibili ovunque via `import { SITE } from '@lib/site'`.
 */

export const SITE = {
  name: "Tao Veda",
  legalName: "Tao Veda",
  url: import.meta.env.PUBLIC_SITE_URL || "https://www.tao-veda.org",
  locale: "it-IT",
  ogLocale: "it_IT",
  lang: "it",
  tagline: "La via della conoscenza attraverso il corpo",
  description:
    "Tao Veda è un laboratorio culturale e corporeo sulla conoscenza attraverso il corpo: un incontro fra Tao, Veda e sguardo occidentale, con studio, pratica, trattamenti e confini chiari.",
  defaultOgImage: "/assets/og-image.png",
  logo: "/assets/logo/tao-veda-logo-oro-su-nero.svg",
  contact: {
    email: "info@tao-veda.org",
  },
  social: {
    instagram: "",
  },
  analytics: {
    // GTM container (GA4 configurato dentro GTM). Hardcoded di default per parità
    // col sito statico; sovrascrivibile via env PUBLIC_GTM_ID.
    gtmId: import.meta.env.PUBLIC_GTM_ID?.trim() || "GTM-5868C6CD",
  },
} as const;

/**
 * Navigazione primaria. La CTA apre alla visione: la Mappa resta una via pratica
 * ben visibile; Confini, Principi e Chi siamo vivono nel footer.
 */
export const NAV_PRIMARY = [
  { label: "Entra nella visione", href: "/approccio.html", cta: true },
  { label: "Conoscenza", href: "/conoscenza", cta: false },
  { label: "Trattamento", href: "/trattamento.html", cta: false },
  { label: "Mappa", href: "/mappa-tao-veda.html", cta: false },
  { label: "Contatti", href: "/contatti.html", cta: false },
] as const;

export const NAV_FOOTER = [
  { label: "Visione", href: "/approccio.html" },
  { label: "Conoscenza", href: "/conoscenza" },
  { label: "Trattamento", href: "/trattamento.html" },
  { label: "Prima del trattamento", href: "/prima-del-trattamento.html" },
  { label: "Mappa Tao Veda", href: "/mappa-tao-veda.html" },
  { label: "Confini", href: "/confini.html" },
  { label: "Principi", href: "/principi.html" },
  { label: "Chi siamo", href: "/chi-siamo.html" },
  { label: "Contatti", href: "/contatti.html" },
  { label: "Privacy e cookie", href: "/privacy-policy.html" },
] as const;

/**
 * Tassonomia dei contenuti editoriali (hub /conoscenza).
 * `tradizione` = corrente culturale; `livello` = profondità/epoca della fonte.
 */
export const TRADIZIONI = [
  "tao",
  "veda",
  "kundalini",
  "occidente",
  "tarocchi",
  "pratica",
] as const;
export type Tradizione = (typeof TRADIZIONI)[number];

export const TRADIZIONI_LABELS: Record<Tradizione, string> = {
  tao: "Tao e Medicina Cinese",
  veda: "Tradizione indiana, Ayurveda e Yoga",
  kundalini: "Kundalini, chakra e la via del Drago",
  occidente: "L’Occidente in dialogo con l’Oriente",
  tarocchi: "Tarocchi, archetipi e simbolo",
  pratica: "Pratica del corpo e meditazione",
};

export const TRADIZIONI_INTRO: Record<Tradizione, string> = {
  tao: "Lo sguardo sul fluire dell’energia: qi, yin e yang, cinque movimenti, meridiani.",
  veda: "La sapienza indiana del corpo e della coscienza: dosha, prana, yoga, conoscenza di sé.",
  kundalini: "L’energia che risale lungo la colonna: chakra, nadi, tantra, la via del Drago.",
  occidente: "Filosofia e psicologia del profondo che hanno saputo riconoscere l’Oriente.",
  tarocchi: "Il linguaggio simbolico degli archetipi come mappa del cammino interiore.",
  pratica: "Il lavoro concreto su corpo, respiro ed energia: alchimia taoista, shiatsu, meditazione.",
};

export const LIVELLI = ["fondamentale", "approfondimento", "contemporaneo"] as const;
export type Livello = (typeof LIVELLI)[number];

export const LIVELLI_LABELS: Record<Livello, string> = {
  fondamentale: "Fondamentale",
  approfondimento: "Approfondimento",
  contemporaneo: "Contemporaneo",
};
