export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

import {
  getPaste,
  incrementViews,
  getRemainingViews
} from "@/lib/paste";
import { nowMs } from "@/lib/time";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // ---- Fetch paste ----
  const paste = await getPaste(id);

  if (!paste) {
    return NextResponse.json(
      { error: "Paste not found" },
      { status: 404 }
    );
  }

  // ---- Deterministic time (for tests) ----
  const h = await headers();
  const testNowHeader = h.get("x-test-now-ms");
  const currentTime = nowMs(
    testNowHeader ? Number(testNowHeader) : undefined
  );

  // ---- Availability check ----
  const expired =
    paste.expiresAt !== null &&
    currentTime >= paste.expiresAt;

  const viewsExceeded =
    paste.maxViews !== null &&
    paste.viewsUsed >= paste.maxViews;

  if (expired || viewsExceeded) {
    return NextResponse.json(
      { error: "Paste unavailable" },
      { status: 404 }
    );
  }

  // ---- Increment views (successful fetch counts) ----
  const updatedPaste = await incrementViews(id);

  if (!updatedPaste) {
    return NextResponse.json(
      { error: "Paste unavailable" },
      { status: 404 }
    );
  }

  // ---- Build response ----
  return NextResponse.json(
    {
      content: updatedPaste.content,
      remaining_views: getRemainingViews(updatedPaste),
      expires_at:
        updatedPaste.expiresAt !== null
          ? new Date(updatedPaste.expiresAt).toISOString()
          : null
    },
    { status: 200 }
  );
}
