const crypto = require('crypto');

function parseCookies(headerValue) {
  const cookies = {};
  if (!headerValue) return cookies;
  headerValue.split(';').forEach((part) => {
    const [rawKey, ...rawVal] = part.trim().split('=');
    if (!rawKey) return;
    cookies[rawKey] = decodeURIComponent(rawVal.join('=') || '');
  });
  return cookies;
}

function html(body) {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store'
    },
    body
  };
}

function errorPage(provider, message) {
  const safe = String(message || 'OAuth error');
  return html(`<!doctype html><html><body>
<script>
  (function () {
    var msg = ${JSON.stringify('authorization:' + provider + ':error:') } + JSON.stringify({ error: ${JSON.stringify(safe)} });
    if (window.opener && window.opener.postMessage) {
      window.opener.postMessage(msg, '*');
      window.close();
      return;
    }
    document.body.innerText = ${JSON.stringify(safe)};
  })();
</script>
</body></html>`);
}

exports.handler = async function handler(event) {
  const provider = 'github';

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const siteUrl = process.env.URL || 'https://www.bluecanarywebdesign.com';

  if (!clientId || !clientSecret) {
    return errorPage(provider, 'Missing server env vars GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET');
  }

  const cookies = parseCookies(event.headers && (event.headers.cookie || event.headers.Cookie));

  const params = new URLSearchParams(event.queryStringParameters || {});
  const code = params.get('code');
  const returnedState = params.get('state');

  const functionUrl = `${siteUrl}/.netlify/functions/oauth`;

  // Step 1: start the OAuth flow
  if (!code) {
    const state = crypto.randomBytes(16).toString('hex');

    const authorizeUrl = new URL('https://github.com/login/oauth/authorize');
    authorizeUrl.searchParams.set('client_id', clientId);
    authorizeUrl.searchParams.set('redirect_uri', functionUrl);
    authorizeUrl.searchParams.set('state', state);
    authorizeUrl.searchParams.set('scope', 'public_repo');

    return {
      statusCode: 302,
      headers: {
        Location: authorizeUrl.toString(),
        'Set-Cookie': `decap_oauth_state=${encodeURIComponent(state)}; Path=/.netlify/functions/oauth; HttpOnly; Secure; SameSite=Lax`,
        'Cache-Control': 'no-store'
      },
      body: ''
    };
  }

  // Step 2: callback (code -> access token)
  if (!returnedState || cookies.decap_oauth_state !== returnedState) {
    return errorPage(provider, 'Invalid OAuth state. Please try again.');
  }

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: functionUrl,
        state: returnedState
      })
    });

    const tokenJson = await tokenRes.json();
    if (!tokenRes.ok || !tokenJson.access_token) {
      return errorPage(provider, tokenJson.error_description || tokenJson.error || 'Failed to obtain access token');
    }

    const accessToken = tokenJson.access_token;

    return html(`<!doctype html><html><body>
<script>
  (function () {
    var payload = { token: ${JSON.stringify(accessToken)} };
    var msg = ${JSON.stringify('authorization:' + provider + ':success:')} + JSON.stringify(payload);
    if (window.opener && window.opener.postMessage) {
      window.opener.postMessage(msg, '*');
      window.close();
      return;
    }
    document.body.innerText = 'Authorized. You can close this window.';
  })();
</script>
</body></html>`);
  } catch (e) {
    return errorPage(provider, e && e.message ? e.message : 'OAuth exception');
  }
};
