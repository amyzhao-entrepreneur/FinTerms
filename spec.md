# FinTerms — Product Spec

**Hackathon product.** Spec-driven development for a B2B web app that helps fintech startups draft, review, and rewrite consumer-facing terms for **Washington, Oregon, and California**.

---

## 1. Positioning

**One-liner:** FinTerms is a West Coast terms assistant for fintech startups — draft, review, and rewrite consumer agreements so WA / OR / CA rules don’t surprise you or your users.

**Audience:** Anyone at a fintech startup (founders, PMs, ops, counsel-adjacent). Preference for teams that already know their product and customers.

**Tone:** Founder-friendly — plain language, actionable, not legalese-first.

**Not:** A consumer “scan before you accept” tool. FinTerms serves the **writers** of terms, using a consumer-harm and state-law lens.

---

## 2. Problem

Fintech startups ship Terms of Service, Privacy Policies, and related agreements under time pressure. Clauses that seem protective can:

- Create **consumer harm** (unexpected fees, rights waivers, data exposure, future lock-in)
- Create **startup risk** (unenforceable terms, regulatory friction, trust/conversion damage, disputes)

WA, OR, and CA have material consumer-protection and privacy expectations. Teams need a **thorough first-pass review** with **traceable sources**, not vibes and not multi-round whack-a-mole.

---

## 3. Goals

### Product goals
1. Help startups **draft from scratch**, **review existing drafts**, and **rewrite risky clauses**.
2. Surface risks across **consumer** and **startup** lenses (see §6).
3. Ground every factual claim in a **source URL** via **OpenAI** using an allowlisted citation pack (hackathon judging requirement).
4. Avoid greenlighting language that would **violate WA / OR / CA law or regulation** — flag and suggest safer alternatives with citations.
5. Deliver a **near-complete first revision**: catch all or ~99% of material errors/concerns in the initial analysis so the revision cycle stays short.
6. Politely **refuse out-of-scope states and domains** and redirect to in-scope services (see §5.1).

### Hackathon goals
- Functional, meaningful demo that works live (or local as allowed for the working prototype).
- Pipeline **deployed to Rocket Ride Cloud** (not local-only / docker-only for the pipeline requirement).
- Clear Rocket Ride + **OpenAI** integration story, including an example of cited output.

---

## 4. Non-goals / disclaimers

FinTerms **is not**:
- Legal advice
- A compliance certification
- A substitute for licensed counsel
- A guarantee of enforceability or regulatory approval
- Exhaustive coverage of all WA / OR / CA law
- A general-purpose legal assistant for non-finance domains or other U.S. states (v1)

**Safety language (required in UI):**
- Prominent disclaimer on every analysis and export.
- Findings are informational decision-support for internal draft review.
- Users remain responsible for final terms and counsel review.
- Liability / reliance limitation suitable for hackathon + startup use (no warranty; no reliance as counsel).

---

## 5. Users & verticals

| Attribute | Spec |
|-----------|------|
| Primary user | Startup team member working on consumer terms |
| Startup stage | Any; prefer teams with existing product knowledge |
| In-scope verticals (hackathon) | **Neobank, payments, lending, investing** |
| In-scope states | **Washington, Oregon, California** |
| Out of scope (v1) | Other U.S. states; non-finance domains (e.g. healthcare, pure SaaS); crypto, BNPL, insurance unless framed inside an in-scope fintech vertical |

**Demo recommendation:** Ship one primary vertical end-to-end (e.g. payments or neobank); keep the other three as selectable context that biases prompts/checklists.

### 5.1 Out-of-scope handling (required)

If the user says their startup is in a **different state**, or asks about a **different domain/field** (e.g. healthcare instead of finance), the app must **not** run a full analysis for that scope. Respond politely and redirect:

> We don’t currently serve [state / field], but we will be expanding there soon. Please see our services for financial startups in Washington, Oregon, and California.

**Behavior:**
- Detect out-of-scope **geography** (any state/region other than WA, OR, CA) and out-of-scope **domain** (non-fintech / non-finance fields).
- Use the same polite redirect pattern in chat, intake, and clarifying questions.
- Offer to continue only if they reframe for **financial startups** in **WA / OR / CA**.
- Do not invent advice for the out-of-scope state or field.

---

## 6. Risk model

Every finding is tagged with one or more lenses:

### Consumer-facing
1. **Money** — fees, interest, penalties, unexpected charges, hard-to-cancel paid features
2. **Rights** — arbitration, class-action waivers, unilateral change, dispute limits
3. **Data** — sharing, sale, broad licenses, retention, secondary use of financial data
4. **Future problems** — lock-in, auto-renewal, account freeze/closure, surprising default outcomes

### Startup-facing
5. **Enforceability** — clauses likely unenforceable or overbroad in WA / OR / CA
6. **Regulatory friction** — language that conflicts with or invites scrutiny under state rules
7. **Conversion / trust** — terms that may reduce sign-up trust or create reputational risk without proportional legal benefit

**Must-flag themes:** Any theme that creates material risk to the **startup and/or consumer** (including but not limited to arbitration, class-action waiver, data sharing, auto-renewal, fee changes, account freeze/closure, liability limits — when risk-relevant).

---

## 7. Core workflows

### 7.1 Intake
User provides:
- Vertical (neobank | payments | lending | investing)
- Target states: WA, OR, CA (multi-select; default all three)
- Document type (ToS | Privacy Policy | both / other agreement)
- Mode: **Draft** | **Review** | **Rewrite-focused**
- Content: **paste text** and/or **upload** (PDF or plain text / markdown / doc text extract)

Run **scope gate** first (§5.1). If out of scope → polite redirect; stop analysis.

### 7.2 Clarifying questions
Agent asks short, founder-friendly questions until enough context exists, e.g.:
- Product one-liner and who the consumer is
- Money movement (hold funds? lend? invest?)
- Fee model
- Data sharing / third parties
- Account closure / freeze policies
- Dispute / arbitration preferences
- Whether expanding into WA / OR / CA or already live there

Questions should be minimal; prefer 3–7 high-signal questions, not a long questionnaire. If answers reveal out-of-scope state/domain → §5.1 redirect.

### 7.3 First-pass analysis (primary path)

**Design target:** Surface **all or ~99% of material errors/concerns in the first revision.** Minimize back-and-forth.

The first analysis pass must be comprehensive:
1. Scan the full draft against all risk lenses in §6 (**Analyze**).
2. Run **Cite/Rank** over the allowlisted citation pack (§9.1): retrieve candidates, score by similarity + trust + freshness, attach best sources (or mark uncertain).
3. Produce a complete findings set (report + inline annotations + checklist as needed).
4. Include suggested rewrites for each actionable finding up front.
5. User **approves / accepts suggestion / ignores** (bulk actions encouraged).
6. Agent applies accepted rewrites **once** into a revised draft.

Optional second pass is only for:
- User-changed product facts after the first pass
- User explicitly asks to re-check after major manual edits
- Gaps the user calls out that were not in the original draft

Do **not** rely on a multi-round discovery loop to find issues that should have been caught initially.

### 7.4 Version history (brief)
- Store **current revision + immediately prior revision only**.
- User can view prior revision (diff or side-by-side lite).
- No deep history in v1 (storage/scope constraint).

---

## 8. Outputs

Deliver a **mix**, depending on user need and mode:

| Output | When |
|--------|------|
| **Inline annotations** | Review / rewrite on an existing draft |
| **Findings report** | Summary of risks, severities, citations |
| **Checklist** | WA / OR / CA readiness and coverage gaps (esp. Draft mode) |
| **Suggested rewrite** | Per finding and as a full revised draft |

### Finding schema (required fields)
- `id`
- `risk_types[]` — from §6
- `severity` — `critical` | `high` | `medium` | `low` | `info`
- `title` — short founder-friendly label
- `plain_language_explanation` — why it matters to consumers and/or the startup
- `clause_excerpt` — quoted span from draft (if applicable)
- `suggested_rewrite` — concrete replacement language
- `state_relevance[]` — `WA` | `OR` | `CA`
- `citations[]` — `{ label, url, trust_tier?, score? }` — **every factual claim must be traceable to a source URL** selected by **Cite/Rank** from the allowlisted citation pack
- `citation_status` — `cited` | `uncertain` (no pack match above threshold)
- `user_action` — `pending` | `approved` | `accepted` | `ignored`

### Example cited output (for submission / demo)

> **Finding:** Unilateral fee-change without clear notice may conflict with California consumer expectations for unfair practices.  
> **Severity:** High  
> **Risk types:** Money, Regulatory friction, Conversion/trust  
> **Why it matters:** Consumers can be surprised by new fees; CA scrutiny of unfair or deceptive practices raises startup dispute risk.  
> **Suggested rewrite:** Require advance notice and an opt-out path before new fees apply to existing accounts.  
> **Citation:** [California Civil Code §1750 et seq. (Consumers Legal Remedies Act) — URL from allowlisted citation pack]

*(Replace with a real allowlisted URL used in the live demo.)*

### Severity guidance
- **Critical:** Likely unlawful / clear state-law conflict / severe consumer harm
- **High:** Strong risk; rewrite recommended before publish
- **Medium:** Material but context-dependent
- **Low:** Improve clarity / fairness / trust
- **Info:** Context or checklist gap, not yet a clause defect

---

## 9. WA / OR / CA requirements

### Product bar
- Analysis is scoped to **Washington, Oregon, and California** laws and regulations relevant to consumer fintech terms.
- The app must **not** present violating language as “safe” or “approved.”
- When a clause conflicts with state law/regulation, FinTerms must:
  1. Flag it with severity appropriate to the conflict
  2. Explain in plain language
  3. Cite source URL(s) attached by the **Cite/Rank** step from the allowlisted citation pack
  4. Offer a safer rewrite direction

### Traceability (judging requirement)
- Any factual claim surfaced by the agent (legal/regulatory assertion, “this violates X”, “state requires Y”) **must include a source URL**.
- Prefer primary sources (statutes, regs, AG guidance, official state pages) over blogs.
- If a claim cannot be sourced from the citation pack above the score threshold, do **not** assert it as fact — mark as `uncertain` or omit.
- **Never invent or hallucinate URLs.**
- Prefer **one high-trust** cite over many weak ones; if top sources conflict, mark `uncertain`.

### 9.1 Cite/Rank (RAG over citation pack)

Rocket Ride pipeline step after **Analyze**:

1. **Retrieve** — For each factual claim, pull candidate entries from the citation pack (filter by `states[]` / `topics[]`, then similarity to claim text / snippet).
2. **Score** —  
   `score = w1·similarity + w2·trust + w3·freshness − w4·conflict`  
   - **similarity:** overlap between claim and source `snippet` (embedding or keyword; hackathon-simple is fine)  
   - **trust:** tier from pack metadata (`official_statute` > `official_guidance` > `gov_explainer` ≫ exclude blogs)  
   - **freshness:** prefer higher `last_reviewed` / non-`superseded` entries  
   - **conflict:** penalize when two high-trust candidates disagree
3. **Attach or reject** — If best `score` ≥ threshold → attach top 1–2 URLs; else set `citation_status: uncertain` and do not assert the legal fact.
4. **Post-check** — Drop any citation whose `url` is not in the allowlist.

### Citation pack entry shape
```json
{
  "id": "ca-clra",
  "label": "California Civil Code §1750 et seq. (CLRA)",
  "url": "https://...",
  "states": ["CA"],
  "topics": ["unfair_practices", "fees"],
  "trust_tier": "official_statute",
  "last_reviewed": "2026-01-15",
  "superseded": false,
  "snippet": "Short verbatim or summary text used for similarity matching."
}
```

### OpenAI + Cite/Rank
- **OpenAI** runs analysis, Q&A, rewrites, and may help phrase claims for retrieval.
- **Cite/Rank** (Rocket Ride node) grounds factual claims against the pack using similarity + validity signals above.
- Cited output in the UI must show a URL the judge can open.
- Submission materials must describe Cite/Rank and include an example of cited output (see §8 and §17).

**Secrets:** Store the OpenAI API key in Rocket Ride / env config (e.g. `OPENAI_API_KEY`). Do not commit keys or paste them into chat, docs, or the repo.

---

## 10. UX (web app)

### Principles
- Founder-friendly copy
- One primary job per screen/step
- Disclaimer always visible on analysis views
- Live-demo resilient: clear loading, errors, and “try sample draft” path
- Prefer **one strong first pass** over many revision rounds

### Happy path (~2 minutes for judges)
1. Open FinTerms → choose vertical + states (or hit scope redirect if out of scope)
2. Paste or upload terms (or load sample)
3. Answer a few clarifying questions
4. See a **comprehensive** first-pass findings set (annotations + report + checklist)
5. Accept one or more rewrites (ideally bulk-friendly)
6. View updated draft + prior revision — without needing a long rediscovery loop

### Actions on findings
- **Approve** — acknowledge finding without applying rewrite
- **Accept suggestion** — apply suggested rewrite into working draft
- **Ignore** — dismiss for this revision

### Explicitly out of UX scope (v1)
- Google Docs sync
- Deep version trees
- Multi-user org permissions
- PDF export polish (optional nice-to-have: Markdown download)
- Advising on out-of-scope states or non-finance domains

---

## 11. System architecture (hackathon)

### Rocket Ride Cloud
- Rocket Ride Cloud is the **pipeline builder and agent host**.
- The analysis/draft/rewrite **pipeline must be deployed to Rocket Ride Cloud**.
- Local-only or docker-only pipelines **do not** satisfy the pipeline deployment requirement.

### Orchestration (Rocket Ride)
Rocket Ride Cloud **is the orchestrator**: it owns step order, branching, deployment, and agent hosting. The UI only invokes the deployed pipeline. OpenAI is a **worker inside nodes**, not the orchestrator.

### OpenAI
Used for:
- Structured review (findings JSON matching §8) — **exhaustive first pass**
- Chat / clarifying Q&A on the draft and product context
- Rewrite generation
- Scope-gate replies (§5.1)
- Optional help forming claim text for Cite/Rank retrieval

### Logical components
1. **Web UI** — intake, scope gate, Q&A, findings, actions, draft + prior revision
2. **Rocket Ride pipeline / agents (orchestration graph)**
   - ScopeGate (state + domain)
   - Clarify (questions)
   - Analyze (OpenAI first-pass findings)
   - **Cite/Rank** (RAG over citation pack: similarity + trust + freshness)
   - Rewrite (apply accepted suggestions)
3. **Citation pack** — curated allowlisted sources with snippets + validity metadata
4. **Session state** — working draft, findings, actions, current + prior revision

### Data retention (v1)
- Persist only what is needed for the session demo: current draft, prior draft, findings, user actions.
- No long-term document vault requirement for hackathon.

---

## 12. Functional requirements

### Must-have (demo day)
- [ ] Paste **and** upload intake
- [ ] Scope gate with polite redirect for out-of-scope state/domain (§5.1)
- [ ] Clarifying-question loop (short)
- [ ] **Comprehensive first-pass** findings aiming to catch all / ~99% of material issues
- [ ] Structured findings with all required fields in §8
- [ ] Approve / accept suggestion / ignore (bulk-friendly where possible)
- [ ] Apply accepted rewrites to produce a new draft without long rediscovery cycles
- [ ] Show current + prior revision only
- [ ] WA/OR/CA-scoped analysis with **Cite/Rank** source URLs (from citation pack) on factual claims
- [ ] Uncertain findings when no source clears the score threshold
- [ ] Visible legal disclaimer
- [ ] Pipeline deployed on **Rocket Ride Cloud**
- [ ] Live or local working prototype ready for judges
- [ ] Submission artifacts: repo link + project description covering pipeline + Cite/Rank cited example

### Nice-to-have
- [ ] Full multi-vertical depth beyond the primary demo vertical
- [ ] Side-by-side visual diff
- [ ] Markdown / share-link export
- [ ] Checklist-first Draft mode wizard
- [ ] Richer citation pack coverage beyond the demo themes

---

## 13. Success criteria

| Criterion | Measure |
|-----------|---------|
| Useful | Judge sees material risks flagged, explained, rewritten, and cited in the **first** pass |
| Thorough first pass | Few or no “missed obvious issues” requiring another discovery round |
| Traceable | Spot-check: factual claims have working allowlisted source URLs from Cite/Rank |
| Ranked | Higher similarity + trust sources preferred; weak/outdated/conflict → uncertain |
| Scoped | Out-of-scope state/domain gets the polite redirect, not a fake analysis |
| Deployed | Rocket Ride Cloud pipeline is live and used by the demo |
| Integrated | Clear Rocket Ride orchestration + OpenAI workers + Cite/Rank story |
| Submittable | Prototype + repo link + project description with pipeline + cited example |

---

## 14. Sample demo script

1. “We’re a payments startup entering WA, OR, and CA.”
2. (Optional) Show scope gate: ask about healthcare or Texas → polite redirect.
3. Paste a sample ToS with multiple problematic clauses (fees, arbitration, data sharing).
4. Answer 3–4 clarifying questions.
5. Show a **full first-pass** findings set with plain-language explanations + Cite/Rank citation URLs (mention similarity + trust ranking briefly).
6. **Accept suggestion(s)** → revised draft; prior revision still viewable.
7. Point to disclaimer: decision-support, not legal advice.

---

## 15. Open questions (defer if needed)

1. Exact Rocket Ride pipeline node graph — document in the project description once built.
2. Upload parsing limits (PDF size/pages) — set pragmatic caps for demo.
3. Whether Privacy Policy and ToS are analyzed in one pass or separately — default: one document per run for reliability; still aim for exhaustive coverage of that document.
4. Final disclaimer legal wording — keep short and prominent for hackathon.
5. Final citation-pack entries + Cite/Rank weights/threshold for the demo — finalize during implementation.

---

## 16. Summary for builders

Build a **founder-facing WA/OR/CA terms assistant** for neobank / payments / lending / investing startups. Gate out-of-scope states/domains with a polite expand-soon redirect. Prefer a **comprehensive first-pass** analysis so nearly all material issues appear before the user starts accepting rewrites. Support paste/upload → short clarifying questions → OpenAI **Analyze** → **Cite/Rank** (RAG over allowlisted pack) → accept/ignore → current + one prior revision. **Rocket Ride orchestrates** the pipeline; **OpenAI** powers node reasoning; never assert unsourced legal facts or invent URLs.

---

## 17. Hackathon submission requirements

Prepare and submit:

### 1. Working prototype
- A **live or local** demonstration of the application.
- Must exercise the Rocket Ride–deployed pipeline for analysis (not a pipeline that exists only locally/docker-only).

### 2. Source code
- A link to the project’s **repository**.

### 3. Project description
Include:
- **Problem solved** — fintech startups need faster, citation-backed drafting/review of consumer terms for WA / OR / CA without treating FinTerms as counsel.
- **Rocket Ride Cloud pipeline structure** — describe the deployed orchestration graph (ScopeGate → Clarify → Analyze → **Cite/Rank** → Rewrite). Update with the actual node/tool graph after implementation.
- **OpenAI + Cite/Rank integration** — how OpenAI is used inside nodes; how Cite/Rank scores similarity + trust + freshness; how URLs appear on findings.
- **Example of cited output** — include at least one real example from the app (see §8 template), with a working source URL.
