# Formazione — setup Supabase (passi manuali per Dario)

Il codice dell'area formazione è pronto per la registrazione e l'accesso con magic link. Questi passi vanno eseguiti una volta nella dashboard Supabase e in Netlify; senza di essi il sito continua a costruire, e le pagine di registrazione e accesso mostrano che il servizio è in preparazione.

## 1. Creare il progetto

1. Su [supabase.com](https://supabase.com) crea il progetto **tao-veda-formazione**, regione **EU (Francoforte)**.
2. Da *Project Settings → API* copia due valori: **Project URL** e **anon/publishable key**. Serviranno al punto 5. La service role key resta inutilizzata: il sito usa solo la chiave pubblica.

## 2. Configurare l'autenticazione

1. *Authentication → Providers*: lascia attivo solo **Email**. Disattiva "Confirm email" doppio se proposto: il magic link è già la verifica.
2. *Authentication → URL Configuration*:
   - Site URL: `https://formazione.tao-veda.org`
   - Redirect URLs: `https://formazione.tao-veda.org/auth/confirm`, `http://localhost:4321/auth/confirm`, `http://localhost:4323/auth/confirm` (sviluppo locale), `https://*--<nome-sito-formazione>.netlify.app/auth/confirm` (per i deploy preview; sostituisci il nome del sito Netlify).
3. *Authentication → Emails → Magic Link*, template in italiano. Il link usa `{{ .RedirectTo }}` (l'endpoint `/auth/confirm` del sito, con percorso di ritorno e tipo di flusso) e il `token_hash`: così funziona in produzione, nei deploy preview e in locale, anche se l'email viene aperta in un browser diverso.
   - Oggetto: `Il tuo accesso alla Formazione Tao Veda`
   - Corpo (HTML minimo):
     ```html
     <p>Questo collegamento apre il tuo accesso all'area Formazione Tao Veda.</p>
     <p><a href="{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=email">Entra nell'area Formazione</a></p>
     <p>Il collegamento vale per un'ora e per un solo utilizzo.</p>
     <p>Se non hai richiesto questo accesso, ignora questo messaggio.</p>
     ```
4. OTP expiry: 3600 secondi (default). Rate limit: default.

## 3. SMTP con Resend (obbligatorio prima del lancio)

L'SMTP integrato di Supabase è limitato (circa 2 email/ora) e usa un mittente anonimo: le email finirebbero in spam.

1. In Resend (account già attivo per la Mappa) verifica che il dominio `tao-veda.org` copra il mittente scelto, per esempio `formazione@tao-veda.org`.
2. In Supabase, *Project Settings → Auth → SMTP Settings*:
   - Host: `smtp.resend.com`, porta 465
   - Username: `resend`
   - Password: una API key Resend
   - Sender: `formazione@tao-veda.org`, nome `Formazione Tao Veda`

## 4. Creare le tabelle

In *SQL Editor* esegui nell'ordine:

1. [`docs/sql/formazione-001-registrazione.sql`](sql/formazione-001-registrazione.sql), che crea `profiles`, `enrollments`, le policy RLS e l'iscrizione automatica al percorso fondativo;
2. [`docs/sql/formazione-002-profili-iscrizioni.sql`](sql/formazione-002-profili-iscrizioni.sql), che salva il nome passato dalla registrazione e permette a ogni utente di creare soltanto una propria richiesta `pending_payment`.

## 5. Variabili d'ambiente

Nel sito Netlify **formazione** (Site configuration → Environment variables) e in `formazione/.env` per il locale:

```
PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
PUBLIC_SUPABASE_ANON_KEY=<anon key>
PUBLIC_DONATION_IBAN=<iban usato per donazioni e quote corso>
PUBLIC_DONATION_ACCOUNT_HOLDER=<intestatario del conto>
```

Le due variabili del conto alimentano sia la donazione conclusiva del corso fondativo sia le istruzioni per i corsi a pagamento. Dopo aver impostato le variabili su Netlify, rilancia un deploy.

## 6. Gestire le iscrizioni (corsi a pagamento futuri)

Per il corso fondativo ad accesso libero l'iscrizione è automatica. Per i corsi a pagamento con bonifico:

1. la persona apre la scheda pubblica, accede o si registra e conferma la richiesta in `/iscrizione/<course_id>`;
2. la richiesta compare in *Table Editor → enrollments* con stato `pending_payment`, mentre il profilo mostra importo, IBAN e causale univoca;
3. alla verifica del bonifico, porta `status` a `active`: l'accesso si apre al successivo caricamento di pagina;
4. per chiudere un accesso, porta `status` a `revoked`;
5. il campo `note` è libero per data di verifica e riferimenti operativi essenziali.

Per cancellare un utente che lo richiede: *Authentication → Users → Delete user*. Profilo e iscrizioni si eliminano a cascata.

## 7. Verifica finale

1. Da anonimo, apri una lezione: devi arrivare su `/accesso`.
2. Da `/registrazione`, inserisci nome ed email reali: arriva l'email dal mittente `formazione@tao-veda.org`, il link apre la destinazione richiesta.
3. In *Table Editor* compaiono il nome in `profiles` e l'iscrizione `active` al corso fondativo in `enrollments`.
4. Esci e usa `/accesso` con la stessa email: il magic link apre la sessione senza creare un nuovo utente.
5. Porta lo stato a `revoked` e ricarica la lezione: l'accesso si chiude.
