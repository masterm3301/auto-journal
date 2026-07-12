import { redirect } from "next/navigation";
import AdminForm from "@/components/AdminForm";
import { isAdmin } from "@/lib/auth";
import { createArticleAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewArticlePage() {
  if (!(await isAdmin())) redirect("/admin/login");

  return (
    <div className="py-8">
      <h1 className="border-b-2 border-ink pb-3 text-2xl font-bold">مقال جديد</h1>
      <AdminForm action={createArticleAction} submitLabel="نشر المقال" />
    </div>
  );
}
