import Link from "next/link";
import { redirect } from "next/navigation";
import { latestArticles } from "@/lib/articles";
import { isAdmin } from "@/lib/auth";
import { categoryName } from "@/lib/categories";
import { formatRelativeTime } from "@/lib/format";
import { deleteArticleAction, logoutAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const items = await latestArticles(50);

  return (
    <div className="py-8">
      <div className="flex items-center justify-between border-b-2 border-ink pb-3">
        <h1 className="text-2xl font-bold">لوحة الإدارة</h1>
        <div className="font-sans-ar flex items-center gap-4 text-sm">
          <Link href="/admin/new" className="bg-ink px-4 py-2 font-bold text-white">
            + مقال جديد
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="text-neutral-500 hover:underline">
              خروج
            </button>
          </form>
        </div>
      </div>

      <table className="font-sans-ar mt-6 w-full text-sm">
        <thead>
          <tr className="border-b border-ink text-right text-xs text-neutral-500">
            <th className="py-2 font-medium">العنوان</th>
            <th className="py-2 font-medium">القسم</th>
            <th className="py-2 font-medium">النشر</th>
            <th className="py-2 font-medium">النوع</th>
            <th className="py-2 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((article) => (
            <tr key={article.id} className="border-b border-rule align-top">
              <td className="max-w-md py-2.5 pl-4">
                <Link href={`/article/${article.slug}`} className="hover:underline">
                  {article.title}
                </Link>
              </td>
              <td className="py-2.5">{categoryName(article.category)}</td>
              <td className="whitespace-nowrap py-2.5">{formatRelativeTime(article.publishedAt)}</td>
              <td className="whitespace-nowrap py-2.5">{article.isAi ? "آلي" : "يدوي"}</td>
              <td className="whitespace-nowrap py-2.5 text-left">
                <Link href={`/admin/edit/${article.id}`} className="ml-3 hover:underline">
                  تعديل
                </Link>
                <form action={deleteArticleAction} className="inline">
                  <input type="hidden" name="id" value={article.id} />
                  <button type="submit" className="text-red-600 hover:underline">
                    حذف
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {items.length === 0 && (
        <p className="py-12 text-center text-neutral-500">لا توجد مقالات.</p>
      )}
    </div>
  );
}
