/**
 * In-memory OTP store — no database tables required.
 * Entries expire automatically after TTL.
 * Works within a single Node.js process (Next.js on Replit).
 */

interface OtpEntry {
  code: string;
  expiresAt: number; // Unix ms
}

const store = new Map<string, OtpEntry>();

/** Sweep expired entries (called on every write to keep memory tidy) */
function sweep() {
  const now = Date.now();
  for (const [k, v] of store) {
    if (v.expiresAt < now) store.delete(k);
  }
}

/** Save or overwrite an OTP for a key (email / token). */
export function otpSave(key: string, code: string, ttlMs: number) {
  sweep();
  store.set(key.toLowerCase(), { code, expiresAt: Date.now() + ttlMs });
}

/** Verify and consume an OTP. Returns true only if code matches and not expired. */
export function otpVerify(key: string, code: string): boolean {
  const entry = store.get(key.toLowerCase());
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) { store.delete(key.toLowerCase()); return false; }
  if (entry.code !== code) return false;
  store.delete(key.toLowerCase()); // one-time use
  return true;
}

/** Check if a key exists (without consuming). */
export function otpExists(key: string): boolean {
  const entry = store.get(key.toLowerCase());
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) { store.delete(key.toLowerCase()); return false; }
  return true;
}

/** Get the stored code for a key without consuming it (for token→email lookups). */
export function otpGet(key: string): string | null {
  const entry = store.get(key.toLowerCase());
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { store.delete(key.toLowerCase()); return null; }
  return entry.code;
}
