import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";

export default function Footer() {
  return (
    <footer className="mt-12 border-t-2 border-ink bg-neutral-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <p className="font-masthead text-3xl">مجيد</p>
        <p className="font-sans-ar mt-2 max-w-xl text-sm text-neutral-600">
          صحيفة إلكترونية مغربية تجمع الأخبار من مصادر موثوقة وتعيد تحريرها آليا على مدار
          الساعة، مع الإشارة إلى المصدر الأصلي لكل خبر.
        </p>
        <ul className="font-sans-ar mt-4 flex flex-wrap gap-4 text-sm">
          {CATEGORIES.map((category) => (
            <li key={category.slug}>
              <Link href={`/section/${category.slug}`} className="hover:underline">
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
        <p className="font-sans-ar mt-6 text-xs text-neutral-400">
          © {new Date().getFullYear()} مجيد — جميع الحقوق محفوظة
        </p>
      </div>
    </footer>
  );
}
