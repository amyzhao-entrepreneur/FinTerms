import { NextResponse } from "next/server";
import { runOnRocketRide } from "@/lib/rocketride-client";
import { checkScope } from "@/lib/scope";
import type { Finding, StateCode, Vertical } from "@/lib/types";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { pathToFileURL } from "url";

export const runtime = "nodejs";
export const maxDuration = 120;

type Body = {
  step: "scope" | "clarify" | "analyze" | "rewrite" | "sample";
  text?: string;
  vertical?: Vertical;
  states?: StateCode[];
  draft?: string;
  productContext?: string;
  freeText?: string;
  findings?: Finding[];
};

type OptionalLocalModule = {
  clarify: (body: Body) => Promise<unknown>;
  analyze: (body: Body) => Promise<unknown>;
  rewrite: (body: Body) => Promise<unknown>;
};

async function loadOptionalLocal(): Promise<OptionalLocalModule | null> {
  const file = join(process.cwd(), "src", "lib", "_local.mjs");
  if (!existsSync(file)) return null;
  try {
    return (await import(
      /* webpackIgnore: true */ pathToFileURL(file).href
    )) as OptionalLocalModule;
  } catch {
    return null;
  }
}

function normalizeFindings(raw: unknown): Finding[] {
  const obj = raw as { findings?: Finding[] };
  const list = Array.isArray(obj?.findings) ? obj.findings : [];
  return list.map((f, i) => ({
    id: f.id || `f${i + 1}`,
    risk_types: f.risk_types || ["regulatory_friction"],
    severity: f.severity || "medium",
    title: f.title || "Finding",
    plain_language_explanation: f.plain_language_explanation || "",
    clause_excerpt: f.clause_excerpt || "",
    suggested_rewrite: f.suggested_rewrite || "",
    state_relevance: f.state_relevance || ["WA", "OR", "CA"],
    citations: f.citations || [],
    citation_status:
      f.citation_status || (f.citations?.length ? "cited" : "uncertain"),
    user_action: "pending" as const,
    topics: f.topics,
  }));
}

async function runPipelineStep(
  message: string,
  local: (() => Promise<unknown>) | null,
): Promise<unknown> {
  try {
    return await runOnRocketRide(message);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const useLocal =
      !!local &&
      (msg.startsWith("TIMEOUT:") ||
        msg.includes("already running") ||
        msg.includes("bufferUtil") ||
        msg.includes("Rocket Ride") ||
        msg.includes("WebSocket") ||
        msg.includes("ECONN"));
    if (useLocal) return local();
    throw err;
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const local = await loadOptionalLocal();

    if (body.step === "sample") {
      const sample = readFileSync(
        join(process.cwd(), "data", "sample-tos.txt"),
        "utf8",
      );
      return NextResponse.json({ draft: sample });
    }

    if (body.step === "scope") {
      return NextResponse.json({ scope: checkScope(body.text || "") });
    }

    if (body.step === "clarify") {
      const scopeText = [
        body.productContext,
        body.freeText,
        body.draft?.slice(0, 800),
      ]
        .filter(Boolean)
        .join("\n");
      const scope = checkScope(scopeText);
      if (!scope.inScope) {
        return NextResponse.json({ scope, questions: [] });
      }

      const message = [
        "MODE clarify",
        `Vertical: ${body.vertical || "payments"}`,
        `States: ${(body.states || ["WA", "OR", "CA"]).join(", ")}`,
        `Product context: ${body.productContext || body.freeText || ""}`,
        "Draft excerpt:",
        (body.draft || "").slice(0, 6000),
      ].join("\n\n");

      const data = await runPipelineStep(
        message,
        local ? () => local.clarify(body) : null,
      );
      const parsed = data as { redirect?: string; questions?: string[] };
      if (parsed.redirect) {
        return NextResponse.json({
          scope: { inScope: false, message: parsed.redirect },
          questions: [],
        });
      }
      return NextResponse.json({
        scope: { inScope: true },
        questions: parsed.questions || [],
        orchestrator: "rocketride",
      });
    }

    if (body.step === "analyze") {
      const scope = checkScope(body.productContext || "");
      if (!scope.inScope) {
        return NextResponse.json({ scope, findings: [] });
      }

      const message = [
        "MODE analyze",
        `Vertical: ${body.vertical || "payments"}`,
        `States: ${(body.states || ["WA", "OR", "CA"]).join(", ")}`,
        `Product / Q&A context:\n${body.productContext || ""}`,
        "FULL DRAFT TO REVIEW:",
        body.draft || "",
      ].join("\n\n");

      const data = await runPipelineStep(
        message,
        local ? () => local.analyze(body) : null,
      );
      const asObj = data as { redirect?: string };
      if (asObj.redirect) {
        return NextResponse.json({
          scope: { inScope: false, message: asObj.redirect },
          findings: [],
        });
      }
      return NextResponse.json({
        scope: { inScope: true },
        findings: normalizeFindings(data),
        orchestrator: "rocketride",
      });
    }

    if (body.step === "rewrite") {
      const accepted = (body.findings || []).filter(
        (f) => f.user_action === "accepted",
      );
      const message = [
        "MODE rewrite",
        "Apply only accepted findings' suggested_rewrite into the draft.",
        "ORIGINAL DRAFT:",
        body.draft || "",
        "ACCEPTED FINDINGS JSON:",
        JSON.stringify(accepted),
      ].join("\n\n");

      const data = await runPipelineStep(
        message,
        local ? () => local.rewrite(body) : null,
      );
      const parsed = data as {
        prior_draft?: string;
        current_draft?: string;
      };
      return NextResponse.json({
        priorDraft: parsed.prior_draft || body.draft || "",
        currentDraft: parsed.current_draft || body.draft || "",
        orchestrator: "rocketride",
      });
    }

    return NextResponse.json({ error: "Unknown step" }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Pipeline error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
