export const runtime = "nodejs";

import { notFound } from "next/navigation";
import { headers } from "next/headers";

import { getPaste, incrementViews } from "@/lib/paste";
import { nowMs } from "@/lib/time";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PastePage({ params }: PageProps) {
  const { id } = await params;

  // 1️⃣ Fetch paste
  const paste = await getPaste(id);
  if (!paste) {
    notFound();
  }

  // 2️⃣ Deterministic time support (for tests)
  const h = await headers();
  const testNowHeader = h.get("x-test-now-ms");
  const currentTime = nowMs(
    testNowHeader ? Number(testNowHeader) : undefined
  );

  // 3️⃣ Availability checks
  const expired =
    paste.expiresAt !== null &&
    currentTime >= paste.expiresAt;

  const viewsExceeded =
    paste.maxViews !== null &&
    paste.viewsUsed >= paste.maxViews;

  if (expired || viewsExceeded) {
    notFound();
  }

  // 4️⃣ Increment views (HTML view counts)
  const updatedPaste = await incrementViews(id);
  if (!updatedPaste) {
    notFound();
  }

  // 5️⃣ Safe HTML rendering
  return (
    <main style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h1>Paste</h1>

      <pre
        style={{
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          background: "#f5f5f5",
          padding: "1rem",
          borderRadius: "4px",
        }}
      >
        {updatedPaste.content}
      </pre>
    </main>
  );
}
