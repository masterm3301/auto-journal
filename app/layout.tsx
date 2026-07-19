import type { Metadata } from "next";
import { Aref_Ruqaa, IBM_Plex_Sans_Arabic, Noto_Naskh_Arabic } from "next/font/google";
import Script from "next/script";
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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://majid-silk.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ماجد | أخبار المغرب",
    template: "%s | ماجد",
  },
  description: "ماجد — صحيفة إلكترونية مغربية تنشر آخر الأخبار على مدار الساعة",
  openGraph: {
    siteName: "ماجد",
    type: "website",
    locale: "ar_MA",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${arefRuqaa.variable} ${notoNaskh.variable} ${plexArabic.variable}`}
    >
      <body>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-ZQWJE6C4DZ"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-ZQWJE6C4DZ');
          `}
        </Script>
        <Masthead />
        <NavBar />
        <main className="mx-auto min-h-[60vh] max-w-6xl px-4">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
