# Formazione Tao Veda — continuità operativa e lancio

Questo runbook accompagna l'area Formazione dal collaudo interno alla prima
beta. Le operazioni che modificano fatturazione, utenti o iscrizioni richiedono
sempre un controllo umano nella dashboard.

## 1. Intervento immediato dopo un avviso di pausa

1. Apri direttamente
   `https://supabase.com/dashboard/project/byyanpcxwwjshdivvhpc`, senza usare i
   collegamenti dell'email.
2. Verifica che lo stato sia `Running` e apri Table Editor. La visita genera
   attività del progetto.
3. Controlla gli ultimi log di Auth e PostgREST. Un errore HTTP `540` indica un
   progetto in pausa.
4. Se il progetto è in pausa, usa `Resume project`, attendi lo stato `Running`
   e ripeti il collaudo del paragrafo 6.

Il piano Free può essere messo in pausa anche con il monitor attivo. Il piano
Pro è il requisito di continuità prima degli inviti esterni.

## 2. Adottare il database remoto nella cronologia locale

Le due migrazioni in `supabase/migrations` rispecchiano gli script già eseguiti
nel progetto di produzione. Prima di segnalarle come applicate, verifica che il
database remoto non presenti differenze.

```bash
npx supabase login
npx supabase link --project-ref byyanpcxwwjshdivvhpc
npx supabase migration list
npx supabase db diff --linked --schema public
```

Il diff deve essere vuoto oppure contenere soltanto differenze comprese e
documentate. Se è vuoto, registra le due migrazioni come già applicate:

```bash
npx supabase migration repair --status applied 20260713000100
npx supabase migration repair --status applied 20260713000200
npx supabase migration list
npx supabase db push --dry-run
```

Il dry run finale non deve proporre modifiche. Non usare mai
`supabase db reset --linked`: cancella i dati del database remoto.

## 3. Ricostruzione locale

Con Docker Desktop attivo:

```bash
npm run supabase:start
npm run supabase:reset
```

Il reset locale deve applicare entrambe le migrazioni. Le modifiche future
seguono questo ordine: nuova migrazione, reset locale, revisione del diff,
backup remoto e infine `supabase db push`.

## 4. Backup cifrato

La CLI ufficiale produce tre file: ruoli, schema e dati. Lo script li raccoglie
in un archivio AES-256 cifrato, imposta permessi `0600` e rimuove i file
temporanei. La destinazione deve essere un percorso assoluto fuori dal
repository, preferibilmente un volume cifrato con una seconda copia esterna.

```bash
export SUPABASE_DB_URL='postgresql://...'
export TAO_VEDA_BACKUP_PASSPHRASE='una passphrase lunga e unica'
npm run supabase:backup -- /percorso/assoluto/backup-tao-veda
unset SUPABASE_DB_URL TAO_VEDA_BACKUP_PASSPHRASE
```

Verifica che il file `.tar.gz.enc` sia presente e abbia dimensione maggiore di
zero. Conserva la passphrase nel gestore di password, separata dal backup.
Esegui un backup prima della beta e poi ogni mese; il piano Pro aggiunge i
backup giornalieri Supabase con sette giorni di conservazione.

## 5. Monitor Netlify

Nel sito Netlify **Formazione** configura:

```text
RESEND_API_KEY=...
HEALTH_ALERT_TO=...
HEALTH_FROM_EMAIL=formazione@tao-veda.org
```

`PUBLIC_SUPABASE_URL` e `PUBLIC_SUPABASE_ANON_KEY` sono già usate dal sito. La
funzione `supabase-health` parte alle 00:00, 08:00 e 16:00 UTC sui soli deploy
di produzione. Esegue una richiesta `HEAD`; nessuna riga di `profiles` entra
nei log o nell'email.

Dopo il deploy:

1. apri Netlify, **Functions**, `supabase-health`;
2. verifica il badge `Scheduled` e il prossimo orario;
3. usa `Run now`;
4. controlla nel log `supabase-health ok` con stato HTTP 2xx;
5. attendi sette giorni consecutivi senza errori prima del gate di lancio.

## 6. Collaudo end-to-end

Usa un indirizzo email reale destinato al collaudo.

- Da anonimo, una lezione riservata reindirizza ad `/accesso`.
- `/registrazione` invia il magic link con il mittente configurato in Resend.
- Il collegamento apre la destinazione richiesta e crea `profiles` ed
  `enrollments`; `via-tao-veda` risulta `active`.
- Profilo, lezione protetta, avanzamento locale, logout e nuovo accesso
  funzionano su desktop e mobile.
- Impostando temporaneamente l'iscrizione su `revoked`, l'accesso si chiude;
  ripristina `active` al termine del test.
- GTM riceve `course_view`, `registration_start` e `registration_complete`
  senza nome, email o identificativi personali.

## 7. Gate e beta

1. Completa sette giorni di monitor verde e un backup verificato.
2. Passa l'organizzazione Supabase a Pro almeno 48 ore prima degli inviti.
3. Invita 5–10 persone al solo corso fondativo.
4. Durante due settimane registra soltanto conteggi aggregati: inviti,
   registrazioni riuscite, accessi alle lezioni e completamenti del modulo 1.
5. Il risultato minimo è 5 registrazioni, 3 accessi alle lezioni e 2
   completamenti del primo modulo senza blocchi critici.
6. Correggi i blocchi emersi e apri il corso fondativo al pubblico. Il corso
   *Mappe del corpo* resta in bozza fino al completamento editoriale.

## 8. Gestione degli incidenti

- **HTTP 540:** riprendi il progetto dalla dashboard e ricontrolla Auth e
  PostgREST. Sul piano Pro apri anche un ticket Supabase.
- **Magic link assente:** controlla log Auth, SMTP Resend, mittente verificato,
  rate limit e URL di redirect.
- **Monitor verde ma accesso fallito:** esegui il collaudo completo; il monitor
  verifica l'infrastruttura del database, non la consegna email.
- **Backup fallito:** conserva il database invariato, risolvi l'errore e ripeti
  l'export prima di modificare schema o iscrizioni.
