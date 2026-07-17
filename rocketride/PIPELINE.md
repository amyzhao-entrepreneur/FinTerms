# Rocket Ride Cloud — FinTerms pipeline

## Graph (`finterms.pipe`)

Two entry points share one story: **ScopeGate → Clarify → Analyze → Cite/Rank → (Rewrite) → Return Answers**.

### Website path (Webhook — used by the Next.js app)

```text
Webhook → Question → Prompt (MODE-aware stages) → LLM → Return Answers
```

| Node | Role |
|------|------|
| **Webhook** | HTTP entry for the website (`source: webhook_1` via SDK) |
| **Question** | Webhook text → questions lane |
| **Prompt** | Scope / Clarify / Analyze / Cite-Rank / Rewrite (honors `MODE …`) |
| **LLM** | Model worker (`${ROCKETRIDE_OPENAI_KEY}`) |
| **Return Answers** | JSON back to the website |

### IDE / judging path (Chat — Play in Cursor)

```text
Chat → Prompt ScopeGate → LLM
    → Prompt Clarify → LLM
    → Prompt Analyze → LLM
    → Prompt Cite/Rank → LLM
    → Agent (orchestrator + Memory) → Return Answers
```

| Node | Role |
|------|------|
| **Chat** | Cursor Play / live demo |
| **Prompt + LLM ×4** | Explicit stages judges can point at |
| **Agent** | Orchestrates / validates final JSON; uses Memory across waves |
| **LLM (control)** | Model attached to the Agent |
| **Memory** | Scratchpad between agent waves |
| **Return Answers** | Final output in Chat |

## Website wiring

`POST /api/pipeline` → Rocket Ride SDK → `use({ filepath: finterms.pipe, source: "webhook_1" })` → `send(...)`.

Primary path is always Rocket Ride Cloud. Soft client timeout: 10 seconds.
