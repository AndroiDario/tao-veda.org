# Tao Veda

Sito istituzionale di **Tao Veda** — approccio al trattamento corporeo olistico e alla consapevolezza, fondato su presenza, ascolto, personalizzazione e chiarezza dei confini.

🌐 **Sito**: [tao-veda.org](https://tao-veda.org)

## Cos'è

Tao Veda nasce dall'incontro fra tradizioni taoiste, visione vedica e pratiche contemplative. Si colloca nell'ambito del benessere e delle discipline bionaturali — non è un'attività sanitaria, psicologica, psicoterapeutica o sessuologica clinica.

## Struttura del repository

```
.
├── index.html      # Sito single-page (HTML + CSS inline)
├── logo.png        # Logo Tao Veda (versione oro su nero)
├── logo-bw.png     # Logo Tao Veda (bianco e nero)
└── README.md
```

Il sito è una single-page application statica senza dipendenze: nessun build step, nessun framework, nessun JavaScript. I font vengono caricati da Google Fonts (Cormorant Garamond + Jost).

## Pubblicazione

### GitHub Pages

1. Crea un repository pubblico (es. `tao-veda` o `tao-veda.github.io`)
2. Carica i file in questo repo
3. Vai su **Settings → Pages**
4. Source: `Deploy from a branch` → `main` / `root`
5. Salva: il sito sarà disponibile a `https://<username>.github.io/tao-veda/`

### Dominio personalizzato (tao-veda.org)

1. Su GitHub: **Settings → Pages → Custom domain** → inserisci `tao-veda.org`
2. Nel pannello DNS del registrar (WordPress.com o altrove), aggiungi:
   - Record `A` verso gli IP di GitHub Pages: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - Record `CNAME` per `www` → `<username>.github.io`
3. Attendi la propagazione DNS, poi attiva **Enforce HTTPS** su GitHub.

In alternativa: Netlify o Cloudflare Pages — basta trascinare la cartella, dominio e HTTPS gratuiti.

## Design system

- **Colori**: nero `#0a0a0a`, oro `#C5A55A`, testo `#e8e4d9`
- **Tipografia**: Cormorant Garamond (display), Jost (body)
- **Tono**: sobrio, colto, rispettoso, mai sensazionalistico

## Note editoriali

Ogni modifica ai testi deve rispettare il perimetro definito nel manifesto e nella carta dei principi. In particolare la sezione *Sessualità, tantra e confini* non va alleggerita né resa ambigua: è uno degli elementi che rendono il progetto chiaro e difendibile.

---

© Tao Veda
