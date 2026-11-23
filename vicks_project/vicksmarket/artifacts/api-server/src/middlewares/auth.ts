import type { Request, Response, NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl  = process.env.SUPABASE_URL  || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceKey   = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export interface AuthRequest extends Request {
  user?: { id: string; email?: string; role?: string };
}

/** Validates Supabase JWT and attaches user to req.user */
export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing Authorization header" });
    return;
  }
  const token = header.slice(7);
  try {
    const sb = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    const { data: { user }, error } = await sb.auth.getUser(token);
    if (error || !user) {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }
    // fetch role from profiles table
    const { data: profile } = await sb.from("profiles").select("role").eq("id", user.id).maybeSingle();
    req.user = { id: user.id, email: user.email, role: profile?.role || user.user_metadata?.role || "customer" };
    next();
  } catch {
    res.status(401).json({ error: "Auth error" });
  }
}

/** Only allows merchant or admin */
export function requireMerchant(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) { res.status(401).json({ error: "Unauthenticated" }); return; }
  if (!["merchant", "admin"].includes(req.user.role || "")) {
    res.status(403).json({ error: "Merchant or admin role required" });
    return;
  }
  next();
}

/** Only allows admin */
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) { res.status(401).json({ error: "Unauthenticated" }); return; }
  if (req.user.role !== "admin") {
    res.status(403).json({ error: "Admin role required" });
    return;
  }
  next();
}
