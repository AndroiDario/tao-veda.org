'use strict';

const assert = require('node:assert/strict');
const { afterEach, beforeEach, test } = require('node:test');
const submit = require('../netlify/functions/submit-mappa.js');

const originalFetch = global.fetch;
const originalEnv = { ...process.env };
const originalConsole = {
  info: console.info,
  error: console.error,
  warn: console.warn
};

function validPayload(overrides = {}) {
  return {
    nome: 'Ada Lovelace',
    email: 'Ada@example.org',
    telefono: '+39 333 1234567',
    preferenzaContatto: 'Telefono',
    motivoCompilazione: ['Curiosità personale'],
    risposte: {
      nome: 'Ada Lovelace',
      email: 'Ada@example.org',
      telefono: '+39 333 1234567',
      preferenzaContatto: 'Telefono',
      passoSuccessivo: ['Nessuno per ora: mi interessa solo il risultato'],
      sonno: 'Leggero\u0000 e variabile',
      consensoServizio: true,
      consensoDatiParticolari: true,
      consensoAggiornamenti: false,
      confermaNonDiagnosi: true
    },
    consensi: {
      servizio: true,
      datiParticolari: true,
      aggiornamenti: false,
      nonDiagnosi: true
    },
    ...overrides
  };
}

function setProviderEnv() {
  process.env.AIRTABLE_API_KEY = 'airtable-key';
  process.env.AIRTABLE_BASE_ID = 'base-id';
  process.env.AIRTABLE_TABLE_NAME = 'Mappa';
  process.env.AIRTABLE_CONTACTS_TABLE_NAME = 'Contatti Mappa';
  process.env.RESEND_API_KEY = 'resend-key';
  process.env.FROM_EMAIL = 'mappa@example.org';
  process.env.NOTIFICATION_EMAIL = 'ops@example.org';
}

beforeEach(() => {
  process.env = { ...originalEnv };
  setProviderEnv();
  console.info = () => {};
  console.error = () => {};
  console.warn = () => {};
});

afterEach(() => {
  global.fetch = originalFetch;
  process.env = { ...originalEnv };
  console.info = originalConsole.info;
  console.error = originalConsole.error;
  console.warn = originalConsole.warn;
});

test('minimizza contatti e rimuove campi operativi dalle risposte', () => {
  const normalized = submit._test.normalizeSubmission(validPayload());

  assert.equal(normalized.email, 'ada@example.org');
  assert.equal(normalized.telefono, '');
  assert.equal(normalized.preferenzaContatto, '');
  assert.equal(normalized.risposte.nome, undefined);
  assert.equal(normalized.risposte.email, undefined);
  assert.equal(normalized.risposte.consensoServizio, undefined);
  assert.equal(normalized.risposte.sonno, 'Leggero e variabile');
  assert.equal('userAgent' in normalized, false);
  assert.equal('internalSignals' in normalized, false);
});

test('mantiene telefono e preferenza solo quando viene chiesto un contatto', () => {
  const payload = validPayload();
  payload.risposte.passoSuccessivo = ['Fare una prima conversazione conoscitiva'];
  const normalized = submit._test.normalizeSubmission(payload);

  assert.equal(normalized.telefono, '+39 333 1234567');
  assert.equal(normalized.preferenzaContatto, 'Telefono');
});

test('richiede separatamente servizio, dati particolari e conferma non diagnostica', () => {
  const normalized = submit._test.normalizeSubmission(validPayload({
    consensi: { servizio: true, datiParticolari: false, aggiornamenti: true, nonDiagnosi: true }
  }));
  const validation = submit._test.validateSubmission(normalized);

  assert.equal(validation.valid, false);
  assert.match(validation.message, /dati particolari/i);
});

test('salva risposte senza user agent o segnali inferiti e conserva il contratto di risposta', async () => {
  const requests = [];
  global.fetch = async (url, options) => {
    requests.push({ url: String(url), options });
    if (String(url).includes('airtable.com')) {
      return new Response(JSON.stringify({ id: 'rec123' }), { status: 200 });
    }
    return new Response(JSON.stringify({ id: 'email123' }), { status: 200 });
  };

  const result = await submit.handler({
    httpMethod: 'POST',
    body: JSON.stringify(validPayload())
  });
  const body = JSON.parse(result.body);
  const airtableBody = JSON.parse(requests[0].options.body);
  const storedJson = airtableBody.fields['Risposte JSON'];

  assert.equal(result.statusCode, 200);
  assert.equal(body.ok, true);
  assert.match(body.submissionId, /^mappa-/);
  assert.equal(storedJson.includes('userAgent'), false);
  assert.equal(storedJson.includes('internalSignals'), false);
  assert.equal(airtableBody.fields['Consenso elaborazione'], true);
  assert.equal(airtableBody.fields['Consenso dati particolari'], true);
  assert.match(airtableBody.fields['Delete After'], /^\d{4}-\d{2}-\d{2}T/);
});

test('separa il contatto per aggiornamenti dalle risposte grezze', async () => {
  const requests = [];
  global.fetch = async (url, options) => {
    requests.push({ url: String(url), options });
    if (String(url).includes('airtable.com')) {
      return new Response(JSON.stringify({ id: 'rec123' }), { status: 200 });
    }
    return new Response(JSON.stringify({ id: 'email123' }), { status: 200 });
  };

  const payload = validPayload({
    consensi: { servizio: true, datiParticolari: true, aggiornamenti: true, nonDiagnosi: true }
  });
  const result = await submit.handler({ httpMethod: 'POST', body: JSON.stringify(payload) });
  const contactRequest = requests.find((request) => decodeURIComponent(request.url).includes('/Contatti Mappa'));
  const contactBody = JSON.parse(contactRequest.options.body);
  const serialized = JSON.stringify(contactBody);

  assert.equal(result.statusCode, 200);
  assert.equal(contactBody.fields.Email, 'ada@example.org');
  assert.equal(contactBody.fields['Consenso aggiornamenti'], true);
  assert.equal(serialized.includes('Risposte JSON'), false);
  assert.equal(serialized.includes('sonno'), false);
});

test('un errore Airtable non invia email e non dichiara acquisita la Mappa', async () => {
  let calls = 0;
  global.fetch = async () => {
    calls += 1;
    return new Response(JSON.stringify({ error: 'provider failure' }), { status: 503 });
  };

  const result = await submit.handler({
    httpMethod: 'POST',
    body: JSON.stringify(validPayload())
  });
  const body = JSON.parse(result.body);

  assert.equal(result.statusCode, 502);
  assert.equal(body.ok, false);
  assert.equal(calls, 1);
});

test('un errore Resend non perde una Mappa già archiviata e i log non espongono PII', async () => {
  const logs = [];
  console.info = (...args) => logs.push(args.join(' '));
  console.error = (...args) => logs.push(args.join(' '));
  global.fetch = async (url) => {
    if (String(url).includes('airtable.com')) {
      return new Response(JSON.stringify({ id: 'rec123' }), { status: 200 });
    }
    return new Response(JSON.stringify({ message: 'resend failure' }), { status: 500 });
  };

  const result = await submit.handler({
    httpMethod: 'POST',
    body: JSON.stringify(validPayload())
  });
  const body = JSON.parse(result.body);
  const logText = logs.join('\n');

  assert.equal(result.statusCode, 200);
  assert.equal(body.ok, true);
  assert.equal(logText.includes('Ada Lovelace'), false);
  assert.equal(logText.includes('ada@example.org'), false);
  assert.equal(logText.includes('Leggero'), false);
});
