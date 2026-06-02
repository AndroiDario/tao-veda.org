import { defineCollection, z } from 'astro:content';
import { TRADIZIONI, LIVELLI } from '../lib/site';

/**
 * Modello dati dei contenuti editoriali dell'hub /conoscenza.
 * Per ora è attiva la collection `bibliografia`. Diario, tradizioni (pillar) e
 * glossario verranno aggiunti nei passi successivi della Fase 1.
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

export const collections = { bibliografia };
