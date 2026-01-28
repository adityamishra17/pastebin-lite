import { NextResponse } from "next/server";
import kv from "@/lib/kv";

export async function GET() {
  try {
    // Lightweight KV check
    await kv.set("healthz:ping", "ok", { ex: 5 });
    const value = await kv.get("healthz:ping");

    if (value !== "ok") {
      throw new Error("KV check failed");
    }

    return NextResponse.json(
      { ok: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json(
      { ok: false },
      { status: 500 }
    );
  }
}
