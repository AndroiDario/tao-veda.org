# Formazione — setup Supabase (passi manuali per Dario)

Il codice dell'area formazione è pronto per la registrazione con magic link. Questi passi vanno eseguiti una volta nella dashboard Supabase e in Netlify; senza di essi il sito continua a costruire, e le pagine riservate rispondono con un errore di configurazione.

## 1. Creare il progetto

1. Su [supabase.com](https://supabase.com) crea il progetto **tao-veda-formazione**, regione **EU (Francoforte)**.
2. Da *Project Settings → API* copia due valori: **Project URL** e **anon/publishable key**. Serviranno al punto 5. La service role key resta inutilizzata: il sito usa solo la chiave pubblica.

## 2. Configurare l'autenticazione

1. *Authentication → Providers*: lascia attivo solo **Email**. Disattiva "Confirm email" doppio se proposto: il magic link è già la verifica.
2. *Authentication → URL Configuration*:
   - Site URL: `https://formazione.tao-veda.org`
   - Redirect URLs: `https://formazione.tao-veda.org/auth/confirm`, `http://localhost:4321/auth/confirm`, `http://localhost:4323/auth/confirm` (sviluppo locale), `https://*--<nome-sito-formazione>.netlify.app/auth/confirm` (per i deploy preview; sostituisci il nome del sito Netlify).
3. *Authentication → Emails → Magic Link*, template in italiano. Il link usa `{{ .RedirectTo }}` (l'endpoint `/auth/confirm` del sito, con il percorso di ritorno) e il `token_hash`: così funziona in produzione, nei deploy preview e in locale, anche se l'email viene aperta in un browser diverso.
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

In *SQL Editor* esegui una volta il contenuto di [`docs/sql/formazione-001-registrazione.sql`](sql/formazione-001-registrazione.sql). Crea `profiles`, `enrollments`, le policy RLS e il trigger che attiva automaticamente il corso gratuito alla registrazione.

## 5. Variabili d'ambiente

Nel sito Netlify **formazione** (Site configuration → Environment variables) e in `formazione/.env` per il locale:

```
PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
PUBLIC_SUPABASE_ANON_KEY=<anon key>
```

Dopo averle impostate su Netlify, rilancia un deploy.

## 6. Gestire le iscrizioni (corsi a pagamento futuri)

Per il corso gratuito è tutto automatico. Per i corsi a pagamento con bonifico, dalla dashboard:

1. *Table Editor → enrollments*: quando una persona chiede un corso a pagamento, inserisci una riga con il suo `user_id` (lo trovi in *Authentication → Users*), il `course_id` del corso e stato `pending_payment`.
2. Alla verifica del bonifico, porta `status` a `active`: l'accesso si apre al successivo caricamento di pagina.
3. Per chiudere un accesso, porta `status` a `revoked`.
4. Il campo `note` è libero (riferimento bonifico, data, condizioni).

Per cancellare un utente che lo richiede: *Authentication → Users → Delete user*. Profilo e iscrizioni si eliminano a cascata.

## 7. Verifica finale

1. Da anonimo, apri una lezione: devi arrivare su `/accesso`.
2. Registrati con una email reale: arriva l'email dal mittente `formazione@tao-veda.org`, il link apre la lezione.
3. In *Table Editor* compaiono la riga in `profiles` e l'iscrizione `active` in `enrollments`.
4. Porta lo stato a `revoked` e ricarica la lezione: l'accesso si chiude.
