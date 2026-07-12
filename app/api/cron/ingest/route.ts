import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { runIngest } from "@/lib/pipeline/ingest";
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

  const summary = await runIngest();
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
