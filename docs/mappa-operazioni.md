# Mappa Tao Veda — configurazione, conservazione e collaudo

Ultimo aggiornamento: 31 agosto 2026.

La Mappa accetta una compilazione solo se Airtable è configurato: le risposte complete non vengono più replicate nelle email operative. La risposta pubblica di successo resta `{ ok, submissionId }`; dopo il successo il browser invia esclusivamente l'evento anonimo `compilazione_mappa`, senza parametri.

## Variabili Netlify obbligatorie

```text
AIRTABLE_API_KEY=...
AIRTABLE_BASE_ID=...
AIRTABLE_TABLE_NAME=Mappa
AIRTABLE_CONTACTS_TABLE_NAME=Contatti Mappa
RESEND_API_KEY=...
FROM_EMAIL=...
NOTIFICATION_EMAIL=...
```

`AIRTABLE_CONTACTS_TABLE_NAME` serve solo a separare nome ed email delle persone che acconsentono agli aggiornamenti. Se manca, la Mappa viene comunque archiviata e restituita, ma il consenso agli aggiornamenti non viene copiato: l'errore compare nei log e va risolto prima di inviare comunicazioni future.

## Schema Airtable

La tabella indicata da `AIRTABLE_TABLE_NAME` deve avere questi campi:

- `Created At` — data e ora;
- `Delete After` — data e ora;
- `Nome`, `Email`, `Telefono`, `Preferenza contatto`, `Motivo compilazione` — testo;
- `Risposte JSON` — testo lungo;
- `Consenso elaborazione`, `Consenso dati particolari`, `Consenso aggiornamenti`, `Conferma non diagnosi` — checkbox;
- `Stato`, `Note interne` — testo.

La tabella indicata da `AIRTABLE_CONTACTS_TABLE_NAME` deve avere:

- `Created At` — data e ora;
- `Nome`, `Email`, `Fonte` — testo;
- `Consenso aggiornamenti` — checkbox.

Non aggiungere formule di scoring o campi derivati dalle risposte.

## Conservazione

Ogni record grezzo riceve `Delete After` a 90 giorni dalla ricezione. La Scheduled Function `purge-mappa` viene eseguita ogni giorno alle 03:15 UTC e cancella tutti i record scaduti. Nei log compaiono solo quantità e stati tecnici, mai nomi, email o risposte.

Le email operative contengono nome, email, eventuale contatto richiesto, identificativo del record e data massima di cancellazione; non contengono il questionario. Il record separato per aggiornamenti non contiene le risposte e resta fino alla revoca del consenso.

## Semantica degli errori

- Se Airtable non è configurato o non salva, la funzione risponde con errore e non invia email: la pagina non dichiara acquisita la Mappa.
- Se Airtable salva ma Resend fallisce, la funzione risponde con successo perché le risposte sono recuperabili nel record; il fallimento email è registrato senza PII.
- Se il salvataggio del contatto aggiornamenti fallisce, la Mappa resta valida ma non si può usare quel consenso finché il contatto non è stato separato correttamente.

## Collaudo prima del rilancio

1. Eseguire `npm test`, `npm run check` e `npm run build`.
2. Inviare una compilazione di prova con soli nome ed email e verificare che telefono e preferenza siano vuoti.
3. Inviare una compilazione con richiesta di conversazione e verificare i campi condizionali.
4. Verificare i tre consensi distinti e la copia separata degli aggiornamenti.
5. Controllare che l'email operativa non contenga `Risposte JSON`.
6. Impostare temporaneamente `Delete After` nel passato, eseguire `purge-mappa` con “Run now” e verificare la cancellazione.
7. Controllare i log e il `dataLayer` per confermare l'assenza di PII.
8. Chiudere la revisione professionale descritta in `docs/revisione-esterna-safeguarding-privacy.md`.
