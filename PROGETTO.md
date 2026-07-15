# PROGETTO — Evoluzione editoriale di Tao Veda

> Documento-bussola del progetto. Si procede **uno step alla volta**: questo file
> tiene sempre chiari **direzione, obiettivo e stato**. Aggiornare le checklist
> man mano. Ultimo aggiornamento: 2026-07-13.

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

## Revisione editoriale (2026-06-29): totalità e consenso continuo

Riallineamento dei testi alla visione: il trattamento guarda alla **persona nella sua totalità**, senza nominare o separare singole zone "intime" (che, enumerate, finivano per sessualizzarle). Decisioni:

1. **Totalità al posto dell'elenco** nelle pagine del corpo/confini e nella Mappa (`zoneEscluse` riformulato).
2. **Consenso continuo** (verbale e gestuale, sempre revocabile) al posto del modulo scritto: la pagina-modulo `consenso-manualita-interne` diventa la pagina editoriale pubblica **`/consenso`** ("Il consenso in Tao Veda"); opzionale, solo su accordo trasparente, una traccia audio condivisa.
3. **Energia sessuale come sublimazione**: riconosciuta come energia vitale a cui attingere per sublimarla in conoscenza e consapevolezza, mai agita (confine del principio 6 intatto).
4. **Forma a quattro mani** introdotta come grado massimo del trattamento (operatore + operatrice, energie complementari, testimoni reciproci).
5. Regole rispecchiate in `CLAUDE.md` e nella skill `tao-veda-insight`.

## Vincoli non negoziabili

- **Parità a iso-funzionalità** dopo la migrazione: 12 pagine identiche, **URL
  `.html` preservati**, Mappa funzionante, Consent/GTM invariati.
- `styles.css` spostato ma **regole invariate** (in Fase 0 nessuna regola nuova).
- GTM è la sola porta di misurazione per entrambi gli host; GA4 non viene caricato direttamente.
- Tutte le pagine, inclusa `mappa-tao-veda`, caricano bootstrap consenso → GTM → interfaccia CMP. La Mappa non invia risposte o PII nel `dataLayer`.
- Il template Consent Mode vive nel container; banner, cookie condiviso e listener vivono negli asset del sito.
  - `consenso` → pagina editoriale standard (ex modulo `consenso-manualita-interne`, sostituito il 2026-06-29 dalla pagina sul consenso continuo).

## Architettura di riferimento

Si riusano i pattern di `/Users/macdariopagnoni/Documents/GitHub/veda-consulting`:
`src/lib/{site,seo,schema}.ts`, `src/layouts/BaseLayout.astro`,
`src/content/config.ts`, `public/admin/{config.yml,index.html}`, `astro.config.mjs`.
Differenze: Tao Veda resta su **Netlify** (non Cloudflare), tema **dark fisso**
oro/nero con font Cormorant+Jost, CMP **proprietario** (`cmp.js`) da preservare.

## Strategia URL & SEO

> **Aggiornamento 2026-06: migrazione a URL puliti completata.** La strategia
> "canonical `.html` sulle pagine legacy" è superata: tutti gli URL pubblici
> sono ora senza estensione (`/approccio`), i vecchi `.html` fanno **301
> forzato** in `public/_redirects` e `/sitemap.xml` (vecchia sitemap inviata a
> GSC) fa 301 verso `sitemap-index.xml`. Il momento era ideale: il sito era di
> fatto non indicizzato. Runbook GSC e roadmap editoriale in
> `docs/seo-roadmap-editoriale.md`.

- `build.format: 'file'` → i `.html` restano come artefatti di build; Netlify
  serve gli URL senza estensione (200) e i `.html` espliciti fanno 301.
- Canonical calcolato ovunque da `cleanPath()` (nessun canonical esplicito).
- `site = https://www.tao-veda.org`; redirect apex→www via `public/_redirects`.
- Sitemap generata da `@astrojs/sitemap` (solo URL puliti); `robots.txt` con
  sitemap www + `Disallow: /admin/` + `Disallow: /consenso-manualita-interne`.

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
> - ~~che gli URL `/pagina.html` rispondano 200 e non vengano riscritti~~ →
>   **superato (2026-06)**: i canonical sono ora puliti e i `.html` fanno 301
>   forzato via `_redirects`, indipendentemente da "Pretty URLs".
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

### Fase 2 — Sveltia CMS + skill + contenuti MVP  ✅ FATTA in locale (build verde)
- [x] `public/admin` (Sveltia) + `config.yml` con le 4 collection (diario/tradizioni/glossario/bibliografia)
- [x] Auth GitHub OAuth su Netlify: funzioni `netlify/functions/auth.js` + `auth-callback.js`, rotte in `_redirects`, `local_backend` per il locale
- [x] Skill `tao-veda-insight` in `docs/skills/tao-veda-insight/` (SKILL + template + checklist + idee)
- [x] Pillar cornerstone + glossario (24) + diario (2) già fatti in Fase 1
- [ ] **SERVE DA TE:** creare la GitHub OAuth App + impostare `GITHUB_CLIENT_ID` /
      `GITHUB_CLIENT_SECRET` su Netlify e fare un deploy. Guida: `docs/cms-setup.md`
- [ ] (poi, nel tempo) installare la skill in Cowork e produrre nuovi contenuti

### Fase 3 — Produzione continua  🟡 IN CORSO
- [x] Sei pillar ampliati con fonti, interpretazione, implicazioni e limiti
- [x] Quattro articoli revisionati con autore, fonti strutturate e immagini OG specifiche
- [x] Glossario arricchito nella pagina unica senza generare pagine sottili
- [x] Calendario pillar+cluster aggiornato a un approfondimento originale al mese
- [x] Audit SEO automatico, sitemap selettive, `lastmod` reale e IndexNow
- [ ] Misurazione post-deploy a 7, 30 e 90 giorni in Search Console e Bing

### Area Formazione — MVP completo in locale (2026-07-10)
- [x] Applicazione Astro separata in `formazione/`, predisposta come secondo sito Netlify
- [x] Corso ad accesso libero e donazione volontaria *La via Tao Veda: conoscere attraverso il corpo*, edizione 1.0
- [x] 8 moduli, 25 lezioni e 8 pratiche guidate con trascrizione
- [x] Catalogo predisposto per più corsi, indice persistente e avanzamento locale senza account
- [x] Sintesi vocale sul dispositivo, con campo CMS per le future registrazioni audio
- [x] Pagina conclusiva, donazione libera configurabile e manifestazione d’interesse
- [x] Collezioni Formazione aggiunte a Sveltia CMS
- [x] Pagina `/formazione` e collegamenti nella navigazione del sito principale
- [x] Build e check verdi per entrambi i siti; audit dei collegamenti interni dell’area Formazione
- [x] Secondo sito Netlify con base directory `formazione`, collegato a `formazione.tao-veda.org`
- [ ] **DA FARE:** impostare le variabili pubbliche della donazione libera
- [ ] **DA FARE:** revisione editoriale umana e registrazione degli audio definitivi

### Area Formazione — revisione editoriale e registrazione (2026-07-13)
- [x] Revisione e arricchimento delle 25 lezioni e degli 8 moduli: tono meno difensivo, sostanza dalle fonti dell’hub Conoscenza, durate ricalcolate (edizione 1.1, 4–6 ore)
- [x] Reference `lezioni-formazione.md` nella skill `tao-veda-insight` (schema, regola “meno difensivo”, durata onesta)
- [x] Registrazione con Supabase magic link: corso fondativo ad accesso libero dietro registrazione con verifica email e iscrizione auto-attiva; landing e programma restano pubblici, lezioni riservate
- [x] Adapter Netlify, middleware di accesso, pagine `/accesso`, `/verifica`, `/profilo`, `/auth/confirm`, `/auth/logout`
- [x] Modello dati `profiles` + `enrollments` con stati per corso (per i futuri corsi a pagamento con bonifico, abilitazione manuale dalla dashboard Supabase)
- [x] Informativa privacy aggiornata (sezione Area Formazione) e copy di accesso rivisto
- [ ] **DA FARE (Dario):** setup Supabase e variabili Netlify secondo `docs/formazione-supabase-setup.md`, poi verifica del flusso email reale

### Area Formazione — SEO, privacy e contenuti pubblici (2026-07-13)
- [x] Home, corso e 8 panoramiche modulo indicizzabili; pagine operative e 25 lezioni escluse
- [x] `Course`, `WebSite`, `Organization` e breadcrumb JSON-LD collegati alle entità principali
- [x] Moduli pubblici ampliati con risultati attesi, fonti, limiti e collegamenti culturali
- [x] Immagini responsive e dimensionate; OG compresso; font locali e cache asset
- [x] Consent Mode condiviso tra host ed eventi `course_view`, `registration_start`, `registration_complete` senza PII
- [ ] **DA FARE (GTM):** collegare i tre eventi formazione al Google tag esistente secondo `gtm-consent-tags.md`
- [x] Audit build e notifica IndexNow separata per il sottodominio
- [ ] **DA FARE (Dario):** proprietà e sitemap in Search Console/Bing, verifica Tag Assistant e Lighthouse sul deploy

### Area Formazione — multi-corso e donazione libera (2026-07-14)
- [x] Copy pubblico riposizionato su accesso libero, registrazione e donazione volontaria in base al valore percepito
- [x] Flussi separati `/registrazione` (nome + email) e `/accesso` (email esistente), entrambi con magic link
- [x] Richiesta dei corsi a pagamento con bonifico, stato `pending_payment`, importo e causale nel profilo
- [x] Navigazione, progressi, conclusione, sitemap e dati strutturati generalizzati per più corsi
- [x] Roadmap dei percorsi e Corso 2 *Mappe del corpo* in bozza: 6 moduli e prime 3 lezioni complete
- [x] Migrazione `formazione-002-profili-iscrizioni.sql`, schema CMS e informativa privacy aggiornati
- [x] Configurazione Supabase/Resend/Netlify eseguita da Dario (2026-07-15)
- [ ] **DA FARE (Dario):** collaudo finale di magic link e bonifico con dati reali sul deploy

### Area Formazione — rilancio: anteprima, design condiviso ed edizione 2.0 (2026-07-15)
- [x] Design token condivisi in `shared/styles/tokens.css` importati da entrambi i progetti; logo e foto serviti in locale dal sottodominio
- [x] Modulo 1 in anteprima libera e indicizzabile: flag `pubblico`/`indicizzabile` sulle lezioni, middleware, sitemap e audit SEO aggiornati, JSON-LD `LearningResource`, CTA di registrazione a fine anteprima
- [x] Landing e scheda corso rifatte: hero con fotografia, numeri, programma esplorabile lezione per lezione, come funziona, cornice di Dario con disclaimer, FAQ
- [x] Edizione 2.0 del corso fondativo: 25 lezioni e 8 introduzioni modulo espanse allo standard del pilota (studio ~700-1000 parole con fonti attraversate, esempi concreti e sintesi in tre punti; pratiche guidate da 8-12 minuti parlati con varianti brevi)
- [x] Durate ricalcolate con la regola documentata (`parole/140 + pratica + 3'`): totale 275 minuti, claim aggiornato a "4–5 ore" (`PT4H35M`)
- [ ] **DA FARE (Dario):** push, verifica del deploy Netlify su entrambi i siti e collaudo del flusso magic link in produzione

---

## Verifica end-to-end (pre go-live)
1. `npm run build` + `npm run check` verdi; `node --check` sui 4 JS spostati.
2. Parità visiva delle 12 pagine (desktop/mobile).
3. URL puliti (200) e vecchi `.html` → **301** (migrazione 2026-06); canonical univoco; sitemap+robots ok.
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
- Regole di voce e tono editoriale (vincolanti): `CLAUDE.md` in root, rispecchiate nella skill `docs/skills/tao-veda-insight/`.
- Piano dettagliato originale: `~/.claude/plans/vorrei-fare-una-revisione-breezy-puzzle.md`
- Materiale sorgente contenuti: `Dropbox/CBR/Olistico/` (manifesto, dispense Ayurveda/MTC, appunti Hakusha)
- Sito gemello di riferimento: `../veda-consulting`
