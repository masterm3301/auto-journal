import { CATEGORIES } from "../categories";
import type { NormalizedItem } from "./normalize";
import { validateRewrite, type Rewrite } from "./validate";

// Groq (OpenAI-compatible API, free tier). Get a key at https://console.groq.com
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

const SYSTEM_PROMPT = `أنت صحفي مغربي محترف يعمل في صحيفة "مجيد" الإلكترونية.
مهمتك: كتابة مقال إخباري عربي أصلي انطلاقا من عنوان ومقتطف خبر منشور في مصدر آخر.

قواعد صارمة:
- اكتب مقالا أصليا بأسلوبك الخاص، ولا تنسخ صياغة المصدر حرفيا.
- اعتمد فقط على المعلومات الواردة في العنوان والمقتطف. لا تخترع أرقاما أو أسماء أو تصريحات أو تفاصيل غير مذكورة.
- إذا كان المقتطف قصيرا، اكتب مقالا موجزا وقدم السياق العام المعروف دون اختلاق وقائع جديدة.
- الطول: بين 250 و400 كلمة، من 3 إلى 5 فقرات مفصولة بسطر فارغ، بدون عناوين فرعية وبدون Markdown.

أجب حصريا بكائن JSON صالح بهذه البنية بالضبط (بدون أي نص خارج الكائن):
{
  "title": "عنوان إخباري عربي أصلي وجذاب",
  "dek": "جملة تمهيدية واحدة تلخص الخبر",
  "body": "نص المقال: فقرات مفصولة بسطر فارغ (\\n\\n)",
  "category": "أحد هذه الرموز فقط: ${CATEGORIES.map((c) => c.slug).join(" | ")} — ${CATEGORIES.map((c) => `${c.slug}=${c.name}`).join("، ")}",
  "slug": "معرف-url-قصير-بأحرف-لاتينية-صغيرة-وشرطات"
}`;

export function hasApiKey(): boolean {
  return Boolean(process.env.GROQ_API_KEY);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Groq's free tier caps tokens per minute; a burst of rewrites trips it. On a
// 429 we wait out the server-provided retry-after (bounded) and retry once.
const MAX_RETRY_WAIT_MS = 90_000;

export async function rewriteItem(item: NormalizedItem): Promise<Rewrite> {
  return rewriteWithRetry(item, true);
}

async function rewriteWithRetry(item: NormalizedItem, allowRetry: boolean): Promise<Rewrite> {
  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 3000,
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `العنوان الأصلي: ${item.title}\nالمصدر: ${item.sourceName}\nالمقتطف: ${item.snippet || "(لا يوجد مقتطف)"}\n\nاكتب المقال وأجب بكائن JSON فقط.`,
        },
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
    return rewriteWithRetry(item, false);
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

  const rewrite = validateRewrite(JSON.parse(text));
  if (!rewrite) throw new Error("model response failed validation");
  return rewrite;
}
