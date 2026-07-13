# GTM, GA4 e Consent Mode — Tao Veda

`GTM-5868C6CD` è l'unica porta di misurazione per `www.tao-veda.org` e `formazione.tao-veda.org`. Il codice non deve caricare direttamente `gtag.js` né contenere un secondo Measurement ID.

La configurazione condivisa del repository è in `tracking.config.json`; ogni build esegue `scripts/tracking-audit.mjs` per impedire divergenze fra i due siti.

## Responsabilità dei componenti

| Componente | Dove vive | Responsabilità |
| --- | --- | --- |
| Bootstrap consenso | `public/assets/js/consent-init.js` | Legge/migra il cookie ed espone il listener richiesto dal template GTM. Non chiama le API Consent Mode. |
| Interfaccia CMP | `public/assets/js/cmp.js` | Mostra banner e preferenze, salva la scelta e notifica i listener. |
| Template `Tao Veda Consent` | GTM, Consent Initialization | Imposta il default denied, legge il cookie e applica gli aggiornamenti Consent Mode. |
| Google tag | GTM, Initialization | Carica GA4 `G-Z90EDW2LTN` dopo l'inizializzazione del consenso. |
| Eventi applicativi | `dataLayer` + tag GTM | Inoltra a GA4 solo eventi espliciti e privi di PII. |

La CMP grafica non viene iniettata da GTM: il container ospita il ponte verso Consent Mode. Questa separazione evita che il banner dipenda dal caricamento di uno script terzo.

## Contratto del cookie

Il cookie tecnico condiviso fra sottodomini è `tao_veda_consent`, versione 3:

```text
version=3&timestamp=2026-07-13T10%3A00%3A00.000Z&necessary=1&analytics=1&marketing=0&preferences=0
```

Attributi: `Domain=.tao-veda.org`, `Path=/`, `Max-Age=31536000`, `SameSite=Lax`, `Secure` in HTTPS.

Il formato è intenzionalmente leggibile dal template GTM già pubblicato. Il bootstrap migra una scelta valida dal precedente formato JSON versione 2 mantenendone la data originale.

## Contratto fra CMP e GTM

Prima del container, `consent-init.js` espone:

```js
window.taoVedaAddConsentListener(function (choice) {
  // callback registrato dal template GTM
});
```

Quando la persona salva una scelta, `cmp.js`:

1. aggiorna il cookie;
2. invoca i listener registrati, permettendo al template GTM di chiamare `updateConsentState`;
3. inserisce `consent_update` nel `dataLayer` per debug e anteprima.

Il sito non chiama direttamente `gtag('consent', ...)`: esiste una sola autorità per il Consent Mode, il template del container.

## Configurazione attesa nel container

Verificata sul container pubblicato il 13 luglio 2026:

- Google tag `G-Z90EDW2LTN`, trigger Initialization su tutte le pagine;
- template personalizzato Tao Veda Consent, trigger Consent Initialization su tutte le pagine;
- nessun altro container o Measurement ID nel markup dei due siti.

Il template del consenso deve mantenere questi comportamenti:

- default `denied` per `ad_storage`, `ad_user_data`, `ad_personalization`, `analytics_storage`, `functionality_storage` e `personalization_storage`;
- `security_storage: granted`;
- `wait_for_update: 500`;
- lettura del cookie `tao_veda_consent`;
- registrazione tramite `taoVedaAddConsentListener`;
- `ads_data_redaction: true`.

## Eventi formazione da configurare in GTM

Il repository produce già questi eventi, senza email, ID Supabase o testo libero:

```text
course_view
registration_start
registration_complete
```

Nel container pubblicato verificato il 13 luglio 2026 non risultano ancora tag associati. Per completarli:

1. creare la variabile Data Layer `DLV - course_id`, nome `course_id`, versione 2;
2. creare un trigger Custom Event con espressione regolare `^(course_view|registration_start|registration_complete)$`;
3. creare un tag evento GA4 che usa il Google tag esistente, nome evento `{{Event}}` e parametro `course_id = {{DLV - course_id}}`;
4. associare il trigger e pubblicare una nuova versione del container.

Non configurare un secondo Google tag e non inserire GA4 direttamente nei layout.

## Mappa Tao Veda

Anche `/mappa-tao-veda` carica ora GTM per la normale misurazione della pagina. Le risposte, i dati di contatto e i valori dei campi non entrano mai nel `dataLayer`. Eventuali eventi futuri della Mappa devono essere soltanto aggregati, senza risposte o PII, e richiedono una revisione separata.

## Collaudo in Tag Assistant

1. Nuova finestra privata: Consent Initialization precede Initialization e tutti i consensi opzionali sono denied.
2. Accetta gli analitici: il template riceve la notifica nella stessa pagina e `analytics_storage` diventa granted senza ricaricare.
3. Passa da `www` a `formazione`: la scelta resta valida e il banner non riappare.
4. Genera i tre eventi formazione: il tag GA4 Event deve attivarsi una sola volta per evento.
5. Rifiuta: lo stato torna denied e i cookie `_ga`, `_gid`, `_gat`, `_gcl*` e `_gac*` vengono rimossi quando non autorizzati.
6. Apri la Mappa: il container è presente, ma nel `dataLayer` non compaiono valori del modulo.

## Verifica locale

```bash
npm run tracking:audit
cd formazione && npm run tracking:audit
```

L'audit fallisce se manca GTM, compare un container diverso, GA4 viene caricato direttamente, l'ordine consenso→GTM→CMP è errato o le due applicazioni usano versioni differenti.

Riferimenti ufficiali:

- [Consent Mode sui siti web](https://developers.google.com/tag-platform/security/guides/consent)
- [Template Consent Mode per Tag Manager](https://developers.google.com/tag-platform/tag-manager/templates/consent-apis)
- [Trigger Custom Event](https://support.google.com/tagmanager/answer/7679219)
