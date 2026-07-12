import Anthropic from "@anthropic-ai/sdk";
import { CATEGORIES, CATEGORY_SLUGS } from "../categories";
import type { NormalizedItem } from "./normalize";
import { validateRewrite, type Rewrite } from "./validate";

const REWRITE_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string", description: "عنوان إخباري عربي أصلي وجذاب" },
    dek: { type: "string", description: "جملة تمهيدية واحدة تلخص الخبر" },
    body: {
      type: "string",
      description:
        "نص المقال بالعربية الفصحى: 3 إلى 5 فقرات مفصولة بسطر فارغ، بدون أي وسوم أو ترقيم Markdown",
    },
    category: { type: "string", enum: CATEGORY_SLUGS },
    slug: {
      type: "string",
      description: "معرّف URL قصير بأحرف لاتينية صغيرة وشرطات، مثل morocco-economy-growth",
    },
  },
  required: ["title", "dek", "body", "category", "slug"],
  additionalProperties: false,
} as const;

const SYSTEM_PROMPT = `أنت صحفي مغربي محترف يعمل في صحيفة "مجيد" الإلكترونية.
مهمتك: كتابة مقال إخباري عربي أصلي انطلاقا من عنوان ومقتطف خبر منشور في مصدر آخر.

قواعد صارمة:
- اكتب مقالا أصليا بأسلوبك الخاص، ولا تنسخ صياغة المصدر حرفيا.
- اعتمد فقط على المعلومات الواردة في العنوان والمقتطف. لا تخترع أرقاما أو أسماء أو تصريحات أو تفاصيل غير مذكورة.
- إذا كان المقتطف قصيرا، اكتب مقالا موجزا وقدم السياق العام المعروف دون اختلاق وقائع جديدة.
- الطول: بين 250 و400 كلمة، من 3 إلى 5 فقرات مفصولة بسطر فارغ، بدون عناوين فرعية وبدون Markdown.
- اختر التصنيف الأنسب من: ${CATEGORIES.map((c) => `${c.slug} (${c.name})`).join("، ")}.
- اكتب slug لاتينيا قصيرا يصف الخبر.`;

let cachedClient: Anthropic | null = null;

function getClient(): Anthropic {
  if (!cachedClient) cachedClient = new Anthropic();
  return cachedClient;
}

export function hasApiKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export async function rewriteItem(item: NormalizedItem): Promise<Rewrite> {
  const client = getClient();
  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 3000,
    system: SYSTEM_PROMPT,
    output_config: {
      format: { type: "json_schema", schema: REWRITE_SCHEMA },
    },
    messages: [
      {
        role: "user",
        content: `العنوان الأصلي: ${item.title}\nالمصدر: ${item.sourceName}\nالمقتطف: ${item.snippet || "(لا يوجد مقتطف)"}\n\nاكتب المقال.`,
      },
    ],
  });

  if (response.stop_reason === "refusal") {
    throw new Error("rewrite refused by model");
  }
  const text = response.content.find((b) => b.type === "text")?.text;
  if (!text) throw new Error("empty model response");

  const rewrite = validateRewrite(JSON.parse(text));
  if (!rewrite) throw new Error("model response failed validation");
  return rewrite;
}
