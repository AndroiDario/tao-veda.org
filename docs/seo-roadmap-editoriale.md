# Roadmap SEO e GEO editoriale — Tao Veda

> Stato aggiornato al 13 luglio 2026. SEO e GEO seguono la stessa base: contenuti originali, verificabili, attribuiti e tecnicamente accessibili.

## Ruoli delle aree

| Area | Intento principale |
| --- | --- |
| Home | Identità del progetto e orientamento |
| `/approccio` | Visione, perimetro e natura culturale |
| `/conoscenza/la-via-della-conoscenza` | Tesi sul corpo come luogo di conoscenza |
| Sei tradizioni | Pillar tematici e accesso ai cluster |
| Diario | Analisi originali e applicazioni |
| Glossario | Definizioni contestualizzate in una risorsa unica |
| `/formazione` | Ponte editoriale al sottodominio |
| Sottodominio formazione | Corso ad accesso libero, programma e registrazione |

## Stato tecnico implementato

- Interfaccia SEO comune nei due layout: title, description, canonical, robots, Open Graph, autore, date e schema.
- Entità JSON-LD stabili per Tao Veda, Dario Pagnoni, sito principale e sito formazione.
- Article con autore Person, publisher Organization, immagine, date e breadcrumb.
- WebSite, Organization, Course e breadcrumb nella formazione.
- Tag esclusi dalla sitemap e marcati `noindex,follow`.
- Lezioni e pagine operative della formazione escluse da sitemap e robots; risposte protette con `X-Robots-Tag`.
- `lastmod` derivato dalle date dei contenuti, senza timestamp di build artificiali.
- Font locali, cache lunga per asset versionati, immagini dei moduli dimensionate e responsive.
- Immagini Open Graph specifiche per quattro articoli, sei pillar e corso.
- Audit SEO eseguito durante la build e notifica IndexNow post-build in produzione.

## Gate editoriale

Prima della pubblicazione, ogni articolo deve avere:

- titolo e description autonomi;
- autore `dario-pagnoni` e una data reale;
- immagine sociale specifica;
- fonti strutturate con titolo, URL e tipo;
- apertura che renda chiaro l'oggetto senza ricorrere a formule sensazionalistiche;
- distinzione visibile tra fonte, interpretazione Tao Veda ed esperienza pratica;
- linguaggio non clinico e limiti espliciti per affermazioni su corpo, benessere, trauma, Medicina Cinese e Ayurveda;
- collegamento al pillar, alla bibliografia e ai termini utili del glossario.

Una voce di glossario resta nella pagina unica finché non esiste un approfondimento originale sufficiente a sostenere una pagina autonoma. FAQ schema si usa solo dove domande e risposte sono mostrate nella pagina.

## Calendario iniziale

Le prime quattro revisioni sono completate: cinque movimenti, dosha, presenza e via del Drago/Kundalini. La cadenza sostenibile successiva è **un approfondimento originale al mese**, scelto incrociando cluster editoriali e dati reali di Search Console/Bing.

Ordine proposto per i primi sei mesi:

1. Yin e yang: significato, fonti e uso nel progetto — cluster Tao.
2. Prana e respiro nelle fonti indiane — cluster Veda.
3. Chakra: storia del concetto e letture contemporanee — cluster Kundalini.
4. Jung e il processo di individuazione — cluster Occidente.
5. Arcani maggiori come linguaggio simbolico — cluster Tarocchi.
6. Meditazione taoista: cornice e pratica non prescrittiva — cluster Pratica.

Il titolo definitivo nasce dall'evidenza di ricerca e dalla sostanza disponibile, non da un backlog di keyword. Ogni revisione sostanziale aggiorna `aggiornato`.

## Misurazione mensile

Registrare una baseline di 28 giorni prima di fissare target di crescita. Poi monitorare:

- copertura, esclusioni e canonical dichiarato/selezionato;
- impression e click non-brand;
- query e pagine per ciascuno dei sei cluster;
- passaggi organici da `www` alla formazione;
- eventi aggregati per corso, registrazione, lezioni e completamenti senza PII;
- citazioni, grounding query e pagine citate nei report generativi disponibili di Google e Bing.

Controlli straordinari a 7, 30 e 90 giorni dopo la pubblicazione di questa revisione.

## Runbook Google Search Console

1. Verificare la proprietà Dominio `tao-veda.org` tramite record DNS TXT: copre apex, `www` e formazione.
2. Inviare `https://www.tao-veda.org/sitemap-index.xml`.
3. Aggiungere, se utile per l'analisi separata, la proprietà URL-prefix `https://formazione.tao-veda.org/` e inviare `https://formazione.tao-veda.org/sitemap-index.xml`.
4. Ispezionare home, un articolo, un pillar, corso e un modulo. Verificare che tag, accesso e lezione risultino esclusi intenzionalmente.
5. Controllare report Pagine, Core Web Vitals, rendimento e funzionalità generative disponibili dopo 7, 30 e 90 giorni.

## Runbook Bing Webmaster Tools e IndexNow

1. Importare la proprietà dominio da Search Console o verificarla via DNS.
2. Registrare e controllare separatamente entrambi gli host.
3. Inviare le due sitemap canoniche.
4. Verificare che i file chiave IndexNow siano raggiungibili alla root di entrambi gli host.
5. Dopo un deploy di produzione, controllare nei log Netlify la riga `IndexNow: notificati … URL`.
6. Consultare mensilmente Search Performance, Site Explorer e AI Performance, quando disponibile per la proprietà.

`scripts/indexnow-submit.mjs` invia gli URL pubblicati, modificati o rimossi rilevati tra `CACHED_COMMIT_REF` e `COMMIT_REF`. Un cambiamento globale a layout, schema o configurazione invia l'intera sitemap. Impostare `SKIP_INDEXNOW=1` soltanto per manutenzione o debug.

## Distribuzione autorevole

Dopo la stabilizzazione tecnica, cercare poche menzioni autentiche e contestuali: contributi editoriali, bibliografie, interviste, associazioni o progetti culturali affini. Evitare directory generaliste, testi duplicati, comunicati seriali e scambi di link.

## Criteri ricorrenti di accettazione

- `npm run check` e `npm run build` verdi in entrambe le applicazioni;
- tutte le sitemap contengono solo URL pubblici, canonici e indicizzabili;
- nessun link interno o asset mancante nell'audit automatico;
- schema verificato su Rich Results Test e Schema Markup Validator dopo il deploy;
- redirect apex/www e `.html` in un solo passaggio;
- Lighthouse mobile: SEO e accessibilità ≥95, performance ≥90, nessun CLS da immagini.
