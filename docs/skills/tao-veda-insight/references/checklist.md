# Checklist di rilettura — articolo Diario Tao Veda

Prima di emettere il file, verifica ogni punto. Se anche uno fallisce, correggi.

## Tono (anti-teatralità)
- [ ] Affermazioni dirette e in positivo; nessuna cornice a effetto ("La formula più precisa…", "prima di tutto", "con cautela", chiasmi tipo "non è X: è Y").
- [ ] Nessun trattino lungo " — " nella prosa (ammesso solo nei separatori `<title>` e nei `<cite>`).
- [ ] La parola "non" è ridotta al minimo; nessuna negazione "a elefante" (nominare ciò che nessuno avrebbe pensato). Restano solo le negazioni di confine sostanziali (perimetro sessuale, distinzioni cliniche, disclaimer su Dario) e le citazioni d'autore.

## Voce e perimetro
- [ ] Tono sobrio e colto, niente New Age, niente sensazionalismo.
- [ ] Nessuna promessa di guarigione; nessuna affermazione medica, psicologica o sessuologica.
- [ ] Il tema generativo/sessuale (se presente) è trattato come energia da sublimare, mai agito o esplicito; nessuna enumerazione di zone "intime" come diverse dal resto.
- [ ] Si parla della persona nella sua totalità; il consenso, se citato, è continuo e revocabile, senza moduli scritti per singole manualità.
- [ ] "tu" cortese col lettore; «Tao Veda» in terza persona.

## Struttura e GEO
- [ ] Le prime 2-3 frasi danno una definizione/osservazione netta e citabile.
- [ ] Titoli di sezione `##` che dicono la cosa (niente `#`, già nel front matter).
- [ ] Sezione finale "Per approfondire" con collegamenti utili.
- [ ] Lunghezza 500-900 parole (salvo approfondimenti motivati).
- [ ] Il markdown si ferma a "Per approfondire": H1, firma, indice, FAQ, "Fonti e riferimenti", tag, "Approfondisci" e CTA li genera il template.
- [ ] Se c'e' il campo `faq`: domande reali, risposte autonome, nessuna ripetizione del corpo. Lo schema FAQPage si usa solo perche' le risposte sono mostrate in pagina.

## Collegamenti
- [ ] Gli slug del glossario linkati esistono in `src/content/glossario/`.
- [ ] Eventuali opere citate esistono (o sono accurate) in `src/content/bibliografia/`.
- [ ] Link alla pillar della tradizione corretto.

## Front matter
- [ ] `tradizione` e `pillar` sono valori validi dell'enum.
- [ ] `data` in formato `YYYY-MM-DD` (verificata con `date +%Y-%m-%d`).
- [ ] `autore: "dario-pagnoni"`, unico valore che lo schema accetta.
- [ ] `fonti` presente con almeno una voce, ogni `url` assoluto e verificato, `tipo` valido.
- [ ] `ogImage` presente, con il PNG che esiste davvero in `public/assets/og/`: card aggiunta in `scripts/generate-og-images.mjs` e `npm run og:generate` eseguito.
- [ ] `draft: false` per la pubblicazione (lo schema ha `false` come default).
- [ ] Slug del file: minuscole, trattini, conciso.

## Validazione
- [ ] `npm run check` pulito (lo schema non è violato).
- [ ] `npm run build` verde: include gli audit SEO, tracking, stati e accessibilità. L'audit SEO si ferma da solo se manca l'og:image, se gli H1 non sono esattamente 1, se un JSON-LD non è parsabile o se un link interno punta a una rotta inesistente.
