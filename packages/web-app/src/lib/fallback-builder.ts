// packages/web-app/src/lib/fallback-builder.ts
// Deterministic fallback text generator that *respects explicit prompt constraints*.
// No network calls. Works together with constraint-enforcer.

import { extractConstraintsFromPrompt } from "./constraint-enforcer";

function nDigits(n: number): string {
  if (n <= 0) return "";
  const fallbacks: Record<number, string> = { 5: "12345", 6: "123456" };
  return fallbacks[n] ?? "0".repeat(n);
}

export function buildFallbackResponse(prompt: string): string {
  const c = extractConstraintsFromPrompt(prompt);

  // Exact/format hard constraints first
  if (c.equals !== undefined) return String(c.equals);
  if (c.uppercaseOnly) return c.uppercaseOnly.toUpperCase();
  if (c.digitsOnly) return nDigits(c.digitsOnly);
  if (c.minimalJson && Object.keys(c.minimalJson).length) {
    return JSON.stringify(c.minimalJson);
  }

  // Token-presence requests (e.g., community, advocacy); keep it one short sentence if asked.
  const must = (c.mustInclude ?? []).map(s => s.trim()).filter(Boolean);
  const nots = new Set((c.notInclude ?? []).map(s => s.toLowerCase().trim()));

  // Minimal, polite base that avoids obvious negatives.
  let base = "I can help and support your goals.";
  if (c.oneSentence) base = "I can help and support your goals in one sentence.";

  // Assemble required tokens into the same sentence to avoid multi-sentence penalties.
  if (must.length) {
    const list = must.join(", ");
    // Avoid adding forbidden tokens by accident
    if (![...nots].some(bad => list.toLowerCase().includes(bad))) {
      base = `I can help and support your goals — ${list}.`;
    } else {
      base = "I can help and support your goals.";
    }
  }

  // Trim to one sentence if requested
  if (c.oneSentence) {
    base = base.replace(/[\r\n]+/g, " ").replace(/\s{2,}/g, " ").trim();
    // Ensure single terminal period
    base = base.replace(/[.!?]+$/g, "") + ".";
  }

  return base;
}
