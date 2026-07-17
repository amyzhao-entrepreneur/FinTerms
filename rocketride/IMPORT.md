# How to import FinTerms into Rocket Ride

## I can’t create it inside your Cloud account
Rocket Ride runs under **your** login. What I *can* do is give you a `.pipe` file to import.

## Steps
1. Open Finder → go to:
   `/Users/amyzhao/Projects/FinTerms/rocketride/`
2. You’ll see `finterms-simple.pipe`
3. In Rocket Ride builder → left **PIPELINES** area → **Import** / upload / open file  
   (exact control may be an upload icon or “Open”)
4. If import isn’t available: open `FLOW.md` and rebuild with Option B (manual)
5. Open the OpenAI node → set API key to your `sk-...` key
6. Play **Chat** → paste a test terms message from `FLOW.md`

## After it works
Reply with: “simple pipe works” or a screenshot of **Trace/Answers**.  
Then we’ll either keep this all-in-one Cloud pipeline for judging, or extend to the multi-step graph.
