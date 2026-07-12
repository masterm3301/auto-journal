import { CATEGORIES } from "@/lib/categories";
import type { Article } from "@/lib/db/schema";

export default function AdminForm({
  action,
  article,
  submitLabel,
}: {
  action: (formData: FormData) => Promise<void>;
  article?: Article;
  submitLabel: string;
}) {
  return (
    <form action={action} className="font-sans-ar mt-6 max-w-2xl space-y-5 text-sm">
      <div>
        <label htmlFor="title" className="block font-medium">
          العنوان *
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={article?.title}
          className="mt-1 w-full border border-neutral-300 px-3 py-2 focus:border-ink focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="dek" className="block font-medium">
          المقدمة
        </label>
        <input
          id="dek"
          name="dek"
          defaultValue={article?.dek}
          className="mt-1 w-full border border-neutral-300 px-3 py-2 focus:border-ink focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="body" className="block font-medium">
          النص * <span className="font-normal text-neutral-400">(فقرات مفصولة بسطر فارغ)</span>
        </label>
        <textarea
          id="body"
          name="body"
          required
          rows={14}
          defaultValue={article?.body}
          className="mt-1 w-full border border-neutral-300 px-3 py-2 leading-relaxed focus:border-ink focus:outline-none"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="category" className="block font-medium">
            القسم *
          </label>
          <select
            id="category"
            name="category"
            defaultValue={article?.category ?? "politics"}
            className="mt-1 w-full border border-neutral-300 bg-white px-3 py-2 focus:border-ink focus:outline-none"
          >
            {CATEGORIES.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="imageUrl" className="block font-medium">
            رابط الصورة
          </label>
          <input
            id="imageUrl"
            name="imageUrl"
            dir="ltr"
            defaultValue={article?.imageUrl ?? ""}
            className="mt-1 w-full border border-neutral-300 px-3 py-2 focus:border-ink focus:outline-none"
          />
        </div>
      </div>
      <button type="submit" className="bg-ink px-6 py-2.5 font-bold text-white">
        {submitLabel}
      </button>
    </form>
  );
}
