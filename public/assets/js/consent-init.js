(function (window, document) {
  'use strict';

  var COOKIE_NAME = 'tao_veda_consent';
  var CONSENT_VERSION = 3;
  var LEGACY_VERSION = 2;
  var MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;
  var COOKIE_DOMAIN = /(^|\.)tao-veda\.org$/.test(window.location.hostname) ? '.tao-veda.org' : '';
  var consentListeners = [];

  function readCookie(name) {
    var cookies = document.cookie ? document.cookie.split(';') : [];
    var prefix = name + '=';
    var cookie;
    var i;

    for (i = 0; i < cookies.length; i += 1) {
      cookie = cookies[i].trim();
      if (cookie.indexOf(prefix) === 0) return cookie.slice(prefix.length);
    }

    return '';
  }

  function parseQueryConsent(value) {
    var values = {};

    value.split('&').forEach(function (part) {
      var pair = part.split('=');
      var key;
      var item;

      if (pair.length < 2) return;
      try {
        key = decodeURIComponent(pair.shift());
        item = decodeURIComponent(pair.join('='));
      } catch (error) {
        return;
      }
      values[key] = item;
    });

    return {
      version: Number(values.version),
      timestamp: values.timestamp || '',
      necessary: values.necessary === '1',
      analytics: values.analytics === '1',
      marketing: values.marketing === '1',
      preferences: values.preferences === '1'
    };
  }

  function parseConsent(value) {
    var decoded;

    if (!value) return null;
    try {
      decoded = decodeURIComponent(value);
      if (decoded.charAt(0) === '{') return JSON.parse(decoded);
    } catch (error) {
      decoded = value;
    }

    return parseQueryConsent(decoded);
  }

  function isValidConsent(value, allowLegacy) {
    var savedAt;
    var validVersion = value && (
      value.version === CONSENT_VERSION || (allowLegacy && value.version === LEGACY_VERSION)
    );

    if (!validVersion || value.necessary !== true) return false;
    if (
      typeof value.analytics !== 'boolean' ||
      typeof value.marketing !== 'boolean' ||
      typeof value.preferences !== 'boolean'
    ) return false;

    savedAt = Date.parse(value.timestamp);
    return Number.isFinite(savedAt) && Date.now() - savedAt < MAX_AGE_MS;
  }

  function serializeConsent(choice) {
    return [
      'version=' + CONSENT_VERSION,
      'timestamp=' + encodeURIComponent(choice.timestamp),
      'necessary=1',
      'analytics=' + (choice.analytics ? '1' : '0'),
      'marketing=' + (choice.marketing ? '1' : '0'),
      'preferences=' + (choice.preferences ? '1' : '0')
    ].join('&');
  }

  function cookieSecurityAttribute() {
    return window.location.protocol === 'https:' ? '; Secure' : '';
  }

  function clearConsentCookie() {
    var secure = cookieSecurityAttribute();
    var domain = COOKIE_DOMAIN ? '; Domain=' + COOKIE_DOMAIN : '';

    document.cookie = COOKIE_NAME + '=; Path=/; Max-Age=0; SameSite=Lax' + secure;
    document.cookie = COOKIE_NAME + '=; Path=/; Max-Age=0; SameSite=Lax' + domain + secure;
  }

  function writeConsentCookie(choice, maxAgeSeconds) {
    var domain = COOKIE_DOMAIN ? '; Domain=' + COOKIE_DOMAIN : '';

    document.cookie = COOKIE_NAME + '=; Path=/; Max-Age=0; SameSite=Lax' + cookieSecurityAttribute();
    document.cookie = COOKIE_NAME + '=' + serializeConsent(choice) +
      '; Path=/' +
      '; Max-Age=' + maxAgeSeconds +
      '; SameSite=Lax' +
      domain +
      cookieSecurityAttribute();
  }

  var storedConsent = parseConsent(readCookie(COOKIE_NAME));

  if (!isValidConsent(storedConsent, true)) {
    clearConsentCookie();
    storedConsent = null;
  } else if (storedConsent.version === LEGACY_VERSION) {
    storedConsent.version = CONSENT_VERSION;
    writeConsentCookie(
      storedConsent,
      Math.max(1, Math.floor((MAX_AGE_MS - (Date.now() - Date.parse(storedConsent.timestamp))) / 1000))
    );
  }

  window.__taoVedaConsentState = storedConsent;
  window.__taoVedaConsentConfig = {
    cookieName: COOKIE_NAME,
    version: CONSENT_VERSION,
    maxAgeMs: MAX_AGE_MS,
    cookieDomain: COOKIE_DOMAIN,
    parseConsent: parseConsent,
    serializeConsent: serializeConsent,
    isValidConsent: function (value) {
      return isValidConsent(value, false);
    }
  };

  // Contratto usato dal template "Tao Veda Consent" in GTM.
  // Il template registra qui il callback che aggiorna il Consent Mode.
  window.taoVedaAddConsentListener = function (listener) {
    if (typeof listener === 'function') consentListeners.push(listener);
  };

  window.__taoVedaNotifyConsent = function (choice) {
    consentListeners.slice().forEach(function (listener) {
      try {
        listener(choice);
      } catch (error) {
        // Un errore nel container non deve impedire il salvataggio della scelta.
      }
    });
  };
}(window, document));
