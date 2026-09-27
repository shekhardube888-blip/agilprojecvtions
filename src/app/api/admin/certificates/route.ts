import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureAccountsSeeded, readSession } from "@/lib/auth";

export const runtime = "nodejs";

// GET /api/admin/certificates — admin-only. Lists all issued certificates with student info.
export async function GET(req: Request) {
  try {
    await ensureAccountsSeeded();
    const session = readSession(req.headers.get("cookie"));
    if (!session || session.role !== "admin") {
      return NextResponse.json({ ok: false, error: "Admin access required." }, { status: 403 });
    }
    const certs = await db.certificate.findMany({
      orderBy: { issuedAt: "desc" },
      include: {
        student: {
          select: { firstName: true, lastName: true, email: true, degree: true, branch: true, college: true, project: true, categoryLabel: true, completedAt: true },
        },
      },
    });
    return NextResponse.json({ ok: true, count: certs.length, certificates: certs });
  } catch (err) {
    console.error("[admin/certificates] error:", err);
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}
