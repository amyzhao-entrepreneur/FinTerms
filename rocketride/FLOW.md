# FinTerms Rocket Ride — copy this flow

I **cannot log into your Rocket Ride account**, but you can either:

1. **Import** `finterms-simple.pipe` (easiest), or  
2. **Rebuild by hand** using the diagram below (matches what you’ve been building).

---

## Option A — Import the ready pipeline (recommended)

File in this repo: [`finterms-simple.pipe`](./finterms-simple.pipe)

### Import steps
1. In Rocket Ride Pipeline Builder, left sidebar under **PIPELINES**, use **Import** (or open/upload a `.pipe` file)
2. Select `rocketride/finterms-simple.pipe` from your FinTerms folder on disk  
   Path: `/Users/amyzhao/Projects/FinTerms/rocketride/finterms-simple.pipe`
3. Open the **OpenAI** node gear → paste your OpenAI API key again if `${ROCKETRIDE_OPENAI_KEY}` doesn’t resolve
4. Press **Play** on **Chat**
5. Paste a test message (see below)

### What this simple pipe includes (one LLM pass)
```text
Chat → Prompt (FinTerms all-in-one) → OpenAI GPT-4o → Return Answers
```

It does scope gate + clarifying questions + exhaustive findings + allowlisted citations in **one** OpenAI call (good for hackathon demo / judging traceability).

---

## Option B — Full multi-step flow (manual rebuild)

```text
Chat  (or Webhook later for the website)
  │ Text / Questions
  ▼
Prompt: Scope/Clarify
  │ Questions
  ▼
OpenAI: Scope/Clarify  ──Answers──►  Prompt: Analyze
                                       │ Questions/Text
                                       ▼
                                     OpenAI: Analyze ──Answers──► Prompt: CiteRank
                                                                    │
                                                                    ▼
                                                                  OpenAI: CiteRank ──Answers──► Prompt: Rewrite
                                                                                                 │
                                                                                                 ▼
                                                                                               OpenAI: Rewrite
                                                                                                 │ Answers
                                                                                                 ▼
                                                                                           Return Answers
```

### Node checklist
| # | Node type | Name | What to configure |
|---|-----------|------|-------------------|
| 1 | SOURCE → Chat | Chat | Play to type messages |
| 2 | TEXT → Prompt | Scope/Clarify prompt | Paste prompt #1 |
| 3 | LLM → OpenAI | Scope/Clarify | Model GPT-4o + API key |
| 4 | TEXT → Prompt | Analyze prompt | Paste prompt #2 |
| 5 | LLM → OpenAI | Analyze | Model + API key |
| 6 | TEXT → Prompt | CiteRank prompt | Paste prompt #3 + citation pack |
| 7 | LLM → OpenAI | CiteRank | Model + API key |
| 8 | TEXT → Prompt | Rewrite prompt | Paste prompt #4 |
| 9 | LLM → OpenAI | Rewrite | Model + API key |
| 10 | INFRASTRUCTURE → Return Answers | Return Answers | Connect last Answers here |

OpenAI gears = **name + model + API key only**.  
Prompts go in **Prompt** nodes.

---

## Test messages

**In scope:**
```text
We are a payments startup entering WA, OR, and CA. Here is our Terms draft:

SAMPLE: Company may change fees anytime without notice. All disputes go to binding arbitration in Delaware; class actions waived. We may sell transaction data to any third party. We may freeze accounts without notice.
```

**Out of scope (should redirect):**
```text
We are a healthcare app based in Texas.
```

---

## Connect to the website later

1. Swap **Chat** for **Webhook** (or add a second pipeline with Webhook)
2. Click **Endpoint Info** → copy URL
3. Paste URL in chat → I’ll wire Next.js `/api/pipeline` to call it

Until then, keep using **local** http://localhost:3000 for the full UI demo.
