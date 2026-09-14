# Revisione editoriale — 11 settembre 2026

Modifiche locali, non pubblicate. Obiettivo: dare priorità alle domande di chi legge e concentrare persone, metodo e organizzazione nelle pagine pertinenti.

## Prima e dopo

| Prima | Dopo |
| --- | --- |
| Box «A cura di Dario Pagnoni · Revisione…» in 13 pagine | Componente e richiami eliminati; firme degli articoli e dati strutturati conservati |
| Home con presentazione del fondatore, gruppo promotore, associazione e formazione futura | Esperienza e possibilità attuali; un invito breve a contribuire a Brescia, collegato a Partecipare |
| Chi siamo ripete catalogo delle attività e prospettive organizzative | Persone, responsabilità editoriali, fonti e invito a contribuire |
| Approccio e hub Conoscenza ripetono firma e stato del progetto | Visione, metodo di lettura e collegamenti alle pagine di riferimento |
| Partecipare anticipa procedure di sottoscrizione non aperte | Possibilità concrete di confronto, sottoscrizione non disponibile e consenso alla pubblicazione del nome |
| Area corsi con scheda numerata di un percorso futuro, biografia e versione tecnica | Catalogo dei corsi disponibili, richiamo distinto alla pratica futura, collegamento alla cura dei contenuti |
| Consenso e lezione 17 descrivono adempimenti futuri del progetto | Spiegano quali informazioni riceverà chi partecipa, se servirà documentare il consenso |

Il nome completo resta in Chi siamo, biografia, firma editoriale, privacy e dati strutturati. La Mappa mantiene l'indicazione di chi legge e risponde. Gli stati tecnici condivisi, le versioni dei corsi e le chiavi dei progressi non cambiano: cambia soltanto la loro presentazione visibile. La carta di affinità conserva data e testo.

## Privacy: punti ancora da chiarire

L'informativa non è stata modificata: le frasi provvisorie segnalano informazioni non risolvibili con una semplice pulizia editoriale. Questo elenco è interno e non viene pubblicato dal sito.

| Punto nella pagina privacy | Evidenza disponibile | Informazione ancora necessaria |
| --- | --- | --- |
| Titolare e contatti: «Identificazione completa… devono essere confermati… prima del rilancio» | Nome e indirizzo email dichiarati nei sorgenti | Conferma del titolare dei dati identificativi e dei recapiti da riportare |
| Finalità / Mappa: «configurazione delle basi giuridiche…» | `netlify/functions/submit-mappa.js` controlla separatamente i consensi servizio e dati particolari; aggiornamenti facoltativi | Conferma delle basi giuridiche; la presenza di checkbox non conclude questa verifica |
| Fornitori: «elenco definitivo… ruoli contrattuali… localizzazione… trasferimenti…» | Codice di invio e conservazione della Mappa tramite Netlify, Airtable e Resend | Contratti, configurazioni effettive, destinatari e garanzie; non deducibili dal codice |
| Chiusura: «Questa pagina non sostituisce la revisione professionale…» | È una nota sul processo di redazione | Completare i punti precedenti prima di togliere il richiamo come se fossero risolti |

Ulteriori affermazioni da verificare sul servizio effettivo: localizzazione UE e ruolo contrattuale di Supabase; esecuzione della cancellazione programmata; eliminazione manuale delle copie email entro 90 giorni. Il codice imposta `Delete After` a 90 giorni e implementa `purge-mappa`, schedulata in `netlify.toml`; ciò non dimostra che il job sia stato eseguito in produzione o che le email siano state eliminate. Nessun account, contratto o casella email è stato verificato in questa revisione.

## Verifiche locali

- Sito principale: 11 test passati; build e audit SEO, tracking, stati e accessibilità superati.
- Area corsi: 9 test passati; build e audit SEO e tracking superati.
- Astro check: zero errori e zero warning su entrambi i siti; 6 hint nel sito principale.
- Browser Chrome: 18 pagine a 390 e 1440 pixel, comprese pagine modificate, un articolo e una lezione pubblica. 36 visite con HTTP 200, un H1, nessun overflow orizzontale, box editoriale o sezione vuota.
- Controllo visivo delle schermate rappresentative di home, Chi siamo, Partecipare, Formazione e articolo; nessuna modifica al sistema grafico.
- Confronto delle build prima/dopo su 63 pagine statiche: URL, canonical, dati strutturati, ancore, URL sitemap, redirect e file SEO/tracking protetti invariati.
- Il confronto rigoroso `seo-continuity.mjs` segnala sei differenze editoriali intenzionali: H1 e metadati di Chi siamo; collegamenti alla formazione futura tolti da home e Chi siamo; mailto generico tolto dal box della carta (restano i contatti con oggetto); collegamento biografico diretto tolto dalla home corsi (sostituito da Chi siamo). Nessuna destinazione è stata eliminata.
- IndexNow disabilitato durante le build locali. Nessun invio della Mappa, registrazione, pubblicazione o verifica dei flussi autenticati.

La lezione 17, non pubblica, è stata verificata nel sorgente e nella build; il campione browser riguarda una lezione liberamente accessibile. Le pagine SSR non sono comprese nelle 63 pagine del confronto statico.

## Anomalia distinta rilevata nell’anteprima corsi

Il banner cookie nell’area corsi locale appare senza lo stile del sito principale. Il layout carica lo script CMP remoto ma il foglio `formazione/src/styles/global.css` non contiene gli stili CMP, presenti invece in `src/styles/styles.css`. La stessa situazione è presente in HEAD prima delle modifiche. Non è stata modificata la CMP in questa revisione editoriale; serve un intervento distinto e una verifica sul sito pubblico. Gli audit statici superati non equivalgono a una verifica visiva positiva del banner.
