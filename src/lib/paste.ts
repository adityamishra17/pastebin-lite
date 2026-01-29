import redis from "./kv";

export interface Paste {
  id: string;
  content: string;
  createdAt: number;
  expiresAt: number | null;
  maxViews: number | null;
  viewsUsed: number;
}

const pasteKey = (id: string) => `paste:${id}`;

export async function savePaste(paste: Paste): Promise<void> {
  await redis.set(pasteKey(paste.id), JSON.stringify(paste));
}

export async function getPaste(id: string): Promise<Paste | null> {
  const data = await redis.get(pasteKey(id));
  return data ? JSON.parse(data) : null;
}

export async function incrementViews(id: string): Promise<Paste | null> {
  const paste = await getPaste(id);
  if (!paste) return null;

  paste.viewsUsed += 1;
  await savePaste(paste);
  return paste;
}

export async function deletePaste(id: string): Promise<void> {
  await redis.del(pasteKey(id));
}

export function getRemainingViews(paste: Paste): number | null {
  if (paste.maxViews === null) return null;
  return Math.max(paste.maxViews - paste.viewsUsed, 0);
}
