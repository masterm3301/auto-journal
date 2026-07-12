import { notFound, redirect } from "next/navigation";
import AdminForm from "@/components/AdminForm";
import { articleById } from "@/lib/articles";
import { isAdmin } from "@/lib/auth";
import { updateArticleAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin/login");

  const { id } = await params;
  const numericId = Number.parseInt(id, 10);
  if (!Number.isInteger(numericId)) notFound();
  const article = await articleById(numericId);
  if (!article) notFound();

  const action = updateArticleAction.bind(null, article.id);

  return (
    <div className="py-8">
      <h1 className="border-b-2 border-ink pb-3 text-2xl font-bold">تعديل المقال</h1>
      <AdminForm action={action} article={article} submitLabel="حفظ التعديلات" />
    </div>
  );
}
