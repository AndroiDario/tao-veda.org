# Geometrie in relazione — estensione completa

Consegna locale del 15 settembre 2026. Nessuna pubblicazione eseguita in questa sessione.

## Implementazione

Identità estesa ai layout di tutto il sito pubblico e della formazione: navigazione, footer, aperture editoriali, hub, tradizioni, bibliografia, glossario, corsi, moduli, lezioni e schermate di accesso. La firma geometrica interna è statica e decorativa. Tipografia, superfici e spaziature riprendono il pilota approvato. Su mobile rimangono visibili anche i collegamenti Corsi e Accedi della formazione.

Modifiche circoscritte a due layout e due fogli CSS; nessuna nuova libreria o script. L'admin editoriale resta fuori dal restyling pubblico. Testi, fotografie, logo, domande, dati, API, autenticazione, progressi e tracking preservati.

## Confronto e reversibilità

Baseline dell'estensione prodotta con build aggiornate: `/tmp/taoveda-full-baseline`. Comprende il pilota approvato e le revisioni editoriali preesistenti. Il confronto visuale `http://127.0.0.1:4335/confronto.html` presenta invece la trasformazione complessiva rispetto alla baseline precedente al pilota, per le pagine selezionabili; include il collegamento alla formazione attuale.

Anteprime: sito `http://127.0.0.1:4321/`, formazione `http://127.0.0.1:4322/`. I link fra domini conservano gli indirizzi originali: possono quindi aprire il sito pubblico.

`output/ux-pilota/estensione.patch` registra solo l'estensione rispetto al pilota: verificato `git apply --reverse --check`. Applicazione inversa da rivalutare se intervengono ulteriori modifiche. La precedente `restyling.patch` documenta il pilota, non è una patch di ripristino dell'intero stato corrente. Non annullare indiscriminatamente i commit che comprendono anche altre revisioni.

## Verifiche

- Audit indipendente: 63 HTML di baseline (52 sito, 11 formazione), testo normalizzato, titoli H1–H6 in ordine, metadati, link, ancore, script inline e dati strutturati invariati. Asset JavaScript identici; public e shared invariati. Sitemap, robots e redirect identici.
- Ultimo confronto `seo-continuity`: 63 pagine esistenti, nessuna pagina o URL sitemap aggiunto, nessun errore.
- Build finali con `SKIP_INDEXNOW=1`: superate. Test: 11 principali e 9 formazione. Audit SEO, tracking, stati e accessibilità del sito superati; audit formazione superati.
- Check principale: zero errori, zero warning, sei suggerimenti. Check formazione: zero errori e warning.
- Sette HTML duplicati estranei ai sorgenti erano presenti nel vecchio output; dopo la build finale non risultano più file con suffisso ` 2.html` o ` 3.html` nel dist principale.
- Matrice browser: 320, 390, 768, 1280, 1440 px per Approccio, Conoscenza, Tradizioni, Bibliografia, Glossario, Diario, Contatti; homepage formazione, pagina corso, lezione aperta, accesso e profilo non autenticato (che rinvia all'accesso). Nessun overflow orizzontale rilevato in 60 controlli. Questi controlli dimensionali non equivalgono alla revisione visuale di ogni singola pagina.
- Screenshot esaminati: apertura editoriale desktop, Tradizioni desktop e 320 px, formazione desktop e 390 px, lezione a 390 px. Nessuna sovrapposizione osservata. Menu mobile: apertura, Escape e ritorno del focus al pulsante verificati.
- Le verifiche funzionali dettagliate della Mappa, invio simulato, recupero bozza, no-JS e movimento ridotto del pilota sono documentate in `ux-pilota-2026-09-15.md`. Le relative logiche non sono state cambiate dall'estensione.

## Peso e prestazioni

CSS finali gzip: 4.088 byte sito e 2.248 byte formazione. SVG sorgente gzip circa 482 byte. Incremento JavaScript dell'estensione: zero. Nessun nuovo servizio o richiesta a terzi introdotto dal codice di design.

Campioni locali di produzione, stessa strumentazione e viewport 390×844, tre caricamenti alternati prima/dopo per pagina; LCP in ms:

| Pagina | Prima | Dopo | CLS |
| --- | --- | --- | --- |
| Approccio | 136, 80, 80 | 108, 100, 80 | 0 in tutti i campioni |
| Conoscenza | 76, 112, 88 | 108, 104, 100 | 0 in tutti i campioni |
| Tradizioni | 88, 76, 88 | 68, 88, 80 | 0 in tutti i campioni |

Ripetizione Conoscenza invertendo l'ordine: prima 84, 92, 100; dopo 84, 84, 104; CLS sempre zero. La differenza iniziale non si ripete nel secondo gruppo. Tempi così brevi e oscillanti non certificano il vincolo del 5% su dispositivi reali. Non è stato completato un benchmark di produzione a tre campioni su ogni pagina della formazione o su tutto il sito: il budget in byte è verificato, il requisito prestazionale globale resta da validare prima della pubblicazione.

## Limiti della verifica locale

Non certificati: zoom nativo 200%, tastiera virtuale su dispositivo reale, tutte le viste dopo autenticazione, prestazioni sul dominio pubblico e audit completo WCAG. Nessun accesso o dato personale sintetico inviato a backend reali in questa estensione. Il restyling è implementato e navigabile; queste verifiche rimangono controlli pre-pubblicazione, non prove già superate.

Log principali: `/tmp/taoveda-full-final-build.log`, `/tmp/taoveda-full-check.log`, `/tmp/taoveda-full-training-after.log`.
