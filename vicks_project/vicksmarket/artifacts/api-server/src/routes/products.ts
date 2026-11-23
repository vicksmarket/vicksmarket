import { Router } from "express";
import { supabase } from "../lib/supabase.js";
import { requireAuth, requireMerchant, type AuthRequest } from "../middlewares/auth.js";

const router = Router();

/** GET /api/products — public, supports ?mall=&category=&limit=&search= */
router.get("/products", async (req, res) => {
  try {
    let q = supabase.from("products").select("*").order("created_at", { ascending: false });
    if (req.query.mall)     q = q.eq("mall", req.query.mall as string);
    if (req.query.category) q = q.eq("category", req.query.category as string);
    if (req.query.search)   q = q.ilike("name", `%${req.query.search}%`);
    if (req.query.seller_id) q = q.eq("seller_id", req.query.seller_id as string);
    q = q.limit(Number(req.query.limit) || 50);
    const { data, error } = await q;
    if (error) throw error;
    res.json({ data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/** GET /api/products/:id — public */
router.get("/products/:id", async (req, res) => {
  const { data, error } = await supabase.from("products").select("*").eq("id", req.params.id).maybeSingle();
  if (error) { res.status(500).json({ error: error.message }); return; }
  if (!data)  { res.status(404).json({ error: "Product not found" }); return; }
  res.json({ data });
});

/** POST /api/products — merchant/admin only */
router.post("/products", requireAuth, requireMerchant, async (req: AuthRequest, res) => {
  const body = { ...req.body, seller_id: req.user!.id };
  const { data, error } = await supabase.from("products").insert(body).select().single();
  if (error) { res.status(400).json({ error: error.message }); return; }
  res.status(201).json({ data });
});

/** PATCH /api/products/:id — merchant (own) or admin */
router.patch("/products/:id", requireAuth, requireMerchant, async (req: AuthRequest, res) => {
  // verify ownership unless admin
  if (req.user!.role !== "admin") {
    const { data: existing } = await supabase.from("products").select("seller_id").eq("id", req.params.id).maybeSingle();
    if (!existing || existing.seller_id !== req.user!.id) {
      res.status(403).json({ error: "Not your product" }); return;
    }
  }
  const { data, error } = await supabase.from("products").update(req.body).eq("id", req.params.id).select().single();
  if (error) { res.status(400).json({ error: error.message }); return; }
  res.json({ data });
});

/** DELETE /api/products/:id — merchant (own) or admin */
router.delete("/products/:id", requireAuth, requireMerchant, async (req: AuthRequest, res) => {
  if (req.user!.role !== "admin") {
    const { data: existing } = await supabase.from("products").select("seller_id").eq("id", req.params.id).maybeSingle();
    if (!existing || existing.seller_id !== req.user!.id) {
      res.status(403).json({ error: "Not your product" }); return;
    }
  }
  const { error } = await supabase.from("products").delete().eq("id", req.params.id);
  if (error) { res.status(400).json({ error: error.message }); return; }
  res.json({ success: true });
});

/** POST /api/products/:id/like — public (optimistic) */
router.post("/products/:id/like", async (req, res) => {
  const { data: p } = await supabase.from("products").select("likes").eq("id", req.params.id).maybeSingle();
  if (!p) { res.status(404).json({ error: "Not found" }); return; }
  const { data, error } = await supabase.from("products").update({ likes: (p.likes || 0) + 1 }).eq("id", req.params.id).select("likes").single();
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json({ likes: data.likes });
});

/** POST /api/products/:id/rate — body: { rating: 1-5 } */
router.post("/products/:id/rate", async (req, res) => {
  const newRating = Number(req.body.rating);
  if (!newRating || newRating < 1 || newRating > 5) { res.status(400).json({ error: "rating must be 1-5" }); return; }
  const { data: p } = await supabase.from("products").select("rating, rating_count").eq("id", req.params.id).maybeSingle();
  if (!p) { res.status(404).json({ error: "Not found" }); return; }
  const count = (p.rating_count || 0) + 1;
  const avg   = ((Number(p.rating) * (count - 1)) + newRating) / count;
  const { data, error } = await supabase.from("products").update({ rating: avg.toFixed(2), rating_count: count }).eq("id", req.params.id).select("rating,rating_count").single();
  if (error) { res.status(500).json({ error: error.message }); return; }
  res.json({ rating: data.rating, rating_count: data.rating_count });
});

export default router;
