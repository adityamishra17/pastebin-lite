export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { generateId } from "@/lib/id";
import {
    savePaste,
    Paste
} from "@/lib/paste";
import { nowMs } from "@/lib/time";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const { content, ttl_seconds, max_views } = body;

        // ---- Validation ----
        if (
            typeof content !== "string" ||
            content.trim().length === 0
        ) {
            return NextResponse.json(
                { error: "content must be a non-empty string" },
                { status: 400 }
            );
        }

        if (
            ttl_seconds !== undefined &&
            (!Number.isInteger(ttl_seconds) || ttl_seconds < 1)
        ) {
            return NextResponse.json(
                { error: "ttl_seconds must be an integer >= 1" },
                { status: 400 }
            );
        }

        if (
            max_views !== undefined &&
            (!Number.isInteger(max_views) || max_views < 1)
        ) {
            return NextResponse.json(
                { error: "max_views must be an integer >= 1" },
                { status: 400 }
            );
        }

        // ---- Time handling (deterministic for tests) ----
        const h = await headers();
        const testNowHeader = h.get("x-test-now-ms");
        const currentTime = nowMs(
            testNowHeader ? Number(testNowHeader) : undefined
        );

        const expiresAt =
            ttl_seconds !== undefined
                ? currentTime + ttl_seconds * 1000
                : null;

        // ---- Create paste ----
        const id = generateId();

        const paste: Paste = {
            id,
            content,
            createdAt: currentTime,
            expiresAt,
            maxViews: max_views ?? null,
            viewsUsed: 0
        };

        await savePaste(paste);

        // ---- Build URL ----
        const host =
            req.headers.get("x-forwarded-host") ??
            req.headers.get("host");

        const protocol =
            req.headers.get("x-forwarded-proto") ?? "http";

        const origin = `${protocol}://${host}`;


        return NextResponse.json(
            {
                id,
                url: `${origin}/p/${id}`
            },
            { status: 201 }
        );

    } catch (error) {
        return NextResponse.json(
            { error: "Invalid JSON body" },
            { status: 400 }
        );
    }
}
