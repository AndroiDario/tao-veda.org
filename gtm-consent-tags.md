# GTM consent setup per Tao Veda

Questa configurazione usa la CMP locale del sito e Google Consent Mode v2.

La CMP salva il consenso nel cookie tecnico `tao_veda_consent` e invia questi eventi nel `dataLayer`:

- `tao_veda_consent_default`: nessuna scelta salvata, default negato.
- `tao_veda_consent_ready`: scelta già salvata e letta al caricamento.
- `tao_veda_consent_update`: scelta appena salvata o modificata.

Il valore del cookie è nel formato:

```text
v=2026-05-07&analytics=1&marketing=0&preferences=0&t=1778150000000
```

## 1. Template tag: Tao Veda CMP - Consent Mode

In GTM vai su **Templates > Tag Templates > New** e crea un template chiamato:

```text
Tao Veda CMP - Consent Mode
```

Usa questo codice nel template:

```javascript
const setDefaultConsentState = require('setDefaultConsentState');
const updateConsentState = require('updateConsentState');
const getCookieValues = require('getCookieValues');
const callInWindow = require('callInWindow');
const gtagSet = require('gtagSet');

const COOKIE_NAME = 'tao_veda_consent';

const parseConsentCookie = (value) => {
  const data = {};

  if (!value) {
    return {
      analytics: false,
      marketing: false,
      preferences: false
    };
  }

  value.split('&').forEach((part) => {
    const pair = part.split('=');

    if (pair.length === 2) {
      data[pair[0]] = pair[1];
    }
  });

  return {
    analytics: data.analytics === '1',
    marketing: data.marketing === '1',
    preferences: data.preferences === '1'
  };
};

const toConsentMode = (consent) => {
  return {
    ad_storage: consent.marketing ? 'granted' : 'denied',
    ad_user_data: consent.marketing ? 'granted' : 'denied',
    ad_personalization: consent.marketing ? 'granted' : 'denied',
    analytics_storage: consent.analytics ? 'granted' : 'denied',
    functionality_storage: consent.preferences ? 'granted' : 'denied',
    personalization_storage: consent.preferences ? 'granted' : 'denied',
    security_storage: 'granted'
  };
};

setDefaultConsentState({
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  functionality_storage: 'denied',
  personalization_storage: 'denied',
  security_storage: 'granted',
  wait_for_update: 500
});

gtagSet('ads_data_redaction', true);

const cookieValues = getCookieValues(COOKIE_NAME);

if (cookieValues && cookieValues.length > 0) {
  updateConsentState(toConsentMode(parseConsentCookie(cookieValues[0])));
}

callInWindow('taoVedaAddConsentListener', (consent) => {
  updateConsentState(toConsentMode(parseConsentCookie(
    'analytics=' + (consent.analytics ? '1' : '0') +
    '&marketing=' + (consent.marketing ? '1' : '0') +
    '&preferences=' + (consent.preferences ? '1' : '0')
  )));
});

data.gtmOnSuccess();
```

Permessi del template:

- **Accesses consent state**: Write per `ad_storage`, `ad_user_data`, `ad_personalization`, `analytics_storage`, `functionality_storage`, `personalization_storage`, `security_storage`.
- **Reads cookie value(s)**: `tao_veda_consent`.
- **Accesses global variables**: Execute/call `taoVedaAddConsentListener`.
- **Sets global values**: `ads_data_redaction`.

Crea poi un tag da questo template:

- Nome tag: `CMP - Tao Veda Consent Mode`
- Trigger: `Consent Initialization - All Pages`
- Tag firing options: `Once per page`

## 2. Variabili dataLayer

Crea queste Data Layer Variables:

```text
DLV - Consent Analytics    -> consent.analytics
DLV - Consent Marketing    -> consent.marketing
DLV - Consent Preferences  -> consent.preferences
```

Tipo valore: booleano.

## 3. Trigger

Crea questi trigger Custom Event:

```text
CE - Consent Update
Event name: tao_veda_consent_update
```

Per GA4, usa una variante filtrata:

```text
CE - Consent Update - Analytics Granted
Event name: tao_veda_consent_update
Condition: DLV - Consent Analytics equals true
```

Per tag marketing:

```text
CE - Consent Update - Marketing Granted
Event name: tao_veda_consent_update
Condition: DLV - Consent Marketing equals true
```

## 4. GA4 / Google tag

Per il tag Google/GA4:

- Trigger: `All Pages` e `CE - Consent Update - Analytics Granted`.
- Consent settings: richiedi consenso aggiuntivo `analytics_storage`.
- Tag firing options: `Once per page`.

Così, alla prima visita senza consenso, GA4 non parte. Se l'utente accetta gli analitici sulla stessa pagina, l'evento `tao_veda_consent_update` fa partire il tag dopo l'aggiornamento consenso.

## 5. Google Ads o tag marketing

Per conversion linker, Google Ads, remarketing o tag simili:

- Trigger: solo pagine/eventi necessari più `CE - Consent Update - Marketing Granted`, se devono partire subito dopo il consenso.
- Consent settings: richiedi `ad_storage`, `ad_user_data`, `ad_personalization`.
- Non usare tag marketing con trigger `All Pages` senza consenso aggiuntivo.

## 6. Test in Tag Assistant

Prima pubblicazione:

- Apri una finestra anonima senza cookie.
- In Tag Assistant verifica che al caricamento siano `denied`: `ad_storage`, `ad_user_data`, `ad_personalization`, `analytics_storage`, `functionality_storage`, `personalization_storage`.
- Verifica che `security_storage` sia `granted`.
- Clicca `Accetta tutti`: deve comparire `tao_veda_consent_update` e tutti i consensi devono diventare `granted`.
- Clicca `Rifiuta` o disattiva categorie: i consensi tornano `denied`; i cookie first-party Google più comuni (`_ga`, `_gid`, `_gat`, `_gcl*`, `_gac*`) vengono rimossi quando la relativa categoria non è più autorizzata.

Riferimenti utili:

- Google Consent Mode: https://developers.google.com/tag-platform/security/guides/consent
- GTM Consent APIs: https://developers.google.com/tag-platform/tag-manager/templates/consent-apis
- FAQ cookie Garante Privacy: https://www.garanteprivacy.it/faq/cookie
