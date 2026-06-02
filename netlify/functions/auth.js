/**
 * OAuth entry — Sveltia CMS -> GitHub (Netlify Function).
 *
 * Flusso:
 *   1. Il CMS apre /api/auth?provider=github&scope=repo in una popup.
 *   2. Questa funzione genera uno state (CSRF) e redirige a GitHub.
 *   3. GitHub, dopo il login, redirige a /api/auth/callback (auth-callback.js).
 *
 * Variabili d'ambiente richieste (Netlify -> Site settings -> Environment variables):
 *   GITHUB_CLIENT_ID       (Client ID della GitHub OAuth App)
 *   GITHUB_CLIENT_SECRET   (Client Secret)
 *
 * Le rotte /api/auth e /api/auth/callback sono mappate alle function in public/_redirects.
 */

var crypto = require('crypto');

function generateState() {
  return crypto.randomBytes(32).toString('hex');
}

exports.handler = async function handler(event) {
  var params = event.queryStringParameters || {};

  if (params.provider !== 'github') {
    return { statusCode: 400, body: 'Provider non supportato. Solo github.' };
  }

  var clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return { statusCode: 500, body: 'GITHUB_CLIENT_ID non configurata su Netlify.' };
  }

  var scope = params.scope || 'repo,user';
  var state = generateState();

  var origin =
    process.env.URL ||
    (event.headers && 'https://' + (event.headers['x-forwarded-host'] || event.headers.host));
  var redirectUri = origin + '/api/auth/callback';

  var authorizeUrl = new URL('https://github.com/login/oauth/authorize');
  authorizeUrl.searchParams.set('client_id', clientId);
  authorizeUrl.searchParams.set('redirect_uri', redirectUri);
  authorizeUrl.searchParams.set('scope', scope);
  authorizeUrl.searchParams.set('state', state);

  var cookie = [
    'tao_cms_state=' + state,
    'Path=/api/auth',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    'Max-Age=600',
  ].join('; ');

  return {
    statusCode: 302,
    headers: {
      Location: authorizeUrl.toString(),
      'Set-Cookie': cookie,
      'Cache-Control': 'no-store',
    },
  };
};
