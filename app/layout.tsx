import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "مجيد | أخبار المغرب",
  description: "مجيد — صحيفة إلكترونية مغربية تنشر آخر الأخبار على مدار الساعة",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
