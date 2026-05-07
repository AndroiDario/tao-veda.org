(function (window) {
  'use strict';

  var COOKIE_NAME = 'tao_veda_consent';
  var CONSENT_VERSION = '2026-05-07';
  var DEFAULT_CHOICES = {
    analytics: false,
    marketing: false,
    preferences: false
  };
  var listeners = [];

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  function readCookie(name) {
    var parts = document.cookie ? document.cookie.split('; ') : [];

    for (var i = 0; i < parts.length; i += 1) {
      var pair = parts[i].split('=');
      var key = pair.shift();

      if (key === name) {
        return pair.join('=');
      }
    }

    return '';
  }

  function parseCookieValue(value) {
    var data = {};

    if (!value) {
      return null;
    }

    value.split('&').forEach(function (part) {
      var pair = part.split('=');

      if (pair.length === 2) {
        data[pair[0]] = pair[1];
      }
    });

    if (data.v !== CONSENT_VERSION) {
      return null;
    }

    return {
      version: data.v,
      analytics: data.analytics === '1',
      marketing: data.marketing === '1',
      preferences: data.preferences === '1',
      timestamp: data.t || ''
    };
  }

  function toConsentMode(choices) {
    var consent = choices || DEFAULT_CHOICES;
    var analyticsGranted = !!consent.analytics;
    var marketingGranted = !!consent.marketing;
    var preferencesGranted = !!consent.preferences;

    return {
      ad_storage: marketingGranted ? 'granted' : 'denied',
      ad_user_data: marketingGranted ? 'granted' : 'denied',
      ad_personalization: marketingGranted ? 'granted' : 'denied',
      analytics_storage: analyticsGranted ? 'granted' : 'denied',
      functionality_storage: preferencesGranted ? 'granted' : 'denied',
      personalization_storage: preferencesGranted ? 'granted' : 'denied',
      security_storage: 'granted'
    };
  }

  function pushConsentEvent(eventName, choices) {
    var cleanChoices = choices || DEFAULT_CHOICES;

    window.dataLayer.push({
      event: eventName,
      consent: {
        analytics: !!cleanChoices.analytics,
        marketing: !!cleanChoices.marketing,
        preferences: !!cleanChoices.preferences
      },
      consent_mode: toConsentMode(cleanChoices)
    });
  }

  window.taoVedaConsent = {
    cookieName: COOKIE_NAME,
    version: CONSENT_VERSION,
    get: function () {
      return parseCookieValue(readCookie(COOKIE_NAME));
    },
    mapToConsentMode: toConsentMode,
    pushEvent: pushConsentEvent
  };

  window.taoVedaAddConsentListener = function (callback) {
    var currentConsent;

    if (typeof callback !== 'function') {
      return;
    }

    listeners.push(callback);
    currentConsent = window.taoVedaConsent.get();

    if (currentConsent) {
      callback(currentConsent);
    }
  };

  window.taoVedaDispatchConsent = function (choices) {
    listeners.slice().forEach(function (callback) {
      callback(choices);
    });
  };

  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'denied',
    personalization_storage: 'denied',
    security_storage: 'granted',
    wait_for_update: 500
  });
  window.gtag('set', 'ads_data_redaction', true);

  (function applyStoredConsent() {
    var storedConsent = window.taoVedaConsent.get();

    if (!storedConsent) {
      pushConsentEvent('tao_veda_consent_default', DEFAULT_CHOICES);
      return;
    }

    window.gtag('consent', 'update', toConsentMode(storedConsent));
    pushConsentEvent('tao_veda_consent_ready', storedConsent);
  }());
}(window));
