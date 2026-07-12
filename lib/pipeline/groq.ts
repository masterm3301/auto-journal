// Shared Groq client (OpenAI-compatible API, free tier).
// Get a key at https://console.groq.com
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

export function hasApiKey(): boolean {
  return Boolean(process.env.GROQ_API_KEY);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Groq's free tier caps tokens per minute; a burst of calls trips it. On a
// 429 we wait out the server-provided retry-after (bounded) and retry once.
const MAX_RETRY_WAIT_MS = 60_000;

export async function groqJsonCompletion(options: {
  system: string;
  user: string;
  maxTokens: number;
  temperature?: number;
}): Promise<string> {
  return request(options, true);
}

async function request(
  options: { system: string; user: string; maxTokens: number; temperature?: number },
  allowRetry: boolean,
): Promise<string> {
  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: options.maxTokens,
      temperature: options.temperature ?? 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: options.system },
        { role: "user", content: options.user },
      ],
    }),
  });

  if (response.status === 429 && allowRetry) {
    const retryAfterSeconds = Number.parseFloat(response.headers.get("retry-after") ?? "20");
    const waitMs = Math.min(
      (Number.isFinite(retryAfterSeconds) ? retryAfterSeconds + 1 : 20) * 1000,
      MAX_RETRY_WAIT_MS,
    );
    await response.body?.cancel();
    await sleep(waitMs);
    return request(options, false);
  }
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 200);
    throw new Error(`groq ${response.status}: ${detail}`);
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("empty model response");
  return text;
}
