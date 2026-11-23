import { Router } from "express";
import { supabase } from "../lib/supabase.js";
import { requireAuth, requireMerchant, type AuthRequest } from "../middlewares/auth.js";

const router = Router();

/** GET /api/merchant/products — own products only */
router.get("/merchant/products", requireAuth, requireMerchant, async (req: AuthRequest, res) => {
  try {
    const { status } = req.query;
    let q = supabase
      .from("products")
      .select("*")
      .eq("sellerId", req.user!.id)
      .order("createdAt", { ascending: false });
    if (status) q = q.eq("status", status as string);
    const { data, error } = await q;
    if (error) throw error;
    res.json({ data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/** POST /api/merchant/products — create product */
router.post("/merchant/products", requireAuth, requireMerchant, async (req: AuthRequest, res) => {
  try {
    const body = {
      ...req.body,
      sellerId: req.user!.id,
      likes: 0,
      views: 0,
      comments: 0,
      isReported: false,
    };
    const { data, error } = await supabase.from("products").insert(body).select().single();
    if (error) throw error;
    res.status(201).json({ data });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/** PATCH /api/merchant/products/:id — update own product */
router.patch("/merchant/products/:id", requireAuth, requireMerchant, async (req: AuthRequest, res) => {
  try {
    const { data: existing } = await supabase
      .from("products").select("sellerId").eq("id", req.params.id).maybeSingle();
    if (!existing || existing.sellerId !== req.user!.id) {
      res.status(403).json({ error: "ليس منتجك" }); return;
    }
    const { data, error } = await supabase
      .from("products").update(req.body).eq("id", req.params.id).select().single();
    if (error) throw error;
    res.json({ data });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/** PUT /api/merchant/profile — update merchant profile */
router.put("/merchant/profile", requireAuth, requireMerchant, async (req: AuthRequest, res) => {
  try {
    const allowed = ["shop_name", "bio", "photo_url", "phone", "location"];
    const patch: Record<string, any> = {};
    for (const key of allowed) {
      if (key in req.body) patch[key] = req.body[key];
    }
    const { data, error } = await supabase
      .from("profiles").update(patch).eq("id", req.user!.id).select().single();
    if (error) throw error;
    res.json({ data });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
