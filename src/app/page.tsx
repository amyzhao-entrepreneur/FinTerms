"use client";

import { useState, useTransition } from "react";
import type { Finding, StateCode, Vertical } from "@/lib/types";

type Step = "intake" | "questions" | "findings" | "done";

const VERTICALS: Vertical[] = ["payments", "neobank", "lending", "investing"];
const ALL_STATES: StateCode[] = ["WA", "OR", "CA"];

export default function Home() {
  const [step, setStep] = useState<Step>("intake");
  const [vertical, setVertical] = useState<Vertical>("payments");
  const [states, setStates] = useState<StateCode[]>(["WA", "OR", "CA"]);
  const [draft, setDraft] = useState("");
  const [priorDraft, setPriorDraft] = useState<string | null>(null);
  const [productContext, setProductContext] = useState("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [scopeMessage, setScopeMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggleState(s: StateCode) {
    setStates((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  }

  async function api(body: Record<string, unknown>) {
    const res = await fetch("/api/pipeline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Request failed");
    return data;
  }

  function loadSample() {
    startTransition(async () => {
      setError(null);
      try {
        const data = await api({ step: "sample" });
        setDraft(data.draft);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load sample");
      }
    });
  }

  function startClarify() {
    startTransition(async () => {
      setError(null);
      setScopeMessage(null);
      try {
        const data = await api({
          step: "clarify",
          vertical,
          states,
          draft,
          productContext,
          freeText: productContext,
        });
        if (data.scope && !data.scope.inScope) {
          setScopeMessage(data.scope.message);
          return;
        }
        setQuestions(data.questions || []);
        setAnswers((data.questions || []).map(() => ""));
        setStep("questions");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Clarify failed");
      }
    });
  }

  function runAnalysis() {
    startTransition(async () => {
      setError(null);
      setScopeMessage(null);
      try {
        const context = [
          productContext,
          ...questions.map((q, i) => `Q: ${q}\nA: ${answers[i] || ""}`),
        ].join("\n\n");
        const data = await api({
          step: "analyze",
          vertical,
          states,
          draft,
          productContext: context,
        });
        if (data.scope && !data.scope.inScope) {
          setScopeMessage(data.scope.message);
          return;
        }
        setFindings(data.findings || []);
        setStep("findings");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Analyze failed");
      }
    });
  }

  function setAction(id: string, user_action: Finding["user_action"]) {
    setFindings((prev) =>
      prev.map((f) => (f.id === id ? { ...f, user_action } : f)),
    );
  }

  function applyAccepted() {
    startTransition(async () => {
      setError(null);
      try {
        const data = await api({
          step: "rewrite",
          draft,
          findings,
        });
        setPriorDraft(data.priorDraft);
        setDraft(data.currentDraft);
        setStep("done");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Rewrite failed");
      }
    });
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <header className="mb-10">
        <p className="text-sm font-semibold tracking-[0.14em] uppercase text-teal-800/80">
          FinTerms
        </p>
        <h1 className="font-display mt-2 text-4xl sm:text-5xl font-semibold text-[#0c1f2e] leading-tight">
          West Coast terms for fintech startups
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-[#0c1f2e]/90">
          Draft, review, and rewrite consumer agreements for Washington, Oregon,
          and California — with citation-backed findings.
        </p>
        <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          Not legal advice, not a compliance certificate, and not a substitute
          for counsel. Decision-support only — you own the final terms.
        </p>
      </header>

      {scopeMessage && (
        <div className="mb-6 rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-teal-950">
          {scopeMessage}
        </div>
      )}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-900">
          {error}
        </div>
      )}

      {step === "intake" && (
        <section className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Vertical</label>
            <div className="flex flex-wrap gap-2">
              {VERTICALS.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVertical(v)}
                  className={`px-3 py-1.5 text-sm border ${
                    vertical === v
                      ? "bg-teal-800 text-white border-teal-800"
                      : "bg-white/70 border-teal-200"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">States</label>
            <div className="flex flex-wrap gap-2">
              {ALL_STATES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleState(s)}
                  className={`px-3 py-1.5 text-sm border ${
                    states.includes(s)
                      ? "bg-teal-800 text-white border-teal-800"
                      : "bg-white/70 border-teal-200"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Product context (mention state/field here to test scope gate)
            </label>
            <textarea
              className="w-full min-h-24 border border-teal-200 bg-white/80 p-3 text-sm"
              placeholder="e.g. Payments startup expanding into WA, OR, and CA."
              value={productContext}
              onChange={(e) => setProductContext(e.target.value)}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold">
                Terms draft (paste)
              </label>
              <button
                type="button"
                onClick={loadSample}
                className="text-sm text-teal-800 underline"
              >
                Load sample payments ToS
              </button>
            </div>
            <textarea
              className="w-full min-h-64 border border-teal-200 bg-white/80 p-3 text-sm font-mono"
              placeholder="Paste your Terms of Service or Privacy Policy…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
          </div>

          <button
            type="button"
            disabled={pending || !draft.trim() || states.length === 0}
            onClick={startClarify}
            className="bg-teal-800 text-white px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
          >
            {pending ? "Working…" : "Continue — clarifying questions"}
          </button>
        </section>
      )}

      {step === "questions" && (
        <section className="space-y-5">
          <h2 className="font-display text-2xl font-semibold">
            A few quick questions
          </h2>
          {questions.map((q, i) => (
            <div key={q}>
              <label className="block text-sm font-semibold mb-1">{q}</label>
              <input
                className="w-full border border-teal-200 bg-white/80 p-2.5 text-sm"
                value={answers[i] || ""}
                onChange={(e) => {
                  const next = [...answers];
                  next[i] = e.target.value;
                  setAnswers(next);
                }}
              />
            </div>
          ))}
          <button
            type="button"
            disabled={pending}
            onClick={runAnalysis}
            className="bg-teal-800 text-white px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
          >
            {pending ? "Analyzing first pass…" : "Run full first-pass review"}
          </button>
        </section>
      )}

      {step === "findings" && (
        <section className="space-y-5">
          <h2 className="font-display text-2xl font-semibold">
            First-pass findings ({findings.length})
          </h2>
          <p className="text-sm text-[#0c1f2e]/80">
            Citations are attached by Cite/Rank over an allowlisted WA/OR/CA
            source pack (similarity + trust + freshness).
          </p>
          <div className="space-y-4">
            {findings.map((f) => (
              <article
                key={f.id}
                className="border border-teal-200 bg-white/75 p-4"
              >
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wide text-teal-900">
                    {f.severity}
                  </span>
                  <span className="text-xs text-[#0c1f2e]/70">
                    {f.risk_types.join(" · ")}
                  </span>
                  <span className="text-xs">
                    {f.citation_status === "cited" ? "cited" : "uncertain"}
                  </span>
                </div>
                <h3 className="font-semibold text-lg">{f.title}</h3>
                <p className="mt-1 text-sm">{f.plain_language_explanation}</p>
                {f.clause_excerpt && (
                  <blockquote className="mt-2 border-l-2 border-teal-600 pl-3 text-sm italic text-[#0c1f2e]/85">
                    {f.clause_excerpt}
                  </blockquote>
                )}
                <p className="mt-2 text-sm">
                  <span className="font-semibold">Suggested rewrite: </span>
                  {f.suggested_rewrite}
                </p>
                {f.citations?.length > 0 && (
                  <ul className="mt-2 text-sm space-y-1">
                    {f.citations.map((c) => (
                      <li key={c.url}>
                        <a
                          className="text-teal-800 underline"
                          href={c.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {c.label}
                        </a>
                        {typeof c.score === "number" && (
                          <span className="text-xs text-[#0c1f2e]/60">
                            {" "}
                            (score {c.score}
                            {c.trust_tier ? `, ${c.trust_tier}` : ""})
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  {(
                    [
                      ["approved", "Approve"],
                      ["accepted", "Accept suggestion"],
                      ["ignored", "Ignore"],
                    ] as const
                  ).map(([action, label]) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => setAction(f.id, action)}
                      className={`px-3 py-1 text-xs border ${
                        f.user_action === action
                          ? "bg-teal-800 text-white border-teal-800"
                          : "bg-white border-teal-200"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>
          <button
            type="button"
            disabled={pending || !findings.some((f) => f.user_action === "accepted")}
            onClick={applyAccepted}
            className="bg-teal-800 text-white px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
          >
            {pending ? "Applying rewrites…" : "Apply accepted rewrites"}
          </button>
        </section>
      )}

      {step === "done" && (
        <section className="space-y-5">
          <h2 className="font-display text-2xl font-semibold">Revised draft</h2>
          <p className="text-sm text-[#0c1f2e]/80">
            Showing current revision and the immediately prior revision only.
          </p>
          <div>
            <h3 className="text-sm font-semibold mb-1">Current</h3>
            <pre className="whitespace-pre-wrap text-sm border border-teal-200 bg-white/80 p-3 max-h-80 overflow-auto">
              {draft}
            </pre>
          </div>
          {priorDraft && (
            <div>
              <h3 className="text-sm font-semibold mb-1">Prior revision</h3>
              <pre className="whitespace-pre-wrap text-sm border border-teal-200 bg-white/60 p-3 max-h-80 overflow-auto opacity-90">
                {priorDraft}
              </pre>
            </div>
          )}
          <button
            type="button"
            className="border border-teal-800 text-teal-900 px-4 py-2 text-sm"
            onClick={() => {
              setStep("intake");
              setFindings([]);
              setPriorDraft(null);
              setQuestions([]);
              setAnswers([]);
            }}
          >
            Start over
          </button>
        </section>
      )}
    </div>
  );
}
