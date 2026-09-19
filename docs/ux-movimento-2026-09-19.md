# Movimento in relazione — strato dinamico legato allo scorrimento

Consegna del 19 settembre 2026, estensione di "Geometrie in relazione" (`docs/ux-pilota-2026-09-15.md`, `docs/ux-estensione-2026-09-15.md`).

## Intervento

Il redesign di settembre aveva lasciato il sito volutamente immobile: l'unica animazione era l'ingresso di 800 ms del `RelationMark` sulla homepage. Qui lo scorrimento diventa il motore del movimento, su tutto il sito pubblico.

Otto interventi, tutti in CSS:

1. **Il segno che ruota.** Il `RelationMark` ruota e trasla mentre attraversa lo schermo, sulle intestazioni editoriali, sulla guida e nell'apertura della homepage. Proprietà indipendenti `rotate` e `translate`, così le keyframe di ingresso di `geometrie.css` sui gruppi interni restano intatte.
2. **Il segno che si disegna.** Sulla sezione `.home-map` della homepage il segno si compone tratto per tratto (`stroke-dashoffset`) mentre la sezione attraversa il viewport.
3. **Parallasse sulle fotografie.** L'immagine scorre più lenta della pagina dentro la cornice: homepage, trattamento, percorso di Dario, formazione.
4. **Apertura delle sezioni e delle righe.** Sezioni, righe del diario, tradizioni, schede dell'hub, glossario e bibliografia salgono di 16 px e si schiariscono entrando. Ogni riga ha la propria timeline, quindi la cascata nasce da sola senza ritardi calcolati.
5. **Linea di avanzamento della lettura.** Filo dorato di 2 px sul bordo superiore della navigazione, largo quanto la pagina già letta.
6. **Colonne ferme.** Su `#inizia` la fotografia resta ferma mentre il testo scorre; su `#progetto-condiviso` lo fa il titolo. Solo sopra gli 800 px.
7. **Transizioni tra pagine.** `@view-transition { navigation: auto; }`: il contenuto sfuma e la navigazione resta ferma. Navigazioni vere, nessun routing lato client.
8. **Menu mobile.** Il pannello entra con `@starting-style` e `transition-behavior: allow-discrete`, senza toccare il JavaScript di `Nav.astro`.

### Due scelte tecniche che decidono il risultato

**`overflow: clip`, mai `hidden`.** Una cornice con `overflow: hidden` diventa un contenitore di scorrimento, e la timeline `view()` dell'immagine al suo interno si risolve contro un box che non scorre: la parallasse resta ferma. `clip` ritaglia senza creare il contenitore. Vale per le cornici delle fotografie e per il ritaglio del segno grande su mobile.

**L'opacità di apertura parte da `.2`, mai da `0`.** Con `animation-timeline: view()` un elemento sotto la piega resta all'inizio della propria timeline anche in un rendering headless, e Googlebot renderizza con Chromium: partendo da `0` quel testo sarebbe trasparente al momento del rendering. A `.2` nessun testo è mai invisibile per un'euristica di hidden text, e alla velocità reale dello scorrimento la differenza visiva è impercettibile. Misurata: opacità minima al caricamento `0.2`.

### Il segno grande su mobile

Sotto gli 800 px `geometrie.css` nascondeva il segno della sezione `.home-map`, e quella sezione restava senza movimento per tutta la sua altezza. Ora il segno torna visibile a larghezza 78%, opacità .16, dietro al testo (`z-index: -1`, `aria-hidden`, `pointer-events: none`), e si disegna mentre si scorre. È l'unica modifica di layout mobile della consegna. La sezione riceve `overflow-x: clip` perché il segno sborda a destra di proposito.

## Perimetro

Fuori: `formazione.tao-veda.org` (app Astro separata con il proprio `geometrie.css`), l'admin editoriale.

La **Mappa** (`data-design="map"`) resta quieta: otto sezioni di modulo, validazione e scorrimento guidato ai campi non convivono con sezioni che entrano e con una barra che si confonde con quella del questionario. Verificato: zero sezioni animate, linea di avanzamento disattivata.

## File

| File | Intervento |
| --- | --- |
| `src/styles/movimento.css` | Nuovo, 7.136 byte sorgente |
| `src/layouts/BaseLayout.astro` | Due righe: import `?inline` e `<style is:inline>` |

Zero modifiche a `src/pages/`, `src/components/`, `src/content/`, `public/`, `astro.config.mjs`, `package.json`. **Nessuna modifica al markup:** ogni selettore esisteva già.

## Continuità dei contenuti e SEO

La verifica decisiva, con build di produzione locale prima e dopo:

- **55 HTML su 55 byte-identici** una volta rimosso il singolo nuovo blocco `<style>`. Nessun'altra differenza in nessun file.
- **Tutti gli asset non-HTML byte-identici**: sitemap, robots, redirect, JavaScript, font, fotografie, immagini OG.
- `scripts/seo-continuity.mjs`: 55 pagine esistenti, nessuna pagina aggiunta, nessun URL di sitemap aggiunto, **zero errori**.

## Verifiche superate

Build di produzione locale, Chromium 1194, `SKIP_INDEXNOW=1`.

| Controllo | Risultato |
| --- | --- |
| `npm run build` (11 test, audit SEO, tracking, stati, accessibilità) | Superata |
| `npm run check` | 0 errori, 0 warning, 6 hint (identico alla baseline) |
| Continuità SEO | 55 pagine, 0 errori |
| Overflow orizzontale | 60 controlli: 12 pagine × 320, 390, 768, 1280, 1440 px, scorrendo l'intera pagina. Nessun overflow |
| CLS | 0 su homepage, Approccio, Conoscenza e Trattamento, scorrendo tutta la pagina |
| Opacità del testo al rendering | Minima 0.2, mai 0 |
| `prefers-reduced-motion: reduce` | Zero animazioni attive, contenuto a piena opacità, `scroll-behavior: auto` |
| Mancato supporto (Firefox) | Fixture con `@supports` forzato a fallire: opacità 1, zero animazioni aggiunte, zero fotografie scalate, zero cornici ritagliate, zero overflow. Restano attive le tre keyframe di ingresso preesistenti della homepage |
| Menu mobile | Apre, Escape chiude, il fuoco torna al pulsante, piena opacità dopo la transizione |
| Transizioni tra pagine | Clic su un link: due eventi `load` completi, titolo e H1 corretti, `dataLayer` presente, navigazione della pagina ancora funzionante |
| Movimento effettivo | Linea di avanzamento `0 1` → `0.088 1`; rotazione del segno `9.88deg` → `12deg`; parallasse `-4.96%` → `-1.54%` |
| La Mappa resta quieta | Zero sezioni animate, linea di avanzamento `none` |

## Peso

| Voce | Valore |
| --- | --- |
| CSS inline prima | 3.448 byte gzip |
| CSS inline dopo | 4.486 byte gzip |
| Incremento di `movimento.css` | **1.038 byte gzip** |
| Incremento JavaScript | **zero** |
| Librerie, richieste di rete, asset aggiunti | nessuno |

## Supporto dei browser

Tutto lo scroll-driven vive dentro `@supports (animation-timeline: view())`. Chrome, Edge e Safari 26 lo eseguono; Firefox a settembre 2026 tiene ancora la funzionalità dietro `layout.css.scroll-driven-animations.enabled` e legge il sito statico di oggi, verificato con fixture. Copertura globale attorno all'83% e in crescita autonoma. Le transizioni tra pagine seguono la stessa logica: Chrome e Safari 18.2+, Firefox naviga come prima.

Sticky e transizione del menu mobile restano fuori dalla guardia `@supports`: sono comportamenti di layout consueti, supportati ovunque.

## Limiti della verifica

Non certificati: zoom nativo al 200%, tastiera virtuale su dispositivo reale, Safari e Firefox su dispositivo reale (qui è stato usato solo Chromium), prestazioni sul dominio pubblico, audit WCAG completo, Core Web Vitals di campo. La chiusura animata del menu mobile dipende da come il browser gestisce la transizione discreta di `display`: se non risulta pulita, l'uscita resta istantanea e va bene così.

Non è stato eseguito un benchmark LCP a tre campioni per pagina: il budget in byte è verificato e il CLS è misurato a zero, la conferma prestazionale sul dominio pubblico resta un passaggio pre-pubblicazione.

## Reversibilità

`output/ux-movimento/movimento.patch` contiene l'intera consegna, con `git apply --reverse --check` superato. In alternativa bastano la cancellazione di `src/styles/movimento.css` e la rimozione delle due righe in `BaseLayout.astro`.
