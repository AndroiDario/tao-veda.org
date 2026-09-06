# Incidente Mappa del 6 settembre 2026

## Sintomo e impatto

Un invio completo effettuato sul sito pubblico ha ricevuto un errore 502. Il messaggio mostrato alla persona dichiarava correttamente che le risposte non erano state acquisite. La verifica dell'archivio ha confermato l'assenza di nuovi record dopo il 17 agosto 2026.

La compilazione rimasta aperta nella stessa scheda può essere reinviata dopo il deploy del fix. Una scheda ricaricata con la versione precedente non permette il recupero dal server.

## Causa

La funzione pubblicata richiedeva nuovi campi Airtable che non erano presenti nella tabella operativa. Il salvataggio falliva prima dell'invio della notifica. Inoltre la notifica conteneva soltanto il riferimento Airtable e non le risposte complete. Questa sequenza rendeva Airtable un punto singolo di guasto.

## Correzione

- Lo schema della tabella `Compilazioni` contiene ora `Submission ID`, `Delete After`, `Consenso elaborazione` e `Consenso dati particolari`.
- La tabella separata `Contatti Mappa` è disponibile per il consenso facoltativo agli aggiornamenti.
- Archivio Airtable e notifica completa vengono avviati in parallelo.
- La Mappa viene dichiarata ricevuta quando almeno uno dei due canali acquisisce le risposte.
- I record salvati senza notifica restano in `Notifica pendente`; una funzione programmata ritenta ogni 15 minuti.
- La stessa compilazione usa un identificativo stabile per evitare duplicati durante i tentativi.
- Il browser salva una bozza per 24 ore e la elimina dopo la conferma di ricezione.
- I log tecnici contengono soltanto identificativi e stati, senza risposte o dati di contatto.

## Verifiche necessarie per la chiusura

- [x] Schema Airtable allineato.
- [x] Test automatici per successo, guasto Airtable, guasto Resend, doppio guasto e recupero notifiche.
- [ ] Commit pubblicato su Netlify.
- [ ] Invio sintetico in produzione ricevuto sia in Airtable sia nella casella di notifica.
- [ ] Verifica della funzione programmata nei log Netlify.
- [ ] Regola operativa per eliminare entro 90 giorni le email con le risposte complete.

La procedura completa è descritta in `docs/mappa-operazioni.md`.
