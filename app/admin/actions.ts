"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deleteArticle, insertArticle, updateArticle } from "@/lib/articles";
import { isAdmin, loginWithPassword, logout } from "@/lib/auth";
import { isCategorySlug } from "@/lib/categories";
import { fallbackSlug, normalizeSlug } from "@/lib/pipeline/validate";

async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}

export async function loginAction(_prev: { error?: string }, formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (await loginWithPassword(password)) {
    redirect("/admin");
  }
  return { error: "كلمة المرور غير صحيحة" };
}

export async function logoutAction() {
  await logout();
  redirect("/admin/login");
}

function articleFromForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const dek = String(formData.get("dek") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const category = String(formData.get("category") ?? "");
  const imageUrl = String(formData.get("imageUrl") ?? "").trim() || null;
  if (!title || !body || !isCategorySlug(category)) return null;
  return { title, dek, body, category, imageUrl };
}

export async function createArticleAction(formData: FormData) {
  await requireAdmin();
  const data = articleFromForm(formData);
  if (!data) return;
  await insertArticle({
    ...data,
    slug: normalizeSlug(data.title) || fallbackSlug(),
    isAi: false,
    publishedAt: new Date(),
  });
  revalidatePath("/", "layout");
  redirect("/admin");
}

export async function updateArticleAction(id: number, formData: FormData) {
  await requireAdmin();
  const data = articleFromForm(formData);
  if (!data) return;
  await updateArticle(id, data);
  revalidatePath("/", "layout");
  redirect("/admin");
}

export async function deleteArticleAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return;
  await deleteArticle(id);
  revalidatePath("/", "layout");
}
