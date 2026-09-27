import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

// GET /api/certificate/[number] — public verification.
// Returns the certificate + student info so anyone can verify a certificate
// by its number (e.g. AP-2026-A1B2C3).
export async function GET(_req: Request, { params }: { params: Promise<{ number: string }> }) {
  try {
    const { number } = await params;
    const cert = await db.certificate.findUnique({
      where: { certificateNumber: number.toUpperCase() },
      include: {
        student: {
          select: {
            firstName: true, lastName: true, email: true, degree: true, branch: true,
            college: true, project: true, categoryLabel: true, completedAt: true,
          },
        },
      },
    });
    if (!cert) {
      return NextResponse.json({ ok: false, error: "Certificate not found. Please check the number." }, { status: 404 });
    }
    return NextResponse.json({
      ok: true,
      certificate: {
        certificateNumber: cert.certificateNumber,
        type: cert.type,
        eligibility: cert.eligibility,
        issuedAt: cert.issuedAt,
        student: cert.student,
      },
    });
  } catch (err) {
    console.error("[certificate/[number]] error:", (err as Error).message);
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}
