import type { ScopeResult } from "./types";

const ALLOWED_STATES = new Set([
  "wa",
  "washington",
  "or",
  "oregon",
  "ca",
  "california",
]);

const STATE_ALIASES: Record<string, string> = {
  wa: "Washington",
  washington: "Washington",
  or: "Oregon",
  oregon: "Oregon",
  ca: "California",
  california: "California",
};

const NON_FINANCE_FIELDS = [
  "healthcare",
  "health care",
  "medical",
  "hospital",
  "insurance clinic",
  "pharma",
  "biotech",
  "education",
  "edtech",
  "real estate",
  "proptech",
  "gaming",
  "gambling",
  "cannabis",
  "agriculture",
  "construction",
  "legal services",
  "law firm",
];

const US_STATES = [
  "alabama",
  "alaska",
  "arizona",
  "arkansas",
  "colorado",
  "connecticut",
  "delaware",
  "florida",
  "georgia",
  "hawaii",
  "idaho",
  "illinois",
  "indiana",
  "iowa",
  "kansas",
  "kentucky",
  "louisiana",
  "maine",
  "maryland",
  "massachusetts",
  "michigan",
  "minnesota",
  "mississippi",
  "missouri",
  "montana",
  "nebraska",
  "nevada",
  "new hampshire",
  "new jersey",
  "new mexico",
  "new york",
  "north carolina",
  "north dakota",
  "ohio",
  "oklahoma",
  "pennsylvania",
  "rhode island",
  "south carolina",
  "south dakota",
  "tennessee",
  "texas",
  "utah",
  "vermont",
  "virginia",
  "west virginia",
  "wisconsin",
  "wyoming",
];

function redirectMessage(thing: string): string {
  return `We don't currently serve ${thing}, but we will be expanding there soon. Please see our services for financial startups in Washington, Oregon, and California.`;
}

export function checkScope(text: string): ScopeResult {
  const lower = text.toLowerCase();

  for (const field of NON_FINANCE_FIELDS) {
    if (lower.includes(field)) {
      return {
        inScope: false,
        detectedField: field,
        message: redirectMessage(field),
      };
    }
  }

  for (const state of US_STATES) {
    if (lower.includes(state)) {
      return {
        inScope: false,
        detectedState: state,
        message: redirectMessage(state.replace(/\b\w/g, (c) => c.toUpperCase())),
      };
    }
  }

  // Abbreviation mentions like "based in TX" / "NY customers only"
  const abbrev = lower.match(
    /\b(?:based in|located in|serving|only in|expanding to|headquartered in)\s+([a-z]{2})\b/,
  );
  if (abbrev) {
    const code = abbrev[1];
    if (!ALLOWED_STATES.has(code)) {
      return {
        inScope: false,
        detectedState: code.toUpperCase(),
        message: redirectMessage(code.toUpperCase()),
      };
    }
  }

  // Explicit allowed geography is fine
  for (const key of Object.keys(STATE_ALIASES)) {
    if (lower.includes(key)) {
      // still in scope if only WA/OR/CA mentioned
    }
  }

  return { inScope: true };
}
