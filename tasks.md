# FinTerms — Tasks

**Source of truth:** [`spec.md`](./spec.md) · **Plan:** [`plan.md`](./plan.md)  
**Timebox:** 2–3 hours · **Demo vertical:** Payments  
**Stack:** Rocket Ride Cloud (orchestrator) + OpenAI (node workers) + Cite/Rank over citation pack. Store `OPENAI_API_KEY` in secrets/env only.

Mark tasks: `[ ]` todo · `[~]` in progress · `[x]` done · `[-]` cut/skipped

---

## 0. Team sync (all) — first 15 min

- [ ] **T0.1** Confirm GitHub repo exists and everyone has access
- [ ] **T0.2** Lock demo vertical = payments
- [ ] **T0.3** Add OpenAI API key to Rocket Ride secrets / local `.env` (never commit or paste in chat)
- [ ] **T0.4** Confirm Rocket Ride Cloud project access
- [ ] **T0.5** Agree on UI framework (fastest option for the team)
- [ ] **T0.6** Share deployed pipeline URL placeholder once Person A has a stub

---

## 1. Person A — Rocket Ride orchestration + OpenAI

- [ ] **A1** Create Rocket Ride project and wire OpenAI
- [ ] **A2** Implement **ScopeGate** node (out-of-state / non-finance → polite redirect per spec §5.1)
- [ ] **A3** Implement **Clarify** node (≤5 founder-friendly questions)
- [ ] **A4** Implement **Analyze** node:
  - [ ] Exhaustive first-pass across all 7 risk lenses
  - [ ] Findings JSON matching spec §8 schema (citations may be empty pre–Cite/Rank)
  - [ ] Never invent URLs; never greenlight unlawful WA/OR/CA language
- [ ] **A5** Implement **Cite/Rank** node:
  - [ ] Retrieve candidates from citation pack (filter by state/topic)
  - [ ] Score: similarity + trust + freshness − conflict
  - [ ] Attach top 1–2 allowlisted URLs if score ≥ threshold; else `citation_status: uncertain`
  - [ ] Post-check: drop any URL not in the pack
- [ ] **A6** Implement **Rewrite** node (accepted finding IDs → `current_draft` + `prior_draft`)
- [ ] **A7** Deploy pipeline to **Rocket Ride Cloud** (not local/docker-only)
- [ ] **A8** Smoke-test with sample payments ToS
- [ ] **A9** Hand Person C the live endpoint + request/response shape

**Finding fields:** `id`, `risk_types[]`, `severity`, `title`, `plain_language_explanation`, `clause_excerpt`, `suggested_rewrite`, `state_relevance[]`, `citations[{label,url,trust_tier?,score?}]`, `citation_status`, `user_action`

---

## 2. Person B — Citation pack + sample + writeup

- [ ] **B1** Create `citation-pack.json` with full metadata (`snippet`, `trust_tier`, `last_reviewed`, `superseded`, `states`, `topics`)
- [ ] **B2** Deliver pack to Person A; verify Cite/Rank ranking + allowlist post-check
- [ ] **B3** Write sample payments ToS with planted issues:
  - [ ] Unilateral / surprise fees
  - [ ] Arbitration / class-action waiver
  - [ ] Broad data sharing
  - [ ] Unilateral terms change
- [ ] **B4** Capture one real cited finding (snippet or screenshot) for submission
- [ ] **B5** Draft project description:
  - [ ] Problem solved
  - [ ] Rocket Ride **orchestration** structure (ScopeGate → Clarify → Analyze → Cite/Rank → Rewrite)
  - [ ] OpenAI as node workers + Cite/Rank scoring
  - [ ] Example of cited output with working URL
- [ ] **B6** Add README run instructions + repo link section

---

## 3. Person C — Web UI + session + demo

- [ ] **C1** Scaffold UI intake: vertical, states (WA/OR/CA), paste + upload
- [ ] **C2** Wire UI to **deployed** Rocket Ride pipeline
- [ ] **C3** Render clarifying Q&A loop
- [ ] **C4** Findings UI: severity, explanation, citation links (optional trust/score), approve / accept / ignore; show uncertain state
- [ ] **C5** Apply accepted rewrites; show current draft + **prior revision only**
- [ ] **C6** Add disclaimer banner on analysis views
- [ ] **C7** Add “Load sample draft” button + basic error states
- [ ] **C8** Dry-run full demo script **twice**

---

## 4. Integration (all) — ~minute 75

- [ ] **I1** UI calls deployed Rocket Ride URL (not localhost agent)
- [ ] **I2** Scope gate: Texas or healthcare → redirect copy matches spec
- [ ] **I3** First pass returns comprehensive findings (not 1–2 shallow issues)
- [ ] **I4** Cite/Rank: factual findings have ≥1 clickable allowlisted URL (or marked uncertain)
- [ ] **I5** Accept suggestion updates draft; prior revision still viewable
- [ ] **I6** Disclaimer visible on analysis view

---

## 5. Submission pack (all)

- [ ] **S1** Working prototype ready (live and/or local demo)
- [ ] **S2** Source code / repository link
- [ ] **S3** Project description complete (problem + orchestration + Cite/Rank + cited example)
- [ ] **S4** Optional: backup screen recording if live demo is risky

---

## 6. Definition of done

- [ ] Deployed Rocket Ride pipeline used in demo
- [ ] OpenAI Analyze returns comprehensive findings
- [ ] Cite/Rank allowlisted URLs (or uncertain); example saved for writeup
- [ ] Scope gate works
- [ ] Accept rewrite + prior revision works
- [ ] Repo link + project description ready
- [ ] Full dry-run completed successfully once

---

## 7. Explicit non-tasks (do not do)

- [-] Linkup or open-web crawling
- [-] Deep version history
- [-] Google Docs sync
- [-] Org auth / multi-user
- [-] Healthcare or other-state analysis
- [-] Local-only pipeline as the real backend

---

## 8. Cut list if under 2 hours

Keep: deployed pipeline, Cite/Rank allowlisted citations, first-pass findings, accept rewrite, scope redirect, disclaimer, sample paste path.

Cut if needed:
- [-] Upload (keep paste + sample)
- [-] Multi-vertical depth
- [-] Fancy side-by-side diff
- [-] Bulk accept-all polish
- [-] Showing numeric scores in UI (keep ranking logic server-side)
