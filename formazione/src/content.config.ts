import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const byFrontmatter = (fallbackKey: string) => ({ entry, data }: { entry: string; data: Record<string, unknown> }) => {
  const value = data[fallbackKey];
  return typeof value === 'string' && value ? value : entry.replace(/\.md$/, '');
};

const courseSchema = z.object({
    id: z.string(),
    titolo: z.string(),
    sommario: z.string(),
    destinatari: z.string(),
    risultati: z.array(z.string()),
    stato: z.enum(['bozza', 'pubblicato', 'archiviato']).default('bozza'),
    versione: z.string(),
    durata: z.string(),
    durataIso: z.string(),
    accesso: z.enum(['donazione_libera', 'pagamento_unico']),
    modalita: z.enum(['autonomo', 'accompagnato', 'coorte']).default('autonomo'),
    prezzoCentesimi: z.number().int().positive().optional(),
    valuta: z.string().length(3).default('EUR'),
    prerequisiti: z.string().optional(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    ogImage: z.url(),
    aggiornato: z.coerce.date().optional(),
    ordine: z.number().default(100),
  }).superRefine((course, context) => {
    if (course.stato === 'pubblicato' && course.accesso === 'pagamento_unico' && !course.prezzoCentesimi) {
      context.addIssue({
        code: 'custom',
        path: ['prezzoCentesimi'],
        message: 'Obbligatorio per un corso a pagamento pubblicato',
      });
    }
  });

const corsi = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/corsi', generateId: byFrontmatter('id') }),
  schema: courseSchema,
});

const moduleSchema = z.object({
  corso: z.string(),
  titolo: z.string(),
  sommario: z.string(),
  risultati: z.array(z.string()),
  durataMinuti: z.number(),
  ordine: z.number(),
  pubblico: z.boolean(),
  indicizzabile: z.boolean(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  aggiornato: z.coerce.date().optional(),
  immagine: z.string().regex(/^(https?:\/\/|\/)/, 'URL assoluto o percorso dalla radice del sito').optional(),
  immagineAlt: z.string().optional(),
  immagineWidth: z.number().int().positive().optional(),
  immagineHeight: z.number().int().positive().optional(),
  didascalia: z.string().optional(),
  draft: z.boolean().default(false),
}).superRefine((module, context) => {
  if (!module.immagine) return;
  if (!module.immagineAlt) {
    context.addIssue({ code: 'custom', path: ['immagineAlt'], message: 'Obbligatorio quando è presente immagine' });
  }
  if (!module.immagineWidth) {
    context.addIssue({ code: 'custom', path: ['immagineWidth'], message: 'Obbligatorio quando è presente immagine' });
  }
  if (!module.immagineHeight) {
    context.addIssue({ code: 'custom', path: ['immagineHeight'], message: 'Obbligatorio quando è presente immagine' });
  }
});

const moduli = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/moduli', generateId: byFrontmatter('slug') }),
  schema: moduleSchema,
});

const fonte = z.object({ titolo: z.string(), url: z.url() });

const lezioni = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/lezioni', generateId: byFrontmatter('slug') }),
  schema: z.object({
    corso: z.string(),
    modulo: z.string(),
    titolo: z.string(),
    sommario: z.string(),
    tipo: z.enum(['studio', 'pratica', 'integrazione']),
    durataMinuti: z.number(),
    ordine: z.number(),
    obiettivi: z.array(z.string()).default([]),
    audio: z.url().optional(),
    trascrizione: z.string().optional(),
    indicazioni: z.string().optional(),
    domande: z.array(z.string()).default([]),
    fonti: z.array(fonte).default([]),
    pubblico: z.boolean().default(false),
    indicizzabile: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

export const collections = { corsi, moduli, lezioni };
