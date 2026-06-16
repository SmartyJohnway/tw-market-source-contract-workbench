# TW Source Contract Workbench

A Netlify-ready interactive workbench for scouting Taiwan market data sources, endpoint contracts, response shapes, and source-evidence quality.

This repository was created for the `AG-REPLAY-BLOCKER-03A04A05` source feasibility scout, but the tool is intentionally named and structured as a reusable Taiwan data-source workbench.

## Scope

This workbench helps inspect and compare data sources such as:

- TWSE OpenAPI
- TPEx OpenAPI
- TWSE TWT49U ex-right / ex-dividend calculation reports
- FinMind TaiwanStockDividend
- MOPS announcement endpoints
- Candidate endpoints discovered from uploaded source probes

It supports:

- Endpoint catalog search and filtering
- Request URL building
- Netlify Function server-side probing
- Direct browser fetch
- Raw URL opening
- curl / Python requests generation
- Optional public CORS proxy preview
- Response classification
- Table preview
- Schema inference
- Probe history
- Governance / feasibility matrix

## Important governance boundary

This tool is a **source scout / source contract workbench**.

It does **not**:

- Create production replay input
- Write to any database
- Produce orders, fills, trades, PnL, returns, or equity curves
- Unlock corporate-action, PIT, survivorship, or execution-economics blockers
- Promote any source to authoritative status without separate validation

A successful fetch only means the endpoint returned something. It does not mean the source is production-ready.

## Evidence policy

Preferred formal evidence flow:

1. Raw URL
2. HTTP status
3. Content-Type
4. Transport type:
   - direct
   - Netlify Function
   - local probe server
   - public proxy
5. Content class:
   - JSON object
   - JSON array
   - fields + data matrix
   - HTML table
   - WAF/security page
   - empty day
   - unknown
6. Row count and sample fields
7. Date parameter behavior
8. Empty-day behavior
9. Authority level:
   - official direct evidence
   - official proxy-assisted preview
   - nonofficial secondary validation
   - invalid candidate

Public CORS proxy responses are preview-only and should not be used as formal source evidence.

## Netlify deployment

This repo is designed for Netlify.

### Files

```text
index.html
netlify.toml
package.json
netlify/functions/probe.js
README_DEPLOY.md
