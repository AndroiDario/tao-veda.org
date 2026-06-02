/** Formattazione date in italiano, condivisa dalle pagine del diario. */
export function formatData(d: Date): string {
  return new Intl.DateTimeFormat("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function isoData(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Slug URL-safe per i tag del diario (gli spazi/accenti diventano trattini). */
export function tagSlug(tag: string): string {
  return tag
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
