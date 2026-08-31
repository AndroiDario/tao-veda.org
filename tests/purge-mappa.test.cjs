'use strict';

const assert = require('node:assert/strict');
const { afterEach, test } = require('node:test');
const purge = require('../netlify/functions/purge-mappa.js');

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
});

test('seleziona i record scaduti e li cancella senza leggere i campi personali', async () => {
  const requests = [];
  global.fetch = async (url, options) => {
    requests.push({ url: String(url), method: options.method });
    if (options.method === 'GET') {
      return new Response(JSON.stringify({ records: [{ id: 'rec1' }, { id: 'rec2' }] }), { status: 200 });
    }
    return new Response(JSON.stringify({ records: [
      { id: 'rec1', deleted: true },
      { id: 'rec2', deleted: true }
    ] }), { status: 200 });
  };

  const config = { apiKey: 'key', baseId: 'base', tableName: 'Mappa' };
  const ids = await purge._test.listExpiredRecordIds(config);
  const deleted = await purge._test.deleteRecords(config, ids);

  assert.deepEqual(ids, ['rec1', 'rec2']);
  assert.equal(deleted, 2);
  assert.match(requests[0].url, /filterByFormula=IS_BEFORE/);
  assert.equal(requests[1].method, 'DELETE');
  assert.equal(requests.some((request) => /Nome|Email|Risposte/.test(request.url)), false);
});
