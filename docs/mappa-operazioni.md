# Mappa Tao Veda — configurazione, conservazione e collaudo

Ultimo aggiornamento: 6 settembre 2026.

La Mappa salva ogni compilazione attraverso due canali indipendenti: il record Airtable e una notifica email completa a Dario. Il backend considera ricevuta la Mappa quando almeno uno dei due canali ha acquisito le risposte. Se entrambi falliscono, la pagina conserva la compilazione nel browser e permette di riprovare senza ricominciare. La risposta pubblica di successo resta `{ ok, submissionId }`; dopo il successo il browser invia esclusivamente l'evento anonimo `compilazione_mappa`, senza parametri personali.

## Variabili Netlify obbligatorie

```text
AIRTABLE_API_KEY=...
AIRTABLE_BASE_ID=...
AIRTABLE_TABLE_NAME=Compilazioni
AIRTABLE_CONTACTS_TABLE_NAME=Contatti Mappa
RESEND_API_KEY=...
FROM_EMAIL=...
NOTIFICATION_EMAIL=...
```

Se i nomi delle tabelle non sono impostati, le funzioni usano `Compilazioni` e `Contatti Mappa`. `AIRTABLE_CONTACTS_TABLE_NAME` serve solo a separare nome ed email delle persone che acconsentono agli aggiornamenti. Se il relativo salvataggio fallisce, la Mappa resta acquisita ma quel contatto non può essere usato per aggiornamenti finché non viene verificato.

## Schema Airtable

La tabella indicata da `AIRTABLE_TABLE_NAME` deve avere questi campi:

- `Submission ID` — testo, identificativo tecnico stabile;
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

La notifica operativa contiene nome, email, eventuale contatto richiesto, identificativo, consensi e tutte le risposte complete. Questa copia è un canale di recupero deliberato e va eliminata manualmente dalla casella email entro lo stesso limite di 90 giorni. Il record separato per aggiornamenti non contiene le risposte e resta fino alla revoca del consenso.

I record vengono creati con stato `Notifica pendente`. Dopo la consegna dell'email lo stato passa a `Nuova`. La Scheduled Function `retry-mappa-notifications` cerca ogni 15 minuti i record ancora pendenti, reinvia la notifica completa con una chiave idempotente e aggiorna lo stato dopo il successo.

Nel browser una bozza resta in `localStorage` per un massimo di 24 ore. Non viene trasmessa finché la persona non preme il pulsante di invio, viene aggiornata durante la compilazione e cancellata dopo la conferma di ricezione. L'applicazione non applica una cifratura aggiuntiva alla bozza, quindi la Mappa non va compilata su dispositivi o profili browser condivisi.

## Semantica degli errori

- Se Airtable non è configurato o non salva ma Resend consegna la notifica completa, la funzione risponde con successo: l'email è la copia di recupero.
- Se Airtable salva ma Resend fallisce, la funzione risponde con successo e lascia il record in `Notifica pendente`; il recupero programmato ritenta l'email.
- Se falliscono sia Airtable sia Resend, la funzione risponde con errore e lo stesso `Submission ID`; il browser conserva i dati e il pulsante permette di riprovare senza duplicare il record o l'email.
- Se il salvataggio del contatto aggiornamenti fallisce, la Mappa resta valida ma non si può usare quel consenso finché il contatto non è stato separato correttamente.

## Collaudo prima del rilancio

1. Eseguire `npm test`, `npm run check` e `npm run build`.
2. Inviare una compilazione di prova con soli nome ed email e verificare che telefono e preferenza siano vuoti.
3. Inviare una compilazione con richiesta di conversazione e verificare i campi condizionali.
4. Verificare i tre consensi distinti e la copia separata degli aggiornamenti.
5. Controllare che la notifica operativa contenga tutte le risposte e i consensi, e che l'email di conferma arrivi alla persona.
6. Simulare il fallimento Airtable e verificare la ricezione della notifica completa; simulare il fallimento Resend e verificare lo stato `Notifica pendente` e il recupero programmato.
7. Ripetere lo stesso invio e verificare che il `Submission ID` impedisca duplicati.
8. Impostare temporaneamente `Delete After` nel passato, eseguire `purge-mappa` con “Run now” e verificare la cancellazione.
9. Controllare i log e il `dataLayer` per confermare l'assenza di PII.
10. Verificare e applicare nella casella email la cancellazione entro 90 giorni delle notifiche complete.
11. Chiudere la revisione professionale descritta in `docs/revisione-esterna-safeguarding-privacy.md`.
