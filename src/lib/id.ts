import crypto from "crypto";

export function generateId(): string {
  return crypto.randomBytes(6).toString("hex");
}
