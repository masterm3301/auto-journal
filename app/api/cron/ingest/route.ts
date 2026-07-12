import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { runIngest, type RunSummary } from "@/lib/pipeline/ingest";
import { hasApiKey } from "@/lib/pipeline/rewrite";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

async function handle(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!hasApiKey()) {
    return NextResponse.json(
      { error: "GROQ_API_KEY is not configured" },
      { status: 503 },
    );
  }

  // Last-resort guard: respond before the GitHub Actions curl (290s) and
  // Vercel's function limit (300s) give up, even if a dependency hangs in a
  // way the pipeline's own deadline can't see. Unfinished items are simply
  // picked up by the next run.
  const hardTimeout = new Promise<RunSummary>((resolve) =>
    setTimeout(
      () =>
        resolve({
          feedsOk: 0,
          feedsFailed: 0,
          candidates: 0,
          published: 0,
          errors: ["hard timeout: run did not finish within 250s — items deferred to next run"],
        }),
      250_000,
    ),
  );
  const summary = await Promise.race([runIngest(), hardTimeout]);
  if (summary.published > 0) {
    revalidatePath("/", "layout");
  }
  return NextResponse.json(summary);
}

export async function POST(request: NextRequest) {
  return handle(request);
}

export async function GET(request: NextRequest) {
  return handle(request);
}
