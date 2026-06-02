/**
 * OAuth callback — GitHub -> Sveltia CMS (Netlify Function).
 *
 * Riceve il redirect di GitHub, scambia il `code` con un access_token e
 * restituisce una pagina HTML che fa postMessage del token alla finestra del
 * CMS, nel formato atteso da Sveltia/Decap: "authorization:github:<status>:<json>".
 *
 * Variabili d'ambiente: GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET.
 */

function readCookie(cookieHeader, name) {
  if (!cookieHeader) return null;
  var parts = cookieHeader.split(';');
  for (var i = 0; i < parts.length; i++) {
    var p = parts[i].trim().split('=');
    if (p[0] === name) return decodeURIComponent(p.slice(1).join('='));
  }
  return null;
}

function renderResultPage(status, payload) {
  var message = 'authorization:github:' + status + ':' + JSON.stringify(payload);
  var messageLiteral = JSON.stringify(message)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
  var authorizingLiteral = JSON.stringify('authorizing:github');
  return (
    '<!doctype html><html lang="it"><head><meta charset="utf-8">' +
    '<title>Autenticazione CMS</title><meta name="robots" content="noindex, nofollow">' +
    '<style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;padding:2rem;max-width:480px;margin:0 auto;color:#222}h1{font-size:1.1rem}p{color:#555;font-size:.95rem;line-height:1.5}</style>' +
    '</head><body>' +
    '<h1>Autenticazione ' + (status === 'success' ? 'riuscita' : 'fallita') + '</h1>' +
    '<p>Puoi chiudere questa finestra. Se non si chiude da sola, torna al CMS e ricarica.</p>' +
    '<script>(function(){var receiveMessage=function(e){window.opener&&window.opener.postMessage(' +
    messageLiteral +
    ',e.origin)};window.addEventListener("message",receiveMessage,false);' +
    'window.opener&&window.opener.postMessage(' +
    authorizingLiteral +
    ',"*")})();</script></body></html>'
  );
}

exports.handler = async function handler(event) {
  var params = event.queryStringParameters || {};
  var code = params.code;
  var state = params.state;
  var error = params.error;

  var cookieHeader = (event.headers && (event.headers.cookie || event.headers.Cookie)) || null;
  var expectedState = readCookie(cookieHeader, 'tao_cms_state');

  var htmlHeaders = {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store',
    'Set-Cookie': 'tao_cms_state=; Path=/api/auth; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
  };

  if (error) {
    return { statusCode: 200, headers: htmlHeaders, body: renderResultPage('error', { message: 'GitHub: ' + error }) };
  }
  if (!code || !state) {
    return { statusCode: 400, headers: htmlHeaders, body: renderResultPage('error', { message: 'Parametri OAuth mancanti (code/state).' }) };
  }
  if (!expectedState || expectedState !== state) {
    return { statusCode: 400, headers: htmlHeaders, body: renderResultPage('error', { message: 'State non valido (possibile CSRF). Riprova il login.' }) };
  }

  var clientId = process.env.GITHUB_CLIENT_ID;
  var clientSecret = process.env.GITHUB_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return { statusCode: 500, headers: htmlHeaders, body: renderResultPage('error', { message: 'Configurazione GitHub OAuth assente su Netlify.' }) };
  }

  var origin =
    process.env.URL ||
    (event.headers && 'https://' + (event.headers['x-forwarded-host'] || event.headers.host));

  var tokenResp;
  try {
    tokenResp = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': 'tao-veda-cms-auth',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        redirect_uri: origin + '/api/auth/callback',
      }),
    });
  } catch (e) {
    return { statusCode: 502, headers: htmlHeaders, body: renderResultPage('error', { message: 'Impossibile contattare GitHub.' }) };
  }

  if (!tokenResp.ok) {
    return { statusCode: 502, headers: htmlHeaders, body: renderResultPage('error', { message: 'GitHub ha risposto ' + tokenResp.status + ' allo scambio token.' }) };
  }

  var tokenData = await tokenResp.json();
  if (tokenData.error || !tokenData.access_token) {
    return {
      statusCode: 400,
      headers: htmlHeaders,
      body: renderResultPage('error', { message: tokenData.error_description || tokenData.error || 'Token non ricevuto.' }),
    };
  }

  return {
    statusCode: 200,
    headers: htmlHeaders,
    body: renderResultPage('success', { token: tokenData.access_token, provider: 'github' }),
  };
};
