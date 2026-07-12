import Link from "next/link";
import ArticleImage from "./ArticleImage";
import { categoryName } from "@/lib/categories";
import type { Article } from "@/lib/db/schema";
import { formatRelativeTime } from "@/lib/format";

function Meta({ article, showCategory = false }: { article: Article; showCategory?: boolean }) {
  return (
    <p className="font-sans-ar mt-1.5 text-xs text-neutral-500">
      {showCategory && (
        <>
          <Link href={`/section/${article.category}`} className="font-semibold text-ink hover:underline">
            {categoryName(article.category)}
          </Link>
          <span className="mx-1.5">·</span>
        </>
      )}
      {formatRelativeTime(article.publishedAt)}
    </p>
  );
}

export function LeadCard({ article }: { article: Article }) {
  return (
    <article>
      <Link href={`/article/${article.slug}`} className="group block">
        <ArticleImage src={article.imageUrl} alt={article.title} className="aspect-[3/2] w-full" />
        <h2 className="mt-3 text-3xl font-bold leading-snug group-hover:text-neutral-600 sm:text-4xl">
          {article.title}
        </h2>
        {article.dek && (
          <p className="mt-2 text-base leading-relaxed text-neutral-600">{article.dek}</p>
        )}
      </Link>
      <Meta article={article} showCategory />
    </article>
  );
}

export function StackedCard({ article }: { article: Article }) {
  return (
    <article className="flex gap-3 py-3">
      <div className="min-w-0 flex-1">
        <Link href={`/article/${article.slug}`} className="group block">
          <h3 className="text-base font-bold leading-snug group-hover:text-neutral-600">
            {article.title}
          </h3>
        </Link>
        <Meta article={article} showCategory />
      </div>
      <Link href={`/article/${article.slug}`} className="shrink-0">
        <ArticleImage src={article.imageUrl} alt="" className="h-20 w-28" />
      </Link>
    </article>
  );
}

export function StandardCard({ article }: { article: Article }) {
  return (
    <article>
      <Link href={`/article/${article.slug}`} className="group block">
        <ArticleImage src={article.imageUrl} alt={article.title} className="aspect-[3/2] w-full" />
        <h3 className="mt-2 text-lg font-bold leading-snug group-hover:text-neutral-600">
          {article.title}
        </h3>
        {article.dek && (
          <p className="mt-1 text-sm leading-relaxed text-neutral-600">{article.dek}</p>
        )}
      </Link>
      <Meta article={article} />
    </article>
  );
}

export function TextCard({ article }: { article: Article }) {
  return (
    <article className="py-2.5">
      <Link href={`/article/${article.slug}`} className="group block">
        <h3 className="text-base font-bold leading-snug group-hover:text-neutral-600">
          {article.title}
        </h3>
      </Link>
      <Meta article={article} />
    </article>
  );
}

export function ListCard({ article }: { article: Article }) {
  return (
    <article className="flex gap-5 border-b border-rule py-5">
      <Link href={`/article/${article.slug}`} className="shrink-0">
        <ArticleImage src={article.imageUrl} alt="" className="h-28 w-44 sm:h-32 sm:w-52" />
      </Link>
      <div className="min-w-0 flex-1">
        <Link href={`/article/${article.slug}`} className="group block">
          <h3 className="text-xl font-bold leading-snug group-hover:text-neutral-600">
            {article.title}
          </h3>
          {article.dek && (
            <p className="mt-1.5 text-sm leading-relaxed text-neutral-600">{article.dek}</p>
          )}
        </Link>
        <Meta article={article} />
      </div>
    </article>
  );
}
