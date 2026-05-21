'use strict';

var MAX_TEXT_LENGTH = 3000;

exports.handler = async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, {
      ok: false,
      error: 'Metodo non consentito.'
    });
  }

  try {
    var payload = parseJson(event.body);

    if (payload.website) {
      return jsonResponse(200, { ok: true });
    }

    var normalized = normalizeSubmission(payload, event.headers || {});
    var validation = validateSubmission(normalized);

    if (!validation.valid) {
      return jsonResponse(400, {
        ok: false,
        error: validation.message
      });
    }

    var airtableRecord = await saveToAirtable(normalized);
    await sendInternalNotification(normalized, airtableRecord);
    await sendConfirmationEmail(normalized);

    return jsonResponse(200, { ok: true });
  } catch (error) {
    console.error('submit-mappa failed:', error && error.message ? error.message : 'unknown error');

    if (error && error.statusCode === 400) {
      return jsonResponse(400, {
        ok: false,
        error: 'Richiesta non valida.'
      });
    }

    return jsonResponse(500, {
      ok: false,
      error: 'Non è stato possibile completare l’invio. Riprova più tardi.'
    });
  }
};

function parseJson(body) {
  if (!body) {
    return {};
  }

  try {
    return JSON.parse(body);
  } catch (error) {
    var invalid = new Error('Invalid JSON body');
    invalid.statusCode = 400;
    throw invalid;
  }
}

function normalizeSubmission(payload, headers) {
  var risposte = isPlainObject(payload.risposte) ? payload.risposte : {};
  var consensi = isPlainObject(payload.consensi) ? payload.consensi : {};
  var motivoCompilazione = normalizeList(payload.motivoCompilazione || risposte.motivoCompilazione);
  var internalSignals;

  internalSignals = calculateInternalSignals({
    risposte: risposte,
    motivoCompilazione: motivoCompilazione
  });

  return {
    timestamp: new Date().toISOString(),
    nome: sanitizeText(payload.nome || risposte.nome),
    email: sanitizeEmail(payload.email || risposte.email),
    telefono: sanitizeText(payload.telefono || risposte.telefono),
    preferenzaContatto: sanitizeText(payload.preferenzaContatto || risposte.preferenzaContatto),
    motivoCompilazione: motivoCompilazione,
    risposte: sanitizeValue(risposte),
    consensi: {
      privacy: consensi.privacy === true || risposte.consensoPrivacy === true,
      aggiornamenti: consensi.aggiornamenti === true || risposte.consensoAggiornamenti === true || normalizeForMatch(risposte.aggiornamenti) === 'si',
      nonDiagnosi: consensi.nonDiagnosi === true || risposte.confermaNonDiagnosi === true
    },
    interessi: deriveInterests(risposte, motivoCompilazione),
    internalSignals: internalSignals,
    userAgent: sanitizeText(headers['user-agent'] || headers['User-Agent'] || '')
  };
}

function validateSubmission(submission) {
  if (!submission.nome) {
    return { valid: false, message: 'Il nome è obbligatorio.' };
  }

  if (!submission.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(submission.email)) {
    return { valid: false, message: 'Inserisci un indirizzo email valido.' };
  }

  if (submission.consensi.privacy !== true) {
    return { valid: false, message: 'Il consenso privacy è obbligatorio.' };
  }

  if (submission.consensi.nonDiagnosi !== true) {
    return { valid: false, message: 'La conferma di comprensione non-diagnostica è obbligatoria.' };
  }

  return { valid: true };
}

async function saveToAirtable(submission) {
  var apiKey = process.env.AIRTABLE_API_KEY;
  var baseId = process.env.AIRTABLE_BASE_ID;
  var tableName = process.env.AIRTABLE_TABLE_NAME;
  var url;
  var response;
  var body;

  if (!apiKey || !baseId || !tableName) {
    throw new Error('Airtable environment variables are missing');
  }

  url = 'https://api.airtable.com/v0/' + encodeURIComponent(baseId) + '/' + encodeURIComponent(tableName);

  response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      fields: buildAirtableFields(submission)
    })
  });

  body = await response.json().catch(function () {
    return {};
  });

  if (!response.ok) {
    throw new Error('Airtable request failed with status ' + response.status);
  }

  return {
    id: body.id || '',
    baseId: baseId
  };
}

function buildAirtableFields(submission) {
  var risposteJson = {
    timestamp: submission.timestamp,
    risposte: submission.risposte,
    consensi: submission.consensi,
    interessi: submission.interessi,
    internalSignals: submission.internalSignals,
    userAgent: submission.userAgent
  };

  return {
    'Created At': submission.timestamp,
    Nome: submission.nome,
    Email: submission.email,
    Telefono: submission.telefono,
    'Preferenza contatto': submission.preferenzaContatto,
    'Motivo compilazione': submission.motivoCompilazione.join(', '),
    'Interesse trattamento': submission.interessi.trattamento,
    'Interesse scambio': submission.interessi.scambio,
    'Interesse formazione': submission.interessi.formazione,
    'Risposte JSON': JSON.stringify(risposteJson, null, 2),
    'Consenso privacy': submission.consensi.privacy,
    'Consenso aggiornamenti': submission.consensi.aggiornamenti,
    'Conferma non diagnosi': submission.consensi.nonDiagnosi,
    Stato: 'Nuova',
    'Note interne': ''
  };
}

async function sendInternalNotification(submission, airtableRecord) {
  var subject = 'Nuova Mappa Tao Veda — ' + submission.nome;
  var text = [
    'Nuova Mappa Tao Veda corpo-energia-presenza',
    '',
    'Nome: ' + submission.nome,
    'Email: ' + submission.email,
    'Telefono: ' + (submission.telefono || 'Non indicato'),
    'Motivo compilazione: ' + formatList(submission.motivoCompilazione),
    'Preferenza contatto: ' + (submission.preferenzaContatto || 'Non indicata'),
    '',
    'Interessi dichiarati:',
    '- Trattamento: ' + yesNo(submission.interessi.trattamento),
    '- Scambio: ' + yesNo(submission.interessi.scambio),
    '- Formazione: ' + yesNo(submission.interessi.formazione),
    '- Solo curiosità/risultato: ' + yesNo(submission.interessi.soloCuriosita),
    '',
    'Principali risposte testuali:',
    summarizeTextAnswers(submission.risposte),
    '',
    'Segnali interni orientativi:',
    JSON.stringify(submission.internalSignals, null, 2),
    '',
    'Record Airtable: ' + formatAirtableReference(airtableRecord)
  ].join('\n');

  await sendEmail({
    to: process.env.NOTIFICATION_EMAIL,
    subject: subject,
    text: text,
    replyTo: submission.email
  });
}

async function sendConfirmationEmail(submission) {
  var text = [
    'Ciao ' + submission.nome + ',',
    '',
    'grazie per aver compilato la Mappa Tao Veda corpo-energia-presenza.',
    '',
    'Le tue risposte sono state ricevute correttamente. Riceverai una restituzione personalizzata via email: non sarà una diagnosi né una valutazione clinica, ma una traccia orientativa di ascolto costruita a partire da ciò che hai condiviso.',
    '',
    'A presto,',
    'Tao Veda'
  ].join('\n');

  await sendEmail({
    to: submission.email,
    subject: 'Abbiamo ricevuto la tua Mappa Tao Veda corpo-energia-presenza',
    text: text
  });
}

async function sendEmail(message) {
  var apiKey = process.env.RESEND_API_KEY;
  var from = process.env.FROM_EMAIL;
  var response;
  var body;

  if (!apiKey || !from || !message.to) {
    throw new Error('Resend environment variables are missing');
  }

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

  body = await response.json().catch(function () {
    return {};
  });

  if (!response.ok) {
    throw new Error('Resend request failed with status ' + response.status + (body.message ? ': ' + body.message : ''));
  }
}

function calculateInternalSignals(payload) {
  var risposte = payload.risposte || {};
  var scores = {
    vataScore: 0,
    pittaScore: 0,
    kaphaScore: 0,
    movimentoScore: 0,
    fuocoScore: 0,
    terraScore: 0,
    metalloScore: 0,
    acquaScore: 0,
    spazioScore: 0,
    livelloPrevalente: 'non definito'
  };

  addFromTexts(scores, [
    risposte.corpoPeriodo,
    risposte.energiaPeriodo,
    risposte.corporatura,
    risposte.pelle,
    risposte.temperatura,
    risposte.appetito,
    risposte.digestione,
    risposte.sonno,
    risposte.movimentoAttivita,
    risposte.mente,
    risposte.stress,
    risposte.comunicazione,
    risposte.cambiamento,
    risposte.fraseVicina,
    risposte.esperienzaUtile,
    risposte.modalitaAccompagnamento
  ]);

  addScale(scores, risposte.presenzeAttuali || {}, {
    'Tensione fisica': ['kaphaScore', 'terraScore'],
    'Stress mentale': ['vataScore', 'movimentoScore'],
    'Emozioni trattenute': ['kaphaScore', 'metalloScore'],
    'Bisogno di riposo': ['vataScore', 'acquaScore'],
    'Bisogno di radicamento': ['vataScore', 'terraScore'],
    'Bisogno di leggerezza': ['kaphaScore', 'metalloScore'],
    'Bisogno di chiarezza': ['pittaScore', 'fuocoScore'],
    'Bisogno di contatto con il corpo': ['vataScore', 'terraScore'],
    'Bisogno di silenzio': ['spazioScore', 'acquaScore'],
    'Bisogno di trasformazione': ['pittaScore', 'fuocoScore']
  });

  addScale(scores, risposte.qualitaMovimenti || {}, {
    'Movimento, desiderio di agire, bisogno di cambiare': ['movimentoScore', 'vataScore'],
    'Calore, intensita, direzione, trasformazione': ['fuocoScore', 'pittaScore'],
    'Nutrimento, cura, bisogno di stabilita': ['terraScore', 'kaphaScore'],
    'Apertura, respiro, lasciare andare': ['metalloScore'],
    'Profondita, paura/fiducia, forza interiore': ['acquaScore'],
    'Silenzio, ascolto, spazio, osservazione': ['spazioScore']
  });

  scores.livelloPrevalente = deriveLevel(risposte.livelloAscolto);

  return scores;
}

function addFromTexts(scores, values) {
  flatten(values).forEach(function (value) {
    var text = normalizeForMatch(value);

    if (/variabile|irregolare|fredd|legger|veloce|rapida|ansia|paura|instabil|agitaz|caotic|cambi/.test(text)) {
      scores.vataScore += 1;
      scores.movimentoScore += 1;
    }

    if (/cald|intens|impazient|acida|irrit|lucida|analit|critica|dirett|taglient|controll|giudizio|trasform/.test(text)) {
      scores.pittaScore += 1;
      scores.fuocoScore += 1;
    }

    if (/pesant|lenta|solida|robusta|oleosa|accumul|lungo|costante|resistente|calma|chiusura|inerzia|radicat|sostenut/.test(text)) {
      scores.kaphaScore += 1;
      scores.terraScore += 1;
    }

    if (/lasciare andare|respiro|leggerezza|confini/.test(text)) {
      scores.metalloScore += 1;
    }

    if (/fiducia|forza interiore|profond|riposo/.test(text)) {
      scores.acquaScore += 1;
    }

    if (/silenz|ascolto|presenza|meditativa/.test(text)) {
      scores.spazioScore += 1;
    }
  });
}

function addScale(scores, values, mapping) {
  Object.keys(mapping).forEach(function (key) {
    var rawValue = Number(values[key] || 0);

    if (!rawValue) {
      return;
    }

    mapping[key].forEach(function (scoreName) {
      scores[scoreName] += rawValue;
    });
  });
}

function deriveLevel(value) {
  var text = normalizeForMatch(value);

  if (text.indexOf('mentale') !== -1) {
    return 'mentale';
  }

  if (text.indexOf('emotivo') !== -1) {
    return 'emotivo';
  }

  if (text.indexOf('energetico') !== -1) {
    return 'energetico-generativo';
  }

  if (text.indexOf('fisico') !== -1) {
    return 'fisico-fisiologico';
  }

  return 'non definito';
}

function deriveInterests(risposte, motivoCompilazione) {
  var passi = normalizeList(risposte.passoSuccessivo);
  var all = normalizeForMatch(motivoCompilazione.concat(passi).join(' '));

  return {
    trattamento: /trattamento/.test(all),
    scambio: /scambio|operator/.test(all),
    formazione: /formativ|formazione|percorsi/.test(all),
    soloCuriosita: /curiosita|solo il risultato/.test(all)
  };
}

function summarizeTextAnswers(risposte) {
  var lines = [];

  if (risposte.attenzioniFisiche) {
    lines.push('Attenzioni fisiche: ' + sanitizeText(risposte.attenzioniFisiche));
  }

  if (risposte.zoneEscluse) {
    lines.push('Zone escluse: ' + formatList(risposte.zoneEscluse));
  }

  if (risposte.allergieSensibilita) {
    lines.push('Allergie/sensibilita: ' + sanitizeText(risposte.allergieSensibilita));
  }

  if (risposte.livelloAscolto) {
    lines.push('Livello richiesto: ' + sanitizeText(risposte.livelloAscolto));
  }

  if (risposte.modalitaAccompagnamento) {
    lines.push('Modalita: ' + sanitizeText(risposte.modalitaAccompagnamento));
  }

  return lines.length ? lines.join('\n') : 'Nessuna risposta testuale facoltativa indicata.';
}

function sanitizeValue(value) {
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (isPlainObject(value)) {
    return Object.keys(value).reduce(function (accumulator, key) {
      accumulator[sanitizeText(key, 120)] = sanitizeValue(value[key]);
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
    return value.map(function (item) {
      return sanitizeText(item, 500);
    }).filter(Boolean);
  }

  if (value) {
    return [sanitizeText(value, 500)].filter(Boolean);
  }

  return [];
}

function flatten(values) {
  var result = [];

  values.forEach(function (value) {
    if (Array.isArray(value)) {
      result = result.concat(value);
    } else if (isPlainObject(value)) {
      result = result.concat(Object.keys(value));
    } else if (value) {
      result.push(value);
    }
  });

  return result;
}

function normalizeForMatch(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function formatList(value) {
  var list = normalizeList(value);

  return list.length ? list.join(', ') : 'Non indicato';
}

function yesNo(value) {
  return value ? 'Sì' : 'No';
}

function formatAirtableReference(airtableRecord) {
  if (airtableRecord && airtableRecord.id && airtableRecord.baseId) {
    return 'salvato (Base ID: ' + airtableRecord.baseId + ', Record ID: ' + airtableRecord.id + ')';
  }

  if (airtableRecord && airtableRecord.id) {
    return 'salvato (Record ID: ' + airtableRecord.id + ')';
  }

  return 'Record salvato in Airtable.';
}

function isPlainObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
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
