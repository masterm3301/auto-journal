// Moroccan Arabic RSS sources for the automatic pipeline. Adjust freely —
// a dead feed is skipped per-run and never blocks the others.
export const FEEDS: { name: string; url: string }[] = [
  { name: "هسبريس", url: "https://www.hespress.com/feed" },
  { name: "اليوم 24", url: "https://alyaoum24.com/feed" },
  { name: "Le360 عربية", url: "https://ar.le360.ma/arc/outboundfeeds/rss/?outputType=xml" },
  { name: "SNRT نيوز", url: "https://snrtnews.com/rss.xml" },
  { name: "هبة بريس", url: "https://ar.hibapress.com/feed" },
];
