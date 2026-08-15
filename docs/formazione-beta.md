# Formazione Tao Veda: beta privata del corso fondativo

Questo documento governa le due settimane di beta di *La via Tao Veda:
conoscere attraverso il corpo*. Nel repository entrano soltanto conteggi e
sintesi anonime. Nomi, indirizzi email e risposte individuali restano fuori dal
controllo versione.

## Gate prima degli inviti

- [ ] Il deploy di produzione contiene la versione sottoposta a beta.
- [ ] Registrazione, magic link, accesso, logout e revoca sono stati verificati
  su Safari e Chrome, desktop e mobile.
- [ ] IBAN e intestatario della donazione sono visibili nella conclusione.
- [ ] Le migrazioni locali e il database remoto risultano allineati.
- [ ] Esiste un backup cifrato verificato fuori dal repository.
- [ ] Il monitor Supabase ha completato sette giorni senza errori.
- [ ] Supabase Pro è attivo da almeno 48 ore.
- [ ] Tag Assistant conferma Consent Mode e i sette eventi della Formazione.
- [ ] Con consenso rifiutato, il tag GA4 Event resta inattivo.

## Composizione del gruppo

Invita da cinque a dieci persone:

- due o tre persone che conoscono già Tao Veda;
- due o tre persone che incontrano il progetto per la prima volta;
- almeno due persone con esperienza corporea, somatica o contemplativa.

La varietà serve a distinguere i passaggi comprensibili per familiarità da
quelli sostenuti realmente dalla pagina e dal corso.

## Calendario

### Giorno 0

Invia un invito personale con il collegamento alla scheda del corso. Chiedi di
completare almeno il primo modulo entro sette giorni. Il resto del percorso
rimane disponibile con ritmo libero.

### Giorno 3

Controlla i conteggi aggregati di registrazione e accesso alle lezioni. Contatta
soltanto chi segnala spontaneamente un problema. Un mancato accesso può essere
un dato di esperienza, non richiede un sollecito individuale.

### Giorno 7

Raccogli il primo feedback dalle persone che hanno attraversato il modulo 1.
Registra problemi e sintesi anonime nelle tabelle di questo documento.

### Giorno 14

Chiudi la rilevazione, confronta i risultati con il gate finale e assegna le
correzioni nell'ordine: autenticazione, navigazione, contenuto, presentazione.

## Messaggio di invito

> Sto aprendo una piccola beta della Formazione Tao Veda. Il corso fondativo è
> online, gratuito con registrazione via email e sostenuto da una donazione
> facoltativa. Ti chiedo di attraversare almeno il primo modulo entro una
> settimana e di raccontarmi con sincerità dove il percorso è chiaro, utile o
> faticoso. I progressi restano sul tuo dispositivo e la misurazione aggregata
> è attiva soltanto se accetti i cookie analitici.

## Cinque domande di feedback

1. Il percorso dalla scheda del corso alla prima lezione è stato chiaro?
2. Dopo il primo modulo, come descriveresti la proposta della Formazione Tao
   Veda a un'altra persona?
3. Il ritmo fra lettura, pratica e diario ti è sembrato sostenibile?
4. Quale passaggio o pratica ha avuto maggiore utilità concreta?
5. In quale punto hai rallentato, interrotto o incontrato confusione?

## Registro aggregato

| Indicatore | Risultato | Soglia |
| --- | ---: | ---: |
| Persone invitate | 0 | 5–10 |
| Registrazioni completate | 0 | almeno 5 |
| Accessi a lezioni protette | 0 | almeno 3 |
| Completamenti del modulo 1 | 0 | almeno 2 |
| Blocchi aperti | 0 | nessun blocco al lancio |

Aggiorna soltanto i totali. I dati GA4 possono essere inferiori al numero reale
quando una persona rifiuta il consenso analitico; in quel caso il feedback
diretto completa la lettura senza ricostruire l'identità della persona.

## Registro dei problemi

| Data | Gravità | Area | Sintesi anonima | Stato |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |

Usa tre gravità:

- **Bloccante:** impedisce registrazione, accesso o prosecuzione del corso.
- **Importante:** crea incomprensione o perdita di orientamento, con una via
  alternativa ancora disponibile.
- **Migliorativo:** riguarda tono, ritmo, leggibilità o rifinitura visiva.

## Gate finale

La promozione pubblica può iniziare quando le tre soglie quantitative sono
raggiunte, il registro non contiene blocchi aperti, il monitor rimane stabile e
il controllo del `dataLayer` conferma l'assenza di dati personali.

Gli audio con voce umana appartengono al ciclo successivo e non bloccano la
beta. *Mappe del corpo* resta in bozza fino al completamento e alla revisione di
tutte le lezioni.
