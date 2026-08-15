# Formazione Tao Veda — architettura evolutiva

## Prima edizione

L’applicazione Astro in `formazione/` viene pubblicata come sito Netlify separato con base directory `formazione` e dominio primario `formazione.tao-veda.org`. I contenuti restano nello stesso repository e sono modificabili dal CMS del sito principale.

I progressi sul dispositivo usano una chiave locale versionata. Il cambio sostanziale del programma richiede una nuova versione e una nuova chiave. Nessun progresso viene inviato al server.

Le pratiche usano la sintesi vocale disponibile nel browser e mostrano sempre la trascrizione. Le registrazioni umane potranno sostituire la sintesi valorizzando in futuro un campo audio, senza cambiare i testi.

## Registrazione (implementata)

Il sito usa l’adattatore Astro per Netlify con output ibrido: landing, pagina del corso e pagine dei moduli restano statiche e pubbliche; lezioni, conclusione e area personale sono rese on demand e protette da `src/middleware.ts`. L’autenticazione è Supabase con magic link: la verifica dell’email è implicita nel clic sul collegamento. I contenuti editoriali restano nei file; il database contiene soltanto dati operativi e personali.

Tabelle attive (migrazioni canoniche in `supabase/migrations`, setup in `docs/formazione-supabase-setup.md`):

- `profiles`: dati essenziali dell’utente, creati da trigger alla registrazione;
- `enrollments`: iscrizione per corso con stato `pending_payment`, `active`, `completed` o `revoked`. Il corso fondativo ad accesso libero viene attivato automaticamente dal trigger; la richiesta di un corso a pagamento nasce come `pending_payment` e l’accesso si apre alla verifica manuale del bonifico.

Row Level Security: gli utenti leggono solo le proprie righe e possono creare soltanto una propria iscrizione `pending_payment`; gli altri stati si gestiscono via dashboard. Il sito usa esclusivamente la chiave pubblica (`PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`). I progressi delle lezioni restano in `localStorage`, con chiave distinta per corso e versione.

Pagine del flusso: `/registrazione` (nome ed email, creazione account), `/accesso` (sola email e nessuna creazione implicita), `/verifica`, `/auth/confirm`, `/profilo`, `/auth/logout` e `/iscrizione/[corso]` per la richiesta dei corsi a pagamento.

## Indicizzazione, schema e misurazione

Sono pubblici e indicizzabili la home, le schede dei corsi pubblicati e le panoramiche dei moduli pubblici. Le lezioni, le conclusioni, registrazione, accesso, verifica, profilo, iscrizione e rotte auth non compaiono nella sitemap; le risposte protette aggiungono anche `X-Robots-Tag: noindex, nofollow, noarchive`.

Il layout espone canonical, Open Graph e JSON-LD condividendo gli identificatori dell'organizzazione del sito principale. Home, corso e moduli aggiungono rispettivamente `WebSite`, `Course` e breadcrumb. Il `lastmod` delle sitemap deriva solo dai campi `aggiornato` del corso e dei moduli.

Il CMP usa un cookie di consenso sul dominio `.tao-veda.org`, quindi la scelta
vale sui due host. Gli eventi analytics misurano visualizzazione del corso,
registrazione, accesso alle lezioni e completamento di lezioni, moduli e corsi.
Contengono soltanto identificativi editoriali e stato di anteprima, senza email,
ID Supabase o testo libero. I traguardi sono deduplicati sul dispositivo per
corso e versione con una chiave distinta dai progressi. IndexNow viene eseguito
soltanto nei deploy di produzione.

Una Scheduled Function Netlify esegue ogni otto ore una richiesta `HEAD` alla
tabella `profiles` con la chiave pubblica. La RLS non restituisce righe e il
controllo verifica gateway, PostgREST e database senza leggere dati personali.
Gli errori vengono registrati nei log Netlify e notificati tramite Resend.

## Accesso economico e sviluppo futuro

Ogni corso dichiara `accesso`, `modalita`, valuta e, quando pubblicato a pagamento, prezzo in centesimi. Il corso fondativo usa `donazione_libera`: la scelta economica resta separata dalla fruizione. I corsi `pagamento_unico` mostrano quota e bonifico, registrano la richiesta e attendono l’attivazione manuale.

Tabelle future: `billing_profiles` (dati fiscali raccolti solo al pagamento), `course_versions`, `payments`, `lesson_progress` (migrazione dei progressi dal dispositivo), `assessment_attempts`, `submissions`, `reviews`, `attestations`, `invoice_records`. Una colonna `is_admin` su `profiles` e una pagina `gestione` potranno sostituire la dashboard per l’abilitazione degli utenti.

L’attestato richiede tutte le lezioni obbligatorie, almeno l’80% nelle verifiche, prova finale e approvazione umana.

## Gate editoriale

Ogni pubblicazione segue questa gerarchia: Principi, Confini e Consenso; documenti del metodo; tradizioni, bibliografia e glossario; appunti e dispense verificati. La revisione applica `CLAUDE.md` e la checklist di `docs/skills/tao-veda-insight/`.
