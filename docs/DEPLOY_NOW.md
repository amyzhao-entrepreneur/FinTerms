# Deploy FinTerms to Rocket Ride Cloud — checklist

I **cannot** deploy to your Cloud account (needs your login). You click Deploy; the local app/repo stays ready.

## A. Deploy pipeline to Cloud (~10 min)

1. In Cursor, open **`finterms.pipe`**.
2. Command Palette (`Cmd+Shift+P`) → **`RocketRide: Deploy`** / **`RocketRide: Open Deploy`**.
3. Connection mode: **RocketRide Cloud**.
4. Ensure **`ROCKETRIDE_OPENAI_KEY`** is set for the deployment (LLM nodes use `${ROCKETRIDE_OPENAI_KEY}`).
5. Deploy / publish **`finterms.pipe`**.
6. Smoke-test **Chat** Play with a payments WA/OR/CA draft; confirm findings + citation URLs.
7. Also try: `Healthcare app in Texas` → redirect.

## B. Local website

```bash
cd /Users/amyzhao/Projects/FinTerms
npm run dev
```

Open the printed localhost URL → Load sample ToS → run review.  
The UI calls Rocket Ride via the Webhook branch of `finterms.pipe`.

## C. Submission pack

- Repo: https://github.com/amyzhao-entrepreneur/FinTerms
- Pipeline: `finterms.pipe` (Webhook + multi-stage Chat / Agent graph)
- Citation example: findings with allowlisted URLs (e.g. CCPA, WA CPA)

**Project description bullets:**
1. **Problem:** fintech startups need citation-backed WA/OR/CA terms review.
2. **Pipeline:** Rocket Ride Cloud — Webhook for the product; Chat path shows Scope→Clarify→Analyze→Cite/Rank→Agent→Return Answers.
3. **Cited output:** findings include allowlisted source URLs.

## Demo script (2 min)

1. Scope fail: Texas healthcare → redirect  
2. Sample payments ToS → findings with citation link  
3. Point at Rocket Ride Cloud graph (stages + Agent + Return Answers)  
4. Disclaimer: not legal advice  
