import kv from "./kv";
import { nowMs } from "./time";

/**
 * Paste entity stored in KV
 */
export interface Paste {
  id: string;
  content: string;
  createdAt: number;
  expiresAt: number | null;
  maxViews: number | null;
  viewsUsed: number;
}

/**
 * KV key generator
 */
const pasteKey = (id: string) => `paste:${id}`;

/**
 * Save a new paste
 */
export async function savePaste(paste: Paste): Promise<void> {
  await kv.set(pasteKey(paste.id), paste);
}

/**
 * Fetch a paste by ID
 */
export async function getPaste(id: string): Promise<Paste | null> {
  const paste = await kv.get<Paste>(pasteKey(id));
  return paste ?? null;
}

/**
 * Increment views safely
 */
export async function incrementViews(id: string): Promise<Paste | null> {
  const key = pasteKey(id);
  const paste = await kv.get<Paste>(key);

  if (!paste) return null;

  paste.viewsUsed += 1;
  await kv.set(key, paste);

  return paste;
}

/**
 * Delete paste (optional cleanup)
 */
export async function deletePaste(id: string): Promise<void> {
  await kv.del(pasteKey(id));
}

/**
 * Check availability (TTL + views)
 */
export async function isPasteAvailable(paste: Paste): Promise<boolean> {
  const now = await nowMs();

  if (paste.expiresAt !== null && now >= paste.expiresAt) {
    return false;
  }

  if (paste.maxViews !== null && paste.viewsUsed >= paste.maxViews) {
    return false;
  }

  return true;
}

/**
 * Remaining views (never negative)
 */
export function getRemainingViews(paste: Paste): number | null {
  if (paste.maxViews === null) return null;
  return Math.max(paste.maxViews - paste.viewsUsed, 0);
}
