# FinTerms

West Coast terms assistant for fintech startups (**WA / OR / CA**).

**Orchestrator: [Rocket Ride Cloud](https://rocketride.ai)** — pipeline [`finterms.pipe`](./finterms.pipe).

FinTerms helps founders draft, review, and rewrite consumer terms with citation-backed findings. Not legal advice; not a compliance certificate; not a substitute for counsel.

---

## Architecture

```mermaid
flowchart TB
  subgraph Product["FinTerms product"]
    UI["Next.js UI<br/>intake → clarify → findings → rewrite"]
    API["POST /api/pipeline<br/>scope · clarify · analyze · rewrite"]
    Scope["Local ScopeGate<br/>WA / OR / CA · fintech only"]
    UI --> API
    API --> Scope
  end

  subgraph RR["Rocket Ride Cloud — finterms.pipe"]
    direction TB

    subgraph WebPath["Website path · source: webhook_1"]
      WH[Webhook] --> Q[Question]
      Q --> PWeb["Prompt<br/>MODE-aware stages"]
      PWeb --> LLMWeb[LLM]
      LLMWeb --> RAWeb[Return Answers]
    end

    subgraph ChatPath["Chat path · IDE Play"]
      Chat[Chat] --> PS[Prompt · ScopeGate]
      PS --> LS[LLM]
      LS --> PC[Prompt · Clarify]
      PC --> LC[LLM]
      LC --> PA[Prompt · Analyze]
      PA --> LA[LLM]
      LA --> PCite[Prompt · Cite/Rank]
      PCite --> LCite[LLM]
      LCite --> Agent["Agent orchestrator"]
      Agent --> Mem[(Memory)]
      Agent --> LLMAgent[LLM]
      Agent --> RAChat[Return Answers]
    end
  end

  Pack["Citation allowlist<br/>data/citation-pack.json<br/>statute → guidance → explainer"]

  API -->|"SDK use + send"| WH
  RAWeb -->|"JSON answers"| API
  API --> UI
  PWeb -.-> Pack
  PCite -.-> Pack
  Agent -.-> Pack
```

**Pipeline stages:** ScopeGate → Clarify → Analyze → Cite/Rank → Rewrite (Agent + Memory on the Chat path).

**Website** uses the **Webhook** row. **Cursor Play** uses the **Chat** row.

```text
UI ──► /api/pipeline ──► Rocket Ride Cloud (finterms.pipe)
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
     Webhook → … → Answers            Chat → Scope → Clarify
                                      → Analyze → Cite/Rank
                                      → Agent(+Memory) → Answers
```

---

## Run

1. Copy `.env.example` → `.env`:
   - `ROCKETRIDE_URI=https://api.rocketride.ai`
   - `ROCKETRIDE_APIKEY=...`
   - `ROCKETRIDE_OPENAI_KEY=...` (LLM nodes in the pipe)
2. `npm install && npm run dev`
3. Open the printed localhost URL — UI calls Rocket Ride via Webhook (`src/lib/rocketride-client.ts`)
4. Or open `finterms.pipe` in Cursor → **Play** on **Chat**

## Docs

[`spec.md`](spec.md) · [`rocketride/PIPELINE.md`](rocketride/PIPELINE.md) · [`docs/SETUP_ROCKETRIDE.md`](docs/SETUP_ROCKETRIDE.md) · [`docs/DEPLOY_NOW.md`](docs/DEPLOY_NOW.md)
