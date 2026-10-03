import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

// GET /api/track/stats — live page-view + unique-visitor + online-now counts.
// `onlineNow` = visitors whose lastSeen is within the last 5 minutes.
export async function GET() {
  try {
    const aggregate = await db.visitor.aggregate({
      _sum: { views: true },
      _count: true,
    });
    const totalViews = aggregate._sum.views ?? 0;
    const uniqueVisitors = aggregate._count ?? 0;
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    const onlineNow = await db.visitor.count({
      where: { lastSeen: { gte: fiveMinAgo } },
    });
    return NextResponse.json({
      ok: true,
      totalViews,
      uniqueVisitors,
      onlineNow,
    });
  } catch (err) {
    console.error("[track/stats] error:", (err as Error).message);
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}
