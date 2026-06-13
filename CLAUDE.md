# CLAUDE.md — Tao Veda

Sito editoriale **Astro** del progetto Tao Veda (`https://www.tao-veda.org`): pagine `.astro` in `src/pages/`, contenuti dell'hub Conoscenza nelle content collection `src/content/{diario,glossario,bibliografia,tradizioni}` (schema in `src/content/config.ts`).

- **Stato, fasi e decisioni di progetto:** vedi [PROGETTO.md](PROGETTO.md).
- **Generare contenuti** per diario / glossario / bibliografia / tradizioni: usa la skill `tao-veda-insight` (in `docs/skills/tao-veda-insight/`), che applica le stesse regole di voce qui sotto.
- **Workflow git:** si lavora su `main`. **Claude fa il commit in locale; Dario fa il push** da GitHub Desktop. Non committare mai `node_modules/`, `dist/`, `.astro/`.
- **Perimetro del progetto:** Tao Veda è un progetto culturale; non un'attività sanitaria, psicologica, psicoterapeutica o sessuologica clinica. Ogni testo resta coerente con le pagine `/principi` e `/confini`.

## Voce e tono editoriale (vincolante)

Vale per **tutti** i testi: pagine `.astro`, content collection, meta description. Il tono è sobrio, colto, mai New Age, mai sensazionalistico. La regola di fondo: **affermazioni semplici e dirette di un pensiero, non frasi solenni o costruite.** Una frase, un'idea.

Regole pratiche:

1. **Scrivi in positivo e in modo diretto.** Di' cosa una cosa È o può diventare. Evita le costruzioni a effetto: "La formula più precisa, oggi, è questa:", "prima di tutto", "con cautela", i chiasmi e gli epigrammi ("non è una formalità — è…", "non è X: è Y").
2. **Niente trattino lungo " — " nella prosa.** Usa virgola, due punti, "e", parentesi, o spezza la frase. Il "—" resta solo come separatore nei `<title>` SEO (es. "Pagina — Tao Veda") e nei `<cite>`.
3. **Riduci al minimo la parola "non".** Elimina le negazioni "a elefante": nominare ciò che nessuno avrebbe pensato fa l'effetto opposto (es. "non una collezione", "non vende trattamenti", "Non è ancora un'associazione…"). Riformula dicendo cosa la cosa è o diventa.

### Negazioni che restano (confini reali, non teatralità)
Queste sono sostanziali e vanno mantenute così come sono:
- **Perimetro sessuale** (principio 6 e pagina `/confini`): "Non c'è attività sessuale, non c'è finalità di soddisfazione erotica, non c'è ambiguità nel ruolo".
- **Distinzioni cliniche:** non formula diagnosi, non prescrive cure, non sostituisce professioni regolamentate.
- **Disclaimer su Dario**, in grassetto: "Dario non opera attualmente come operatore olistico e non offre trattamenti al pubblico".
- **Citazioni d'autore** (es. «il Tao che può essere nominato non è il vero Tao»).

### Nota di sincronizzazione
Queste regole sono rispecchiate nella sezione "Voce editoriale" della skill `tao-veda-insight` e nella sua `references/checklist.md`. **Se cambiano qui, aggiorna anche lì** (la skill può essere usata fuori dal repo, quindi deve restare autonoma).
