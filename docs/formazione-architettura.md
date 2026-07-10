# Formazione Tao Veda — architettura evolutiva

## Prima edizione

L’applicazione Astro in `formazione/` viene pubblicata come sito Netlify separato con base directory `formazione` e dominio primario `formazione.tao-veda.org`. I contenuti restano nello stesso repository e sono modificabili dal CMS del sito principale.

I progressi anonimi usano la chiave locale `tao-veda-formazione:via-tao-veda:1.0`. Il cambio sostanziale del programma richiede una nuova versione e una nuova chiave. Nessun progresso viene inviato al server.

Le pratiche usano la sintesi vocale disponibile nel browser e mostrano sempre la trascrizione. Le registrazioni umane potranno sostituire la sintesi valorizzando in futuro un campo audio, senza cambiare i testi.

## Evoluzione autenticata

La fase a pagamento aggiungerà l’adattatore Astro per Netlify, accesso Supabase tramite magic link e PostgreSQL con Row Level Security. I contenuti editoriali resteranno nei file; il database conterrà soltanto dati operativi e personali.

Tabelle previste:

- `profiles`: dati essenziali dell’utente;
- `billing_profiles`: dati fiscali separati e raccolti solo al pagamento;
- `course_versions`: programma e versione attestabile;
- `enrollments`: stato `pending_payment`, `active`, `completed` o `revoked`;
- `payments`: metodo, importo, causale, verifica e riferimento;
- `lesson_progress`: completamenti associati a utente e versione;
- `assessment_attempts`: risposte e punteggio dei quiz;
- `submissions`: elaborati finali;
- `reviews`: revisione e decisione umana;
- `attestations`: numero progressivo, versione, emissione, correzione e revoca;
- `invoice_records`: numero, data e stato della fattura emessa esternamente.

L’accesso viene attivato soltanto dopo la verifica manuale del bonifico. L’attestato richiede tutte le lezioni obbligatorie, almeno l’80% nelle verifiche, prova finale e approvazione umana.

## Gate editoriale

Ogni pubblicazione segue questa gerarchia: Principi, Confini e Consenso; documenti del metodo; tradizioni, bibliografia e glossario; appunti e dispense verificati. La revisione applica `CLAUDE.md` e la checklist di `docs/skills/tao-veda-insight/`.
