# Tao Veda

Sito istituzionale di **Tao Veda**: approccio al trattamento corporeo olistico e alla consapevolezza, fondato su presenza, ascolto, personalizzazione e chiarezza dei confini.

Sito pubblico: [tao-veda.org](https://tao-veda.org)

## Cos'è

Tao Veda nasce dall'incontro fra tradizioni taoiste, visione vedica e pratiche contemplative. Si colloca nell'ambito del benessere e delle discipline bionaturali: non è un'attività sanitaria, psicologica, psicoterapeutica o sessuologica clinica.

## Stato del progetto

Il sito è una web property statica multi-pagina, senza framework e senza build step per il frontend. Le pagine HTML condividono `styles.css`, asset logo/favicon e alcuni script JavaScript vanilla.

La Mappa Tao Veda è attiva con invio tramite Netlify Function e notifica email via Resend. Airtable è previsto come archivio operativo delle compilazioni quando verrà configurato.

## Struttura

```text
.
├── index.html                         # Home
├── approccio.html                     # Cornice culturale e metodo
├── trattamento.html                   # Descrizione del trattamento
├── prima-del-trattamento.html         # FAQ e preparazione
├── mappa-tao-veda.html                # Questionario Mappa Tao Veda
├── quattro-livelli.html               # Approfondimento sui livelli
├── confini.html                       # Chiarezza su sessualità, tantra e confini
├── principi.html                      # Carta dei principi
├── chi-siamo.html                     # Identità del progetto
├── contatti.html                      # Contatti e orientamento
├── privacy-policy.html                # Privacy, cookie e fornitori
├── consenso-manualita-interne.html    # Pagina non indicizzata per consenso specifico
├── assets/
│   ├── js/
│   │   ├── cmp.js                     # Banner e preferenze cookie
│   │   ├── consent-init.js            # Default Consent Mode prima di GTM
│   │   └── mappa-tao-veda.js          # Logica questionario multi-step
│   ├── logo/                          # Versioni SVG/PDF del logo
│   └── og-image.png                   # Immagine social sharing
├── netlify/functions/
│   └── submit-mappa.js                # Ricezione Mappa, email, Airtable opzionale
├── gtm-consent-tags.md                # Note operative per GTM Consent Mode
├── netlify.toml                       # Configurazione Netlify Functions
├── sitemap.xml
├── robots.txt
└── styles.css
```

## Pubblicazione

Il progetto è pensato per Netlify.

- Non serve build command.
- La root di pubblicazione è la root del repository.
- Le funzioni serverless sono in `netlify/functions`.
- `netlify.toml` imposta Node.js 20 per l'ambiente Netlify.

### Variabili ambiente

Per la Mappa Tao Veda:

```text
RESEND_API_KEY=...
FROM_EMAIL=...
NOTIFICATION_EMAIL=...
```

Con queste variabili la funzione invia:

- notifica interna a `NOTIFICATION_EMAIL`;
- conferma di ricezione alla persona che ha compilato la Mappa.

Per Airtable, quando verrà attivato l'archivio:

```text
AIRTABLE_API_KEY=...
AIRTABLE_BASE_ID=...
AIRTABLE_TABLE_NAME=...
```

Se Airtable non è configurato, la funzione continua a inviare le email e segnala internamente che il salvataggio è stato saltato.

## Privacy e consenso

Il sito usa un CMP proprietario leggero:

- `assets/js/consent-init.js` imposta il consenso iniziale prima dello snippet GTM;
- `assets/js/cmp.js` mostra banner/preferenze e invia l'evento `consent_update`;
- `gtm-consent-tags.md` documenta la configurazione richiesta in Google Tag Manager.

La privacy policy cita Google Tag Manager, Google Fonts, Resend e Airtable. La Mappa dichiara esplicitamente che non formula diagnosi e che le risposte non vengono inviate a strumenti di analytics o advertising.

## Verifiche utili

Controllo sintassi JavaScript:

```bash
node --check assets/js/cmp.js
node --check assets/js/consent-init.js
node --check assets/js/mappa-tao-veda.js
node --check netlify/functions/submit-mappa.js
```

Controlli manuali consigliati prima di pubblicare modifiche:

- navigazione desktop/mobile;
- banner cookie e riapertura preferenze;
- compilazione completa della Mappa;
- ricezione notifica interna e conferma email;
- verifica dei tag GTM in preview/debug.

## Design system

- Colori: nero `#0a0a0a`, oro `#C5A55A`, testo `#e8e4d9`.
- Tipografia: Cormorant Garamond per titoli/display, Jost per testo e interfaccia.
- Tono: sobrio, colto, rispettoso, mai sensazionalistico.

## Note editoriali

Ogni modifica ai testi deve rispettare il perimetro definito dal progetto e dalla carta dei principi. La sezione su sessualità, tantra e confini non va alleggerita né resa ambigua: è uno degli elementi che rendono il progetto chiaro e difendibile.

---

© Tao Veda
