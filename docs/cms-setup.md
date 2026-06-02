# CMS Sveltia — guida di setup

Il pannello redazionale è su **`https://www.tao-veda.org/admin`** e permette di
scrivere/aggiornare i contenuti (diario, tradizioni, glossario, bibliografia)
**senza toccare il codice**. Ogni salvataggio fa un commit su GitHub (branch
`main`) e Netlify ripubblica il sito.

L'autenticazione usa **GitHub OAuth** tramite due Netlify Functions
(`netlify/functions/auth.js` e `auth-callback.js`), mappate su `/api/auth` e
`/api/auth/callback` in `public/_redirects`.

## 1. Crea la GitHub OAuth App (una volta sola)

1. GitHub → **Settings** → **Developer settings** → **OAuth Apps** → **New OAuth App**.
2. Compila:
   - **Application name:** `Tao Veda CMS`
   - **Homepage URL:** `https://www.tao-veda.org`
   - **Authorization callback URL:** `https://www.tao-veda.org/api/auth/callback`
3. **Register application.**
4. Copia il **Client ID**. Poi **Generate a new client secret** e copia il **Client Secret** (mostrato una volta sola).

## 2. Imposta le variabili d'ambiente su Netlify

Netlify → il sito tao-veda.org → **Site configuration** → **Environment variables** → aggiungi:

| Nome | Valore |
|------|--------|
| `GITHUB_CLIENT_ID` | il Client ID copiato |
| `GITHUB_CLIENT_SECRET` | il Client Secret copiato |

Poi **Deploys → Trigger deploy → Deploy site** (per applicare le variabili).

> Nota: l'account GitHub usato per il login deve avere accesso in scrittura al
> repository `AndroiDario/tao-veda.org`.

## 3. Usa il pannello

Vai su `https://www.tao-veda.org/admin`, **Login with GitHub**, autorizza l'app
una volta, e inizia a scrivere. Salvando, l'articolo viene committato e il sito
si aggiorna in pochi minuti.

## Editing in locale (senza GitHub)

Per provare il CMS sul tuo Mac senza pubblicare:

```bash
# in due terminali, nella cartella del repo:
npx @sveltia/cms-proxy-server     # avvia il proxy locale
npm run dev                        # avvia il sito
# poi apri http://localhost:4321/admin  (scrive sui file locali)
```

`local_backend: true` in `public/admin/config.yml` abilita questa modalità.

## In sintesi: cosa serve da te
1. Creare la GitHub OAuth App (passo 1).
2. Incollare `GITHUB_CLIENT_ID` e `GITHUB_CLIENT_SECRET` su Netlify e fare un deploy (passo 2).
Tutto il resto (funzioni, config, rotte) è già nel codice.
