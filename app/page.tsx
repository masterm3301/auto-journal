import Link from "next/link";
import { LeadCard, StackedCard, StandardCard, TextCard } from "@/components/ArticleCard";
import { articlesByCategory, latestArticles } from "@/lib/articles";
import { CATEGORIES } from "@/lib/categories";
import type { Article } from "@/lib/db/schema";

export const revalidate = 300;

function SectionBlock({ name, slug, items }: { name: string; slug: string; items: Article[] }) {
  if (items.length === 0) return null;
  const [lead, ...rest] = items;
  return (
    <section className="border-t border-ink pt-3">
      <div className="flex items-baseline justify-between">
        <h2 className="font-sans-ar text-lg font-bold">
          <Link href={`/section/${slug}`} className="hover:text-neutral-600">
            {name}
          </Link>
        </h2>
        <Link
          href={`/section/${slug}`}
          className="font-sans-ar text-xs text-neutral-500 hover:underline"
        >
          المزيد ←
        </Link>
      </div>
      <div className="mt-3 grid gap-6 sm:grid-cols-4">
        <div className="sm:col-span-2">
          <StandardCard article={lead} />
        </div>
        <div className="divide-y divide-rule sm:col-span-2">
          {rest.map((article) => (
            <TextCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default async function HomePage() {
  const latest = await latestArticles(6);
  const sections = await Promise.all(
    CATEGORIES.map(async (category) => ({
      ...category,
      items: await articlesByCategory(category.slug, 4),
    })),
  );

  if (latest.length === 0) {
    return (
      <div className="py-24 text-center text-neutral-500">
        <p className="text-xl">لا توجد مقالات بعد.</p>
        <p className="font-sans-ar mt-2 text-sm">سيبدأ النشر تلقائيا مع أول دورة للجلب.</p>
      </div>
    );
  }

  const [lead, ...stack] = latest;

  return (
    <div className="py-6">
      <div className="grid gap-8 border-b border-ink pb-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <LeadCard article={lead} />
        </div>
        <div className="lg:col-span-5 lg:border-r lg:border-rule lg:pr-8">
          <h2 className="font-sans-ar border-b border-ink pb-2 text-sm font-bold">
            آخر الأخبار
          </h2>
          <div className="divide-y divide-rule">
            {stack.map((article) => (
              <StackedCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 space-y-10">
        {sections.map((section) => (
          <SectionBlock
            key={section.slug}
            name={section.name}
            slug={section.slug}
            items={section.items}
          />
        ))}
      </div>
    </div>
  );
}
