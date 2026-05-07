(function () {
  'use strict';

  var consentApi = window.taoVedaConsent || {};
  var COOKIE_NAME = consentApi.cookieName || 'tao_veda_consent';
  var CONSENT_VERSION = consentApi.version || '2026-05-07';
  var COOKIE_MAX_AGE = 60 * 60 * 24 * 183;
  var DEFAULT_CHOICES = {
    analytics: false,
    marketing: false,
    preferences: false
  };
  var root;
  var banner;
  var modal;
  var floatingButton;
  var previousFocus;

  function choicesFromStored() {
    var stored = typeof consentApi.get === 'function' ? consentApi.get() : null;

    if (!stored) {
      return null;
    }

    return {
      analytics: !!stored.analytics,
      marketing: !!stored.marketing,
      preferences: !!stored.preferences
    };
  }

  function currentChoices() {
    return choicesFromStored() || DEFAULT_CHOICES;
  }

  function serializeChoices(choices) {
    return [
      'v=' + CONSENT_VERSION,
      'analytics=' + (choices.analytics ? '1' : '0'),
      'marketing=' + (choices.marketing ? '1' : '0'),
      'preferences=' + (choices.preferences ? '1' : '0'),
      't=' + Date.now()
    ].join('&');
  }

  function writeConsentCookie(choices) {
    var secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = COOKIE_NAME + '=' + serializeChoices(choices) +
      '; Max-Age=' + COOKIE_MAX_AGE +
      '; Path=/' +
      '; SameSite=Lax' +
      secure;
  }

  function deleteCookie(name, domain) {
    var secure = window.location.protocol === 'https:' ? '; Secure' : '';
    var domainPart = domain ? '; Domain=' + domain : '';

    document.cookie = name + '=; Max-Age=0; Path=/' + domainPart + '; SameSite=Lax' + secure;
    document.cookie = name + '=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/' + domainPart + secure;
  }

  function deleteCookieEverywhere(name) {
    var hostname = window.location.hostname;
    var domains = ['', hostname];
    var baseDomain;

    if (hostname.indexOf('www.') === 0) {
      domains.push(hostname.replace(/^www\./, ''));
    }

    baseDomain = hostname.split('.').slice(-2).join('.');

    if (baseDomain && domains.indexOf(baseDomain) === -1) {
      domains.push(baseDomain);
    }

    domains.forEach(function (domain) {
      deleteCookie(name, domain);
      if (domain && domain.charAt(0) !== '.') {
        deleteCookie(name, '.' + domain);
      }
    });
  }

  function clearOptionalCookies(choices) {
    var cookies = document.cookie ? document.cookie.split('; ') : [];

    cookies.forEach(function (cookie) {
      var name = cookie.split('=')[0];
      var isAnalyticsCookie = /^(_ga|_gid|_gat)/.test(name);
      var isMarketingCookie = /^(_gcl|_gac)/.test(name);

      if ((!choices.analytics && isAnalyticsCookie) || (!choices.marketing && isMarketingCookie)) {
        deleteCookieEverywhere(name);
      }
    });
  }

  function toConsentMode(choices) {
    if (typeof consentApi.mapToConsentMode === 'function') {
      return consentApi.mapToConsentMode(choices);
    }

    return {
      ad_storage: choices.marketing ? 'granted' : 'denied',
      ad_user_data: choices.marketing ? 'granted' : 'denied',
      ad_personalization: choices.marketing ? 'granted' : 'denied',
      analytics_storage: choices.analytics ? 'granted' : 'denied',
      functionality_storage: choices.preferences ? 'granted' : 'denied',
      personalization_storage: choices.preferences ? 'granted' : 'denied',
      security_storage: 'granted'
    };
  }

  function emitConsentUpdate(choices) {
    if (typeof window.taoVedaDispatchConsent === 'function') {
      window.taoVedaDispatchConsent(choices);
    }

    if (window.gtag) {
      window.gtag('consent', 'update', toConsentMode(choices));
    }

    if (typeof consentApi.pushEvent === 'function') {
      consentApi.pushEvent('tao_veda_consent_update', choices);
    }
  }

  function setElementHidden(element, hidden) {
    if (element) {
      element.hidden = hidden;
    }
  }

  function showFloatingButton() {
    setElementHidden(floatingButton, false);
  }

  function hideFloatingButton() {
    setElementHidden(floatingButton, true);
  }

  function showBanner() {
    setElementHidden(banner, false);
    hideFloatingButton();
  }

  function hideBanner() {
    setElementHidden(banner, true);
  }

  function getFocusableElements(container) {
    return Array.prototype.slice.call(container.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    ));
  }

  function focusFirstControl(container) {
    var focusable = getFocusableElements(container);

    if (focusable.length) {
      focusable[0].focus();
    }
  }

  function syncForm(choices) {
    var nextChoices = choices || currentChoices();
    var fields = modal.querySelectorAll('[data-cmp-field]');

    fields.forEach(function (field) {
      field.checked = !!nextChoices[field.name];
    });
  }

  function openSettings() {
    previousFocus = document.activeElement;
    syncForm();
    hideBanner();
    hideFloatingButton();
    setElementHidden(modal, false);
    document.documentElement.classList.add('cmp-modal-open');
    focusFirstControl(modal);
  }

  function closeSettings() {
    setElementHidden(modal, true);
    document.documentElement.classList.remove('cmp-modal-open');

    if (choicesFromStored()) {
      showFloatingButton();
    } else {
      showBanner();
    }

    if (previousFocus && typeof previousFocus.focus === 'function') {
      previousFocus.focus();
    }
  }

  function saveChoices(choices) {
    writeConsentCookie(choices);
    clearOptionalCookies(choices);
    emitConsentUpdate(choices);
    hideBanner();
    setElementHidden(modal, true);
    document.documentElement.classList.remove('cmp-modal-open');
    showFloatingButton();
  }

  function acceptAll() {
    saveChoices({
      analytics: true,
      marketing: true,
      preferences: true
    });
  }

  function rejectAll() {
    saveChoices({
      analytics: false,
      marketing: false,
      preferences: false
    });
  }

  function saveSelected() {
    saveChoices({
      analytics: !!modal.querySelector('[name="analytics"]').checked,
      marketing: !!modal.querySelector('[name="marketing"]').checked,
      preferences: !!modal.querySelector('[name="preferences"]').checked
    });
  }

  function handleRootClick(event) {
    var actionElement = event.target.closest('[data-cmp-action]');
    var action;

    if (!actionElement) {
      return;
    }

    action = actionElement.getAttribute('data-cmp-action');

    if (action === 'accept') {
      acceptAll();
    }

    if (action === 'reject') {
      rejectAll();
    }

    if (action === 'settings') {
      openSettings();
    }

    if (action === 'save') {
      saveSelected();
    }

    if (action === 'close-settings') {
      closeSettings();
    }
  }

  function handleDocumentClick(event) {
    var opener = event.target.closest('[data-consent-open]');

    if (!opener) {
      return;
    }

    event.preventDefault();
    openSettings();
  }

  function handleKeydown(event) {
    var focusable;
    var first;
    var last;

    if (!modal || modal.hidden) {
      return;
    }

    if (event.key === 'Escape') {
      closeSettings();
      return;
    }

    if (event.key !== 'Tab') {
      return;
    }

    focusable = getFocusableElements(modal);

    if (!focusable.length) {
      return;
    }

    first = focusable[0];
    last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function createInterface() {
    root = document.createElement('div');
    root.className = 'cmp-root';
    root.innerHTML = [
      '<section class="cmp-banner" role="dialog" aria-labelledby="cmp-banner-title" hidden>',
      '  <button class="cmp-icon-button cmp-banner-close" type="button" data-cmp-action="reject" aria-label="Chiudi e mantieni solo i cookie necessari">&times;</button>',
      '  <div class="cmp-banner-copy">',
      '    <span class="cmp-eyebrow">Privacy</span>',
      '    <h2 id="cmp-banner-title">Gestione cookie</h2>',
      '    <p>Usiamo cookie tecnici necessari e, solo con il tuo consenso, strumenti di analisi o marketing gestiti tramite Google Tag Manager.</p>',
      '    <a href="privacy-policy.html">Leggi privacy e cookie policy</a>',
      '  </div>',
      '  <div class="cmp-banner-actions" aria-label="Scelte cookie">',
      '    <button class="cmp-button cmp-button-ghost" type="button" data-cmp-action="settings">Personalizza</button>',
      '    <button class="cmp-button cmp-button-secondary" type="button" data-cmp-action="reject">Rifiuta</button>',
      '    <button class="cmp-button cmp-button-primary" type="button" data-cmp-action="accept">Accetta tutti</button>',
      '  </div>',
      '</section>',
      '<div class="cmp-modal" role="dialog" aria-modal="true" aria-labelledby="cmp-modal-title" hidden>',
      '  <div class="cmp-modal-backdrop" data-cmp-action="close-settings"></div>',
      '  <section class="cmp-panel">',
      '    <button class="cmp-icon-button cmp-panel-close" type="button" data-cmp-action="close-settings" aria-label="Chiudi preferenze">&times;</button>',
      '    <span class="cmp-eyebrow">Centro preferenze</span>',
      '    <h2 id="cmp-modal-title">Preferenze privacy</h2>',
      '    <p class="cmp-intro">Puoi scegliere quali categorie autorizzare. I cookie necessari restano sempre attivi per far funzionare il sito e ricordare questa scelta.</p>',
      '    <div class="cmp-options">',
      '      <div class="cmp-option">',
      '        <div><h3>Necessari</h3><p>Servono alla navigazione e alla memorizzazione della preferenza cookie.</p></div>',
      '        <span class="cmp-always-on">Sempre attivi</span>',
      '      </div>',
      '      <label class="cmp-option">',
      '        <div><h3>Analitici</h3><p>Aiutano a capire come viene usato il sito, se attivati in GTM con consenso analytics.</p></div>',
      '        <span class="cmp-switch"><input type="checkbox" name="analytics" data-cmp-field><span aria-hidden="true"></span></span>',
      '      </label>',
      '      <label class="cmp-option">',
      '        <div><h3>Marketing</h3><p>Consentono misurazioni pubblicitarie, dati utente e personalizzazione annunci tramite tag compatibili.</p></div>',
      '        <span class="cmp-switch"><input type="checkbox" name="marketing" data-cmp-field><span aria-hidden="true"></span></span>',
      '      </label>',
      '      <label class="cmp-option">',
      '        <div><h3>Preferenze</h3><p>Permettono funzionalita o personalizzazioni non essenziali, se introdotte in futuro.</p></div>',
      '        <span class="cmp-switch"><input type="checkbox" name="preferences" data-cmp-field><span aria-hidden="true"></span></span>',
      '      </label>',
      '    </div>',
      '    <div class="cmp-panel-actions">',
      '      <button class="cmp-button cmp-button-secondary" type="button" data-cmp-action="reject">Rifiuta tutti</button>',
      '      <button class="cmp-button cmp-button-ghost" type="button" data-cmp-action="accept">Accetta tutti</button>',
      '      <button class="cmp-button cmp-button-primary" type="button" data-cmp-action="save">Salva scelte</button>',
      '    </div>',
      '  </section>',
      '</div>',
      '<button class="cmp-reopen" type="button" data-consent-open aria-label="Riapri preferenze privacy" hidden>Privacy</button>'
    ].join('');

    document.body.appendChild(root);
    banner = root.querySelector('.cmp-banner');
    modal = root.querySelector('.cmp-modal');
    floatingButton = root.querySelector('.cmp-reopen');

    root.addEventListener('click', handleRootClick);
    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('keydown', handleKeydown);
  }

  function init() {
    createInterface();

    if (choicesFromStored()) {
      showFloatingButton();
    } else {
      showBanner();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
