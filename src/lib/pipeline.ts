/**
 * Local orchestration mirror of the Rocket Ride Cloud pipeline:
 * ScopeGate → Clarify → Analyze → Cite/Rank → Rewrite
 *
 * Rocket Ride Cloud should host the same graph for judging.
 * This module runs the equivalent steps inside the Next.js app so the
 * prototype works before/while Cloud deploy is configured.
 */

import { analyzeDraft, applyRewrites, generateClarifyingQuestions } from "./analyze";
import { citeAndRankFindings } from "./cite-rank";
import { checkScope } from "./scope";
import type { Finding, ScopeResult, StateCode, Vertical } from "./types";

export type PipelineStep =
  | "scope"
  | "clarify"
  | "analyze"
  | "cite_rank"
  | "rewrite";

export interface RunClarifyInput {
  vertical: Vertical;
  states: StateCode[];
  draft: string;
  productContext?: string;
  freeText?: string;
}

export interface RunAnalyzeInput {
  vertical: Vertical;
  states: StateCode[];
  draft: string;
  productContext: string;
}

export async function runScopeGate(text: string): Promise<ScopeResult> {
  return checkScope(text);
}

export async function runClarify(input: RunClarifyInput) {
  const scopeText = [input.productContext, input.freeText, input.draft.slice(0, 500)]
    .filter(Boolean)
    .join("\n");
  const scope = checkScope(scopeText);
  if (!scope.inScope) {
    return { scope, questions: [] as string[] };
  }
  const questions = await generateClarifyingQuestions(input);
  return { scope, questions };
}

export async function runAnalyzeAndCite(input: RunAnalyzeInput) {
  const scope = checkScope(input.productContext);
  if (!scope.inScope) {
    return { scope, findings: [] as Finding[] };
  }
  const findings = await analyzeDraft(input);
  const ranked = citeAndRankFindings(findings, input.states);
  return { scope: { inScope: true } as ScopeResult, findings: ranked };
}

export async function runRewrite(input: {
  draft: string;
  findings: Finding[];
}) {
  const priorDraft = input.draft;
  const currentDraft = await applyRewrites(input);
  return { priorDraft, currentDraft };
}

export const PIPELINE_DESCRIPTION = [
  "1. ScopeGate — reject out-of-state / non-finance with polite redirect",
  "2. Clarify — short founder Q&A",
  "3. Analyze — OpenAI exhaustive first-pass findings",
  "4. Cite/Rank — RAG over allowlisted citation pack (similarity + trust + freshness)",
  "5. Rewrite — apply accepted suggestions; keep current + prior draft only",
] as const;
