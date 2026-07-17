export type RiskType =
  | "money"
  | "rights"
  | "data"
  | "future_problems"
  | "enforceability"
  | "regulatory_friction"
  | "conversion_trust";

export type Severity = "critical" | "high" | "medium" | "low" | "info";
export type Vertical = "neobank" | "payments" | "lending" | "investing";
export type StateCode = "WA" | "OR" | "CA";
export type CitationStatus = "cited" | "uncertain";
export type UserAction = "pending" | "approved" | "accepted" | "ignored";

export type TrustTier =
  | "official_statute"
  | "official_guidance"
  | "gov_explainer";

export interface CitationPackEntry {
  id: string;
  label: string;
  url: string;
  states: StateCode[];
  topics: string[];
  trust_tier: TrustTier;
  last_reviewed: string;
  superseded: boolean;
  snippet: string;
}

export interface Citation {
  label: string;
  url: string;
  trust_tier?: TrustTier;
  score?: number;
}

export interface Finding {
  id: string;
  risk_types: RiskType[];
  severity: Severity;
  title: string;
  plain_language_explanation: string;
  clause_excerpt: string;
  suggested_rewrite: string;
  state_relevance: StateCode[];
  citations: Citation[];
  citation_status: CitationStatus;
  user_action: UserAction;
  topics?: string[];
}

export interface PipelineSession {
  vertical: Vertical;
  states: StateCode[];
  draft: string;
  priorDraft: string | null;
  productContext: string;
  findings: Finding[];
  clarifyingQuestions: string[];
  answers: string[];
}

export interface ScopeResult {
  inScope: boolean;
  message?: string;
  detectedState?: string;
  detectedField?: string;
}
