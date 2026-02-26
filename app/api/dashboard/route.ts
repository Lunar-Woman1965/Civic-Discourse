// app/api/dashboard/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  // Minimal “proof of life” query. Swap to real dashboard queries after it runs.
  const [userCount, postCount] = await Promise.all([
    prisma.user.count().catch(() => 0),
    prisma.post.count().catch(() => 0),
  ]);

  return NextResponse.json({
    ok: true,
    userCount,
    postCount,
    ts: new Date().toISOString(),
  });
}