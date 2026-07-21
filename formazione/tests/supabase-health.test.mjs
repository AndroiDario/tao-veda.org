import test from 'node:test';
import assert from 'node:assert/strict';
import {
  checkSupabase,
  HealthCheckError,
  runHealthCheck,
} from '../netlify/functions/supabase-health.mjs';

const baseEnv = {
  PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
  PUBLIC_SUPABASE_ANON_KEY: 'public-anon-key',
  RESEND_API_KEY: 'resend-key',
  HEALTH_ALERT_TO: 'alert@example.test',
  HEALTH_FROM_EMAIL: 'formazione@example.test',
};

const silentLogger = { info() {}, error() {} };

test('esegue una HEAD protetta dalla chiave pubblica senza scaricare profili', async () => {
  let request;
  const result = await checkSupabase({
    env: baseEnv,
    clock: (() => {
      const values = [100, 135];
      return () => values.shift();
    })(),
    fetchImpl: async (url, options) => {
      request = { url: url.toString(), options };
      return new Response(null, { status: 200 });
    },
  });

  assert.equal(result.status, 200);
  assert.equal(result.durationMs, 35);
  assert.equal(request.options.method, 'HEAD');
  assert.equal(request.options.headers.apikey, 'public-anon-key');
  assert.match(request.url, /\/rest\/v1\/profiles\?select=id&limit=1$/);
});

test('classifica un timeout senza lasciare il timer attivo', async () => {
  await assert.rejects(
    checkSupabase({
      env: baseEnv,
      timeoutMs: 5,
      fetchImpl: async (_url, { signal }) => new Promise((_resolve, reject) => {
        signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
      }),
    }),
    (error) => error instanceof HealthCheckError && error.kind === 'timeout'
  );
});

test('riconosce HTTP 540 e invia un avviso senza dati personali', async () => {
  const calls = [];
  await assert.rejects(
    runHealthCheck({
      env: baseEnv,
      logger: silentLogger,
      now: () => new Date('2026-07-21T08:00:00.000Z'),
      fetchImpl: async (url, options) => {
        calls.push({ url: url.toString(), options });
        if (url.toString() === 'https://api.resend.com/emails') {
          return new Response(null, { status: 200 });
        }
        return new Response(null, { status: 540 });
      },
    }),
    (error) => error instanceof HealthCheckError
      && error.kind === 'project_paused'
      && error.status === 540
  );

  assert.equal(calls.length, 2);
  const alert = JSON.parse(calls[1].options.body);
  assert.equal(alert.to, 'alert@example.test');
  assert.match(alert.text, /project_paused/);
  assert.doesNotMatch(alert.text, /public-anon-key|resend-key/);
});

test('se fallisce anche Resend rende visibile il doppio errore', async () => {
  await assert.rejects(
    runHealthCheck({
      env: baseEnv,
      logger: silentLogger,
      fetchImpl: async (url) => url.toString() === 'https://api.resend.com/emails'
        ? new Response(null, { status: 503 })
        : new Response(null, { status: 500 }),
    }),
    (error) => error instanceof HealthCheckError
      && error.kind === 'health_and_alert_failure'
      && error.status === 500
  );
});
