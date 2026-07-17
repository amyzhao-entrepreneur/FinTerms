import { z } from "zod";
import { getOpenAIClient } from "./openai";
import type { Finding, StateCode, Vertical } from "./types";

const findingSchema = z.object({
  id: z.string(),
  risk_types: z.array(
    z.enum([
      "money",
      "rights",
      "data",
      "future_problems",
      "enforceability",
      "regulatory_friction",
      "conversion_trust",
    ]),
  ),
  severity: z.enum(["critical", "high", "medium", "low", "info"]),
  title: z.string(),
  plain_language_explanation: z.string(),
  clause_excerpt: z.string(),
  suggested_rewrite: z.string(),
  state_relevance: z.array(z.enum(["WA", "OR", "CA"])),
  topics: z.array(z.string()).optional(),
});

const analyzeSchema = z.object({
  findings: z.array(findingSchema),
});

export async function generateClarifyingQuestions(input: {
  vertical: Vertical;
  states: StateCode[];
  draft: string;
  productContext?: string;
}): Promise<string[]> {
  const client = getOpenAIClient();
  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.3,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You help fintech startups clarify product facts before reviewing consumer terms for WA/OR/CA. Return JSON {\"questions\": string[]} with 3-5 short founder-friendly questions. Do not ask legal advice questions.",
      },
      {
        role: "user",
        content: JSON.stringify({
          vertical: input.vertical,
          states: input.states,
          productContext: input.productContext || "",
          draftExcerpt: input.draft.slice(0, 4000),
        }),
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content || "{}";
  const parsed = JSON.parse(raw) as { questions?: string[] };
  return (parsed.questions || []).slice(0, 5);
}

export async function analyzeDraft(input: {
  vertical: Vertical;
  states: StateCode[];
  draft: string;
  productContext: string;
}): Promise<Finding[]> {
  const client = getOpenAIClient();
  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are FinTerms Analyze node for fintech consumer terms (WA, OR, CA).
Return JSON: {"findings":[...]} with an EXHAUSTIVE first pass.
Each finding needs: id, risk_types[], severity, title, plain_language_explanation, clause_excerpt, suggested_rewrite, state_relevance[], topics[].
Risk lenses: money, rights, data, future_problems, enforceability, regulatory_friction, conversion_trust.
Be thorough — catch essentially all material issues in one pass.
Do NOT invent source URLs. Do NOT say language is "approved" or "compliant".
Founder-friendly tone. Prefer concrete rewrites.
If a clause likely conflicts with WA/OR/CA consumer protections, severity should be high/critical.`,
      },
      {
        role: "user",
        content: JSON.stringify({
          vertical: input.vertical,
          states: input.states,
          productContext: input.productContext,
          draft: input.draft,
        }),
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content || '{"findings":[]}';
  const parsed = analyzeSchema.parse(JSON.parse(raw));
  return parsed.findings.map((f) => ({
    ...f,
    citations: [],
    citation_status: "uncertain" as const,
    user_action: "pending" as const,
  }));
}

export async function applyRewrites(input: {
  draft: string;
  findings: Finding[];
}): Promise<string> {
  const accepted = input.findings.filter((f) => f.user_action === "accepted");
  if (accepted.length === 0) return input.draft;

  const client = getOpenAIClient();
  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          'Apply the accepted suggested rewrites into the draft. Return JSON {"draft": string} with the full revised terms. Keep unrelated sections intact. Founder-friendly clarity.',
      },
      {
        role: "user",
        content: JSON.stringify({
          draft: input.draft,
          accepted: accepted.map((f) => ({
            id: f.id,
            clause_excerpt: f.clause_excerpt,
            suggested_rewrite: f.suggested_rewrite,
            title: f.title,
          })),
        }),
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content || "{}";
  const parsed = JSON.parse(raw) as { draft?: string };
  return parsed.draft || input.draft;
}
