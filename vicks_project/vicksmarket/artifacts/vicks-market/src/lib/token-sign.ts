/**
 * Stateless HMAC-signed reset tokens — survive server restarts and hot-reloads.
 * Payload is base64url-encoded JSON; signature uses SESSION_SECRET via HMAC-SHA256.
 */

import { createHmac } from "crypto";

const SECRET = process.env.SESSION_SECRET || "fallback-secret-change-me";
const ALGO   = "sha256";

function b64url(s: string): string {
  return Buffer.from(s).toString("base64url");
}

function b64urlDecode(s: string): string {
  return Buffer.from(s, "base64url").toString("utf8");
}

function sign(payload: string): string {
  return createHmac(ALGO, SECRET).update(payload).digest("base64url");
}

/** Create a signed token encoding { email, exp }. TTL is in ms. */
export function createResetToken(email: string, ttlMs: number): string {
  const payload = b64url(JSON.stringify({ email: email.toLowerCase(), exp: Date.now() + ttlMs }));
  const sig = sign(payload);
  return `${payload}.${sig}`;
}

/** Verify and decode a reset token. Returns email if valid, null otherwise. */
export function verifyResetToken(token: string): string | null {
  try {
    const [payload, sig] = token.split(".");
    if (!payload || !sig) return null;
    const expected = sign(payload);
    if (sig !== expected) return null;
    const { email, exp } = JSON.parse(b64urlDecode(payload));
    if (!email || typeof exp !== "number" || Date.now() > exp) return null;
    return email as string;
  } catch {
    return null;
  }
}
