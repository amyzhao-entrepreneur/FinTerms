# Rocket Ride Cloud setup

Rocket Ride hosts the **pipeline** that powers FinTerms analysis.

| Piece | Where |
|-------|--------|
| Website (FinTerms UI) | This repo / localhost |
| Pipeline graph | [`finterms.pipe`](../finterms.pipe) → deploy to **Rocket Ride Cloud** |
| Model key for LLM nodes | `.env` as `ROCKETRIDE_OPENAI_KEY` (and Cloud Parameters / node gear) |

## Steps

### 1. Rocket Ride account
Sign in at [https://rocketride.ai](https://rocketride.ai).

### 2. Cursor extension
Install **RocketRide**, connect to Cloud host `https://api.rocketride.ai`, set `ROCKETRIDE_APIKEY` in `.env`.

### 3. LLM API key for pipe nodes
Cloud builder may not show a “Variables” tab. Try in order:

1. **Parameters** — add `ROCKETRIDE_OPENAI_KEY`
2. **LLM node gear** — paste key or `${ROCKETRIDE_OPENAI_KEY}`
3. **Tokens** tab — provider keys

### 4. Open and deploy `finterms.pipe`
- Webhook row → website  
- Chat row → Play demos / judging walkthrough (Scope→Clarify→Analyze→Cite/Rank→Agent)

Deploy via **RocketRide: Deploy** to Cloud.

### 5. Run the website
```bash
npm run dev
```
UI calls Rocket Ride through `src/lib/rocketride-client.ts` (`source: webhook_1`).

## Done when
- [ ] Extension connected to Cloud  
- [ ] `ROCKETRIDE_OPENAI_KEY` set for LLM nodes  
- [ ] `finterms.pipe` deployed / runnable  
- [ ] Chat Play returns findings + citation URLs  
- [ ] Website clarify/analyze works against Rocket Ride  
