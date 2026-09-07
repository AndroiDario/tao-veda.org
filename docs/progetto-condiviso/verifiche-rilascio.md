# Verifiche del primo rilascio del progetto condiviso

Preparazione: 7 settembre 2026. Pubblicazione verificata: 8 settembre 2026, ora italiana.
Base del rilascio: `a0760ce338a76155ad1d3721661a7af6a084739b`,
coincidente con il repository remoto verificato prima delle modifiche.

Commit pubblicato: `c66344672bc91f57463b972cc54043d95b916c89`. Push effettuato
da Dario tramite GitHub Desktop. La nuova pagina è disponibile a
[www.tao-veda.org/partecipare](https://www.tao-veda.org/partecipare).

## Modifiche

Pagina `/partecipare`, carta di affinità con fonte Markdown unica, stato condiviso
`participation: exploratory`, invito in homepage e collegamenti in Chi siamo,
Approccio, Contatti e footer. Aggiunto soltanto il redirect della nuova variante
`/partecipare.html`. Menu principale, percorsi esistenti e funzioni operative
restano invariati.

Le pagine revisionate dichiarano il 7 settembre 2026, da cui la sitemap ricava
il `lastmod`; le altre date non sono aggiornate artificialmente. Nessun nuovo
modulo, database, pagamento o evento analytics. Non si raccolgono ancora
sottoscrizioni formali della carta.

## Risultati locali

| Verifica | Risultato |
| --- | --- |
| Astro check sito | 0 errori, 0 warning; 6 suggerimenti preesistenti su CommonJS/async |
| Test sito | 11 superati, 0 falliti |
| Build sito | Superata: audit SEO su 52 pagine, tracking, stati e accessibilità |
| Astro check formazione | 0 errori, 0 warning, 0 suggerimenti |
| Test formazione | 9 superati, 0 falliti |
| Build formazione | Superata: audit SEO su 11 pagine statiche e tracking |
| Confronto baseline | 62 documenti HTML esistenti conservati; unica aggiunta `/partecipare` |
| Metadati e JSON-LD esistenti | Title, H1, meta, canonical e schemi invariati |
| Collegamenti e ancore | Tutti quelli della baseline ancora presenti |
| Sitemap e robots | Nessun URL rimosso, unica aggiunta `/partecipare`, robots invariati |
| Redirect | Regole precedenti conservate nello stesso ordine; nuova regola aggiunta in coda |
| Browser a 320 e 1280 px | Partecipare, home, Chi siamo, Approccio e Contatti senza overflow orizzontale; un H1 per pagina |
| Browser a 390 px | Nuova pagina leggibile; menu apre e chiude, Escape riporta il focus a Menu; ancora della carta funzionante |
| Email | Destinatario `info@tao-veda.org`, oggetti separati per contributo e ospitalità; nessun messaggio inviato |
| PDF | Proposta 2 pagine, carta 1 pagina; conteggio e testo verificati e tutte le pagine renderizzate e ispezionate |
| IndexNow | Disabilitato durante tutte le build locali |

Il confronto tecnico è ripetibile dopo le build:

```sh
node scripts/seo-continuity.mjs compare docs/progetto-condiviso/verifiche/seo-prima.json
```

La [baseline completa](verifiche/seo-prima.json) contiene esclusivamente dati
pubblici della build prima delle modifiche. Il [risultato del confronto](verifiche/seo-confronto.json)
elenca aggiunte ed eventuali regressioni. La verifica della formazione copre i
documenti statici e il codice SEO protetto, non un nuovo collaudo dei servizi
autenticati o dei flussi email, che non sono stati modificati.

## Verifica pubblica prima del rilascio

Controllate 42 pagine canoniche indicizzabili dei due host: risposte 200,
canonical, title, principali meta e JSON-LD coerenti con la baseline. Robots,
sitemap, redirect apex/www e vecchio `.html` verificati. Nessuna discrepanza.
Evidenza: [controllo pubblico iniziale](verifiche/seo-produzione-prima.json).

Google Search Console e Bing Webmaster Tools riportano alle pagine di accesso
nella sessione disponibile. La baseline di rendimento di 28 giorni non è stata
acquisita: non si formulano conclusioni su traffico, ranking o citazioni AI.

## Pubblicazione e ripristino

Il rilascio ha usato il collegamento Git esistente e la configurazione Netlify
del repository. La verifica pubblica finale ha controllato 42 pagine esistenti
e 12 controlli aggiuntivi, tutti superati. Metadati e JSON-LD delle pagine
esistenti risultano invariati; la nuova pagina risponde 200, compare nella
sitemap e la variante `.html` effettua un 301 al canonical pulito.

Durante il primo controllo la pubblicazione era ancora in corso: la sitemap
precedeva l'aggiornamento della nuova pagina. Il successivo controllo completo,
a deploy aggiornato, non rileva errori. Risultato conservato nel
[rapporto finale di produzione](verifiche/seo-produzione-dopo.json).

Il controllo è ripetibile con:

```sh
node scripts/shared-project-live-audit.mjs docs/progetto-condiviso/verifiche/seo-produzione-dopo.json
```

Lo script effettua soltanto letture: pagine esistenti, stato della nuova pagina,
immagine sociale, inviti, sitemap, robots e redirect. Non invia moduli o notifiche
IndexNow. La presenza di un commit remoto da sola non certifica il deploy.

In caso di regressione introdotta da questo rilascio, ripristinare il precedente
deploy Netlify oppure applicare `git revert` al commit del rilascio e pubblicare
il revert. Non usare reset forzati e non annullare modifiche successive estranee.

## Controlli successivi e lavoro delle persone

Ripetere il controllo pubblico a 7, 30 e 90 giorni dalla pubblicazione verificata.
È attiva un'automazione collegata a questo task: primo controllo il 15 settembre
2026 alle 09:00 Europe/Rome; al termine ripianifica se stessa per l'8 ottobre e
poi il 7 dicembre, senza esecuzioni quotidiane. Dopo l'ultimo controllo si
disattiva. Identificativo: `tao-veda-verifica-seo-a-7-giorni`. Le esecuzioni locali
richiedono che l'app e il computer siano disponibili.

Quando disponibile l'accesso, integrare Search Console e Bing: pagine indicizzate,
canonical selezionati, rendimento delle pagine e query, citazioni dove disponibili.
Un calo di traffico isolato non prova una regressione tecnica.

Restano attività reali da svolgere, non sostituite dagli audit:

- lettura delle pagine da parte di una persona esterna, verificando se distingue
  attività attuali e proposta futura;
- scelta dei contatti e colloqui a cura di Dario;
- disponibilità effettive di promotori e ospitanti;
- verifica con CSV/commercialista e professionisti per attività, responsabilità,
  fiscalità, assicurazione e privacy;
- definizione di informativa, accessi, conservazione e revoca prima di raccogliere
  sottoscrizioni formali; nessun dato personale nei registri Git;
- svolgimento dei tre incontri e decisione associativa dopo la sperimentazione.
