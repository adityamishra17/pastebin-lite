export const runtime = "nodejs";

import { NextResponse } from "next/server";
import redis from "@/lib/kv";

export async function GET() {
  try {
    await redis.set("healthz:ping", "ok", "EX", 5);
    const value = await redis.get("healthz:ping");

    if (value !== "ok") {
      throw new Error("Redis failed");
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
