# Formazione Tao Veda — architettura evolutiva

## Prima edizione

L’applicazione Astro in `formazione/` viene pubblicata come sito Netlify separato con base directory `formazione` e dominio primario `formazione.tao-veda.org`. I contenuti restano nello stesso repository e sono modificabili dal CMS del sito principale.

I progressi anonimi usano la chiave locale `tao-veda-formazione:via-tao-veda:1.0`. Il cambio sostanziale del programma richiede una nuova versione e una nuova chiave. Nessun progresso viene inviato al server.

Le pratiche usano la sintesi vocale disponibile nel browser e mostrano sempre la trascrizione. Le registrazioni umane potranno sostituire la sintesi valorizzando in futuro un campo audio, senza cambiare i testi.

## Registrazione (implementata)

Il sito usa l’adattatore Astro per Netlify con output ibrido: landing, pagina del corso e pagine dei moduli restano statiche e pubbliche; lezioni, conclusione e area personale sono rese on demand e protette da `src/middleware.ts`. L’autenticazione è Supabase con magic link: la verifica dell’email è implicita nel clic sul collegamento. I contenuti editoriali restano nei file; il database contiene soltanto dati operativi e personali.

Tabelle attive (SQL in `docs/sql/formazione-001-registrazione.sql`, setup in `docs/formazione-supabase-setup.md`):

- `profiles`: dati essenziali dell’utente, creati da trigger alla registrazione;
- `enrollments`: iscrizione per corso con stato `pending_payment`, `active`, `completed` o `revoked`. Il corso gratuito `via-tao-veda` viene attivato automaticamente dal trigger; per i corsi a pagamento lo stato si gestisce dalla dashboard Supabase (Table Editor → enrollments) e l’accesso si apre alla verifica manuale del bonifico.

Row Level Security: gli utenti leggono solo le proprie righe; le scritture avvengono solo via trigger e dashboard. Il sito usa esclusivamente la chiave pubblica (`PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`). I progressi delle lezioni restano in `localStorage`.

Pagine del flusso: `/accesso` (form email unico per registrazione e ingresso, con informativa), `/verifica` (invito a controllare l’email), `/auth/confirm` (verifica del token e apertura sessione), `/profilo` (stato iscrizioni e uscita), `/auth/logout`.

## Evoluzione a pagamento (prevista)

Tabelle future: `billing_profiles` (dati fiscali raccolti solo al pagamento), `course_versions`, `payments`, `lesson_progress` (migrazione dei progressi dal dispositivo), `assessment_attempts`, `submissions`, `reviews`, `attestations`, `invoice_records`. Una colonna `is_admin` su `profiles` e una pagina `gestione` potranno sostituire la dashboard per l’abilitazione degli utenti.

L’attestato richiede tutte le lezioni obbligatorie, almeno l’80% nelle verifiche, prova finale e approvazione umana.

## Gate editoriale

Ogni pubblicazione segue questa gerarchia: Principi, Confini e Consenso; documenti del metodo; tradizioni, bibliografia e glossario; appunti e dispense verificati. La revisione applica `CLAUDE.md` e la checklist di `docs/skills/tao-veda-insight/`.
