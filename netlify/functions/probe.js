'use strict';

const DEFAULT_ALLOWED_HOSTS = new Set([
  'openapi.twse.com.tw',
  'www.twse.com.tw',
  'www.tpex.org.tw',
  'api.finmindtrade.com',
  'mops.twse.com.tw',
  'mopsov.twse.com.tw',
  'openapi.tdcc.com.tw',
  'openapi.taifex.com.tw',
  'www.fundclear.com.tw'
]);

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-store, max-age=0',
    'X-Content-Type-Options': 'nosniff'
  };
}

function json(statusCode, payload) {
  return {
    statusCode,
    headers: { ...corsHeaders(), 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload, null, 2)
  };
}

function getAllowedHosts() {
  const envHosts = (process.env.PROBE_ALLOWED_HOSTS || '').split(',').map(s => s.trim()).filter(Boolean);
  if (envHosts.length) return new Set(envHosts);
  return DEFAULT_ALLOWED_HOSTS;
}

function validateTarget(rawUrl) {
  if (!rawUrl) return { ok: false, error: 'Missing required query parameter: url' };
  let target;
  try { target = new URL(rawUrl); } catch (err) { return { ok: false, error: 'Invalid URL' }; }
  if (!['http:', 'https:'].includes(target.protocol)) return { ok: false, error: 'Only http/https URLs are allowed' };
  const allowedHosts = getAllowedHosts();
  const allowAny = String(process.env.PROBE_ALLOW_ANY_URL || '').toLowerCase() === 'true';
  if (!allowAny && !allowedHosts.has(target.hostname)) {
    return { ok: false, error: `Host not allowed: ${target.hostname}`, allowedHosts: Array.from(allowedHosts).sort() };
  }
  return { ok: true, target };
}

exports.handler = async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: corsHeaders(), body: '' };
  if (event.httpMethod !== 'GET') return json(405, { ok: false, error: 'Method not allowed. Use GET.' });

  const rawUrl = event.queryStringParameters && event.queryStringParameters.url;
  const validation = validateTarget(rawUrl);
  if (!validation.ok) return json(400, { ok: false, ...validation });

  const timeoutMs = Math.min(Number(event.queryStringParameters.timeout_ms || 20000) || 20000, 25000);
  const maxBytes = Math.min(Number(event.queryStringParameters.max_bytes || 1500000) || 1500000, 5000000);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const startedAt = new Date().toISOString();
    const upstream = await fetch(validation.target.href, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': 'AG-REPLAY-BLOCKER-Source-Contract-Workbench/1.1 NetlifyFunction',
        'Accept': 'application/json,text/html,text/plain,*/*'
      }
    });

    const arrayBuffer = await upstream.arrayBuffer();
    const raw = Buffer.from(arrayBuffer);
    const truncated = raw.length > maxBytes;
    const body = raw.subarray(0, maxBytes).toString('utf8');
    clearTimeout(timer);

    const responseHeaders = {};
    for (const key of ['content-type', 'content-length', 'last-modified', 'etag', 'cache-control']) {
      const v = upstream.headers.get(key);
      if (v) responseHeaders[key] = v;
    }

    return json(200, {
      ok: upstream.ok,
      transport: 'netlify_function',
      evidence_note: 'Server-side probe through your deployed Netlify Function. Suitable for reproducible scout evidence when target host is allowlisted; still requires schema/date/row-count validation.',
      requested_url: validation.target.href,
      final_url: upstream.url,
      upstream_status: upstream.status,
      upstream_status_text: upstream.statusText,
      upstream_headers: responseHeaders,
      content_type: upstream.headers.get('content-type') || '',
      bytes: raw.length,
      max_bytes_returned: maxBytes,
      truncated,
      started_at: startedAt,
      finished_at: new Date().toISOString(),
      body
    });
  } catch (err) {
    clearTimeout(timer);
    const aborted = err && err.name === 'AbortError';
    return json(aborted ? 504 : 502, {
      ok: false,
      transport: 'netlify_function',
      requested_url: validation.target.href,
      error: aborted ? `Probe timed out after ${timeoutMs} ms` : String(err && err.message || err),
      error_name: err && err.name,
      finished_at: new Date().toISOString()
    });
  }
};
