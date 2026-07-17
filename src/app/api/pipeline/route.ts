import { NextResponse } from "next/server";
import { runAnalyzeAndCite, runClarify, runRewrite, runScopeGate } from "@/lib/pipeline";
import type { Finding, StateCode, Vertical } from "@/lib/types";
import { readFileSync } from "fs";
import { join } from "path";

export const runtime = "nodejs";

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

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    if (body.step === "sample") {
      const sample = readFileSync(
        join(process.cwd(), "data", "sample-tos.txt"),
        "utf8",
      );
      return NextResponse.json({ draft: sample });
    }

    if (body.step === "scope") {
      const scope = await runScopeGate(body.text || "");
      return NextResponse.json({ scope });
    }

    if (body.step === "clarify") {
      const result = await runClarify({
        vertical: body.vertical || "payments",
        states: body.states || ["WA", "OR", "CA"],
        draft: body.draft || "",
        productContext: body.productContext,
        freeText: body.freeText,
      });
      return NextResponse.json(result);
    }

    if (body.step === "analyze") {
      const result = await runAnalyzeAndCite({
        vertical: body.vertical || "payments",
        states: body.states || ["WA", "OR", "CA"],
        draft: body.draft || "",
        productContext: body.productContext || "",
      });
      return NextResponse.json(result);
    }

    if (body.step === "rewrite") {
      const result = await runRewrite({
        draft: body.draft || "",
        findings: body.findings || [],
      });
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Unknown step" }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Pipeline error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
