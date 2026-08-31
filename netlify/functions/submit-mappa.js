'use strict';

var MAX_TEXT_LENGTH = 3000;
var MAX_BODY_LENGTH = 200000;
var RAW_RETENTION_DAYS = 90;
var CONTACT_REQUEST_OPTIONS = [
  'Fare una prima conversazione conoscitiva',
  'Proporre uno scambio tra operatrici/operatori'
];
var OPERATIONAL_FIELDS = [
  'nome',
  'email',
  'telefono',
  'preferenzaContatto',
  'consensoServizio',
  'consensoDatiParticolari',
  'consensoAggiornamenti',
  'confermaNonDiagnosi',
  'motivoCompilazione',
  'website'
];

exports.handler = async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { ok: false, error: 'Metodo non consentito.' });
  }

  try {
    var payload = parseJson(event.body);

    if (payload.website) {
      console.warn('submit-mappa rejected: honeypot');
      return jsonResponse(400, {
        ok: false,
        error: 'Non è stato possibile completare l’invio. Riprova più tardi o scrivi a info@tao-veda.org.'
      });
    }

    var submission = normalizeSubmission(payload);
    var validation = validateSubmission(submission);

    if (!validation.valid) {
      return jsonResponse(400, { ok: false, error: validation.message });
    }

    submission.submissionId = buildSubmissionId(submission.timestamp);

    var airtableResult = await saveRawSubmission(submission, getAirtableConfig());
    var contactResult = await saveUpdateConsentSafely(submission, getAirtableConfig());
    var emailResults = await Promise.all([
      sendEmailSafely('internal', buildInternalNotification(submission, airtableResult)),
      sendEmailSafely('confirmation', buildConfirmationEmail(submission))
    ]);

    console.info('submit-mappa accepted:', JSON.stringify({
      submissionId: submission.submissionId,
      airtable: airtableResult.status,
      updateConsent: contactResult.status,
      internalEmail: emailResults[0].status,
      confirmationEmail: emailResults[1].status
    }));

    return jsonResponse(200, {
      ok: true,
      submissionId: submission.submissionId
    });
  } catch (error) {
    var code = error && error.code ? error.code : 'unknown';
    var statusCode = error && error.statusCode ? error.statusCode : 500;

    console.error('submit-mappa failed:', code);

    return jsonResponse(statusCode, {
      ok: false,
      error: statusCode === 400
        ? 'Richiesta non valida.'
        : 'La Mappa è temporaneamente non disponibile. Le risposte non sono state acquisite: riprova più tardi.'
    });
  }
};

function parseJson(body) {
  if (!body) {
    return {};
  }

  if (body.length > MAX_BODY_LENGTH) {
    throw serviceError('body_too_large', 400);
  }

  try {
    return JSON.parse(body);
  } catch (error) {
    throw serviceError('invalid_json', 400);
  }
}

function normalizeSubmission(payload) {
  var sourceAnswers = isPlainObject(payload.risposte) ? payload.risposte : {};
  var consents = isPlainObject(payload.consensi) ? payload.consensi : {};
  var wantsContact = wantsFollowUp(sourceAnswers);
  var timestamp = new Date().toISOString();

  return {
    timestamp: timestamp,
    deleteAfter: addDays(timestamp, RAW_RETENTION_DAYS),
    nome: sanitizeText(payload.nome || sourceAnswers.nome, 200),
    email: sanitizeEmail(payload.email || sourceAnswers.email),
    telefono: wantsContact ? sanitizeText(payload.telefono || sourceAnswers.telefono, 100) : '',
    preferenzaContatto: wantsContact ? sanitizeText(payload.preferenzaContatto || sourceAnswers.preferenzaContatto, 120) : '',
    motivoCompilazione: normalizeList(payload.motivoCompilazione || sourceAnswers.motivoCompilazione),
    risposte: sanitizeAnswers(sourceAnswers),
    consensi: {
      servizio: consents.servizio === true,
      datiParticolari: consents.datiParticolari === true,
      aggiornamenti: consents.aggiornamenti === true,
      nonDiagnosi: consents.nonDiagnosi === true
    }
  };
}

function validateSubmission(submission) {
  if (!submission.nome) {
    return { valid: false, message: 'Il nome è obbligatorio.' };
  }

  if (!submission.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(submission.email)) {
    return { valid: false, message: 'Inserisci un indirizzo email valido.' };
  }

  if (submission.consensi.servizio !== true) {
    return { valid: false, message: 'Il consenso all’elaborazione della Mappa è obbligatorio.' };
  }

  if (submission.consensi.datiParticolari !== true) {
    return { valid: false, message: 'Il consenso esplicito ai dati particolari è obbligatorio.' };
  }

  if (submission.consensi.nonDiagnosi !== true) {
    return { valid: false, message: 'La conferma di comprensione non-diagnostica è obbligatoria.' };
  }

  return { valid: true };
}

function getAirtableConfig() {
  var config = {
    apiKey: process.env.AIRTABLE_API_KEY,
    baseId: process.env.AIRTABLE_BASE_ID,
    rawTableName: process.env.AIRTABLE_TABLE_NAME,
    contactsTableName: process.env.AIRTABLE_CONTACTS_TABLE_NAME
  };

  if (!config.apiKey || !config.baseId || !config.rawTableName) {
    throw serviceError('airtable_not_configured', 503);
  }

  return config;
}

async function saveRawSubmission(submission, config) {
  var body = await airtableCreate(config, config.rawTableName, buildAirtableFields(submission));

  return {
    status: 'saved',
    id: sanitizeText(body.id, 100)
  };
}

async function saveUpdateConsentSafely(submission, config) {
  if (!submission.consensi.aggiornamenti) {
    return { status: 'not_requested' };
  }

  if (!config.contactsTableName) {
    console.error('submit-mappa update consent save failed: contacts_table_not_configured');
    return { status: 'error' };
  }

  try {
    await airtableCreate(config, config.contactsTableName, {
      'Created At': submission.timestamp,
      Nome: submission.nome,
      Email: submission.email,
      Fonte: 'Mappa Tao Veda',
      'Consenso aggiornamenti': true
    });

    return { status: 'saved' };
  } catch (error) {
    console.error('submit-mappa update consent save failed: provider_error');
    return { status: 'error' };
  }
}

async function airtableCreate(config, tableName, fields) {
  var response;
  var body;
  var url = 'https://api.airtable.com/v0/' + encodeURIComponent(config.baseId) + '/' + encodeURIComponent(tableName);

  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + config.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fields: fields })
    });
  } catch (error) {
    throw serviceError('airtable_network_error', 502);
  }

  body = await response.json().catch(function () { return {}; });

  if (!response.ok) {
    throw serviceError('airtable_http_' + response.status, 502);
  }

  return body;
}

function buildAirtableFields(submission) {
  return {
    'Created At': submission.timestamp,
    'Delete After': submission.deleteAfter,
    Nome: submission.nome,
    Email: submission.email,
    Telefono: submission.telefono,
    'Preferenza contatto': submission.preferenzaContatto,
    'Motivo compilazione': submission.motivoCompilazione.join(', '),
    'Risposte JSON': JSON.stringify({
      risposte: submission.risposte,
      consensi: submission.consensi
    }),
    'Consenso elaborazione': submission.consensi.servizio,
    'Consenso dati particolari': submission.consensi.datiParticolari,
    'Consenso aggiornamenti': submission.consensi.aggiornamenti,
    'Conferma non diagnosi': submission.consensi.nonDiagnosi,
    Stato: 'Nuova',
    'Note interne': ''
  };
}

function buildInternalNotification(submission, airtableResult) {
  return {
    to: process.env.NOTIFICATION_EMAIL,
    subject: 'Nuova Mappa Tao Veda — ' + submission.submissionId,
    replyTo: submission.email,
    text: [
      'Nuova Mappa Tao Veda salvata nell’archivio operativo.',
      '',
      'Riferimento: ' + submission.submissionId,
      'Record Airtable: ' + airtableResult.id,
      'Nome: ' + submission.nome,
      'Email: ' + submission.email,
      'Telefono: ' + (submission.telefono || 'Non richiesto o non indicato'),
      'Preferenza di contatto: ' + (submission.preferenzaContatto || 'Email per la restituzione'),
      'Cancellazione risposte grezze entro: ' + submission.deleteAfter.slice(0, 10),
      '',
      'Le risposte complete non sono incluse in questa email. Consultare il record Airtable e non copiarle in altri sistemi.'
    ].join('\n')
  };
}

function buildConfirmationEmail(submission) {
  return {
    to: submission.email,
    subject: 'Abbiamo ricevuto la tua Mappa Tao Veda corpo-energia-presenza',
    text: [
      'Ciao ' + submission.nome + ',',
      '',
      'abbiamo ricevuto la tua Mappa Tao Veda corpo-energia-presenza.',
      '',
      'La restituzione sarà preparata manualmente e inviata via email. Non sarà una diagnosi, un profilo o una valutazione clinica.',
      '',
      'Le risposte grezze saranno cancellate dall’archivio operativo entro 90 giorni dalla ricezione. Puoi chiedere accesso, rettifica, cancellazione o revocare i consensi scrivendo a info@tao-veda.org.',
      '',
      'Riferimento: ' + submission.submissionId,
      '',
      'Tao Veda'
    ].join('\n')
  };
}

async function sendEmailSafely(kind, message) {
  try {
    return await sendEmail(message);
  } catch (error) {
    console.error('submit-mappa email delivery failed:', kind);
    return { status: 'error' };
  }
}

async function sendEmail(message) {
  var apiKey = process.env.RESEND_API_KEY;
  var from = process.env.FROM_EMAIL;
  var response;

  if (!apiKey || !from || !message.to) {
    throw serviceError('resend_not_configured', 503);
  }

  try {
    response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: from,
        to: [message.to],
        subject: message.subject,
        text: message.text,
        reply_to: message.replyTo || undefined
      })
    });
  } catch (error) {
    throw serviceError('resend_network_error', 502);
  }

  if (!response.ok) {
    throw serviceError('resend_http_' + response.status, 502);
  }

  return { status: 'sent' };
}

function sanitizeAnswers(source) {
  var sanitized = sanitizeValue(source);

  OPERATIONAL_FIELDS.forEach(function (key) {
    delete sanitized[key];
  });

  return sanitized;
}

function sanitizeValue(value) {
  if (Array.isArray(value)) {
    return value.slice(0, 100).map(sanitizeValue);
  }

  if (isPlainObject(value)) {
    return Object.keys(value).slice(0, 200).reduce(function (accumulator, key) {
      var safeKey = sanitizeText(key, 120);

      if (safeKey && safeKey !== '__proto__' && safeKey !== 'constructor' && safeKey !== 'prototype') {
        accumulator[safeKey] = sanitizeValue(value[key]);
      }

      return accumulator;
    }, {});
  }

  if (typeof value === 'string') {
    return sanitizeText(value);
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === 'boolean' || value === null) {
    return value;
  }

  return '';
}

function sanitizeText(value, maxLength) {
  return String(value || '')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength || MAX_TEXT_LENGTH);
}

function sanitizeEmail(value) {
  return sanitizeText(value, 320).toLowerCase();
}

function normalizeList(value) {
  if (Array.isArray(value)) {
    return value.slice(0, 50).map(function (item) {
      return sanitizeText(item, 500);
    }).filter(Boolean);
  }

  return value ? [sanitizeText(value, 500)].filter(Boolean) : [];
}

function wantsFollowUp(answers) {
  var selections = normalizeList(answers.passoSuccessivo);

  return CONTACT_REQUEST_OPTIONS.some(function (option) {
    return selections.indexOf(option) !== -1;
  });
}

function buildSubmissionId(timestamp) {
  return [
    'mappa',
    timestamp.replace(/[^0-9]/g, '').slice(0, 14),
    Math.random().toString(36).slice(2, 8)
  ].join('-');
}

function addDays(timestamp, days) {
  var date = new Date(timestamp);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

function isPlainObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function serviceError(code, statusCode) {
  var error = new Error(code);
  error.code = code;
  error.statusCode = statusCode;
  return error;
}

function jsonResponse(statusCode, body) {
  return {
    statusCode: statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    },
    body: JSON.stringify(body)
  };
}

exports._test = {
  parseJson: parseJson,
  normalizeSubmission: normalizeSubmission,
  validateSubmission: validateSubmission,
  buildAirtableFields: buildAirtableFields,
  buildInternalNotification: buildInternalNotification,
  sanitizeText: sanitizeText,
  wantsFollowUp: wantsFollowUp
};
