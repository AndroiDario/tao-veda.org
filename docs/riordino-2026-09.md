# Tao Veda: capire la visione, orientarsi, incontrarsi

Consegna locale del 5 settembre 2026. Responsabile editoriale e operativo: Dario Pagnoni.

## Cosa cambia per chi visita il sito

La homepage definisce il progetto, presenta il trattamento e dà accesso diretto a Mappa e incontri. La navigazione usa le cinque voci concordate; il footer raggruppa letture, possibilità di incontro e responsabilità. Le tre letture iniziali sono curate; il Diario mantiene l'ordine cronologico.

Il trattamento descrive esperienza, svolgimento, durata indicativa, persone a cui si rivolge e primo confronto. La pagina degli incontri distingue chi vuole ricevere da chi propone uno scambio fra praticanti. Accoglie adulti senza esperienza, spiega la reciprocità libera, i tre passaggi del confronto e gli accordi privati. Mantiene consenso continuo e confini sostanziali.

La Mappa spiega la restituzione personale di Dario, senza scadenza garantita. Ogni sezione ha un'introduzione; avanzamento, campi facoltativi, errori e conferma sono più leggibili. I messaggi di errore sono associati al campo e il focus segue errori e passaggi. Nome, email e testi liberi hanno un nome accessibile. Otto sezioni, domande, obbligatorietà, condizioni, consensi e payload restano invariati.

Le pagine culturali hanno funzioni distinte. Gli indici accompagnano le letture lunghe; i collegamenti suggeriscono approfondimenti riconoscibili. Autore, date reali e riferimenti sono espliciti. La sitemap usa anche le date di revisione dichiarate dalle pagine istituzionali, senza timestamp di build. Il registro collega le revisioni ai capitoli 2, 3, 15 e 17 del libro consultati.

Il corso mantiene registrazione e progressi. L'anteprima porta direttamente alla prima lezione pubblica. Su mobile titolo e introduzione precedono l'indice espandibile; su desktop l'indice resta aperto. Per la formazione pratica futura è possibile manifestare interesse via email.

## Verifiche effettuate

| Verifica | Esito ed evidenza |
| --- | --- |
| Check Astro sito | 0 errori, 0 warning, 5 suggerimenti di conversione CommonJS/async già presenti |
| Check Astro formazione | 0 errori, 0 warning, 0 suggerimenti |
| Test sito | 8 superati: contratto Mappa, minimizzazione, consensi, cancellazione e fallimenti dei servizi simulati |
| Test formazione | 9 superati: progressi anonimi, deduplicazione e controlli dei servizi simulati |
| Build dei due siti | Superate; inclusi audit SEO e tracking. Sito: anche stati e accessibilità |
| Audit SEO | 49 pagine sito e 11 pagine statiche formazione; la lezione pubblica, resa dal server, verificata nel browser |
| Contratto Mappa | Confronto con la versione precedente: configurazione completa delle sezioni e funzione `buildPayload` identiche |
| Mappa nel browser | Otto sezioni attraversate con dati fittizi; facoltativi lasciati vuoti; errore sui campi obbligatori, ritorno senza perdita di risposte, focus al titolo della sezione e al primo errore |
| Invio Mappa nel browser | Servizio locale simulato: primo POST 503, possibilità di riprovare; secondo POST 200 con `ok: true`, modulo nascosto e conferma focalizzata. Nessun POST inoltrato a servizi esterni |
| Menu e tastiera | Menu mobile aperto/chiuso; Escape chiude e restituisce il focus al pulsante; errori della Mappa descrivono il rispettivo campo |
| Larghezza sito | Homepage a 320, 390, 1024 e 1280 px; trattamento, incontri, Conoscenza, formazione e Mappa a 390 px: nessuno scorrimento orizzontale |
| Corso nel browser | Prima lezione pubblica a 320 px con titolo e introduzione prima dell'indice chiuso; indice apribile. A 1024 px indice aperto a lato |
| Progressi corso | Completamento della prima lezione conservato dopo ricaricamento; stato di prova poi riportato a “da rivedere” |
| Accesso corso | Modulo pubblico consultabile; lezione riservata porta alla pagina di accesso con ritorno alla destinazione. Invio magic link non disponibile nel locale senza configurazione del servizio |
| Tracking | Audit del codice superato; evento Mappa privo di risposte o altri parametri. Ricezione effettiva GA4 non verificata in questa consegna |

La prova con endpoint simulato verifica l'interfaccia, non certifica l'archiviazione e le email reali. Gli audit automatici di accessibilità non equivalgono a una certificazione completa. Il criterio dei 30 secondi va confermato con una persona nuova: chiedere cosa sia Tao Veda, cosa possa fare oggi e come avvicinarsi, senza suggerire le risposte.

## Pubblicazione e verifiche esterne

Dario esegue il push secondo il workflow del repository. Nessun deploy è stato effettuato durante questa consegna.

Dopo la pubblicazione dei due host:

1. Verificare redirect apex/www e vecchi `.html`, canonical, sitemap e URL pubblici. Controllare `lastmod` della guida e delle pagine revisionate; le pagine solo reimpaginate mantengono la data precedente.
2. Provare in un ambiente configurato l'invio Mappa fino ad archiviazione e email; verificare separazione aggiornamenti e cancellazione a 90 giorni secondo il runbook operativo esistente.
3. Provare registrazione, magic link, accesso alle lezioni riservate e progressi; mantenere accessibile l'anteprima senza registrazione.
4. Verificare evento aggregato `compilazione_mappa` e avanzamento del corso in GA4, senza dati personali.
5. Verificare proprietà e sitemap di entrambi gli host in Search Console e Bing; controllare indicizzazione effettiva e registrare la baseline. Il rendimento AI di Google confluisce nel report Web; il report citazioni di Bing si usa quando disponibile.
6. Registrare mensilmente per 90 giorni i conteggi aggregati di Mappa, conversazioni pertinenti, confronti preliminari, incontri, letture e partecipazione. Dario conta manualmente conversazioni e incontri; nessuna risposta personale o valutazione di affinità negli analytics.

Le revisioni operative esterne su privacy, tutele e ambito professionale già aperte restano nel [registro delle fonti](registro-fonti-e-claim.md). Non sono sostituite dai test del sito.

## Sviluppi successivi concordati

Prima consolidare le risposte su trattamento, accesso senza esperienza, scambi e corso. Poi un approfondimento originale al mese, scelto da domande reali e dati di ricerca. La distribuzione presso pochi progetti affini richiede una selezione concreta dei destinatari e materiale autentico; nessun messaggio è stato inviato. Audio/video personale e pubblicazione del libro restano passaggi separati. Non sono stati introdotti chatbot, forum, prenotazioni, altri corsi, nuovi database o sistemi di analytics.
