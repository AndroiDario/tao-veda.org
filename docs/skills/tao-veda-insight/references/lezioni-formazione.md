# Lezioni dell'area Formazione (formazione.tao-veda.org)

Riferimento per scrivere e rivedere i contenuti del sito Formazione, che vive nell'app Astro separata `formazione/` dello stesso repo. Tre collection, schema in `formazione/src/content.config.ts` (fonte di verità, rileggilo prima di emettere un file).

## Schema delle collection

### `corsi` (`formazione/src/content/corsi/<id>.md`)
```yaml
id: string            # slug del corso, es. via-tao-veda
titolo: string
sommario: string
destinatari: string
risultati: string[]
stato: enum           # bozza | pubblicato | archiviato
versione: string      # es. "1.0"
durata: string        # es. "8–10 ore", aggiornata per ultima (vedi Durata onesta)
accesso: enum         # donazione_libera | pagamento_unico
modalita: enum        # autonomo | accompagnato | coorte
prezzoCentesimi: int  # obbligatorio solo per un corso a pagamento pubblicato
valuta: string        # default EUR
prerequisiti: string  # opzionale
ordine: number
```

### `moduli` (`formazione/src/content/moduli/<slug>.md`)
```yaml
corso: string         # id del corso
titolo: string
sommario: string
risultati: string[]
durataMinuti: number  # somma delle durate delle sue lezioni
ordine: number
immagine: url         # opzionale
didascalia: string    # opzionale
draft: boolean
```
Il body del modulo è un'introduzione di 2-4 frasi: apre il tema e dice cosa il modulo consegna.

### `lezioni` (`formazione/src/content/lezioni/<slug>.md`)
```yaml
corso: string
modulo: string        # slug del modulo
titolo: string
sommario: string
tipo: enum            # studio | pratica | integrazione
durataMinuti: number  # vedi Durata onesta
ordine: number        # dentro il modulo
obiettivi: string[]   # 2-3, concreti, verificabili dal lettore
audio: url            # opzionale
trascrizione: string  # per tipo pratica: testo guidato letto dal PracticeReader
indicazioni: string   # opzionale: come disporsi alla pratica
domande: string[]     # 2-3 domande per il diario personale
fonti: [{titolo, url}]  # link assoluti a www.tao-veda.org (glossario, tradizioni, bibliografia, diario)
draft: boolean
```

## Forma delle lezioni

- **`studio`**: 400-700 parole di corpo. Apertura con una definizione o osservazione netta (2-3 frasi citabili), poi 2-4 blocchi di sviluppo. Dove il tema lo consente, una citazione breve da un classico in `blockquote` con `<cite>`. Chiudi orientando al diario o alla lezione successiva.
- **`pratica`**: corpo breve (100-250 parole) che introduce senso e postura della pratica; la sostanza è nella `trascrizione`: frasi brevi, ritmo disteso, pause naturali fra i paragrafi, verbi all'imperativo gentile ("porta", "osserva", "lascia"). La trascrizione viene letta ad alta voce dalla sintesi vocale: evita parentesi, sigle e link.
- **`integrazione`**: 250-450 parole, asciutta: raccoglie, verifica, orienta al passo successivo.

Le `fonti` collegano ogni lezione all'hub Conoscenza del sito principale: glossario (`https://www.tao-veda.org/conoscenza/glossario#<slug>`), tradizioni, bibliografia, diario, pagine di cornice (approccio, principi, confini, consenso). Da 2 a 4 fonti per lezione, solo se aiutano davvero.

## Voce: le regole del sito valgono tutte

Le regole di `SKILL.md` (anti-teatralità, totalità, sublimazione, consenso continuo, mai clinico) si applicano per intero. In più, due regole proprie della formazione.

### "Meno difensivo", operativamente

Il linguaggio dei confini si concentra dove È la sostanza: il modulo dedicato a consenso e confini, la pagina del corso, i disclaimer clinici e quello su Dario. In ogni altra lezione:

- al massimo **una frase di perimetro**, e solo se il tema la tocca davvero;
- i caveat ripetuti diventano **affermazioni positive** di ciò che la pratica è e produce ("le pratiche si svolgono su di sé e coltivano l'ascolto" invece di elenchi di ciò che il corso non è);
- le negazioni sostanziali restano intatte dove sono a casa loro: perimetro del principio 6, distinzioni cliniche, disclaimer su Dario, citazioni d'autore.

Il criterio: chi legge deve sentire un progetto che sa cosa offre, con confini sereni perché chiari.

### Durata onesta

`durataMinuti` di una lezione = `ceil(parole del corpo / 140)` + tempo della pratica (trascrizione letta a ~100 parole/min, più le pause) + 3 minuti se ci sono `domande`. Arrotonda a multipli di 1, con buon senso.

`durataMinuti` di un modulo = somma delle sue lezioni. Il campo `durata` del corso si aggiorna per ultimo, come intervallo in ore (es. "8–10 ore").

## Fonti da cui attingere (sito principale)

- **Tradizioni:** `src/content/tradizioni/{tao,veda,kundalini,occidente,tarocchi,pratica}.md`
- **Glossario:** le voci in `src/content/glossario/` (qi, yin-yang, wu-wei, meridiani, cinque-movimenti, dosha, prana, nadi, chakra, kundalini, orbita-microcosmica, meditazione, via-del-drago, individuazione, archetipo, sincronicita…)
- **Bibliografia:** le schede in `src/content/bibliografia/` per citazioni e rimandi
- **Diario:** gli articoli in `src/content/diario/`
- **Cornice** (solo controllo di coerenza, senza copiarne il registro difensivo): `src/pages/{principi,confini,consenso,quattro-livelli,approccio}.astro`

## Rilettura

Applica `references/checklist.md`, più questi controlli specifici:
- `grep " — "` sul corpo e sulla trascrizione: zero occorrenze nella prosa;
- densità di "non" in calo rispetto alla versione precedente, con le negazioni sostanziali conservate;
- nessuna enumerazione di zone del corpo trattate come diverse dal resto;
- `durataMinuti` ricalcolata per lezione e modulo;
- `cd formazione && npm run check && npm run build` senza errori.
