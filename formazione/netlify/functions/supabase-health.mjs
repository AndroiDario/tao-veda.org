const DEFAULT_TIMEOUT_MS = 10_000;
const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const DASHBOARD_URL = 'https://supabase.com/dashboard/project/byyanpcxwwjshdivvhpc';

export class HealthCheckError extends Error {
  constructor(message, { kind = 'unknown', status } = {}) {
    super(message);
    this.name = 'HealthCheckError';
    this.kind = kind;
    this.status = status;
  }
}

function requireValue(env, name) {
  const value = env[name]?.trim();
  if (!value) {
    throw new HealthCheckError(`Variabile ${name} assente.`, { kind: 'configuration' });
  }
  return value;
}

function healthUrl(baseUrl) {
  const url = new URL('/rest/v1/profiles', baseUrl);
  url.searchParams.set('select', 'id');
  url.searchParams.set('limit', '1');
  return url;
}

export async function checkSupabase({
  env,
  fetchImpl = fetch,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  clock = Date.now,
}) {
  const supabaseUrl = requireValue(env, 'PUBLIC_SUPABASE_URL');
  const anonKey = requireValue(env, 'PUBLIC_SUPABASE_ANON_KEY');
  const controller = new AbortController();
  const startedAt = clock();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  let response;
  try {
    response = await fetchImpl(healthUrl(supabaseUrl), {
      method: 'HEAD',
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        Accept: 'application/json',
      },
      signal: controller.signal,
    });
  } catch (error) {
    if (controller.signal.aborted) {
      throw new HealthCheckError('Supabase non ha risposto entro il limite.', { kind: 'timeout' });
    }
    throw new HealthCheckError('Supabase non è raggiungibile.', { kind: 'network' });
  } finally {
    clearTimeout(timeout);
  }

  const durationMs = Math.max(0, clock() - startedAt);
  if (!response.ok) {
    const paused = response.status === 540;
    throw new HealthCheckError(
      paused ? 'Il progetto Supabase risulta in pausa.' : `Supabase ha risposto con HTTP ${response.status}.`,
      { kind: paused ? 'project_paused' : 'http_status', status: response.status }
    );
  }

  return { status: response.status, durationMs };
}

export async function sendHealthAlert({ env, error, fetchImpl = fetch, occurredAt }) {
  const resendKey = requireValue(env, 'RESEND_API_KEY');
  const alertTo = requireValue(env, 'HEALTH_ALERT_TO');
  const alertFrom = requireValue(env, 'HEALTH_FROM_EMAIL');
  const status = error.status ? String(error.status) : 'non disponibile';
  const occurredAtIso = occurredAt.toISOString();

  const response = await fetchImpl(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: alertFrom,
      to: alertTo,
      subject: '[Tao Veda] Controllo Supabase non riuscito',
      text: [
        'Il controllo automatico dell’area Formazione non è riuscito.',
        `Momento: ${occurredAtIso}`,
        `Tipo: ${error.kind ?? 'unknown'}`,
        `Stato HTTP: ${status}`,
        `Dashboard: ${DASHBOARD_URL}`,
      ].join('\n'),
    }),
  });

  if (!response.ok) {
    throw new HealthCheckError(`Resend ha risposto con HTTP ${response.status}.`, {
      kind: 'alert_delivery',
      status: response.status,
    });
  }
}

export async function runHealthCheck({
  env = process.env,
  fetchImpl = fetch,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  now = () => new Date(),
  logger = console,
} = {}) {
  const occurredAt = now();
  try {
    const result = await checkSupabase({ env, fetchImpl, timeoutMs });
    logger.info('supabase-health ok', JSON.stringify({
      at: occurredAt.toISOString(),
      status: result.status,
      durationMs: result.durationMs,
    }));
    return { ok: true, ...result };
  } catch (error) {
    const healthError = error instanceof HealthCheckError
      ? error
      : new HealthCheckError('Errore inatteso nel controllo Supabase.');
    logger.error('supabase-health failed', JSON.stringify({
      at: occurredAt.toISOString(),
      kind: healthError.kind,
      status: healthError.status ?? null,
    }));

    try {
      await sendHealthAlert({ env, error: healthError, fetchImpl, occurredAt });
    } catch (alertError) {
      logger.error('supabase-health alert_failed', JSON.stringify({
        at: occurredAt.toISOString(),
        kind: alertError instanceof HealthCheckError ? alertError.kind : 'unknown',
        status: alertError instanceof HealthCheckError ? alertError.status ?? null : null,
      }));
      throw new HealthCheckError('Controllo Supabase e invio dell’avviso non riusciti.', {
        kind: 'health_and_alert_failure',
        status: healthError.status,
      });
    }

    throw healthError;
  }
}

export default async function scheduledSupabaseHealth() {
  await runHealthCheck();
}
