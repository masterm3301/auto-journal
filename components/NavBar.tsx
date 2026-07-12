import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";

export default function NavBar() {
  return (
    <nav className="sticky top-0 z-20 border-b border-rule bg-white">
      <div className="mx-auto max-w-6xl overflow-x-auto px-4">
        <ul className="font-sans-ar flex items-center justify-center gap-6 whitespace-nowrap py-2.5 text-sm font-medium">
          <li>
            <Link href="/" className="hover:text-neutral-500">
              الرئيسية
            </Link>
          </li>
          {CATEGORIES.map((category) => (
            <li key={category.slug}>
              <Link href={`/section/${category.slug}`} className="hover:text-neutral-500">
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
