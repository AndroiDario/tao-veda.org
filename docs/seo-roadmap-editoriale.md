# Roadmap SEO ed editoriale — Tao Veda

> Aggiornata a giugno 2026, dopo la migrazione a URL puliti e l'arricchimento
> on-page (schema Person/WebSite/FAQ, fonti esterne, internal linking).
> Documento interno: niente di tutto questo implica vendita di trattamenti.

## 1. Posizionamento di ricerca

Tao Veda compete su **query informazionali e culturali**, mai transazionali.
Lo spazio è quello di chi cerca di *capire* — un termine, una tradizione, una
pratica — non di chi cerca di *comprare*. Questo è coerente con il progetto
(laboratorio culturale, nessun servizio in vendita) ed è anche la strategia
giusta: sulle query transazionali del wellness la concorrenza è feroce e
ambigua; su quelle culturali un sito curato, sobrio e ben strutturato può
diventare una fonte citabile (anche dai motori generativi — GEO).

Regole di fondo:

- mai pagine create "per la keyword": ogni contenuto deve avere dignità
  editoriale autonoma;
- ogni articolo apre con una **definizione atomica e citabile** nel primo
  paragrafo (1–2 frasi che rispondono da sole alla query);
- niente promesse, niente linguaggio terapeutico: vale il perimetro della
  pagina Confini anche nelle parole usate per la SEO.

## 2. Cluster per tradizione

I pillar sono le 6 pagine `/conoscenza/tradizioni/<slug>`. Ogni articolo del
diario appartiene a un pillar (`pillar:` nel frontmatter) e il template fa già
il linking inverso automatico. Backlog iniziale, mappato su query reali:

### Tao e Medicina Cinese (`tao`)
| Titolo di lavoro | Query/intento |
|---|---|
| Yin e yang: cosa significano davvero | "yin e yang significato" |
| Wu wei: l'agire senza forzare | "wu wei significato" |
| I meridiani: la mappa energetica del corpo | "meridiani medicina cinese" |
| ~~I cinque movimenti~~ ✔ pubblicato | "cinque movimenti medicina cinese" |

### Tradizione indiana, Ayurveda e Yoga (`veda`)
| Titolo di lavoro | Query/intento |
|---|---|
| Vata, pitta, kapha: le tre costituzioni | "vata pitta kapha differenze", "dosha significato" |
| Il prana e il respiro | "prana cos'è" |
| Cosa sono davvero gli Yoga Sutra | "yoga sutra patanjali" |

### Kundalini, chakra e via del Drago (`kundalini`)
| Titolo di lavoro | Query/intento |
|---|---|
| Kundalini: cos'è (e cosa non è) | "kundalini cos'è" |
| I chakra spiegati senza esoterismi | "chakra cosa sono" |
| L'orbita microcosmica | "orbita microcosmica" |
| ~~Via del Drago e kundalini~~ ✔ pubblicato | "via del drago kundalini" |

### L'Occidente in dialogo con l'Oriente (`occidente`)
| Titolo di lavoro | Query/intento |
|---|---|
| Jung e l'individuazione | "individuazione jung significato" |
| Sincronicità: il caso che ha senso | "sincronicità significato" |
| Il corpo nella psicologia del profondo | "psicologia somatica" |

### Tarocchi, archetipi e simbolo (`tarocchi`)
| Titolo di lavoro | Query/intento |
|---|---|
| Gli arcani maggiori come mappa simbolica | "arcani maggiori significato simbolico" |
| Jodorowsky e la via dei tarocchi | "jodorowsky tarocchi" |

### Pratica del corpo e meditazione (`pratica`)
| Titolo di lavoro | Query/intento |
|---|---|
| La meditazione taoista | "meditazione taoista" |
| Lo shiatsu: principi, non tecniche | "shiatsu principi" |
| Il rilassamento profondo e i suoi livelli | "rilassamento profondo" |

## 3. Cadenza

**2 articoli al mese** è la cadenza realistica e sufficiente: costanza batte
volume. Se un mese consente un solo articolo, va bene; l'importante è non
fermarsi per mesi. Quando un articolo viene rivisto in modo sostanziale,
aggiornare il campo `aggiornato:` nel frontmatter.

## 4. Regole di interlinking per ogni nuovo articolo

Checklist da applicare a ogni pezzo del diario:

- [ ] `pillar:` impostato nel frontmatter (cluster automatico);
- [ ] ≥ 2 ancore verso il glossario (`/conoscenza/glossario#slug`);
- [ ] ≥ 1 ancora verso la bibliografia (`/conoscenza/bibliografia#tradizione`);
- [ ] ≥ 1 link a un articolo precedente del diario, quando esiste un aggancio naturale;
- [ ] sezione di chiusura "Per approfondire" con **1–2 fonti esterne autorevoli**
      (Treccani, schede editore, istituzioni). Mai librerie online o affiliazioni.
      Verificare sempre che l'URL risponda 200 prima di pubblicare;
- [ ] se l'articolo introduce un termine nuovo, valutare se merita anche una
      voce di glossario (definizione atomica + eventuale `fonte` Treccani).

## 5. Convenzioni on-page

- **Title**: ≤ 60 caratteri, formato "X — Tao Veda" (o "X: Y" se serve);
- **Description**: 140–155 caratteri, contiene la risposta, non il teaser;
- **un solo H1** per pagina (il template lo garantisce già);
- primo paragrafo = definizione citabile (regola GEO);
- immagini: `alt` descrittivo, `cover` solo se aggiunge significato.

## 6. Misurazione

Review **mensile** leggera e **trimestrale** seria su Search Console
(proprietà Dominio, vedi runbook sotto):

- quali query generano impression → se una query ha impression ma la pagina è
  un glossario, valutare un articolo dedicato; se ce l'ha un articolo, valutare
  l'ampliamento;
- pagine "Scansionata ma non indicizzata" → di solito si risolve con un link
  interno in più e tempo, non con modifiche frenetiche;
- non guardare il rendimento giornaliero: su un sito nuovo è solo rumore.

---

## 7. Runbook Search Console (da fare una volta, post-deploy)

Contesto: la vecchia proprietà `https://tao-veda.org/` (apex, URL-prefix) vede
solo redirect — il sito vive su `https://www.tao-veda.org`. La sitemap inviata
(`/sitemap.xml`) era morta; ora fa 301 verso `sitemap-index.xml`.

1. **Crea la proprietà Dominio** — GSC → Aggiungi proprietà → tipo **Dominio**
   → `tao-veda.org`. Copia il record TXT `google-site-verification=...`.
2. **Verifica via DNS su Netlify** — Netlify → Domains → `tao-veda.org` →
   DNS records → Add record → tipo TXT, name `@`, value il record copiato.
   Torna su GSC e premi Verifica (da minuti a qualche ora).
   La proprietà Dominio copre apex+www, http+https: la vecchia proprietà apex
   diventa irrilevante (puoi tenerla o rimuoverla).
3. **Invia la sitemap** — nella nuova proprietà: Sitemap →
   `https://www.tao-veda.org/sitemap-index.xml` → Invia.
4. **Richiedi l'indicizzazione delle pagine chiave** — Controllo URL → incolla
   l'URL → "Richiedi indicizzazione", per: `/`, `/approccio`, `/trattamento`,
   `/prima-del-trattamento`, `/mappa-tao-veda`, `/conoscenza`,
   `/conoscenza/la-via-della-conoscenza`, `/conoscenza/glossario`,
   `/conoscenza/bibliografia`, `/percorso-di-dario`.
5. **Aspettative oneste** — sito nuovo, ~0 backlink: l'indicizzazione piena
   richiede **2–8 settimane**. "Rilevata, ma attualmente non indicizzata" è
   normale e si risolve con tempo e contenuti nuovi. Gli URL `.html` appariranno
   come "Pagina con reindirizzamento": è corretto, non è un errore.
   Controlla il report Pagine una volta al mese, non ogni giorno.

### Oltre la Search Console (quando il sito è "a posto")

- **Backlink culturali, non scambi**: bibliografie di scuole DBN, directory di
  progetti culturali, eventuali collaborazioni editoriali. Qualità, poche unità.
- **Bing Webmaster Tools**: import gratuito dalla proprietà GSC, copre anche
  i motori che alimentano alcuni assistenti AI.
- **RSS già attivo** (`/rss.xml`): citarlo nella pagina Conoscenza se si vuole
  renderlo visibile.
