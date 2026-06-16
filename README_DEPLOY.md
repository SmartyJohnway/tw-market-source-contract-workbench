# Netlify Taiwan Source Contract Workbench

AG-REPLAY-BLOCKER-03A04A05 final Netlify-ready version.

## What this package contains

```text
index.html
netlify.toml
package.json
netlify/functions/probe.js
README_DEPLOY.md
```

## Deployment options

### Option A — drag-and-drop deploy

1. Unzip this package.
2. Drag the whole folder to Netlify Deploys.
3. Open the deployed site.
4. Use the default fetch transport: `Netlify Function /api/probe`.

### Option B — Git deploy

1. Push this folder to a GitHub repository.
2. Create a Netlify site from that repository.
3. Netlify reads `netlify.toml` automatically.
4. The static site is served from the repository root and functions are served from `netlify/functions`.

### Option C — local development

```bash
npm install -g netlify-cli
netlify dev
```

Then open the local URL shown by Netlify CLI. The app calls `/api/probe`, which is rewritten to `/.netlify/functions/probe`.

## Security and governance notes

- The Netlify Function is intentionally allowlisted by hostname. Default allowed hosts:
  - `openapi.twse.com.tw`
  - `www.twse.com.tw`
  - `www.tpex.org.tw`
  - `api.finmindtrade.com`
  - `mops.twse.com.tw`
  - `mopsov.twse.com.tw`
- To override the list, set `PROBE_ALLOWED_HOSTS` in Netlify environment variables, comma-separated.
- Avoid `PROBE_ALLOW_ANY_URL=true` unless you are testing in a private environment. Otherwise the function becomes an open proxy.
- Public CORS proxies are retained in the UI only for interactive troubleshooting. Do not treat public-proxy responses as formal source evidence.
- This app does not write to any database. Browser history is stored in localStorage only.
- This app does not create production replay input and does not unlock corporate action / PIT / survivorship / execution economics blockers.

## Suggested formal source-contract evidence flow

For any candidate endpoint, capture:

1. Raw URL.
2. HTTP status.
3. Content-Type.
4. Transport: direct / Netlify Function / local probe / public proxy.
5. Content class: JSON object / JSON array / fields+data matrix / HTML / WAF/security page / empty day.
6. Row count and sample fields.
7. Date parameter behavior.
8. Empty-day behavior.
9. Whether source is authoritative, candidate-only, secondary validation, or invalid.

