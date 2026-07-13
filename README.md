# Tao Veda

Repository delle due applicazioni web di Tao Veda:

- `www.tao-veda.org`: sito editoriale e istituzionale, generato staticamente con Astro 4;
- `formazione.tao-veda.org`: corso pubblico con lezioni riservate, Astro 7 e adapter Netlify.

Tao Veda opera nell'ambito culturale, del benessere e delle discipline bionaturali. I contenuti non costituiscono attività sanitaria, psicologica, psicoterapeutica o sessuologica clinica.

## Struttura corrente

```text
.
├── src/                         # pagine, layout e content collection del sito principale
├── public/                      # asset, CMS, redirect, robots e chiave IndexNow www
├── formazione/                  # seconda applicazione Astro per il sottodominio
│   ├── src/content/             # corso, 8 moduli pubblici e 25 lezioni riservate
│   ├── src/middleware.ts        # autenticazione e protezione delle lezioni
│   └── public/                  # robots, font, OG e chiave IndexNow formazione
├── netlify/functions/           # Mappa Tao Veda e OAuth CMS
├── scripts/
│   ├── seo-audit.mjs            # audit HTML, sitemap, link, immagini e JSON-LD
│   ├── indexnow-submit.mjs      # notifica post-build degli URL cambiati
│   └── generate-og-images.mjs   # asset sociali 1200×630 per pillar e diario
├── docs/                        # architettura, setup e roadmap editoriale
├── astro.config.mjs
└── netlify.toml
```

## Sviluppo e verifica

Servono Node.js 20+ e le dipendenze installate in entrambe le applicazioni.

```bash
npm install
npm run check
npm run build

cd formazione
npm install
npm run check
npm run build
```

Ogni build esegue automaticamente l'audit SEO. Il controllo verifica title, description, H1, canonical, JSON-LD, asset e link interni, oltre a impedire che tag o URL riservati entrino nelle sitemap.

Per rigenerare le immagini sociali del sito principale:

```bash
npm run og:generate
```

## SEO, GEO e indicizzazione

Il dominio canonico del sito principale è `https://www.tao-veda.org`; la formazione è una proprietà separata. Le regole condivise sono definite nei rispettivi `BaseLayout.astro` e nei moduli `src/lib/{seo,schema}.ts`.

- Le pagine tag sono `noindex,follow` ed escluse dalla sitemap.
- I contenuti del diario espongono Dario Pagnoni come autore/curatore e Tao Veda come editore.
- Gli identificatori JSON-LD di persona, organizzazione e siti sono stabili e collegati.
- Le sitemap usano `lastmod` soltanto quando deriva da una data editoriale reale.
- Nella formazione sono indicizzabili home, corso e panoramiche pubbliche dei moduli. Accesso, verifica, profilo, conclusione e lezioni sono esclusi.
- Le risposte protette aggiungono `X-Robots-Tag: noindex, nofollow, noarchive`.
- IndexNow parte nel `postbuild` soltanto nei deploy Netlify di produzione; `SKIP_INDEXNOW=1` lo disattiva.
- Non viene pubblicato `llms.txt`: GEO è trattata come qualità, verificabilità e citabilità del contenuto, non come markup separato.

La strategia, il calendario e i controlli post-pubblicazione sono in [docs/seo-roadmap-editoriale.md](docs/seo-roadmap-editoriale.md).

## Regole editoriali

Ogni contenuto deve rendere distinguibili:

1. ciò che afferma una fonte;
2. l'interpretazione di Tao Veda;
3. ciò che deriva dall'esperienza pratica;
4. ciò che il progetto non afferma o promette.

Gli articoli richiedono autore, data, descrizione, immagine sociale e fonti strutturate. I moduli richiedono stato pubblico/riservato esplicito e, quando mostrano un'immagine, testo alternativo e dimensioni. Il CMS applica gli stessi vincoli delle content collection.

Le regole complete di voce e perimetro sono in [CLAUDE.md](CLAUDE.md) e nella skill editoriale sotto `docs/skills/tao-veda-insight/`.

## Privacy, consenso e analytics

Il CMP proprietario salva un consenso condiviso tra `www` e `formazione` sul dominio `.tao-veda.org`. I font sono ospitati localmente. Gli eventi della formazione non contengono PII:

- `course_view`;
- `registration_start`;
- `registration_complete`.

La configurazione del container è descritta in [gtm-consent-tags.md](gtm-consent-tags.md). Le risposte della Mappa non vengono inviate ad analytics o advertising.

## Deploy e variabili d'ambiente

I due host sono due siti Netlify distinti. La root del repository pubblica `www`; il sito formazione usa `formazione` come base directory.

Variabili del sito principale per Mappa ed email:

```text
RESEND_API_KEY=...
FROM_EMAIL=...
NOTIFICATION_EMAIL=...
AIRTABLE_API_KEY=...       # opzionale
AIRTABLE_BASE_ID=...       # opzionale
AIRTABLE_TABLE_NAME=...    # opzionale
```

Variabili del sito formazione:

```text
PUBLIC_SUPABASE_URL=...
PUBLIC_SUPABASE_ANON_KEY=...
```

Il setup completo è in [docs/formazione-supabase-setup.md](docs/formazione-supabase-setup.md).

## Controlli manuali prima del rilascio

- flusso Mappa con email reale;
- accesso Supabase, iscrizione automatica e revoca;
- Consent Mode in Tag Assistant sui due host;
- redirect apex→www e `.html`→URL pulito in un solo passaggio;
- Rich Results Test e Schema Markup Validator sui template principali;
- Lighthouse mobile su home, articolo, corso e modulo.

I passaggi che richiedono account esterni — Search Console, Bing Webmaster Tools, Supabase e Tag Manager — non sono automatizzabili dal repository e sono riportati nei relativi runbook.
