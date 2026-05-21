import type { Suggestion } from "./types";

export type SuggestionVerdict = "Great fit" | "Worth considering" | "Discuss first" | "Needs details";

export type SuggestionRecommendation = {
  suggestionId: string;
  score: number;
  verdict: SuggestionVerdict;
  rationale: string;
  strengths: string[];
  cautions: string[];
};

const familyFriendlyWords = ["kid", "family", "easy", "casual", "play", "mini golf", "arcade", "pool"];
const backupWords = ["rain", "rough", "indoor", "backup", "storm", "shade"];
const beachFitWords = ["beach", "near", "walk", "sunset", "morning", "golden hour"];
const cautionWords = ["far", "long drive", "expensive", "late", "crowded", "wait", "rough water"];

export function recommendSuggestions(suggestions: Suggestion[]): SuggestionRecommendation[] {
  return suggestions
    .map((suggestion) => recommendSuggestion(suggestion))
    .sort((a, b) => b.score - a.score || a.suggestionId.localeCompare(b.suggestionId));
}

function recommendSuggestion(suggestion: Suggestion): SuggestionRecommendation {
  const text = `${suggestion.title} ${suggestion.category} ${suggestion.location} ${suggestion.notes}`.toLowerCase();
  const strengths: string[] = [];
  const cautions: string[] = [];
  let score = 18 + suggestion.votes.length * 12;

  if (suggestion.kind === "restaurant") {
    score += 4;
    strengths.push("fits a dinner decision");
  } else {
    score += 6;
    strengths.push("adds a flexible activity option");
  }

  if (suggestion.notes.trim().length >= 20) {
    score += 10;
    strengths.push("has useful details");
  } else {
    score -= 16;
    cautions.push("needs notes before the family can compare it");
  }

  if (suggestion.location.trim()) {
    score += 5;
  } else {
    score -= 5;
    cautions.push("missing location");
  }

  if (suggestion.link.trim()) {
    score += 4;
  }

  if (includesAny(text, familyFriendlyWords)) {
    score += 10;
    strengths.push("sounds family-friendly");
  }

  if (includesAny(text, backupWords)) {
    score += 9;
    strengths.push("works as a rainy day or rough water backup");
  }

  if (includesAny(text, beachFitWords)) {
    score += 6;
    strengths.push("fits the Gulf Shores beach rhythm");
  }

  if (includesAny(text, cautionWords)) {
    score -= 18;
    cautions.push("mentions drive time, cost, timing, crowds, or water conditions");
  }

  if (suggestion.votes.length === 0) {
    cautions.push("no family votes yet");
  } else {
    strengths.push(`${suggestion.votes.length} family vote${suggestion.votes.length === 1 ? "" : "s"}`);
  }

  const verdict = getVerdict(score, cautions);

  return {
    suggestionId: suggestion.id,
    score: Math.max(0, Math.min(100, score)),
    verdict,
    rationale: buildRationale(verdict, strengths, cautions),
    strengths: dedupe(strengths),
    cautions: dedupe(cautions),
  };
}

function getVerdict(score: number, cautions: string[]): SuggestionVerdict {
  const hasPlanningCaution = cautions.some((caution) => /drive|cost|timing|crowds|water|conditions/i.test(caution));

  if (hasPlanningCaution && score < 75) {
    return "Discuss first";
  }

  if (score >= 58) {
    return "Great fit";
  }

  if (score >= 34) {
    return hasPlanningCaution ? "Discuss first" : "Worth considering";
  }

  return "Needs details";
}

function buildRationale(verdict: SuggestionVerdict, strengths: string[], cautions: string[]) {
  if (verdict === "Great fit") {
    return `Strong option because it ${sentenceList(strengths)}.`;
  }

  if (verdict === "Worth considering") {
    return `Promising idea: it ${sentenceList(strengths)}.`;
  }

  if (verdict === "Discuss first") {
    return `Talk this through because it may involve ${sentenceList(cautions)}.`;
  }

  return `Add more detail: ${sentenceList(cautions)}.`;
}

function sentenceList(items: string[]) {
  const unique = dedupe(items);

  if (unique.length === 0) {
    return "needs more family input";
  }

  if (unique.length === 1) {
    return unique[0];
  }

  return `${unique.slice(0, -1).join(", ")} and ${unique.at(-1)}`;
}

function includesAny(text: string, words: string[]) {
  return words.some((word) => text.includes(word));
}

function dedupe(items: string[]) {
  return Array.from(new Set(items));
}
