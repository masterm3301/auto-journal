import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ListCard } from "@/components/ArticleCard";
import { articlesByCategory, countByCategory } from "@/lib/articles";
import { categoryName, isCategorySlug } from "@/lib/categories";

export const revalidate = 300;

const PAGE_SIZE = 12;

type Props = {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  return { title: categoryName(category) };
}

export default async function SectionPage({ params, searchParams }: Props) {
  const { category } = await params;
  if (!isCategorySlug(category)) notFound();

  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);
  const [items, total] = await Promise.all([
    articlesByCategory(category, PAGE_SIZE, (page - 1) * PAGE_SIZE),
    countByCategory(category),
  ]);
  const hasMore = page * PAGE_SIZE < total;

  return (
    <div className="py-6">
      <h1 className="border-b-2 border-ink pb-3 text-3xl font-bold">
        {categoryName(category)}
      </h1>
      {items.length === 0 ? (
        <p className="py-16 text-center text-neutral-500">لا توجد مقالات في هذا القسم بعد.</p>
      ) : (
        <div>
          {items.map((article) => (
            <ListCard key={article.id} article={article} />
          ))}
        </div>
      )}
      <div className="font-sans-ar flex justify-between py-6 text-sm">
        {page > 1 ? (
          <Link href={`/section/${category}?page=${page - 1}`} className="hover:underline">
            → الصفحة السابقة
          </Link>
        ) : (
          <span />
        )}
        {hasMore && (
          <Link href={`/section/${category}?page=${page + 1}`} className="hover:underline">
            الصفحة التالية ←
          </Link>
        )}
      </div>
    </div>
  );
}
