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

## Collegamenti
- [ ] Gli slug del glossario linkati esistono in `src/content/glossario/`.
- [ ] Eventuali opere citate esistono (o sono accurate) in `src/content/bibliografia/`.
- [ ] Link alla pillar della tradizione corretto.

## Front matter
- [ ] `tradizione` e `pillar` sono valori validi dell'enum.
- [ ] `data` in formato `YYYY-MM-DD` (verificata con `date +%Y-%m-%d`).
- [ ] `draft: true` (salvo go-live concordato).
- [ ] Slug del file: minuscole, trattini, conciso.

## Validazione
- [ ] `npm run check` previsto pulito (lo schema non è violato).
