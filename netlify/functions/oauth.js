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

function htmlWithHeaders(body, extraHeaders) {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      ...(extraHeaders || {})
    },
    body
  };
}

function errorPage(provider, message) {
  const safe = String(message || 'OAuth error');
  return html(`<!doctype html><html><body>
<script>
  (function () {
    var msg = ${JSON.stringify('authorization:' + provider + ':error:')} + JSON.stringify({ error: ${JSON.stringify(safe)} });
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
  const headers = (event && event.headers) || {};
  const host = headers.host || headers.Host;
  const forwardedProto = headers['x-forwarded-proto'] || headers['X-Forwarded-Proto'];
  const proto = (Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto) || 'https';
  const siteUrl = host
    ? `${proto}://${host}`
    : process.env.DEPLOY_PRIME_URL || process.env.URL || 'https://www.bluecanarywebdesign.com';

  if (!clientId || !clientSecret) {
    return errorPage(provider, 'Missing server env vars GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET');
  }

  const cookies = parseCookies(headers.cookie || headers.Cookie);

  const params = new URLSearchParams(event.queryStringParameters || {});
  const code = params.get('code');
  const returnedState = params.get('state');

  const functionUrl = `${siteUrl}/.netlify/functions/oauth`;

  // Step 1: start the OAuth flow
  if (!code) {
    const state = crypto.randomBytes(16).toString('hex');
    const requestedScope = params.get('scope');
    const scope = requestedScope ? requestedScope : 'public_repo';

    const authorizeUrl = new URL('https://github.com/login/oauth/authorize');
    authorizeUrl.searchParams.set('client_id', clientId);
    authorizeUrl.searchParams.set('redirect_uri', functionUrl);
    authorizeUrl.searchParams.set('state', state);
    authorizeUrl.searchParams.set('scope', scope);

    // Decap CMS uses NetlifyAuthenticator which requires a handshake message
    // before it will start listening for the final authorization message.
    // Netlify's hosted oauth client sends: window.opener.postMessage('authorizing:github', origin)
    // and waits for the same message echoed back.
    const baseOrigin = siteUrl;
    const redirectTo = authorizeUrl.toString();

    return htmlWithHeaders(
      `<!doctype html><html><body>
<script>
  (function () {
    var provider = ${JSON.stringify(provider)};
    var origin = ${JSON.stringify(baseOrigin)};
    var redirectTo = ${JSON.stringify(redirectTo)};

    function go() {
      window.location.replace(redirectTo);
    }

    try {
      if (window.opener && window.opener.postMessage) {
        window.addEventListener('message', function (e) {
          if (e && e.data === 'authorizing:' + provider && e.origin === origin) {
            go();
          }
        });
        window.opener.postMessage('authorizing:' + provider, origin);
        // Fallback: if handshake doesn't complete quickly, continue anyway.
        setTimeout(go, 800);
        return;
      }
    } catch (e) {}

    go();
  })();
</script>
<noscript>
  <meta http-equiv="refresh" content="0; url=${redirectTo}">
</noscript>
</body></html>`,
      {
        'Set-Cookie': `decap_oauth_state=${encodeURIComponent(state)}; Path=/.netlify/functions/oauth; HttpOnly; Secure; SameSite=Lax`
      }
    );
  }

  // Step 2: callback (code -> access token)
  if (!returnedState || cookies.decap_oauth_state !== returnedState) {
    return errorPage(provider, 'Invalid OAuth state. Please try again.');
  }

  try {
    const tokenBody = new URLSearchParams();
    tokenBody.set('client_id', clientId);
    tokenBody.set('client_secret', clientSecret);
    tokenBody.set('code', code);
    tokenBody.set('redirect_uri', functionUrl);
    tokenBody.set('state', returnedState);

    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: tokenBody.toString()
    });

    const tokenJson = await tokenRes.json().catch(() => null);
    if (!tokenRes.ok || !tokenJson || !tokenJson.access_token) {
      const msg =
        (tokenJson && (tokenJson.error_description || tokenJson.error)) ||
        `Failed to obtain access token (HTTP ${tokenRes.status})`;
      return errorPage(provider, msg);
    }

    const accessToken = tokenJson.access_token;

    return html(`<!doctype html><html><body>
<script>
  (function () {
    var token = ${JSON.stringify(accessToken)};
    var payload = { token: token };
    var msg = ${JSON.stringify('authorization:' + provider + ':success:')} + JSON.stringify(payload);
    var origin = ${JSON.stringify(siteUrl)};

    // Fallback: persist a token so /admin can restore session if opener messaging is blocked.
    try {
      window.localStorage.setItem('decap-cms-user', JSON.stringify({ token: token, backendName: ${JSON.stringify(provider)} }));
    } catch (e) {}

    try {
      if (window.opener && window.opener.postMessage) {
        window.opener.postMessage(msg, origin);
        window.close();
        return;
      }
    } catch (e) {}

    // Last resort: navigate into the CMS in this window.
    window.location.replace(origin + '/admin/#/');
  })();
</script>
</body></html>`);
  } catch (e) {
    return errorPage(provider, e && e.message ? e.message : 'OAuth exception');
  }
};
