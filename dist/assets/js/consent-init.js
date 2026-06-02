(function (window, document) {
  'use strict';

  var COOKIE_NAME = 'tao_veda_consent';
  var CONSENT_VERSION = 1;
  var MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

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

  function defaultDeniedConsent() {
    var denied = toConsentMode({
      analytics: false,
      marketing: false,
      preferences: false
    });

    denied.wait_for_update = 500;
    return denied;
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

  function readConsentCookie() {
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

  function clearConsentCookie() {
    var secure = window.location.protocol === 'https:' ? '; Secure' : '';

    document.cookie = COOKIE_NAME + '=; Path=/; Max-Age=0; SameSite=Lax' + secure;
  }

  var storedConsent = readConsentCookie();

  if (!isValidConsent(storedConsent)) {
    clearConsentCookie();
    storedConsent = null;
  }

  window.__taoVedaConsentState = storedConsent;
  window.__taoVedaConsentConfig = {
    cookieName: COOKIE_NAME,
    version: CONSENT_VERSION,
    maxAgeMs: MAX_AGE_MS
  };

  window.gtag('consent', 'default', storedConsent ? toConsentMode(storedConsent) : defaultDeniedConsent());
  window.gtag('set', 'ads_data_redaction', true);
  window.gtag('set', 'url_passthrough', false);
}(window, document));
