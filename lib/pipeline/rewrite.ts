import { CATEGORIES } from "../categories";
import { groqJsonCompletion } from "./groq";
import type { NormalizedItem } from "./normalize";
import { validateRewrite, type Rewrite } from "./validate";

export { hasApiKey } from "./groq";

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

export async function rewriteItem(item: NormalizedItem, deadlineAt?: number): Promise<Rewrite> {
  const text = await groqJsonCompletion(
    {
      system: SYSTEM_PROMPT,
      user: `العنوان الأصلي: ${item.title}\nالمصدر: ${item.sourceName}\nالمقتطف: ${item.snippet || "(لا يوجد مقتطف)"}\n\nاكتب المقال وأجب بكائن JSON فقط.`,
      maxTokens: 3000,
    },
    deadlineAt,
  );

  const rewrite = validateRewrite(JSON.parse(text));
  if (!rewrite) throw new Error("model response failed validation");
  return rewrite;
}
