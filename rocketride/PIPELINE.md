# FinTerms Rocket Ride pipeline

**Orchestrator:** Rocket Ride Cloud  
**Workers:** OpenAI inside nodes  
**Grounding:** Cite/Rank over `data/citation-pack.json`

## Graph

```text
Source (Chat/Webhook)
  → ScopeGate
  → Clarify
  → Analyze
  → CiteRank
  → Rewrite
  → Output
```

## Node contracts

### ScopeGate
**Input:** user/product text  
**If out of scope:** stop and return:

> We don't currently serve [state / field], but we will be expanding there soon. Please see our services for financial startups in Washington, Oregon, and California.

**Else:** pass through.

### Clarify
**Input:** vertical, states, draft, context  
**Output:** 3–5 short questions (JSON array)

### Analyze
**Input:** draft + answers  
**Output:** findings JSON (spec §8) **without final citations**  
**Model:** OpenAI via `${ROCKETRIDE_OPENAI_KEY}`  
**Rule:** exhaustive first pass; never invent URLs

### CiteRank
**Input:** findings + citation pack  
**Score:** `0.45*similarity + 0.35*trust + 0.20*freshness`  
**Output:** attach top 1–2 allowlisted URLs or `citation_status: uncertain`  
**Post-check:** URL must exist in pack

### Rewrite
**Input:** draft + findings with `user_action=accepted`  
**Output:** `{ current_draft, prior_draft }`

## Local mirror
The Next.js route `POST /api/pipeline` runs the same steps for the working prototype while Cloud deploy is in progress.

## Deploy checklist
1. Set `ROCKETRIDE_OPENAI_KEY` in Rocket Ride Variables  
2. Deploy pipeline to **Rocket Ride Cloud**  
3. Put invoke URL in app env as `ROCKETRIDE_PIPELINE_URL` (optional wiring)  
4. Capture one cited finding for the submission writeup  
