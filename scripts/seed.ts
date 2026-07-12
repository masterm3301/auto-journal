import { getDb } from "../lib/db";
import { articles, type NewArticle } from "../lib/db/schema";

const P1 =
  "أعلنت الجهات المعنية اليوم عن مستجدات مهمة تهم الرأي العام المغربي، في خطوة وصفها متتبعون بأنها تأتي في سياق دينامية متسارعة يعرفها هذا القطاع خلال الأشهر الأخيرة.";
const P2 =
  "وأوضح مصدر مطلع أن هذه الخطوة ستنعكس إيجابا على المواطنين، مشيرا إلى أن التفاصيل الكاملة سيتم الإعلان عنها في وقت لاحق بعد استكمال المشاورات الجارية مع مختلف الفاعلين.";
const P3 =
  "ويرى محللون أن هذا التطور يعكس التحولات العميقة التي يشهدها المغرب، داعين إلى مواكبته بإجراءات عملية تضمن استفادة جميع الفئات، خصوصا في المناطق التي تحتاج إلى دعم إضافي.";
const BODY = `${P1}\n\n${P2}\n\n${P3}`;

function hoursAgo(h: number): Date {
  return new Date(Date.now() - h * 3600 * 1000);
}

const SAMPLES: NewArticle[] = [
  {
    slug: "sample-government-reform-plan",
    title: "الحكومة تكشف عن خطة إصلاحية جديدة لتحديث الإدارة العمومية",
    dek: "الخطة تشمل رقمنة الخدمات وتبسيط المساطر الإدارية في أفق 2027",
    body: BODY,
    category: "politics",
    imageUrl: "https://picsum.photos/seed/majid1/1200/800",
    publishedAt: hoursAgo(1),
  },
  {
    slug: "sample-parliament-session-debate",
    title: "جلسة برلمانية ساخنة حول السياسة المائية والاستعداد لموسم الجفاف",
    dek: "نواب يطالبون بتسريع مشاريع تحلية مياه البحر",
    body: BODY,
    category: "politics",
    imageUrl: "https://picsum.photos/seed/majid2/1200/800",
    publishedAt: hoursAgo(5),
  },
  {
    slug: "sample-economy-growth-forecast",
    title: "بنك المغرب يتوقع نموا اقتصاديا يفوق 3.5 في المائة هذه السنة",
    dek: "التقرير يشير إلى تحسن مداخيل السياحة وتحويلات الجالية",
    body: BODY,
    category: "economy",
    imageUrl: "https://picsum.photos/seed/majid3/1200/800",
    publishedAt: hoursAgo(2),
  },
  {
    slug: "sample-automotive-exports-record",
    title: "صادرات قطاع السيارات تسجل رقما قياسيا جديدا",
    dek: "المغرب يعزز موقعه كأول منصة لصناعة السيارات في إفريقيا",
    body: BODY,
    category: "economy",
    imageUrl: "https://picsum.photos/seed/majid4/1200/800",
    publishedAt: hoursAgo(8),
  },
  {
    slug: "sample-atlas-lions-qualifiers",
    title: "أسود الأطلس يستعدون لمواجهة حاسمة في التصفيات الإفريقية",
    dek: "المدرب يستدعي وجوها جديدة لتعزيز الخط الأمامي",
    body: BODY,
    category: "sports",
    imageUrl: "https://picsum.photos/seed/majid5/1200/800",
    publishedAt: hoursAgo(3),
  },
  {
    slug: "sample-botola-title-race",
    title: "سباق محتدم على لقب البطولة الاحترافية قبل ثلاث جولات من النهاية",
    dek: "ثلاثة أندية يفصل بينها نقطتان فقط في صدارة الترتيب",
    body: BODY,
    category: "sports",
    imageUrl: "https://picsum.photos/seed/majid6/1200/800",
    publishedAt: hoursAgo(10),
  },
  {
    slug: "sample-school-dropout-program",
    title: "برنامج وطني جديد لمحاربة الهدر المدرسي في العالم القروي",
    dek: "البرنامج يستهدف أزيد من 200 ألف تلميذ وتلميذة",
    body: BODY,
    category: "society",
    imageUrl: "https://picsum.photos/seed/majid7/1200/800",
    publishedAt: hoursAgo(4),
  },
  {
    slug: "sample-health-coverage-expansion",
    title: "توسيع التغطية الصحية ليشمل فئات جديدة من المهنيين",
    dek: "الإجراء يهم مئات الآلاف من الأسر المغربية",
    body: BODY,
    category: "society",
    imageUrl: "https://picsum.photos/seed/majid8/1200/800",
    publishedAt: hoursAgo(12),
  },
  {
    slug: "sample-film-festival-opening",
    title: "انطلاق فعاليات مهرجان سينمائي دولي بمشاركة أفلام من 30 دولة",
    dek: "الدورة الجديدة تحتفي بالسينما الإفريقية الشابة",
    body: BODY,
    category: "culture",
    imageUrl: "https://picsum.photos/seed/majid9/1200/800",
    publishedAt: hoursAgo(6),
  },
  {
    slug: "sample-heritage-restoration",
    title: "إطلاق مشروع لترميم المدن العتيقة والحفاظ على التراث المعماري",
    dek: "المرحلة الأولى تشمل فاس ومكناس وتطوان",
    body: BODY,
    category: "culture",
    imageUrl: "https://picsum.photos/seed/majid10/1200/800",
    publishedAt: hoursAgo(15),
  },
  {
    slug: "sample-un-climate-summit",
    title: "قمة أممية حول المناخ تبحث تمويل التحول الطاقي في الدول النامية",
    dek: "المغرب يعرض تجربته في مجال الطاقات المتجددة",
    body: BODY,
    category: "world",
    imageUrl: "https://picsum.photos/seed/majid11/1200/800",
    publishedAt: hoursAgo(7),
  },
  {
    slug: "sample-trade-agreement-talks",
    title: "مفاوضات لتوسيع اتفاقيات التبادل الحر مع شركاء جدد",
    dek: "جولات تفاوضية مرتقبة خلال الأشهر المقبلة",
    body: BODY,
    category: "world",
    imageUrl: "https://picsum.photos/seed/majid12/1200/800",
    publishedAt: hoursAgo(18),
  },
  {
    slug: "sample-ai-startups-fund",
    title: "صندوق جديد لدعم الشركات الناشئة في مجال الذكاء الاصطناعي",
    dek: "غلاف مالي يناهز مليار درهم لتمويل مئة مشروع",
    body: BODY,
    category: "tech",
    imageUrl: "https://picsum.photos/seed/majid13/1200/800",
    publishedAt: hoursAgo(9),
  },
  {
    slug: "sample-fiber-optic-expansion",
    title: "توسيع شبكة الألياف البصرية لتغطية المدن المتوسطة والصغرى",
    dek: "الهدف ربط مليوني منزل إضافي بحلول نهاية السنة المقبلة",
    body: BODY,
    category: "tech",
    imageUrl: "https://picsum.photos/seed/majid14/1200/800",
    publishedAt: hoursAgo(20),
  },
];

async function main() {
  const db = await getDb();
  let inserted = 0;
  for (const sample of SAMPLES) {
    const result = await db
      .insert(articles)
      .values({ ...sample, isAi: false, sourceName: null, sourceUrl: null })
      .onConflictDoNothing({ target: articles.slug })
      .returning({ id: articles.id });
    if (result.length > 0) inserted++;
  }
  console.log(`Seed complete: ${inserted} inserted, ${SAMPLES.length - inserted} already present.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
