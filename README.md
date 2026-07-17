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

    subgraph ChatPath["IDE / judging path · Chat Play"]
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

### Orchestration story (say this to judges)

| Stage | What Rocket Ride does |
|-------|------------------------|
| **ScopeGate** | Out-of-state / non-finance → polite expand-soon redirect |
| **Clarify** | 3–5 founder questions (product, fees, data, disputes) |
| **Analyze** | Exhaustive first-pass across money, rights, data, future problems, enforceability, regulatory friction, conversion/trust |
| **Cite/Rank** | Attach 1–2 URLs **only** from the allowlisted pack (never invent links) |
| **Rewrite** | Apply accepted suggestions → `prior_draft` + `current_draft` |
| **Agent + Memory** | On the Chat path: validates/consolidates stage JSON across waves |

**Website** hits the **Webhook** row (fast MODE-aware Prompt → LLM).  
**Cursor Play / live graph walkthrough** uses the **Chat** row (explicit Prompt+LLM stages → Agent).

```text
UI ──► /api/pipeline ──► Rocket Ride Cloud (finterms.pipe)
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
     Webhook → … → Answers            Chat → Scope → Clarify
     (product)                        → Analyze → Cite/Rank
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
