(function (window, document) {
  'use strict';

  var consentConfig = window.__taoVedaConsentConfig || {};
  var COOKIE_NAME = consentConfig.cookieName || 'tao_veda_consent';
  var CONSENT_VERSION = consentConfig.version || 1;
  var COOKIE_MAX_AGE = 365 * 24 * 60 * 60;
  var MAX_AGE_MS = consentConfig.maxAgeMs || COOKIE_MAX_AGE * 1000;
  var DEFAULT_CHOICES = {
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false
  };
  var root;
  var banner;
  var modal;
  var floatingButton;
  var previousFocus;

  function createChoice(overrides) {
    var source = overrides || {};

    return {
      version: CONSENT_VERSION,
      timestamp: new Date().toISOString(),
      necessary: true,
      analytics: !!source.analytics,
      marketing: !!source.marketing,
      preferences: !!source.preferences
    };
  }

  function readCookie(name) {
    var cookies = document.cookie ? document.cookie.split(';') : [];
    var prefix = name + '=';
    var cookie;
    var i;

    for (i = 0; i < cookies.length; i += 1) {
      cookie = cookies[i].trim();

      if (cookie.indexOf(prefix) === 0) {
        return cookie.slice(prefix.length);
      }
    }

    return '';
  }

  function readStoredConsent() {
    var value = readCookie(COOKIE_NAME);

    if (!value) {
      return null;
    }

    try {
      return JSON.parse(decodeURIComponent(value));
    } catch (error) {
      return null;
    }
  }

  function isValidConsent(value) {
    var savedAt;

    if (!value || typeof value !== 'object') {
      return false;
    }

    if (value.version !== CONSENT_VERSION || value.necessary !== true) {
      return false;
    }

    if (
      typeof value.analytics !== 'boolean' ||
      typeof value.marketing !== 'boolean' ||
      typeof value.preferences !== 'boolean'
    ) {
      return false;
    }

    savedAt = Date.parse(value.timestamp);

    if (!Number.isFinite(savedAt)) {
      return false;
    }

    return Date.now() - savedAt < MAX_AGE_MS;
  }

  function currentChoices() {
    var stored = readStoredConsent();

    return isValidConsent(stored) ? stored : DEFAULT_CHOICES;
  }

  function getCookieSecurityAttribute() {
    return window.location.protocol === 'https:' ? '; Secure' : '';
  }

  function writeStoredConsent(choice) {
    document.cookie = COOKIE_NAME + '=' + encodeURIComponent(JSON.stringify(choice)) +
      '; Path=/' +
      '; Max-Age=' + COOKIE_MAX_AGE +
      '; SameSite=Lax' +
      getCookieSecurityAttribute();
  }

  function clearStoredConsent() {
    document.cookie = COOKIE_NAME + '=; Path=/; Max-Age=0; SameSite=Lax' + getCookieSecurityAttribute();
  }

  function deleteCookie(name, domain) {
    var secure = getCookieSecurityAttribute();
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

  function clearOptionalCookies(choice) {
    var cookies = document.cookie ? document.cookie.split('; ') : [];

    cookies.forEach(function (cookie) {
      var name = cookie.split('=')[0];
      var isAnalyticsCookie = /^(_ga|_gid|_gat)/.test(name);
      var isMarketingCookie = /^(_gcl|_gac)/.test(name);

      if ((!choice.analytics && isAnalyticsCookie) || (!choice.marketing && isMarketingCookie)) {
        deleteCookieEverywhere(name);
      }
    });
  }

  function toConsentMode(choice) {
    return {
      ad_storage: choice.marketing ? 'granted' : 'denied',
      ad_user_data: choice.marketing ? 'granted' : 'denied',
      ad_personalization: choice.marketing ? 'granted' : 'denied',
      analytics_storage: choice.analytics ? 'granted' : 'denied',
      functionality_storage: choice.preferences ? 'granted' : 'denied',
      personalization_storage: choice.preferences ? 'granted' : 'denied',
      security_storage: 'granted'
    };
  }

  function pushConsentUpdate(choice) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'consent_update',
      consent: toConsentMode(choice)
    });
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

  function syncForm(choice) {
    var nextChoice = choice || currentChoices();
    var fields = modal.querySelectorAll('[data-cmp-field]');

    fields.forEach(function (field) {
      field.checked = !!nextChoice[field.name];
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

    if (isValidConsent(readStoredConsent())) {
      showFloatingButton();
    } else {
      showBanner();
    }

    if (previousFocus && typeof previousFocus.focus === 'function') {
      previousFocus.focus();
    }
  }

  function saveChoice(choice) {
    writeStoredConsent(choice);
    clearOptionalCookies(choice);
    window.__taoVedaConsentState = choice;
    pushConsentUpdate(choice);
    hideBanner();
    setElementHidden(modal, true);
    document.documentElement.classList.remove('cmp-modal-open');
    showFloatingButton();
  }

  function acceptAll() {
    saveChoice(createChoice({
      analytics: true,
      marketing: true,
      preferences: true
    }));
  }

  function rejectAll() {
    saveChoice(createChoice(DEFAULT_CHOICES));
  }

  function saveSelected() {
    saveChoice(createChoice({
      analytics: !!modal.querySelector('[name="analytics"]').checked,
      marketing: !!modal.querySelector('[name="marketing"]').checked,
      preferences: !!modal.querySelector('[name="preferences"]').checked
    }));
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
    var storedConsent = readStoredConsent();

    createInterface();

    if (isValidConsent(storedConsent)) {
      window.__taoVedaConsentState = storedConsent;
      syncForm(storedConsent);
      showFloatingButton();
      return;
    }

    clearStoredConsent();
    syncForm(DEFAULT_CHOICES);
    showBanner();
  }

  window.taoVedaConsent = {
    cookieName: COOKIE_NAME,
    version: CONSENT_VERSION,
    get: function () {
      var storedConsent = readStoredConsent();

      return isValidConsent(storedConsent) ? storedConsent : null;
    },
    mapToConsentMode: toConsentMode,
    openPreferences: function () {
      openSettings();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}(window, document));
