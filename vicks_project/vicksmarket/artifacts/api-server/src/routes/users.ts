import { Router } from "express";
import { supabase } from "../lib/supabase.js";
import { requireAuth, requireAdmin, type AuthRequest } from "../middlewares/auth.js";

const router = Router();

/** GET /api/users/me — returns own profile */
router.get("/users/me", requireAuth, async (req: AuthRequest, res) => {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", req.user!.id).maybeSingle();
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json({ data });
});

/** PATCH /api/users/me — update own profile */
router.patch("/users/me", requireAuth, async (req: AuthRequest, res) => {
  const allowed = ["full_name", "shop_name", "phone", "photo_url", "location"];
  const update  = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
  const { data, error } = await supabase.from("profiles").update(update).eq("id", req.user!.id).select().single();
  if (error) { res.status(400).json({ error: error.message }); return; }
  res.json({ data });
});

/** GET /api/users — admin only, list all users */
router.get("/users", requireAuth, requireAdmin, async (_req, res) => {
  const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json({ data });
});

/** PATCH /api/users/:id/role — admin only */
router.patch("/users/:id/role", requireAuth, requireAdmin, async (req, res) => {
  const { role } = req.body;
  if (!["customer", "merchant", "admin"].includes(role)) {
    res.status(400).json({ error: "Invalid role" }); return;
  }
  const { data, error } = await supabase.from("profiles").update({ role }).eq("id", req.params.id).select().single();
  if (error) { res.status(400).json({ error: error.message }); return; }
  res.json({ data });
});

export default router;
