import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TextCard } from "@/components/ArticleCard";
import ArticleImage from "@/components/ArticleImage";
import { articleBySlug, relatedArticles } from "@/lib/articles";
import { categoryName } from "@/lib/categories";
import { formatFullDate, formatRelativeTime } from "@/lib/format";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await articleBySlug(slug);
  if (!article) return {};
  return { title: article.title, description: article.dek };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await articleBySlug(slug);
  if (!article) notFound();

  const related = await relatedArticles(article.category, article.id, 4);
  const paragraphs = article.body.split(/\n{2,}/).filter((p) => p.trim());

  return (
    <div className="mx-auto max-w-[680px] py-8">
      <p className="font-sans-ar text-sm font-bold">
        <Link href={`/section/${article.category}`} className="hover:underline">
          {categoryName(article.category)}
        </Link>
      </p>
      <h1 className="mt-3 text-3xl font-bold leading-snug sm:text-4xl">{article.title}</h1>
      {article.dek && (
        <p className="mt-3 text-lg leading-relaxed text-neutral-600">{article.dek}</p>
      )}

      <div className="font-sans-ar mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-rule pb-4 text-xs text-neutral-500">
        <time dateTime={article.publishedAt.toISOString()} title={formatFullDate(article.publishedAt)}>
          {formatRelativeTime(article.publishedAt)}
        </time>
        {article.sourceName && article.sourceUrl && (
          <>
            <span>·</span>
            <span>
              المصدر:{" "}
              <a
                href={article.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-ink hover:underline"
              >
                {article.sourceName}
              </a>
            </span>
          </>
        )}
        {article.isAi && (
          <>
            <span>·</span>
            <span className="rounded bg-neutral-100 px-1.5 py-0.5">تحرير آلي</span>
          </>
        )}
      </div>

      {article.imageUrl && (
        <figure className="mt-6">
          <ArticleImage src={article.imageUrl} alt={article.title} className="aspect-[3/2] w-full" />
        </figure>
      )}

      <div className="mt-6 space-y-5 text-lg leading-[1.9]">
        {paragraphs.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

      {related.length > 0 && (
        <aside className="mt-12 border-t-2 border-ink pt-3">
          <h2 className="font-sans-ar text-lg font-bold">
            المزيد من {categoryName(article.category)}
          </h2>
          <div className="mt-2 divide-y divide-rule">
            {related.map((item) => (
              <TextCard key={item.id} article={item} />
            ))}
          </div>
        </aside>
      )}
    </div>
  );
}
