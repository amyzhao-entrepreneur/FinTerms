import citationPack from "../../data/citation-pack.json";
import type {
  Citation,
  CitationPackEntry,
  CitationStatus,
  Finding,
  StateCode,
  TrustTier,
} from "./types";

const pack = citationPack as CitationPackEntry[];

const TRUST_WEIGHT: Record<TrustTier, number> = {
  official_statute: 1,
  official_guidance: 0.85,
  gov_explainer: 0.7,
};

const W_SIM = 0.45;
const W_TRUST = 0.35;
const W_FRESH = 0.2;
const SCORE_THRESHOLD = 0.42;

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 2),
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter += 1;
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

function freshnessScore(entry: CitationPackEntry): number {
  if (entry.superseded) return 0;
  const t = Date.parse(entry.last_reviewed);
  if (Number.isNaN(t)) return 0.5;
  const ageDays = (Date.now() - t) / (1000 * 60 * 60 * 24);
  if (ageDays <= 180) return 1;
  if (ageDays <= 365) return 0.8;
  if (ageDays <= 730) return 0.55;
  return 0.35;
}

function claimText(finding: Finding): string {
  return [
    finding.title,
    finding.plain_language_explanation,
    finding.clause_excerpt,
    ...(finding.topics || []),
    ...finding.risk_types,
  ].join(" ");
}

export function citeAndRankFinding(
  finding: Finding,
  states: StateCode[],
): { citations: Citation[]; citation_status: CitationStatus } {
  const claimTokens = tokenize(claimText(finding));
  const stateSet = new Set(states);

  const scored = pack
    .filter((e) => !e.superseded)
    .filter((e) => e.states.some((s) => stateSet.has(s)))
    .map((entry) => {
      const sim = Math.max(
        jaccard(claimTokens, tokenize(entry.snippet)),
        jaccard(claimTokens, tokenize(entry.label)),
        jaccard(claimTokens, tokenize(entry.topics.join(" "))),
      );
      const trust = TRUST_WEIGHT[entry.trust_tier];
      const fresh = freshnessScore(entry);
      const score = W_SIM * sim + W_TRUST * trust + W_FRESH * fresh;
      return { entry, score, sim };
    })
    .sort((a, b) => b.score - a.score);

  const top = scored.filter((s) => s.score >= SCORE_THRESHOLD).slice(0, 2);

  // Soft fallback: if nothing clears threshold but we have overlapping topics, take best if sim>0
  if (top.length === 0 && scored[0] && scored[0].sim > 0.08) {
    const best = scored[0];
    if (best.score >= SCORE_THRESHOLD * 0.85) {
      top.push(best);
    }
  }

  if (top.length === 0) {
    return { citations: [], citation_status: "uncertain" };
  }

  // Conflict heuristic: two high-trust different topic clusters with near-equal scores
  if (
    top.length === 2 &&
    Math.abs(top[0].score - top[1].score) < 0.03 &&
    top[0].entry.trust_tier === "official_statute" &&
    top[1].entry.trust_tier === "official_statute" &&
    top[0].entry.topics[0] !== top[1].entry.topics[0]
  ) {
    // Prefer single highest; still cite but prefer one
    top.pop();
  }

  const allow = new Set(pack.map((p) => p.url));
  const citations: Citation[] = top
    .filter((t) => allow.has(t.entry.url))
    .map((t) => ({
      label: t.entry.label,
      url: t.entry.url,
      trust_tier: t.entry.trust_tier,
      score: Number(t.score.toFixed(3)),
    }));

  if (citations.length === 0) {
    return { citations: [], citation_status: "uncertain" };
  }

  return { citations, citation_status: "cited" };
}

export function citeAndRankFindings(
  findings: Finding[],
  states: StateCode[],
): Finding[] {
  return findings.map((f) => {
    const { citations, citation_status } = citeAndRankFinding(f, states);
    const next = { ...f, citations, citation_status };
    // If uncertain on a factual/legal severity claim, soften assertion in status only
    return next;
  });
}

export function getCitationPack(): CitationPackEntry[] {
  return pack;
}
