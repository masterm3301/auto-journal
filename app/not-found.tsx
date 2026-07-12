import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-24 text-center">
      <h1 className="text-4xl font-bold">٤٠٤</h1>
      <p className="mt-3 text-neutral-600">الصفحة التي تبحث عنها غير موجودة.</p>
      <Link href="/" className="font-sans-ar mt-6 inline-block text-sm font-bold hover:underline">
        العودة إلى الرئيسية ←
      </Link>
    </div>
  );
}
