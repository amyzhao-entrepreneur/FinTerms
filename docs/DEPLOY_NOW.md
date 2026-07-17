# Deploy FinTerms to Rocket Ride Cloud

## Deploy the pipeline

1. Open **`finterms.pipe`** in Cursor.
2. Command Palette (`Cmd+Shift+P`) → **RocketRide: Deploy** / **RocketRide: Open Deploy**.
3. Set connection mode to **RocketRide Cloud**.
4. Set **`ROCKETRIDE_OPENAI_KEY`** for LLM nodes (`${ROCKETRIDE_OPENAI_KEY}`).
5. Deploy / publish **`finterms.pipe`**.
6. Smoke-test **Chat** Play with a payments WA/OR/CA draft; confirm findings include citation URLs.
7. Out-of-scope check: `Healthcare app in Texas` → expand-soon redirect.

## Run the website

```bash
cd /Users/amyzhao/Projects/FinTerms
npm run dev
```

Open the printed localhost URL → Load sample ToS → run review.  
The UI calls Rocket Ride via the Webhook branch of `finterms.pipe`.

## Repo highlights

- Pipeline: [`finterms.pipe`](../finterms.pipe) — Webhook + multi-stage Chat / Agent graph  
- Citations: allowlisted URLs (e.g. CCPA, WA CPA) via Cite/Rank  
- Architecture: see [`README.md`](../README.md)
