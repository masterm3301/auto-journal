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

// Under rate-limit pressure Groq has been observed holding connections open
// rather than answering, so every attempt gets a hard abort timeout. Retries
// after a 429 wait out the server's retry-after, but only within the caller's
// remaining time budget — a call never outlives its deadline.
const ATTEMPT_TIMEOUT_MS = 45_000;
const MAX_RETRY_WAIT_MS = 60_000;

interface CompletionOptions {
  system: string;
  user: string;
  maxTokens: number;
  temperature?: number;
}

export async function groqJsonCompletion(
  options: CompletionOptions,
  deadlineAt: number = Date.now() + 120_000,
): Promise<string> {
  return request(options, true, deadlineAt);
}

async function request(
  options: CompletionOptions,
  allowRetry: boolean,
  deadlineAt: number,
): Promise<string> {
  const attemptMs = Math.min(ATTEMPT_TIMEOUT_MS, deadlineAt - Date.now());
  if (attemptMs < 3_000) throw new Error("groq: run time budget exhausted");

  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    signal: AbortSignal.timeout(attemptMs),
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
      deadlineAt - Date.now() - 10_000,
    );
    await response.body?.cancel();
    if (waitMs <= 0) throw new Error("groq 429: rate limited, no budget left to retry");
    await sleep(waitMs);
    return request(options, false, deadlineAt);
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
