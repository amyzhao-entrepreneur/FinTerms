# FinTerms Rocket Ride — flow guide

Canonical file: [`../finterms.pipe`](../finterms.pipe) at the repo root.

## What to open

1. In Cursor, open **`finterms.pipe`** (Rocket Ride canvas view)
2. Ensure **LLM** nodes resolve `${ROCKETRIDE_OPENAI_KEY}` (Parameters, Tokens, or paste on the node)
3. **Website:** no need to press Play — the Next.js app calls the **Webhook** branch via SDK
4. **Judges / IDE demo:** press **Play** on **Chat** and paste a test message

## Graph (explain this)

**Top row — website**

```text
Webhook → Question → Prompt (all stages, MODE-aware) → LLM → Return Answers
```

**Bottom row — Chat / judging narrative**

```text
Chat → ScopeGate → Clarify → Analyze → Cite/Rank → Agent (+ Memory) → Return Answers
         Prompt+LLM   Prompt+LLM  Prompt+LLM  Prompt+LLM
```

Agent steps you can say out loud: ScopeGate → Clarify → Analyze → Cite/Rank → Rewrite.

## Test messages

**In scope:**
```text
We are a payments startup entering WA, OR, and CA. Here is our Terms draft:

SAMPLE: Company may change fees anytime without notice. All disputes go to binding arbitration in Delaware; class actions waived. We may sell transaction data to any third party. We may freeze accounts without notice.
```

**Out of scope:**
```text
We are a healthcare app based in Texas.
```

## Website

The app uses Rocket Ride Cloud (`ROCKETRIDE_URI` + `ROCKETRIDE_APIKEY`) and the Webhook source in `finterms.pipe`. Local UI: `npm run dev` → http://localhost:3001 (or 3000).
