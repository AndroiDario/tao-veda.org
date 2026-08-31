# Consolidamento Tao Veda — verbale QA locale

Data: 31 agosto 2026. Ambiente: build locale dei due siti; nessun deploy o invio reale eseguito.

## Verifiche automatiche

- Sito principale: `npm run check` senza errori.
- Sito principale: test della Mappa su minimizzazione, consensi, sanitizzazione, separazione contatti, Airtable, Resend, log e purge.
- Sito principale: build di 48 route, audit SEO su 49 pagine, audit tracking, audit stati e audit accessibilità verdi.
- Formazione: `npm run check` senza errori, 9 test verdi, build di 11 route e audit SEO/tracking verdi.
- Contratto tecnico Mappa preservato: risposta positiva `{ ok, submissionId }` ed evento anonimo `compilazione_mappa` senza parametri.

## Verifica browser locale

Viewport controllati: 320×800, 390×844, 768×900 e 1280×900.

- Nessun overflow orizzontale rilevato nella home.
- Menu mobile apribile, chiudibile con `Escape`, focus restituito al pulsante; target Menu e Inizia di almeno 44 px.
- Un solo `main`, skip-link presente e destinazione focalizzabile.
- Pulsante Privacy di almeno 44 px: fisso su desktop, nel flusso su mobile per non coprire il contenuto, con margini compatibili con safe area.
- Contrasto dei token testuali sul fondo: testo 15,58:1; muted 5,38:1; oro 8,39:1; oro attenuato 4,77:1.
- Honeypot Mappa assente dall'albero accessibile.
- Percorsi tutti gli otto passi della Mappa senza invio: nell'ultimo passo compaiono i tre consensi distinti; telefono e preferenza non compaiono se non è stato chiesto un contatto.
- Controllo visivo eseguito su home desktop, home 320 px e Mappa 390 px.

## Non verificato localmente

- Configurazione effettiva e schema Airtable in produzione.
- Esecuzione “Run now” della Scheduled Function di cancellazione.
- Invio reale Resend e restituzione manuale.
- Deploy Netlify e comportamento end-to-end autenticato della Formazione.
- Revisione privacy, safeguarding e perimetro professionale da parte di figure esterne.
- Test di comprensione con cinque persone, beta con 5–10 persone e baseline analytics di 28 giorni.

Questi punti restano gate di rilascio e non vanno considerati risolti da una build locale verde.
