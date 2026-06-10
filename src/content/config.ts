import { defineCollection, z } from 'astro:content';
import { TRADIZIONI, LIVELLI } from '../lib/site';

/**
 * Modello dati dei contenuti editoriali dell'hub /conoscenza.
 * Collection: bibliografia, glossario, diario (blog), tradizioni (pillar).
 * I riferimenti incrociati usano slug (string), non `reference()`, per non
 * rompere la validazione se una voce collegata non esiste ancora.
 */

const bibliografia = defineCollection({
  type: 'content',
  schema: z.object({
    titolo: z.string(),
    autore: z.string(),
    // Stringa, non numero: molte opere antiche hanno datazioni approssimative.
    anno: z.string().optional(),
    titoloOriginale: z.string().optional(),
    tradizione: z.enum(TRADIZIONI),
    livello: z.enum(LIVELLI),
    // Nota ragionata: perché l'opera è rilevante per la visione Tao Veda.
    descrizione: z.string(),
    // Link facoltativo (editore / scheda). Niente affiliazioni.
    link: z.string().url().optional(),
    ordine: z.number().default(100),
    draft: z.boolean().default(false),
  }),
});

const glossario = defineCollection({
  type: 'content',
  schema: z.object({
    termine: z.string(),
    tradizione: z.enum(TRADIZIONI),
    // Definizione breve e atomica (1-2 frasi): cuore della strategia GEO.
    definizione: z.string(),
    sinonimi: z.array(z.string()).optional(),
    // slug di altri termini di glossario collegati.
    vediAnche: z.array(z.string()).optional(),
    // Fonte esterna autorevole (es. Treccani). Niente affiliazioni.
    fonte: z
      .object({ titolo: z.string(), url: z.string().url() })
      .optional(),
    ordine: z.number().default(100),
    draft: z.boolean().default(false),
  }),
});

const diario = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    data: z.coerce.date(),
    aggiornato: z.coerce.date().optional(),
    tradizione: z.enum(TRADIZIONI),
    tags: z.array(z.string()).default([]),
    autore: z.string().default('Tao Veda'),
    cover: z.string().optional(),
    // slug della pillar/tradizione di riferimento (per il cluster SEO).
    pillar: z.enum(TRADIZIONI).optional(),
    draft: z.boolean().default(false),
  }),
});

const tradizioni = defineCollection({
  type: 'content',
  schema: z.object({
    titolo: z.string(),
    // Chiave canonica della tradizione (slug della pagina pillar).
    tradizione: z.enum(TRADIZIONI),
    eyebrow: z.string().optional(),
    // Definizione/sommario di apertura (estraibile per GEO).
    sommario: z.string(),
    ordine: z.number().default(100),
    draft: z.boolean().default(false),
  }),
});

export const collections = { bibliografia, glossario, diario, tradizioni };
