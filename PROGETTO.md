# PROGETTO — Evoluzione editoriale di Tao Veda

> Documento-bussola del progetto. Si procede **uno step alla volta**: questo file
> tiene sempre chiari **direzione, obiettivo e stato**. Aggiornare le checklist
> man mano. Ultimo aggiornamento: 2026-06-02.

## Perché (obiettivo)

Trasformare `tao-veda.org` da sito-vetrina statico a **sito editoriale a due velocità**:

- **In superficie** resta semplicissimo: chi vuole solo prenotare/provare un
  trattamento o fare uno scambio arriva in pochi clic alla **Mappa** o ai **Contatti**.
- **In profondità** un livello culturale **sempreverde** che veicola lo spessore
  del mondo olistico (Tao/MTC, tradizione indiana/Ayurveda/yoga, Kundalini e
  "via del Drago", filosofia Occidente↔Oriente, tarocchi/archetipi Jung–Jodorowsky,
  Mantak Chia), con **bibliografia ragionata**, **glossario**, pagine **pillar** e
  un **diario** alimentato nel tempo — progettato per **SEO** (pillar+cluster) e
  **GEO** (contenuti atomici e citabili dai motori di risposta AI).

## Decisioni prese (2026-06-02)

1. **Stack** → migrazione a **Astro** (clonando le convenzioni del sito gemello
   `veda-consulting`: content collection + Sveltia CMS). Design, voce, Mappa e
   Consent/GTM **identici**.
2. **Navigazione** → nav snella `Approccio · Trattamento · Prima · Conoscenza ·
   Contatti` + **"Mappa Tao Veda" come CTA**. Confini e Principi nel footer.
   *(La nuova nav arriva in Fase 1; in Fase 0 la nav resta identica all'attuale.)*
3. **Hub editoriale** → **"Conoscenza"** alle rotte `/conoscenza/*`
   (Diario · Tradizioni · Bibliografia · Glossario).
4. **Produzione** → **Sveltia CMS** (`/admin`) + skill **`tao-veda-insight`**.
5. **Dominio canonico** → `https://www.tao-veda.org` (coerente con gli OG già in uso).
6. **Prima pillar** → *"Tao Veda: la via della conoscenza attraverso il corpo"*.
7. **Priorità** → la **bibliografia completa** online il prima possibile.

## Vincoli non negoziabili

- **Parità a iso-funzionalità** dopo la migrazione: 12 pagine identiche, **URL
  `.html` preservati**, Mappa funzionante, Consent/GTM invariati.
- `styles.css` spostato ma **regole invariate** (in Fase 0 nessuna regola nuova).
- `consent-init.js`, `cmp.js`, `mappa-tao-veda.js`, `submit-mappa.js` **byte-identici**
  (solo spostati in `public/`).
- Profilo script **per pagina** preservato esattamente:
  - 10 pagine standard → GTM + consent-init + cmp;
  - `mappa-tao-veda` → consent-init + cmp + mappa.js, **NO GTM**;
  - `consenso-manualita-interne` → **nessuno** script, `noindex`.

## Architettura di riferimento

Si riusano i pattern di `/Users/macdariopagnoni/Documents/GitHub/veda-consulting`:
`src/lib/{site,seo,schema}.ts`, `src/layouts/BaseLayout.astro`,
`src/content/config.ts`, `public/admin/{config.yml,index.html}`, `astro.config.mjs`.
Differenze: Tao Veda resta su **Netlify** (non Cloudflare), tema **dark fisso**
oro/nero con font Cormorant+Jost, CMP **proprietario** (`cmp.js`) da preservare.

## Strategia URL & SEO

- `build.format: 'file'` → le pagine attuali restano servite a `/pagina.html`
  (nessun redirect, nessuna perdita di indicizzazione). **Canonical esplicito con
  `.html`** sulle pagine legacy.
- Nuove pagine `/conoscenza/*` → URL **puliti** (canonical senza `.html`).
- `site = https://www.tao-veda.org`; redirect apex→www via `public/_redirects`.
- `sitemap.xml` manuale sostituito da `@astrojs/sitemap`; `robots.txt` aggiornato
  (sitemap www + `Disallow: /admin/`).

---

## FASI E CHECKLIST

### Fase 0 — Scaffolding Astro a iso-funzionalità  ✅ FATTA in locale (build verde)
Obiettivo: il sito buildato è **identico** all'attuale, ma su Astro.

- [x] `package.json`, `astro.config.mjs`, `tsconfig.json`, `.gitignore`, `netlify.toml`
- [x] `styles.css` → `src/styles/styles.css` (invariato); JS+asset → `public/`
- [x] `src/lib/site.ts` (SITE + NAV), `seo.ts`, `schema.ts`
- [x] `BaseLayout.astro` (head + GTM/consent/cmp **condizionali** + Nav + Footer)
- [x] `Nav.astro` e `Footer.astro` identici all'attuale (7 voci, footer 9 link)
- [x] Conversione 12 pagine `.astro` (contenuto verbatim nello slot)
- [x] `public/robots.txt`, `_redirects`, rimozione `sitemap.xml` manuale (ora generato)
- [x] `npm install` + `npm run build` + `npm run check` verdi (0 errori)
- [x] Rimozione vecchi `.html` di root + script di migrazione one-shot
- [x] Verifica output buildato: canonical `.html`, profilo script per pagina,
      consent-init prima di GTM, JSON-LD Organization, sitemap coerente
- [ ] **DA FARE:** verifica visiva su deploy preview Netlify + check Mappa live
- **Criterio di uscita:** deploy preview identico all'attuale. Mergiare **da solo**.

> ⚠️ **Da verificare lato Netlify al primo deploy:**
> - che `www.tao-veda.org` sia dominio primario (il redirect apex→www in
>   `public/_redirects` punta a www);
> - che gli URL `/pagina.html` rispondano **200** e non vengano riscritti a
>   `/pagina` (impostazione "Pretty URLs"/asset optimization deve restare OFF),
>   altrimenti i canonical `.html` andrebbero cambiati in URL puliti + redirect 301.
> - smoke test Mappa: invio reale → 200 dalla function + email Resend.

### Fase 1 — Fondamenta editoriali + nav nuova  ✅ FATTA in locale (build verde)
- [x] `schema.ts`: `breadcrumbSchema`, `articleSchema`, `faqPageSchema`, `definedTermSchema` (Organization già attivo)
- [x] **Nav nuova**: + Conoscenza, **Mappa come CTA**, Confini/Principi nel footer (CSS `.menu.cta`)
- [x] `src/content/config.ts`: collection `bibliografia`, `glossario`, `diario`, `tradizioni`
- [x] **Glossario** `/conoscenza/glossario` — 24 voci + JSON-LD `DefinedTermSet` (GEO)
- [x] **Diario** (blog): indice + pagina articolo + `/tag/[tag]` + **RSS** (`/rss.xml`, link in `<head>`) + 2 articoli
- [x] **Tradizioni** (pillar): indice + 6 pagine pillar con cluster (bibliografia/glossario/diario collegati)
- [x] **Pillar cornerstone** `/conoscenza/la-via-della-conoscenza` (la "prima pillar" scelta)
- [x] Hub `/conoscenza` con 4 sezioni attive + cornerstone in evidenza; canonical + sitemap (31 URL)
- [ ] **DA FARE:** verifica visiva su deploy preview; (poi: arricchire diario/glossario nel tempo)

### Bibliografia ragionata online  ✅ FATTA in locale (build verde) — priorità soddisfatta
- [x] Collection `bibliografia` (`src/content/config.ts`) — schema con tradizione/livello/nota ragionata
- [x] Pagina `/conoscenza/bibliografia` (raggruppata per tradizione e livello, con breadcrumb JSON-LD + TOC)
- [x] Popolamento iniziale: **27 voci** dai fondamentali antichi (Tao Te Ching, I Ching, Yoga Sutra,
      Charaka Samhita, Huangdi Neijing, Upanishad) ai contemporanei (Jung, Jodorowsky, Mantak Chia, Capra, Watts…)
- [x] In `src/content/bibliografia/*.md` → editabili a mano o via CMS (Fase 2)
- [ ] **DA FARE:** verifica visiva su deploy preview; eventuale arricchimento voci nel tempo

### Fase 2 — Sveltia CMS + skill + contenuti MVP  ⬜ DA FARE
- [ ] `public/admin` (Sveltia) + `config.yml` allineato allo schema
- [ ] Auth GitHub OAuth su Netlify (avvio con `local_backend`)
- [ ] Skill `tao-veda-insight`
- [ ] Pillar "Tao Veda: la via della conoscenza attraverso il corpo"
- [ ] ~20 voci di glossario + 3-4 articoli di diario

### Fase 3 — Produzione continua  ⬜ DA FARE
- [ ] Calendario pillar+cluster, interlinking, OG per articolo, rifiniture GEO

---

## Verifica end-to-end (pre go-live)
1. `npm run build` + `npm run check` verdi; `node --check` sui 4 JS spostati.
2. Parità visiva delle 12 pagine (desktop/mobile).
3. URL `.html` preservati (200, **non** 301); canonical univoco; sitemap+robots ok.
4. Redirect apex→www = 301; nessun 404 sui vecchi link.
5. **Mappa**: submit → 200 → notifica + email Resend (+ Airtable se configurato).
6. Consent/GTM (GTM Preview): default denied prima di gtm.js; banner; cookie `tao_veda_consent`.
7. `/conoscenza` e sotto-sezioni; `/rss.xml`; `/admin` (dopo Fase 2).

## Flusso di lavoro git (per non ripetere errori)
- Si lavora su **`main`**. `.gitignore` esclude `node_modules/`, `dist/`, `.astro/`:
  **non vanno mai committati** (un commit iniziale via GitHub Desktop li aveva
  inclusi per errore — poi ripuliti nel commit di allineamento).
- Divisione: **Claude** modifica il codice e fa il **commit** in locale;
  **Dario** preme **"Push origin"** da GitHub Desktop (push normale, niente force).
- Prima che Claude lavori, evitare modifiche locali non committate in GitHub Desktop.

## Riferimenti
- Piano dettagliato originale: `~/.claude/plans/vorrei-fare-una-revisione-breezy-puzzle.md`
- Materiale sorgente contenuti: `Dropbox/CBR/Olistico/` (manifesto, dispense Ayurveda/MTC, appunti Hakusha)
- Sito gemello di riferimento: `../veda-consulting`
