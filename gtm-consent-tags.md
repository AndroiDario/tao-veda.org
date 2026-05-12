# GTM consent setup per Tao Veda

Questa configurazione segue il modello Davide/Veda: lo script sorgente del sito imposta il consenso iniziale nel `<head>` prima dello snippet GTM, mentre Google Tag Manager aggiorna lo stato quando riceve l'evento `consent_update`.

## 1. Sorgente del sito

Il sito salva il consenso nel cookie tecnico `tao_veda_consent` come JSON URL-encoded:

```js
{
  version: 1,
  timestamp: '2026-05-12T10:00:00.000Z',
  necessary: true,
  analytics: true,
  marketing: false,
  preferences: false
}
```

Il cookie ha `Path=/`, `Max-Age=31536000`, `SameSite=Lax` e `Secure` quando la pagina è in HTTPS.

Nel `<head>`, prima di GTM, `/assets/js/consent-init.js`:

- legge il cookie valido, se presente;
- imposta `gtag('consent', 'default', ...)` con lo stato salvato;
- per nuovi visitatori imposta tutti i consensi non necessari su `denied` con `wait_for_update: 500`;
- applica sempre `ads_data_redaction: true` e `url_passthrough: false`.

Alla scelta dell'utente, `/assets/js/cmp.js` salva il cookie e invia questo evento:

```js
dataLayer.push({
  event: 'consent_update',
  consent: {
    ad_storage: 'granted|denied',
    ad_user_data: 'granted|denied',
    ad_personalization: 'granted|denied',
    analytics_storage: 'granted|denied',
    functionality_storage: 'granted|denied',
    personalization_storage: 'granted|denied',
    security_storage: 'granted'
  }
});
```

## 2. Tag GTM: Consent Mode - Default

Se nel container esiste un tag Default statico che forza sempre `denied`, va aggiornato o disabilitato: non deve sovrascrivere il consenso già impostato nel `<head>` dal sito per gli utenti di ritorno.

Se vuoi mantenere un tag Default in GTM, usalo solo come fallback e non come fonte primaria. Il default corretto viene già inviato dal sorgente del sito prima del caricamento GTM.

## 3. Trigger GTM

Crea o mantieni un trigger Custom Event:

```text
Nome: CE - consent_update
Event name: consent_update
Trigger: All Custom Events
```

## 4. Tag GTM: Consent Mode - Update

Crea o mantieni un tag Custom HTML:

```html
<script>
  window.dataLayer = window.dataLayer || [];

  function gtag() {
    dataLayer.push(arguments);
  }

  var latestConsentUpdate = null;

  for (var i = window.dataLayer.length - 1; i >= 0; i -= 1) {
    var entry = window.dataLayer[i];

    if (entry && entry.event === 'consent_update') {
      latestConsentUpdate = entry;
      break;
    }
  }

  if (latestConsentUpdate && latestConsentUpdate.consent) {
    gtag('consent', 'update', latestConsentUpdate.consent);
  }
</script>
```

Impostazioni:

- Nome tag: `Consent Mode - Update`
- Trigger: `CE - consent_update`
- Supporto `document.write`: disattivato

## 5. Mapping consenso

- `analytics: true` abilita `analytics_storage`.
- `marketing: true` abilita `ad_storage`, `ad_user_data`, `ad_personalization`.
- `preferences: true` abilita `functionality_storage`, `personalization_storage`.
- `security_storage` resta sempre `granted`.

## 6. Test in Tag Assistant

Prima di considerare chiuso il lavoro:

- In finestra privata, senza cookie, verifica che al caricamento siano `denied`: `ad_storage`, `ad_user_data`, `ad_personalization`, `analytics_storage`, `functionality_storage`, `personalization_storage`.
- Verifica che `security_storage` sia `granted`.
- Clicca `Accetta tutti`: deve comparire `consent_update` e il tag `Consent Mode - Update` deve attivarsi.
- Ricarica la pagina: il consenso salvato deve essere applicato già nel `<head>` prima del container GTM.
- Disattiva o rifiuta le categorie: i consensi tornano `denied`; la CMP rimuove i cookie first-party Google più comuni (`_ga`, `_gid`, `_gat`, `_gcl*`, `_gac*`) quando la categoria relativa non è più autorizzata.

Riferimenti:

- Google Consent Mode: https://developers.google.com/tag-platform/security/guides/consent
- GTM Consent APIs: https://developers.google.com/tag-platform/tag-manager/templates/consent-apis
- Garante Cookie Guidelines: https://www.garanteprivacy.it/home/docweb/-/docweb-display/docweb/9677876
