'use strict';

var submit = require('./submit-mappa.js');
var MAX_RECORDS = 50;

exports.handler = async function handler() {
  var config;
  var records;
  var sent = 0;
  var failed = 0;

  try {
    config = getConfig();
    records = await listPendingRecords(config);

    for (var index = 0; index < records.length; index += 1) {
      var record = records[index];
      var submission = submissionFromRecord(record);
      var result = await submit._test.sendEmailWithRetry(
        'internal-retry',
        submit._test.buildInternalNotification(submission, { status: 'saved', id: record.id }),
        'mappa-internal-' + submission.submissionId
      );

      if (result.status === 'sent') {
        await updateStatus(config, record.id, 'Nuova');
        sent += 1;
      } else {
        failed += 1;
      }
    }

    console.info('retry-mappa-notifications completed:', JSON.stringify({ found: records.length, sent: sent, failed: failed }));
    return jsonResponse(200, { ok: true, found: records.length, sent: sent, failed: failed });
  } catch (error) {
    console.error('retry-mappa-notifications failed:', error && error.code ? error.code : 'unknown');
    return jsonResponse(500, { ok: false, error: 'Recupero notifiche non completato.' });
  }
};

function getConfig() {
  var config = {
    apiKey: process.env.AIRTABLE_API_KEY,
    baseId: process.env.AIRTABLE_BASE_ID,
    tableName: process.env.AIRTABLE_TABLE_NAME || 'Compilazioni'
  };

  if (!config.apiKey || !config.baseId || !config.tableName) {
    throw technicalError('airtable_not_configured');
  }

  return config;
}

async function listPendingRecords(config) {
  var query = new URLSearchParams({
    filterByFormula: '{Stato} = "Notifica pendente"',
    maxRecords: String(MAX_RECORDS)
  });
  var body = await airtableRequest(config, '?' + query.toString(), { method: 'GET' });
  return body.records || [];
}

function submissionFromRecord(record) {
  var fields = record.fields || {};
  var stored = parseStoredAnswers(fields['Risposte JSON']);
  var timestamp = fields['Created At'] || record.createdTime || new Date().toISOString();

  return {
    submissionId: fields['Submission ID'] || 'mappa-recovery-' + record.id,
    timestamp: timestamp,
    deleteAfter: fields['Delete After'] || timestamp,
    nome: fields.Nome || '',
    email: fields.Email || '',
    telefono: fields.Telefono || '',
    preferenzaContatto: fields['Preferenza contatto'] || '',
    motivoCompilazione: fields['Motivo compilazione'] ? String(fields['Motivo compilazione']).split(', ') : [],
    risposte: stored.risposte || {},
    consensi: stored.consensi || {}
  };
}

function parseStoredAnswers(value) {
  try {
    var parsed = JSON.parse(value || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    return {};
  }
}

async function updateStatus(config, recordId, status) {
  await airtableRequest(config, '/' + encodeURIComponent(recordId), {
    method: 'PATCH',
    body: JSON.stringify({ fields: { Stato: status } })
  });
}

async function airtableRequest(config, suffix, options) {
  var response = await fetch(
    'https://api.airtable.com/v0/' + encodeURIComponent(config.baseId) + '/' + encodeURIComponent(config.tableName) + suffix,
    {
      method: options.method,
      headers: {
        Authorization: 'Bearer ' + config.apiKey,
        'Content-Type': 'application/json'
      },
      body: options.body
    }
  );

  if (!response.ok) {
    throw technicalError('airtable_http_' + response.status);
  }

  return response.json().catch(function () { return {}; });
}

function technicalError(code) {
  var error = new Error(code);
  error.code = code;
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
  listPendingRecords: listPendingRecords,
  submissionFromRecord: submissionFromRecord
};
