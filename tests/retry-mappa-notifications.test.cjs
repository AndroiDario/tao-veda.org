'use strict';

const assert = require('node:assert/strict');
const { afterEach, beforeEach, test } = require('node:test');
const retry = require('../netlify/functions/retry-mappa-notifications.js');

const originalFetch = global.fetch;
const originalEnv = { ...process.env };
const originalConsole = {
  info: console.info,
  error: console.error
};

beforeEach(() => {
  process.env = {
    ...originalEnv,
    AIRTABLE_API_KEY: 'airtable-key',
    AIRTABLE_BASE_ID: 'base-id',
    AIRTABLE_TABLE_NAME: 'Compilazioni',
    RESEND_API_KEY: 'resend-key',
    FROM_EMAIL: 'mappa@example.org',
    NOTIFICATION_EMAIL: 'ops@example.org'
  };
  console.info = () => {};
  console.error = () => {};
});

afterEach(() => {
  global.fetch = originalFetch;
  process.env = { ...originalEnv };
  console.info = originalConsole.info;
  console.error = originalConsole.error;
});

test('reinvia le risposte complete dei record pendenti e li marca come notificati', async () => {
  const requests = [];
  const record = {
    id: 'recPending123',
    createdTime: '2026-09-06T02:15:00.000Z',
    fields: {
      'Submission ID': 'mappa-20260906021500-test1234',
      'Created At': '2026-09-06T02:15:00.000Z',
      'Delete After': '2026-12-05',
      Nome: 'Ada Lovelace',
      Email: 'ada@example.org',
      Stato: 'Notifica pendente',
      'Risposte JSON': JSON.stringify({
        risposte: { sonno: 'Leggero e variabile' },
        consensi: { servizio: true, datiParticolari: true, aggiornamenti: false, nonDiagnosi: true }
      })
    }
  };

  global.fetch = async (url, options) => {
    requests.push({ url: String(url), options });
    if (String(url).includes('airtable.com') && options.method === 'GET') {
      return new Response(JSON.stringify({ records: [record] }), { status: 200 });
    }
    if (String(url).includes('resend.com')) {
      return new Response(JSON.stringify({ id: 'email123' }), { status: 200 });
    }
    return new Response(JSON.stringify({ id: record.id }), { status: 200 });
  };

  const result = await retry.handler();
  const body = JSON.parse(result.body);
  const emailRequest = requests.find((request) => request.url.includes('resend.com'));
  const emailBody = JSON.parse(emailRequest.options.body);
  const statusRequest = requests.find((request) => request.options.method === 'PATCH');
  const statusBody = JSON.parse(statusRequest.options.body);

  assert.equal(result.statusCode, 200);
  assert.deepEqual(body, { ok: true, found: 1, sent: 1, failed: 0 });
  assert.match(emailBody.text, /RISPOSTE COMPLETE/);
  assert.match(emailBody.text, /Leggero e variabile/);
  assert.equal(emailRequest.options.headers['Idempotency-Key'], 'mappa-internal-mappa-20260906021500-test1234');
  assert.equal(statusBody.fields.Stato, 'Nuova');
});
