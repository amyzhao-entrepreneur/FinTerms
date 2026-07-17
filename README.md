# FinTerms

West Coast terms assistant for fintech startups (WA / OR / CA).

**Orchestrator: Rocket Ride Cloud** — pipeline file [`finterms.pipe`](./finterms.pipe).

## Pipeline (explain this to judges)

```text
Webhook → Question → Prompt (MODE stages) → LLM → Return Answers

Chat → ScopeGate → Clarify → Analyze → Cite/Rank → Agent (+ Memory) → Return Answers
```

Stages: ScopeGate → Clarify → Analyze → Cite/Rank → Rewrite (citation allowlist only).

## Run

1. `.env` from `.env.example`:
   - `ROCKETRIDE_URI=https://api.rocketride.ai`
   - `ROCKETRIDE_APIKEY=...`
   - `ROCKETRIDE_OPENAI_KEY=...` (for the LLM node inside the pipe)
2. `npm install && npm run dev`
3. UI calls Rocket Ride via Webhook source (`src/lib/rocketride-client.ts`)
4. Or open `finterms.pipe` in Cursor → Play **Chat**

## Docs

[`spec.md`](spec.md) · [`rocketride/PIPELINE.md`](rocketride/PIPELINE.md) · [`docs/SETUP_ROCKETRIDE.md`](docs/SETUP_ROCKETRIDE.md)
