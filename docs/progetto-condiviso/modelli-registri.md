# Modelli dei registri operativi

I modelli sono volutamente vuoti. **Non compilarli nel repository.** Prima di
inserire dati reali, copiare soltanto il modello necessario in un archivio fuori
da Git con accessi limitati, conservazione definita e una persona responsabile.

Nomi, recapiti, opinioni attribuibili, firme, ricevute, coordinate bancarie e
segnalazioni non devono entrare nel controllo versione. Anche codici e iniziali
sono dati personali quando possono essere ricollegati a una persona.

## Registro riservato di contatti e disponibilità

**Finalità:** organizzare colloqui e compiti del pilota. Non classificare
l'affinità personale e non annotare informazioni non necessarie.

```markdown
# Registro riservato — contatti e disponibilità

Responsabile: [fuori da Git]
Persone autorizzate: [fuori da Git]
Finalità: [definire]
Data di cancellazione o riesame: [definire]
Procedura di revoca/correzione: [definire]

| Persona | Recapito autorizzato | Data e origine del contatto | Disponibilità dichiarata | Limiti dichiarati pertinenti | Compito possibile | Prossimo passo autorizzato | Scadenza | Revoca/cancellazione |
| ------- | -------------------- | --------------------------- | ------------------------ | ---------------------------- | ----------------- | -------------------------- | -------- | -------------------- |
|         |                      |                             |                          |                              |                   |                            |          |                      |
```

Non usare campi come punteggio, idoneità, affidabilità o livello di affinità.
Non riportare racconti personali. Registrare un limite soltanto quando serve a
organizzare la partecipazione e la persona ne autorizza la conservazione.

## Registro delle decisioni

**Finalità:** rendere trasparenti decisioni, responsabilità e scadenze. Nella
versione operativa usare i nomi solo se necessari; una sintesi anonima può
essere pubblicata in seguito con una decisione separata.

```markdown
# Registro delle decisioni

| ID  | Data | Decisione | Tipo: consenso/maggioranza/gate | Motivo ed evidenze | Dissensi o condizioni pertinenti | Responsabile | Scadenza | Stato | Data di verifica |
| --- | ---- | --------- | ------------------------------- | ------------------ | -------------------------------- | ------------ | -------- | ----- | ---------------- |
|     |      |           |                                 |                    |                                  |              |          |       |                  |
```

Per decisioni a maggioranza registrare numero di favorevoli, contrari e
astenuti, senza attribuire opinioni salvo necessità e consenso. Un gate su
sicurezza, responsabilità, assicurazione, privacy o liceità resta aperto fino a
verifica e non viene superato dal voto.

## Registro di compiti e responsabilità

```markdown
# Registro di compiti e responsabilità

| Area                     | Risultato atteso | Responsabile | Collaboratori | Data assegnazione | Scadenza | Stato | Blocco o decisione necessaria |
| ------------------------ | ---------------- | ------------ | ------------- | ----------------- | -------- | ----- | ----------------------------- |
| Coordinamento            |                  |              |               |                   |          |       |                               |
| Ricerca culturale        |                  |              |               |                   |          |       |                               |
| Incontri e partnership   |                  |              |               |                   |          |       |                               |
| Amministrazione e tutela |                  |              |               |                   |          |       |                               |
```

Un ruolo senza risultato e scadenza non vale come responsabilità effettivamente
assunta ai fini del Gate 1.

## Registro delle spese

**Finalità:** documentare costi, approvazioni e rimborsi del pilota. Conservare
ricevute e dati fiscali nell'archivio amministrativo appropriato, non nel
repository.

```markdown
# Registro riservato delle spese

Soggetto organizzatore: [da verificare]
Responsabile amministrativo: [fuori da Git]
Regola di approvazione preventiva: [definire]
Trattamento fiscale e documentale: [da validare]

| ID  | Data | Incontro/attività | Categoria | Fornitore o anticipante | Importo | Approvazione preventiva | Documento conservato in | Soggetto che sostiene il costo | Rimborsabile | Data e modalità del rimborso | Note |
| --- | ---- | ----------------- | --------- | ----------------------- | ------: | ----------------------- | ----------------------- | ------------------------------ | ------------ | ---------------------------- | ---- |
|     |      |                   |           |                         |         |                         |                         |                                |              |                              |      |
```

Durante il pilota non sono previsti compensi ai promotori. Separare compensi,
spese anticipate e rimborsi; non chiamare donazione un importo obbligatorio.
Far validare classificazione, documenti e soggetto che incassa o rimborsa.

## Registro anonimo degli esiti

Questo è l'unico modello pensato per poter essere riportato nel repository, ma
solo dopo avere verificato che conteggi piccoli o combinazioni di dettagli non
rendano identificabili le persone.

```markdown
# Esiti aggregati del pilota

Periodo: [data inizio] — [data fine]

| Indicatore                                     | Conteggio o esito aggregato | Nota metodologica             |
| ---------------------------------------------- | --------------------------: | ----------------------------- |
| Colloqui svolti                                |                             |                               |
| Persone presenti ad almeno due momenti         |                             |                               |
| Compiti completati da persone diverse da Dario |                             |                               |
| Incontri realizzati                            |                             |                               |
| Incontri ideati da altre persone               |                             |                               |
| Realtà ospitanti disponibili a un seguito      |                             |                               |
| Spese totali documentate                       |                             | Senza fornitori o anticipanti |
| Gate aperti alla settimana 12                  |                             |                               |
```

Non pubblicare citazioni, motivazioni individuali, combinazioni di ruolo e
presenza o altri dettagli che permettano di riconoscere una persona.
