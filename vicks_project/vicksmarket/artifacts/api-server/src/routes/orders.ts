import { Router } from "express";
import { supabase } from "../lib/supabase.js";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";

const router = Router();

/** GET /api/orders — buyer sees own orders, merchant sees orders to them, admin sees all */
router.get("/orders", requireAuth, async (req: AuthRequest, res) => {
  let q = supabase.from("orders").select("*, products(name, image_url, price)").order("created_at", { ascending: false });
  if (req.user!.role === "admin")    { /* no filter */ }
  else if (req.user!.role === "merchant") q = q.eq("seller_id", req.user!.id);
  else                                    q = q.eq("buyer_id",  req.user!.id);
  const { data, error } = await q;
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json({ data });
});

/** POST /api/orders — any authenticated user can place an order */
router.post("/orders", requireAuth, async (req: AuthRequest, res) => {
  const body = { ...req.body, buyer_id: req.user!.id, status: "pending" };
  const { data, error } = await supabase.from("orders").insert(body).select().single();
  if (error) { res.status(400).json({ error: error.message }); return; }
  res.status(201).json({ data });
});

/** PATCH /api/orders/:id/status — merchant (own) or admin */
router.patch("/orders/:id/status", requireAuth, async (req: AuthRequest, res) => {
  const { status } = req.body;
  const allowed = ["pending","confirmed","shipped","delivered","cancelled"];
  if (!allowed.includes(status)) { res.status(400).json({ error: "Invalid status" }); return; }

  if (req.user!.role !== "admin") {
    const { data: o } = await supabase.from("orders").select("seller_id, buyer_id").eq("id", req.params.id).maybeSingle();
    const isMerchant = req.user!.role === "merchant" && o?.seller_id === req.user!.id;
    const isBuyer    = o?.buyer_id === req.user!.id && status === "cancelled";
    if (!isMerchant && !isBuyer) { res.status(403).json({ error: "Forbidden" }); return; }
  }
  const { data, error } = await supabase.from("orders").update({ status }).eq("id", req.params.id).select().single();
  if (error) { res.status(400).json({ error: error.message }); return; }
  res.json({ data });
});

export default router;
