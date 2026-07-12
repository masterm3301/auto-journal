import { groqJsonCompletion } from "./groq";
import type { NormalizedItem } from "./normalize";
import { validateSelection } from "./validate";

const MAX_CANDIDATES_SHOWN = 15;

const SYSTEM_PROMPT = `You curate the homepage of a Moroccan Arabic news site.
You are given headlines already published recently, and a numbered list of candidate headlines from wire feeds.
Pick the candidates worth publishing now. Rules:
- Skip any candidate covering the same event as an already-published headline, even if worded very differently.
- Skip candidates that duplicate each other (same event from different outlets) — keep only the best one.
- Prefer nationally significant news over minor local items when you must choose.
Reply with JSON only: {"keep": [candidate numbers to publish, most important first]}`;

// Ask the model which candidates are genuinely new, distinct stories. Falls
// back to "first `max` candidates" (the pre-curation behavior) if the call
// or its output is unusable — publishing with occasional duplicates beats
// publishing nothing.
export async function selectCandidates(
  candidates: NormalizedItem[],
  recentTitles: string[],
  max: number,
  deadlineAt?: number,
): Promise<NormalizedItem[]> {
  const shown = candidates.slice(0, MAX_CANDIDATES_SHOWN);
  if (shown.length <= 1) return shown;

  try {
    const user = [
      "Recently published headlines:",
      ...recentTitles.map((title) => `- ${title}`),
      "",
      "Candidates:",
      ...shown.map((item, i) => `${i}. ${item.title}`),
      "",
      `Pick up to ${max}. Reply with JSON only.`,
    ].join("\n");

    const text = await groqJsonCompletion(
      { system: SYSTEM_PROMPT, user, maxTokens: 300, temperature: 0 },
      deadlineAt,
    );
    const indices = validateSelection(JSON.parse(text), shown.length, max);
    if (indices === null) throw new Error("selection response failed validation");
    return indices.map((i) => shown[i]);
  } catch {
    return shown.slice(0, max);
  }
}
