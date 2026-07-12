import Link from "next/link";
import { todayArabic } from "@/lib/format";

export default function Masthead() {
  return (
    <header className="border-b-2 border-ink">
      <div className="mx-auto max-w-6xl px-4 pt-4 pb-3 text-center">
        <p className="font-sans-ar text-xs text-neutral-500">{todayArabic()}</p>
        <Link href="/" className="inline-block">
          <h1 className="font-masthead text-5xl leading-tight sm:text-6xl">مجيد</h1>
        </Link>
        <p className="font-sans-ar mt-1 text-[11px] tracking-wide text-neutral-500">
          صحيفة إلكترونية مغربية — الأخبار على مدار الساعة
        </p>
      </div>
    </header>
  );
}
