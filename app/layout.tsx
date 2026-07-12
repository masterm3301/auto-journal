import type { Metadata } from "next";
import { Aref_Ruqaa, IBM_Plex_Sans_Arabic, Noto_Naskh_Arabic } from "next/font/google";
import Footer from "@/components/Footer";
import Masthead from "@/components/Masthead";
import NavBar from "@/components/NavBar";
import "./globals.css";

const arefRuqaa = Aref_Ruqaa({
  weight: ["400", "700"],
  subsets: ["arabic"],
  variable: "--font-aref-ruqaa",
});

const notoNaskh = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  variable: "--font-noto-naskh",
});

const plexArabic = IBM_Plex_Sans_Arabic({
  weight: ["400", "500", "700"],
  subsets: ["arabic"],
  variable: "--font-plex-arabic",
});

export const metadata: Metadata = {
  title: {
    default: "مجيد | أخبار المغرب",
    template: "%s | مجيد",
  },
  description: "مجيد — صحيفة إلكترونية مغربية تنشر آخر الأخبار على مدار الساعة",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${arefRuqaa.variable} ${notoNaskh.variable} ${plexArabic.variable}`}
    >
      <body>
        <Masthead />
        <NavBar />
        <main className="mx-auto min-h-[60vh] max-w-6xl px-4">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
