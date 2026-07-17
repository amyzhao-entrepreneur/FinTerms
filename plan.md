# FinTerms — Hackathon Implementation Plan

**Timebox:** 2–3 hours · **Team:** 3 people · **Source of truth:** [`spec.md`](./spec.md)

**Demo vertical (lock now):** Payments (primary). Neobank / lending / investing remain selectable labels that bias prompts, but depth is payments-first.

**Stack note:** No Linkup. Citations come from **Cite/Rank** over an allowlisted citation pack (similarity + trust + freshness). Put `OPENAI_API_KEY` in Rocket Ride / local env only — do **not** paste keys into chat, git, or docs.

---

## 1. Outcome for judging

By demo time we must have:

| Deliverable | Done looks like |
|-------------|-----------------|
| Working prototype | Live or local UI that runs the happy path |
| Rocket Ride pipeline | Deployed on Rocket Ride Cloud (orchestration graph live) |
| Cite/Rank citations | Factual claims show openable allowlisted URLs ranked by similarity + validity |
| Source code | Public/shareable repo link |
| Project description | Problem + pipeline structure + Cite/Rank cited-output example |

**Happy path (must work live):**
1. Scope gate (optional quick show: Texas or healthcare → polite redirect)
2. Paste/upload payments ToS for WA/OR/CA
3. 3–5 clarifying questions
4. Comprehensive first-pass findings (report + annotations + checklist mix)
5. Accept ≥1 rewrite → current + prior revision
6. Disclaimer visible

---

## 2. Architecture (build this, not more)

```text
[Web UI]
   │  paste/upload, Q&A, findings actions, draft + prior
   ▼
[Rocket Ride Cloud = ORCHESTRATOR]  ← must be deployed
   1. ScopeGate
   2. Clarify
   3. Analyze          (OpenAI → findings without final cites)
   4. Cite/Rank        (RAG over citation pack → attach or uncertain)
   5. Rewrite          (OpenAI apply accepted suggestions)
   ▼
[Session state] current draft, prior draft, findings, actions
```

**Orchestration:** Rocket Ride owns step order, branching, and deployment. OpenAI runs **inside** Analyze / Clarify / Rewrite / ScopeGate as a worker.

**Stack assumptions**
- **Rocket Ride Cloud:** orchestrator + agent host
- **OpenAI:** review, chat/Q&A, rewrites, scope replies
- **Citation pack + Cite/Rank:** grounding corpus + similarity/trust/freshness scoring
- **Web UI:** thin client calling the deployed pipeline

---

## 3. Workstreams (parallel)

### Person A — Rocket Ride pipeline + OpenAI
**Owns:** Deployed orchestration graph.

| Step | Task | Time |
|------|------|------|
| A1 | Create Rocket Ride project; wire OpenAI (`OPENAI_API_KEY` in secrets) | 15m |
| A2 | Node: **ScopeGate** → redirect copy from spec §5.1 | 15m |
| A3 | Node: **Clarify** (max ~5 questions) | 15m |
| A4 | Node: **Analyze** → findings JSON (§8) without final citations | 25m |
| A5 | Node: **Cite/Rank** → retrieve/score/attach from pack; uncertain if below threshold | 25m |
| A6 | Node: **Rewrite** (accepted IDs → `current_draft` + `prior_draft`) | 15m |
| A7 | Deploy to Rocket Ride Cloud; smoke-test with sample ToS | 15m |

**Cite/Rank score:** `w1·similarity + w2·trust + w3·freshness − w4·conflict`  
**Post-check:** citation URL must be in allowlist; else drop.

**Prompt rules (Analyze):** exhaustive first pass across all 7 risk lenses; never invent URLs; never greenlight violating WA/OR/CA language; founder-friendly tone.

### Person B — Citation pack + sample content + writeup
**Owns:** Traceability corpus and demo content.

| Step | Task | Time |
|------|------|------|
| B1 | Build **citation-pack.json** with `label`, `url`, `states`, `topics`, `trust_tier`, `last_reviewed`, `superseded`, `snippet` | 30m |
| B2 | Hand pack to Person A; verify Cite/Rank only emits allowlisted URLs and ranks by score | 15m |
| B3 | Build **sample payments ToS** with planted issues (fees, arbitration, data sharing, unilateral change) | 20m |
| B4 | Capture **one real cited finding** for submission | 10m |
| B5 | Draft **project description**: problem, orchestration diagram, Cite/Rank example | 20m |

**If best score &lt; threshold or sources conflict:** `citation_status: uncertain` — never invent URLs.

### Person C — Web UI + session + polish
**Owns:** Demo surface and reliability.

| Step | Task | Time |
|------|------|------|
| C1 | Scaffold UI: intake (vertical, states, paste + upload) | 25m |
| C2 | Call deployed Rocket Ride endpoints; render Q&A | 25m |
| C3 | Findings UI: severity, explanation, citations (links), optional score/trust, approve / accept / ignore | 25m |
| C4 | Apply accepts → show revised draft + **prior revision only** | 15m |
| C5 | Disclaimer banner; sample-draft button; error states | 15m |
| C6 | Dry-run full demo script twice | 15m |

---

## 4. Timeline (clock)

```text
0:00–0:15  Sync: lock demo vertical (payments), repo, OpenAI + Rocket Ride secrets
0:15–1:15  Parallel build (A pipeline incl. Cite/Rank, B pack + sample, C UI shell)
1:15–1:45  Integrate: UI ↔ deployed pipeline; first end-to-end run
1:45–2:15  Harden: ranked citations visible, scope gate, rewrite + prior revision
2:15–2:45  Submission pack: README, project description, repo link, dry-run
2:45–3:00  Buffer / backup recording if live demo is risky
```

If only **2 hours**, cut: multi-vertical depth, fancy diff, upload (keep paste + sample), bulk actions, showing score numbers in UI. Keep: deployed pipeline, Cite/Rank allowlisted URLs, first-pass findings, accept rewrite, scope redirect, disclaimer.

---

## 5. Integration checklist (minute 75)

- [ ] UI hits **deployed** Rocket Ride pipeline URL (not localhost agent)
- [ ] Out-of-scope reply matches spec wording (state/field → WA/OR/CA finance redirect)
- [ ] First response returns **many** findings (exhaustive), not 1–2 token issues
- [ ] Cite/Rank: factual findings have ≥1 clickable allowlisted URL (or marked uncertain)
- [ ] Accept suggestion updates draft; prior revision still viewable
- [ ] Disclaimer on analysis view

---

## 6. Rocket Ride pipeline structure (for submission)

1. **ScopeGate** — Detect non–WA/OR/CA geography or non-finance domain → polite redirect; else continue  
2. **Clarify** — Short Q&A until enough product context  
3. **Analyze** — OpenAI structured exhaustive review (all risk lenses)  
4. **Cite/Rank** — RAG over citation pack; score similarity + trust + freshness; attach or uncertain  
5. **Rewrite** — Apply user-accepted suggestions; emit `current_draft` + `prior_draft`

---

## 7. Submission pack

### README / project description (Person B drafts, all review)
1. **Problem solved** — startups need citation-backed WA/OR/CA terms review/drafting without treating the tool as counsel  
2. **Rocket Ride pipeline structure** — orchestration diagram + node list above  
3. **OpenAI + Cite/Rank** — workers vs orchestrator; how ranking works; how URLs appear  
4. **Example of cited output** — paste one real finding with working URL  
5. **Repo link** + how to run the prototype  

### Demo script (Person C leads)
1. Scope gate fail-path (10s)  
2. Sample payments ToS → questions → full findings  
3. Open a citation URL; briefly note Cite/Rank (similarity + trust)  
4. Accept one rewrite → show prior  
5. Point at disclaimer  

---

## 8. Explicit non-work (do not build)

- Linkup or open-web crawling  
- Deep version history  
- Google Docs sync  
- Org auth / multi-user  
- Healthcare or other-state analysis  
- Perfect coverage of all statutes — prefer strong ranked cites on planted demo issues  
- Local-only pipeline as the “real” backend  

---

## 9. Definition of done

- [ ] Deployed Rocket Ride pipeline used in demo  
- [ ] OpenAI Analyze returns comprehensive findings  
- [ ] Cite/Rank attaches allowlisted URLs (or uncertain); example saved for writeup  
- [ ] Scope gate works  
- [ ] Accept rewrite + prior revision works  
- [ ] Repo link + project description ready  
- [ ] Full dry-run completed successfully once  

---

## 10. Immediate next actions (start now)

1. Create/confirm GitHub repo for FinTerms  
2. Create Rocket Ride Cloud pipeline stub and deploy empty “ping”  
3. Add OpenAI API key as a **Rocket Ride / env secret** (not in chat or git)  
4. Person C scaffolds UI; Person B starts citation pack + sample ToS; Person A builds ScopeGate → Analyze → Cite/Rank  

When blockers below are cleared, implementation can start.
