# FinTerms

West Coast terms assistant for fintech startups — draft, review, and rewrite consumer agreements for **Washington, Oregon, and California**, with citation-backed findings.

**Not legal advice. Not a compliance certificate. Not a substitute for counsel.**

## Quick start (local prototype)

1. Put your OpenAI key in `.env` as `ROCKETRIDE_OPENAI_KEY=sk-...` (see `.env.example`)
2. Install Node 22+ and run:

```bash
npm install
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000)
4. Click **Load sample payments ToS** → continue through questions → review findings → accept a rewrite

## Pipeline (orchestration)

Rocket Ride Cloud orchestrates:

1. ScopeGate  
2. Clarify  
3. Analyze (OpenAI)  
4. Cite/Rank (allowlisted citation pack)  
5. Rewrite (OpenAI)

Local mirror: `POST /api/pipeline`  
Cloud instructions: [`docs/SETUP_ROCKETRIDE.md`](docs/SETUP_ROCKETRIDE.md)  
GitHub instructions: [`docs/SETUP_GITHUB.md`](docs/SETUP_GITHUB.md)

## Repo docs

- [`spec.md`](spec.md) — product spec  
- [`plan.md`](plan.md) — hackathon plan  
- [`tasks.md`](tasks.md) — task checklist  
- [`data/citation-pack.json`](data/citation-pack.json) — allowlisted sources  
- [`rocketride/PIPELINE.md`](rocketride/PIPELINE.md) — Cloud pipeline contract  

## Example cited output

Findings include plain-language risk, suggested rewrite, and a source URL from Cite/Rank, e.g. California CLRA / CCPA / Washington CPA entries in the citation pack.
