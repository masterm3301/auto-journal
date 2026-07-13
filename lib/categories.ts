export const CATEGORIES = [
  { slug: "politics", name: "سياسة" },
  { slug: "economy", name: "اقتصاد" },
  { slug: "sports", name: "رياضة" },
  { slug: "society", name: "مجتمع" },
  { slug: "culture", name: "ثقافة" },
  { slug: "world", name: "حروب", focus: "أخبار الحروب والنزاعات المسلحة وتطوراتها فقط" },
  { slug: "tech", name: "ستارتب", focus: "أخبار التمويل والاستثمار في الشركات الناشئة وريادة الأعمال" },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];

export const CATEGORY_SLUGS = CATEGORIES.map((c) => c.slug) as string[];

export function isCategorySlug(value: string): value is CategorySlug {
  return CATEGORY_SLUGS.includes(value);
}

export function categoryName(slug: string): string {
  return CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;
}
