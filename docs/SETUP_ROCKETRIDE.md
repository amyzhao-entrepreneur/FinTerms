# Rocket Ride Cloud setup (beginner)

## What you need to do (plain English)

Rocket Ride is where the **pipeline** (the step-by-step AI workflow) must be **hosted for judging**.

Think of it like this:

| Piece | Who builds it | Where it lives |
|-------|---------------|----------------|
| Website (FinTerms UI) | Me (coding in this repo) | Your laptop / later a host |
| Pipeline steps | Defined here; you deploy in Rocket Ride | **Rocket Ride Cloud** |
| OpenAI key | You created it | `.env` **and** Rocket Ride Variables |

You are **not** expected to invent the pipeline logic yourself.  
Your job is mostly: **install → open project → set the OpenAI variable → deploy → send me the link**.

---

## Step-by-step

### 1. Create / log into Rocket Ride
1. Go to [https://rocketride.ai](https://rocketride.ai) (or the URL your hackathon gave you)
2. Sign up / log in with the account your team is using
3. Confirm you can open **Rocket Ride Cloud** (managed hosting)

### 2. Install the Rocket Ride VS Code / Cursor extension
1. Open Cursor (or VS Code)
2. Open Extensions
3. Search for **RocketRide** / **Rocket Ride**
4. Install the official extension
5. Follow the extension’s “connect / sign in” prompt

Official docs start here: [https://docs.rocketride.org/quickstart](https://docs.rocketride.org/quickstart)

### 3. Put your OpenAI key into Rocket Ride Variables
This is the **same** OpenAI key you already put in `.env`.

1. In the Rocket Ride sidebar, open **Variables**
2. Choose **Deployment** (or Development while testing)
3. Add:

| Name | Value |
|------|--------|
| `ROCKETRIDE_OPENAI_KEY` | your `sk-...` OpenAI key |

4. In any OpenAI/LLM node, set the API key field to: `${ROCKETRIDE_OPENAI_KEY}`

### 4. Build the pipeline on the canvas (mirror our app)
Create a pipeline with these nodes (names can vary; order matters):

1. **ScopeGate** — if out-of-state or non-finance → return the polite redirect from `spec.md`
2. **Clarify** — ask 3–5 clarifying questions
3. **Analyze** — OpenAI exhaustive findings JSON
4. **Cite/Rank** — attach allowlisted citations (use `data/citation-pack.json`)
5. **Rewrite** — apply accepted suggestions; output current + prior draft

See `rocketride/PIPELINE.md` in this repo for the exact contract.

If the hackathon mentors have a “deploy sample pipeline” button, use that and then edit nodes to match FinTerms.

### 5. Deploy to Rocket Ride Cloud
1. Use the extension / dashboard **Deploy to Cloud** (wording may be “Deploy”, “Cloud”, “Publish”)
2. Wait until status is live
3. Copy the **pipeline URL / invoke URL / webhook URL**

### 6. Send me that URL
Paste the deployed pipeline URL in chat. I will wire the website to call it.

Until then, the website already runs the **same step order locally** via `/api/pipeline` so you can demo the product.

---

## What “done” looks like for Rocket Ride
- [ ] Extension installed and signed in
- [ ] `ROCKETRIDE_OPENAI_KEY` set in Variables
- [ ] Pipeline deployed on **Cloud** (not only local Docker)
- [ ] You can run ScopeGate → … → Rewrite once
- [ ] You pasted the Cloud URL into chat

---

## If you get stuck
Tell me which step number failed and paste a **screenshot description** (no secrets). Common issues:
- Forgot Variables → OpenAI calls fail
- Deployed local-only → judges may reject
- Wrong variable name (must be `ROCKETRIDE_OPENAI_KEY`)
