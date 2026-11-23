"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, Heart, Eye, LogOut, Home, Loader2, X, Edit3, Camera,
  Package, Users, Grid3X3, Archive, FileEdit, Check, Image as ImageIcon,
  Tag, AlignLeft, DollarSign, ShoppingBag, MessageCircle, User,
  Star, Send, ChevronLeft, Lock, Bell, Crown, Trash2, RefreshCw,
  BadgeCheck, TrendingUp
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useUser } from "@/lib/supabase-hooks";
import { VicksLogo } from "@/components/VicksLogo";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

/* ──────────────────────────────────────────
   Types
────────────────────────────────────────── */
interface MerchantProfile {
  id: string;
  full_name: string | null;
  shop_name: string | null;
  photo_url: string | null;
  bio: string | null;
  followers_count: number;
  role: string;
  membership?: string | null;
  points?: number;
  unique_id?: string | null;
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: string | null;
  description: string | null;
  image: string | null;
  images?: string[] | null;
  status: string;
  likes: number;
  views: number;
  is_vip?: boolean;
  discount_percent?: number;
  "sellerId": string | null;
  "createdAt": string;
}

interface Order {
  id: string;
  customer_name?: string;
  customer_email?: string;
  product_name?: string;
  product_id?: string;
  quantity?: number;
  total?: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  created_at: string;
}

interface Conversation {
  id: string;
  buyer_id: string;
  seller_id: string;
  product_id?: string | null;
  last_message?: string | null;
  last_message_at?: string | null;
  buyer_name?: string;
  product_name?: string;
  unread_count?: number;
}

const CATEGORIES = ["إلكترونيات", "ملابس", "أدوات منزلية", "جمال وعناية", "أحذية", "أثاث", "طعام", "أخرى"];
const ADMIN_EMAILS = ["mom1113694362@gmail.com", "vicksmarket@gmail.com", "mom01113694362@icloud.com"];

function formatNum(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "الآن";
  if (m < 60) return `${m} د`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} س`;
  return `${Math.floor(h / 24)} ي`;
}

/* ──────────────────────────────────────────
   Edit Profile Modal
────────────────────────────────────────── */
function EditProfileModal({ profile, onClose, onSave }: {
  profile: MerchantProfile; onClose: () => void;
  onSave: (data: Partial<MerchantProfile>) => Promise<void>;
}) {
  const [shopName, setShopName] = useState(profile.shop_name || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [photoUrl, setPhotoUrl] = useState(profile.photo_url || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave({ shop_name: shopName, bio, photo_url: photoUrl });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" dir="rtl">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-white dark:bg-[#1A2332] rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 space-y-4 z-10">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-black text-lg dark:text-white">تعديل الملف الشخصي</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
        <label className="block">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">رابط صورة المتجر</span>
          <div className="relative">
            <Camera className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400" />
            <input value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} placeholder="https://..."
              className="w-full h-11 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pr-10 pl-3 text-sm font-bold dark:text-white focus:outline-none focus:border-orange-400" />
          </div>
        </label>
        <label className="block">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">اسم المتجر</span>
          <input value={shopName} onChange={e => setShopName(e.target.value)} placeholder="اسم متجرك..."
            className="w-full h-11 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 text-sm font-bold dark:text-white focus:outline-none focus:border-orange-400" />
        </label>
        <label className="block">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">وصف المتجر</span>
          <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} placeholder="اكتب وصفاً قصيراً..."
            className="w-full rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm font-bold dark:text-white focus:outline-none focus:border-orange-400 resize-none" />
        </label>
        <button onClick={handleSave} disabled={saving}
          className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-2xl flex items-center justify-center gap-2 disabled:opacity-60 transition-all active:scale-95">
          {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <Check className="w-4 h-4" />}
          حفظ التغييرات
        </button>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────
   Add Product Modal
────────────────────────────────────────── */
function AddProductModal({ sellerId, sellerName, onClose, onPublished }: {
  sellerId: string; sellerName: string;
  onClose: () => void; onPublished: (p: Product) => void;
}) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [imageUrl, setImageUrl] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<"active" | "draft">("active");
  const [isVip, setIsVip] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const allImages = [...uploadedImages, ...(imageUrl.trim() ? [imageUrl.trim()] : [])];
  const primaryImage = allImages[0] || null;

  const handleFileUpload = async (files: FileList) => {
    if (!files.length) return;
    setUploading(true);
    setError("");
    try {
      const supabase = createClient();
      if (!supabase) throw new Error("تعذر الاتصال بالخادم");
      const newUrls: string[] = [];
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${sellerId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(path, file, { upsert: true });
        if (uploadError) {
          toast({ title: `⚠️ فشل رفع ${file.name}: ${uploadError.message}`, variant: "destructive" });
          continue;
        }
        const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
        if (urlData?.publicUrl) newUrls.push(urlData.publicUrl);
      }
      if (newUrls.length) {
        setUploadedImages(prev => [...prev, ...newUrls]);
        toast({ title: `✅ تم رفع ${newUrls.length} صورة` });
      }
    } catch (err: any) {
      setError(err.message || "فشل رفع الصور");
    } finally {
      setUploading(false);
    }
  };

  // Delete a file from Supabase Storage by its public URL
  const deleteStorageFile = async (url: string) => {
    try {
      const supabase = createClient();
      if (!supabase) return;
      // Extract the storage path: everything after /object/public/product-images/
      const marker = "/object/public/product-images/";
      const idx = url.indexOf(marker);
      if (idx === -1) return; // not a storage URL — skip
      const filePath = url.slice(idx + marker.length);
      await supabase.storage.from("product-images").remove([filePath]);
    } catch { /* best-effort */ }
  };

  const removeImage = async (url: string) => {
    setUploadedImages(prev => prev.filter(u => u !== url));
    if (imageUrl.trim() === url) setImageUrl("");
    // If it's a storage-uploaded file, delete it immediately
    if (url.includes("/object/public/product-images/")) {
      await deleteStorageFile(url);
    }
  };

  // On cancel: clean up any already-uploaded files that won't be linked to a product
  const handleClose = async () => {
    if (uploadedImages.length) {
      await Promise.all(uploadedImages.map(deleteStorageFile));
    }
    onClose();
  };

  const handlePublish = async () => {
    if (!name.trim()) { setError("اسم المنتج مطلوب"); return; }
    if (!price || isNaN(Number(price))) { setError("السعر مطلوب"); return; }
    setSaving(true); setError("");
    try {
      const supabase = createClient();
      const { data, error: err } = await supabase!.from("products").insert({
        name: name.trim(), price: Number(price),
        description: description.trim() || null,
        category,
        image: primaryImage,
        images: allImages.length ? allImages : null,
        status,
        seller: sellerName, "sellerId": sellerId,
        is_vip: isVip, likes: 0, views: 0, comments: 0,
        "isReported": false, "isOriginal": true,
      }).select().single();
      if (err) throw err;
      toast({ title: status === "active" ? "✅ تم نشر المنتج" : "📝 تم حفظ المسودة" });
      onPublished(data as Product);
      onClose(); // don't call handleClose — images are now linked to the product
    } catch (err: any) {
      setError(err.message || "حدث خطأ");
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" dir="rtl">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full sm:max-w-md bg-white dark:bg-[#1A2332] rounded-t-3xl sm:rounded-3xl shadow-2xl z-10 max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-[#1A2332] flex items-center justify-between px-6 pt-6 pb-4 border-b dark:border-slate-700 z-10">
          <h2 className="font-black text-lg dark:text-white">نشر منتج جديد</h2>
          <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
        <div className="p-6 space-y-4">

          {/* ── Image upload section ── */}
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 block">صور المنتج</span>

            {/* Multi-image grid */}
            {allImages.length > 0 ? (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {allImages.map((url, i) => (
                  <div key={url} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 group">
                    <img src={url} alt="" className="w-full h-full object-cover" onError={() => removeImage(url)} />
                    {i === 0 && (
                      <div className="absolute top-1 right-1 bg-orange-500 rounded-full px-1.5 py-0.5">
                        <span className="text-[8px] font-black text-white">رئيسية</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(url)}
                      className="absolute top-1 left-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity active:scale-90">
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
                {/* Add more slot */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="aspect-square rounded-xl border-2 border-dashed border-orange-200 dark:border-orange-900 flex flex-col items-center justify-center gap-1 bg-orange-50 dark:bg-orange-950/20 text-orange-300 active:scale-95 transition-all disabled:opacity-50">
                  {uploading ? <Loader2 className="w-5 h-5 animate-spin text-orange-400" /> : <Plus className="w-5 h-5" />}
                  <span className="text-[9px] font-black">{uploading ? "جاري الرفع" : "إضافة"}</span>
                </button>
              </div>
            ) : (
              /* Empty state — big upload zone */
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full h-40 rounded-2xl border-2 border-dashed border-orange-200 dark:border-orange-900 flex flex-col items-center justify-center gap-2 bg-orange-50 dark:bg-orange-950/20 text-orange-300 mb-3 active:scale-[0.98] transition-all disabled:opacity-50">
                {uploading
                  ? <><Loader2 className="w-10 h-10 animate-spin text-orange-400" /><span className="text-xs font-bold text-orange-400">جاري رفع الصور...</span></>
                  : <><Camera className="w-10 h-10" /><span className="text-xs font-black">اضغط لرفع صورة من جهازك</span><span className="text-[10px]">أو أدخل رابطاً في الأسفل</span></>
                }
              </button>
            )}

            {/* Hidden file input — accepts multiple images */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={e => e.target.files && handleFileUpload(e.target.files)}
            />

            {/* Upload button (always visible when images exist) */}
            {allImages.length > 0 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full h-11 rounded-2xl border-2 border-dashed border-orange-200 dark:border-orange-900 flex items-center justify-center gap-2 bg-orange-50 dark:bg-orange-950/20 text-orange-400 text-xs font-black mb-1 active:scale-[0.98] transition-all disabled:opacity-50">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                {uploading ? "جاري الرفع..." : "رفع صور إضافية من الجهاز"}
              </button>
            )}

            {/* URL fallback input */}
            <div className="relative mt-2">
              <ImageIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder="أو الصق رابط صورة هنا..."
                className="w-full h-10 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pr-10 pl-3 text-xs font-bold dark:text-white focus:outline-none focus:border-orange-400 text-slate-400 placeholder:text-slate-300" />
            </div>
          </div>

          <label className="block">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">اسم المنتج *</span>
            <div className="relative">
              <Tag className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400" />
              <input value={name} onChange={e => setName(e.target.value)} placeholder="مثلاً: آيفون 15 برو ماكس"
                className="w-full h-11 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pr-10 pl-3 text-sm font-bold dark:text-white focus:outline-none focus:border-orange-400" />
            </div>
          </label>
          <label className="block">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">السعر *</span>
            <div className="relative">
              <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400" />
              <input type="number" min="0" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00"
                className="w-full h-11 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pr-10 pl-3 text-sm font-bold dark:text-white focus:outline-none focus:border-orange-400" />
            </div>
          </label>
          <label className="block">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">الفئة</span>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(c => (
                <button key={c} type="button" onClick={() => setCategory(c)}
                  className={cn("px-3 py-1.5 rounded-xl text-xs font-black transition-all",
                    category === c ? "bg-orange-500 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300")}>
                  {c}
                </button>
              ))}
            </div>
          </label>
          <label className="block">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 block">وصف المنتج</span>
            <div className="relative">
              <AlignLeft className="absolute right-3 top-3 w-4 h-4 text-orange-400" />
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="اكتب وصفاً مفصلاً..."
                className="w-full rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pr-10 pl-3 pt-3 text-sm font-bold dark:text-white focus:outline-none focus:border-orange-400 resize-none" />
            </div>
          </label>

          {/* VIP toggle */}
          <button type="button" onClick={() => setIsVip(v => !v)}
            className={cn("w-full py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all",
              isVip ? "bg-yellow-400 text-black" : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300")}>
            <Star className={cn("w-4 h-4", isVip && "fill-black")} />
            {isVip ? "⭐ VIP مفعّل" : "تفعيل VIP للمنتج"}
          </button>

          {/* Status toggle */}
          <div className="flex gap-3">
            <button type="button" onClick={() => setStatus("active")}
              className={cn("flex-1 py-3 rounded-2xl font-black text-sm transition-all",
                status === "active" ? "bg-orange-500 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300")}>
              🚀 نشر فوري
            </button>
            <button type="button" onClick={() => setStatus("draft")}
              className={cn("flex-1 py-3 rounded-2xl font-black text-sm transition-all",
                status === "draft" ? "bg-slate-700 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300")}>
              📝 مسودة
            </button>
          </div>

          {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
          <button onClick={handlePublish} disabled={saving || uploading}
            className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-2xl flex items-center justify-center gap-2 disabled:opacity-60 active:scale-95 transition-all shadow-lg shadow-orange-200/50">
            {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {status === "active" ? "نشر المنتج الآن" : "حفظ المسودة"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────
   Product Card
────────────────────────────────────────── */
function ProductCard({ product, onClick }: { product: Product; onClick: () => void }) {
  return (
    <button onClick={onClick} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 group">
      {product.image
        ? <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        : <div className="w-full h-full flex items-center justify-center"><Package className="w-8 h-8 text-slate-300" /></div>
      }
      <div className="absolute bottom-1 right-1 flex items-center gap-0.5 bg-black/40 backdrop-blur-sm rounded-full px-1.5 py-0.5">
        <Heart className="w-2.5 h-2.5 text-white fill-white" />
        <span className="text-[9px] font-black text-white">{formatNum(product.likes || 0)}</span>
      </div>
      {product.is_vip && (
        <div className="absolute top-1 right-1 bg-yellow-400 rounded-full px-1.5 py-0.5">
          <span className="text-[8px] font-black text-black">VIP</span>
        </div>
      )}
      {product.status === "draft" && (
        <div className="absolute top-1 left-1 bg-slate-700/80 rounded-full px-1.5 py-0.5">
          <span className="text-[8px] font-black text-white">مسودة</span>
        </div>
      )}
      {product.status === "archived" && (
        <div className="absolute top-1 left-1 bg-red-700/80 rounded-full px-1.5 py-0.5">
          <span className="text-[8px] font-black text-white">مؤرشف</span>
        </div>
      )}
    </button>
  );
}

/* ──────────────────────────────────────────
   Orders Tab
────────────────────────────────────────── */
const ORDER_STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending:    { label: "قيد الانتظار", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  processing: { label: "قيد التجهيز",  color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  shipped:    { label: "تم الشحن",     color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  delivered:  { label: "مُسلَّم",       color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  cancelled:  { label: "ملغي",         color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

function OrdersTab({ sellerId }: { sellerId: string }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const sb = createClient();
      let q = sb.from("orders").select("*").eq("seller_id", sellerId).order("created_at", { ascending: false });
      const { data } = await q;
      setOrders((data as Order[]) || []);
    } catch { setOrders([]); }
    finally { setLoading(false); }
  }, [sellerId]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: string, status: Order["status"]) => {
    const sb = createClient();
    await sb.from("orders").update({ status }).eq("id", id);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    toast({ title: "✅ تم تحديث الحالة" });
  };

  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="animate-spin w-7 h-7 text-orange-500" />
    </div>
  );

  return (
    <div className="px-4 py-4 space-y-3" dir="rtl">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: "إجمالي", val: orders.length, color: "text-slate-700 dark:text-white" },
          { label: "قيد الانتظار", val: orders.filter(o => o.status === "pending").length, color: "text-yellow-600" },
          { label: "مُسلَّم", val: orders.filter(o => o.status === "delivered").length, color: "text-green-600" },
        ].map(s => (
          <div key={s.label} className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-3 text-center">
            <p className={cn("font-black text-2xl", s.color)}>{s.val}</p>
            <p className="text-[10px] font-bold text-slate-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {[["all", "الكل"], ["pending", "انتظار"], ["processing", "تجهيز"], ["shipped", "شحن"], ["delivered", "مُسلَّم"], ["cancelled", "ملغي"]].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)}
            className={cn("flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-black transition-all",
              filter === v ? "bg-orange-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400")}>
            {l}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <ShoppingBag className="w-8 h-8 text-slate-300" />
          </div>
          <p className="font-black text-slate-400 text-sm">لا توجد طلبات</p>
        </div>
      ) : (
        filtered.map(order => {
          const s = ORDER_STATUS_MAP[order.status] || ORDER_STATUS_MAP.pending;
          return (
            <div key={order.id} className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-black text-sm dark:text-white">{order.customer_name || "عميل"}</p>
                  <p className="text-[11px] font-bold text-slate-400 mt-0.5">{order.product_name || `طلب #${order.id.slice(-6)}`}</p>
                </div>
                <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-black flex-shrink-0", s.color)}>{s.label}</span>
              </div>
              <div className="flex items-center justify-between">
                <p className="font-black text-orange-500">{order.total ? `${order.total.toLocaleString("ar-EG")} ج` : "—"}</p>
                <p className="text-[10px] font-bold text-slate-400">{timeAgo(order.created_at)}</p>
              </div>
              {order.status === "pending" && (
                <div className="flex gap-2 pt-1">
                  <button onClick={() => updateStatus(order.id, "processing")}
                    className="flex-1 py-2 bg-orange-500 text-white text-xs font-black rounded-xl active:scale-95 transition-all">
                    قبول الطلب
                  </button>
                  <button onClick={() => updateStatus(order.id, "cancelled")}
                    className="flex-1 py-2 bg-red-50 dark:bg-red-950/20 text-red-500 text-xs font-black rounded-xl active:scale-95 transition-all border border-red-100 dark:border-red-900">
                    رفض
                  </button>
                </div>
              )}
              {order.status === "processing" && (
                <button onClick={() => updateStatus(order.id, "shipped")}
                  className="w-full py-2 bg-purple-500 text-white text-xs font-black rounded-xl active:scale-95 transition-all">
                  تأكيد الشحن
                </button>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

/* ──────────────────────────────────────────
   Messages Tab
────────────────────────────────────────── */
function MessagesTab({ sellerId }: { sellerId: string }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const loadConversations = useCallback(async () => {
    setLoading(true);
    try {
      const sb = createClient();
      const { data } = await sb.from("conversations").select("*")
        .eq("seller_id", sellerId).order("last_message_at", { ascending: false });
      setConversations((data as Conversation[]) || []);
    } catch { setConversations([]); }
    finally { setLoading(false); }
  }, [sellerId]);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  const openChat = async (conv: Conversation) => {
    setSelected(conv);
    setMsgLoading(true);
    try {
      const sb = createClient();
      const { data } = await sb.from("messages").select("*")
        .eq("conversation_id", conv.id).order("created_at", { ascending: true });
      setMessages(data || []);
    } catch { setMessages([]); }
    finally {
      setMsgLoading(false);
      setTimeout(() => bottomRef.current?.scrollIntoView(), 100);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !selected || sending) return;
    setSending(true);
    try {
      const sb = createClient();
      const { data } = await sb.from("messages").insert({
        conversation_id: selected.id,
        sender_id: sellerId,
        content: input.trim(),
      }).select().single();
      if (data) setMessages(prev => [...prev, data]);
      setInput("");
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch (e: any) {
      toast({ title: "خطأ في الإرسال", variant: "destructive" });
    } finally { setSending(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="animate-spin w-7 h-7 text-orange-500" />
    </div>
  );

  /* Chat view */
  if (selected) return (
    <div className="flex flex-col h-[calc(100vh-180px)]" dir="rtl">
      {/* Chat header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b dark:border-slate-700 bg-white dark:bg-[#0f1621]">
        <button onClick={() => setSelected(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
          <ChevronLeft className="w-4 h-4 text-slate-500" />
        </button>
        <div className="w-9 h-9 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
          <User className="w-5 h-5 text-orange-500" />
        </div>
        <div>
          <p className="font-black text-sm dark:text-white">{selected.buyer_name || "عميل"}</p>
          {selected.product_name && <p className="text-[10px] font-bold text-slate-400">{selected.product_name}</p>}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-slate-50 dark:bg-slate-900/50">
        {msgLoading
          ? <div className="flex items-center justify-center py-10"><Loader2 className="animate-spin w-5 h-5 text-orange-500" /></div>
          : messages.length === 0
            ? <p className="text-center text-slate-400 text-xs font-bold py-10">لا توجد رسائل بعد</p>
            : messages.map((m, i) => {
                const isMine = m.sender_id === sellerId;
                return (
                  <div key={m.id || i} className={cn("flex", isMine ? "justify-start" : "justify-end")}>
                    <div className={cn("max-w-[75%] px-3 py-2 rounded-2xl text-sm font-bold",
                      isMine ? "bg-orange-500 text-white rounded-tr-sm" : "bg-white dark:bg-slate-800 text-slate-700 dark:text-white rounded-tl-sm shadow-sm")}>
                      {m.content}
                    </div>
                  </div>
                );
              })
        }
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 px-4 py-3 border-t dark:border-slate-700 bg-white dark:bg-[#0f1621]">
        <button onClick={sendMessage} disabled={sending || !input.trim()}
          className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center disabled:opacity-50 active:scale-90 transition-all">
          <Send className="w-4 h-4 text-white" />
        </button>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder="اكتب رسالة..."
          className="flex-1 h-10 rounded-full border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 text-sm font-bold dark:text-white focus:outline-none focus:border-orange-400" />
      </div>
    </div>
  );

  /* Conversations list */
  return (
    <div className="px-4 py-4 space-y-2" dir="rtl">
      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <MessageCircle className="w-8 h-8 text-slate-300" />
          </div>
          <p className="font-black text-slate-400 text-sm">لا توجد رسائل بعد</p>
          <p className="text-xs text-slate-400">ستظهر محادثات العملاء هنا</p>
        </div>
      ) : (
        conversations.map(conv => (
          <button key={conv.id} onClick={() => openChat(conv)}
            className="w-full flex items-center gap-3 bg-white dark:bg-slate-800 rounded-2xl p-3.5 shadow-sm border border-slate-100 dark:border-slate-700 active:scale-[0.98] transition-all text-right">
            <div className="w-11 h-11 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
              <User className="w-6 h-6 text-orange-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-black text-sm dark:text-white truncate">{conv.buyer_name || "عميل"}</p>
                <span className="text-[10px] font-bold text-slate-400 flex-shrink-0 mr-2">
                  {conv.last_message_at ? timeAgo(conv.last_message_at) : ""}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-400 truncate mt-0.5">{conv.last_message || "..."}</p>
            </div>
            {(conv.unread_count || 0) > 0 && (
              <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-black flex items-center justify-center flex-shrink-0">
                {conv.unread_count}
              </span>
            )}
          </button>
        ))
      )}
    </div>
  );
}

/* ──────────────────────────────────────────
   Account Tab
────────────────────────────────────────── */
function AccountTab({ profile, user, onProfileUpdate }: {
  profile: MerchantProfile;
  user: any;
  onProfileUpdate: (d: Partial<MerchantProfile>) => Promise<void>;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [shopName, setShopName] = useState(profile.shop_name || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [photoUrl, setPhotoUrl] = useState(profile.photo_url || "");
  const [saving, setSaving] = useState(false);

  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [changingPass, setChangingPass] = useState(false);

  const handleSaveProfile = async () => {
    setSaving(true);
    await onProfileUpdate({ shop_name: shopName, bio, photo_url: photoUrl });
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (!currentPass || !newPass) { toast({ title: "أدخل كلمة المرور الحالية والجديدة", variant: "destructive" }); return; }
    if (newPass.length < 6) { toast({ title: "كلمة المرور الجديدة 6 أحرف على الأقل", variant: "destructive" }); return; }
    setChangingPass(true);
    try {
      const sb = createClient();
      const { error } = await sb.auth.updateUser({ password: newPass });
      if (error) throw error;
      toast({ title: "✅ تم تغيير كلمة المرور" });
      setCurrentPass(""); setNewPass("");
    } catch (e: any) {
      toast({ title: e.message || "فشل تغيير كلمة المرور", variant: "destructive" });
    } finally { setChangingPass(false); }
  };

  const handleSignOut = async () => {
    const sb = createClient();
    await sb.auth.signOut();
    router.replace("/login");
  };

  return (
    <div className="px-4 py-4 space-y-4 pb-28" dir="rtl">
      {/* Profile info card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="px-4 py-3 border-b dark:border-slate-700 flex items-center gap-2">
          <User className="w-4 h-4 text-orange-400" />
          <span className="font-black text-sm dark:text-white">بيانات المتجر</span>
        </div>
        <div className="p-4 space-y-3">
          <label className="block">
            <span className="text-[11px] font-bold text-slate-400 mb-1 block">رابط الصورة</span>
            <input value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} placeholder="https://..."
              className="w-full h-10 rounded-xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3 text-sm font-bold dark:text-white focus:outline-none focus:border-orange-400" />
          </label>
          <label className="block">
            <span className="text-[11px] font-bold text-slate-400 mb-1 block">اسم المتجر</span>
            <input value={shopName} onChange={e => setShopName(e.target.value)} placeholder="اسم متجرك..."
              className="w-full h-10 rounded-xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3 text-sm font-bold dark:text-white focus:outline-none focus:border-orange-400" />
          </label>
          <label className="block">
            <span className="text-[11px] font-bold text-slate-400 mb-1 block">وصف المتجر</span>
            <textarea value={bio} onChange={e => setBio(e.target.value)} rows={2} placeholder="اكتب وصفاً قصيراً..."
              className="w-full rounded-xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3 py-2 text-sm font-bold dark:text-white focus:outline-none focus:border-orange-400 resize-none" />
          </label>
          <button onClick={handleSaveProfile} disabled={saving}
            className="w-full py-2.5 bg-orange-500 text-white font-black text-sm rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 active:scale-95 transition-all">
            {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <Check className="w-4 h-4" />}
            حفظ البيانات
          </button>
        </div>
      </div>

      {/* Subscription card */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Crown className="w-4 h-4" />
              <span className="font-black text-sm">الباقة الحالية</span>
            </div>
            <p className="font-black text-xl">{profile.membership || "مجاني"}</p>
            <p className="text-orange-100 text-xs font-bold mt-1">النقاط: {profile.points || 0} نقطة</p>
          </div>
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
            <Star className="w-7 h-7 fill-white text-white" />
          </div>
        </div>
        <button className="mt-3 w-full py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-black text-sm rounded-xl transition-all active:scale-95">
          ترقية الباقة
        </button>
      </div>

      {/* Password card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="px-4 py-3 border-b dark:border-slate-700 flex items-center gap-2">
          <Lock className="w-4 h-4 text-orange-400" />
          <span className="font-black text-sm dark:text-white">كلمة المرور</span>
        </div>
        <div className="p-4 space-y-3">
          <input type="password" value={currentPass} onChange={e => setCurrentPass(e.target.value)} placeholder="كلمة المرور الحالية"
            className="w-full h-10 rounded-xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3 text-sm font-bold dark:text-white focus:outline-none focus:border-orange-400" />
          <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="كلمة المرور الجديدة"
            className="w-full h-10 rounded-xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3 text-sm font-bold dark:text-white focus:outline-none focus:border-orange-400" />
          <button onClick={handleChangePassword} disabled={changingPass}
            className="w-full py-2.5 bg-slate-700 dark:bg-slate-600 text-white font-black text-sm rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 active:scale-95 transition-all">
            {changingPass ? <Loader2 className="animate-spin w-4 h-4" /> : <Lock className="w-4 h-4" />}
            تغيير كلمة المرور
          </button>
        </div>
      </div>

      {/* Account info */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 space-y-2">
        <p className="font-black text-sm dark:text-white mb-3">معلومات الحساب</p>
        {[
          { label: "البريد الإلكتروني", val: user.email || "—" },
          { label: "رقم العضوية", val: profile.unique_id || "—" },
          { label: "الدور", val: profile.role || "عميل" },
        ].map(item => (
          <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-slate-50 dark:border-slate-700/50 last:border-0">
            <span className="text-xs font-bold text-slate-400">{item.label}</span>
            <span className="text-xs font-black text-slate-700 dark:text-white">{item.val}</span>
          </div>
        ))}
      </div>

      {/* Logout */}
      <button onClick={handleSignOut}
        className="w-full py-3.5 bg-red-50 dark:bg-red-950/20 border-2 border-red-100 dark:border-red-900 text-red-500 font-black text-sm rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all">
        <LogOut className="w-4 h-4" />
        تسجيل الخروج
      </button>
    </div>
  );
}

/* ──────────────────────────────────────────
   Main Dashboard
────────────────────────────────────────── */
export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const { toast } = useToast();

  const [profile, setProfile] = useState<MerchantProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [profileLoading, setProfileLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);

  /* Tab state */
  const [mainTab, setMainTab] = useState<"products" | "orders" | "messages" | "tasks" | "account">("products");
  const [productTab, setProductTab] = useState<"active" | "draft" | "archived">("active");

  /* Modals */
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const loadProfile = useCallback(async (uid: string) => {
    const supabase = createClient();
    let { data } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
    if (!data) {
      const { data: u } = await supabase.from("users").select("*").eq("id", uid).maybeSingle();
      if (u) data = {
        id: u.id, full_name: u.fullName || u.full_name, shop_name: u.shopName || u.shop_name,
        photo_url: u.photoURL || u.photo_url, bio: u.bio || null,
        followers_count: u.followers_count || 0, role: u.role,
      };
    }
    setProfile(data as MerchantProfile);
    setProfileLoading(false);
  }, []);

  const loadProducts = useCallback(async (uid: string) => {
    const supabase = createClient();
    const { data } = await supabase.from("products").select("*")
      .eq("sellerId", uid).order("createdAt", { ascending: false });
    setProducts((data as Product[]) || []);
    setProductsLoading(false);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.replace("/login"); return; }
    const isAdmin = ADMIN_EMAILS.includes(user.email || "");
    loadProfile(user.uid);
    loadProducts(user.uid);
    const metaRole = (user as any).user_metadata?.role;
    if (metaRole && metaRole !== "merchant" && !isAdmin) router.replace("/");
  }, [authLoading, user]);

  const handleSaveProfile = async (data: Partial<MerchantProfile>) => {
    if (!user) return;
    const supabase = createClient();
    const { error } = await supabase.from("profiles").update(data).eq("id", user.uid);
    if (!error) {
      setProfile(prev => prev ? { ...prev, ...data } : prev);
      toast({ title: "✅ تم حفظ التغييرات" });
    } else {
      await supabase.from("users").update({ shopName: data.shop_name, bio: data.bio, photoURL: data.photo_url }).eq("id", user.uid);
      setProfile(prev => prev ? { ...prev, ...data } : prev);
      toast({ title: "✅ تم حفظ التغييرات" });
    }
  };

  const toggleVip = async (productId: string, current: boolean) => {
    const supabase = createClient();
    await supabase.from("products").update({ is_vip: !current }).eq("id", productId);
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, is_vip: !current } : p));
    if (selectedProduct?.id === productId) setSelectedProduct(prev => prev ? { ...prev, is_vip: !current } : prev);
    toast({ title: !current ? "⭐ تم تفعيل VIP" : "تم إلغاء VIP" });
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] dark:bg-[#1A2332]">
        <Loader2 className="animate-spin w-8 h-8 text-orange-500" />
      </div>
    );
  }
  if (!user) return null;

  const totalLikes = products.reduce((sum, p) => sum + (p.likes || 0), 0);
  const tabProducts = products.filter(p => (p.status || "active") === productTab);
  const displayName = profile?.shop_name || profile?.full_name || "متجري";
  const avatarUrl = profile?.photo_url;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f1621] font-cairo" dir="rtl">
      {/* Top nav */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-[#0f1621]/80 backdrop-blur-sm border-b dark:border-slate-800 flex items-center justify-between px-4 py-3">
        <button onClick={() => router.push("/")}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
          <Home className="w-4 h-4 text-orange-500" />
        </button>
        <div className="flex items-center gap-2">
          <VicksLogo className="w-7 h-7" />
          <span className="font-black text-sm dark:text-white">لوحة التحكم</span>
        </div>
        <button onClick={() => setMainTab("account")}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
          <User className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      {/* Profile Header — always visible */}
      <div className="px-4 pt-5 pb-4 border-b dark:border-slate-800">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-orange-400 ring-offset-2 dark:ring-offset-[#0f1621] bg-orange-50">
              {avatarUrl
                ? <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-orange-600">
                    <span className="text-white font-black text-3xl">{displayName[0]}</span>
                  </div>
              }
            </div>
            {profile?.membership && (
              <div className="absolute -bottom-1 -left-1 bg-yellow-400 rounded-full p-1">
                <Crown className="w-3 h-3 text-black" />
              </div>
            )}
          </div>
          <div className="text-center">
            <h1 className="font-black text-xl dark:text-white leading-tight">{displayName}</h1>
            {profile?.full_name && profile.shop_name && (
              <p className="text-xs text-slate-400 font-bold mt-0.5">@{profile.full_name}</p>
            )}
            {profile?.bio && (
              <p className="text-sm text-slate-600 dark:text-slate-300 font-bold mt-1 max-w-xs">{profile.bio}</p>
            )}
          </div>
          <div className="flex items-center gap-8 mt-1">
            {[
              { val: formatNum(products.filter(p => (p.status || "active") === "active").length), label: "منتج" },
              { val: formatNum(profile?.followers_count || 0), label: "متابع" },
              { val: formatNum(totalLikes), label: "إعجاب" },
            ].map((s, i) => (
              <React.Fragment key={s.label}>
                {i > 0 && <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />}
                <div className="flex flex-col items-center">
                  <span className="font-black text-xl dark:text-white">{s.val}</span>
                  <span className="text-[11px] text-slate-400 font-bold mt-0.5">{s.label}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
          <button onClick={() => setShowEditModal(true)}
            className="flex items-center gap-2 px-6 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 font-black text-sm dark:text-white active:scale-95 transition-all hover:border-orange-400">
            <Edit3 className="w-3.5 h-3.5" />
            تعديل الملف الشخصي
          </button>
        </div>
      </div>

      {/* ── Products Section ── */}
      {mainTab === "products" && (
        <>
          <div className="px-4 py-3 border-b dark:border-slate-800">
            <button onClick={() => setShowAddModal(true)}
              className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] transition-all text-white font-black text-base rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-orange-200/50 dark:shadow-none">
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </div>
              نشر منتج جديد
            </button>
          </div>
          <div className="flex border-b dark:border-slate-800">
            {([
              { key: "active", label: "منشور", Icon: Grid3X3 },
              { key: "draft", label: "مسودة", Icon: FileEdit },
              { key: "archived", label: "مؤرشف", Icon: Archive },
            ] as const).map(({ key, label, Icon }) => (
              <button key={key} onClick={() => setProductTab(key)}
                className={cn("flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-black border-b-2 transition-colors",
                  productTab === key ? "border-orange-500 text-orange-500" : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300")}>
                <Icon className="w-3.5 h-3.5" />
                {label}
                <span className={cn("text-[10px] rounded-full px-1.5 py-0.5 font-black",
                  productTab === key ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30" : "bg-slate-100 dark:bg-slate-800 text-slate-400")}>
                  {products.filter(p => (p.status || "active") === key).length}
                </span>
              </button>
            ))}
          </div>
          <div className="p-1 pb-24">
            {productsLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin w-7 h-7 text-orange-500" />
              </div>
            ) : tabProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-6">
                {productTab === "active" ? (
                  <>
                    <div className="w-16 h-16 rounded-full bg-orange-50 dark:bg-orange-950/20 flex items-center justify-center">
                      <Package className="w-8 h-8 text-orange-300" />
                    </div>
                    <p className="font-black text-slate-400 text-sm">لا يوجد منتجات منشورة بعد</p>
                    <button onClick={() => setShowAddModal(true)}
                      className="px-6 py-3 bg-orange-500 text-white font-black rounded-2xl text-sm active:scale-95 transition-all">
                      انشر أول منتج
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      {productTab === "draft" ? <FileEdit className="w-8 h-8 text-slate-300" /> : <Archive className="w-8 h-8 text-slate-300" />}
                    </div>
                    <p className="font-black text-slate-400 text-sm">
                      {productTab === "draft" ? "لا توجد مسودات" : "لا توجد منتجات مؤرشفة"}
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-0.5">
                {tabProducts.map(p => (
                  <ProductCard key={p.id} product={p} onClick={() => setSelectedProduct(p)} />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Orders Section ── */}
      {mainTab === "orders" && (
        <div className="pb-24">
          <OrdersTab sellerId={user.uid} />
        </div>
      )}

      {/* ── Messages Section ── */}
      {mainTab === "messages" && (
        <div className="pb-24">
          <MessagesTab sellerId={user.uid} />
        </div>
      )}

      {/* ── Account Section ── */}
      {mainTab === "account" && profile && (
        <AccountTab profile={profile} user={user} onProfileUpdate={handleSaveProfile} />
      )}

      {/* ── Tasks Section ── */}
      {mainTab === "tasks" && (
        <div className="px-4 py-4 pb-28 space-y-3" dir="rtl">
          <p className="font-black text-sm text-slate-500 dark:text-slate-400 px-1">المهام المعلقة</p>
          {[
            { done: products.length > 0,            title: "انشر أول منتج",             sub: "أضف منتجاً واحداً على الأقل",           icon: "📦" },
            { done: !!profile?.photo_url,            title: "أضف صورة للمتجر",           sub: "صورة واضحة تزيد من الثقة",              icon: "🖼️" },
            { done: !!profile?.bio,                  title: "أكمل وصف المتجر",           sub: "أخبر العملاء عن متجرك",                 icon: "✍️" },
            { done: !!profile?.membership,           title: "فعّل عضوية VIP",            sub: "احصل على مميزات إضافية",                icon: "⭐" },
            { done: products.filter(p => p.is_vip).length > 0, title: "فعّل VIP لمنتج", sub: "اجعل منتجاً يظهر في المقدمة",          icon: "🚀" },
            { done: products.filter(p => p.status === "active").length >= 5, title: "أضف 5 منتجات نشطة", sub: `لديك ${products.filter(p => p.status === "active").length} / 5`, icon: "🎯" },
          ].map((task, i) => (
            <div key={i} className={cn(
              "flex items-center gap-3 bg-white dark:bg-slate-800 rounded-2xl p-4 border transition-all",
              task.done
                ? "border-green-100 dark:border-green-900/30 opacity-60"
                : "border-slate-100 dark:border-slate-700 shadow-sm"
            )}>
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0",
                task.done ? "bg-green-50 dark:bg-green-950/20" : "bg-orange-50 dark:bg-orange-950/20"
              )}>
                {task.done ? "✅" : task.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn("font-black text-sm", task.done ? "line-through text-slate-400" : "dark:text-white")}>{task.title}</p>
                <p className="text-[11px] font-bold text-slate-400 mt-0.5">{task.sub}</p>
              </div>
              {!task.done && <div className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />}
            </div>
          ))}

          {/* Progress bar */}
          {(() => {
            const tasks = [
              products.length > 0, !!profile?.photo_url, !!profile?.bio,
              !!profile?.membership, products.some(p => p.is_vip),
              products.filter(p => p.status === "active").length >= 5,
            ];
            const done = tasks.filter(Boolean).length;
            const pct = Math.round((done / tasks.length) * 100);
            return (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 space-y-2 mt-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm dark:text-white">اكتمال الملف</span>
                  <span className="font-black text-orange-500">{pct}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-l from-orange-500 to-orange-400 transition-all duration-500"
                    style={{ width: `${pct}%` }} />
                </div>
                <p className="text-[11px] font-bold text-slate-400">{done} من {tasks.length} مهام مكتملة</p>
              </div>
            );
          })()}
        </div>
      )}

      {/* ── Bottom Tab Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0f1621]/95 backdrop-blur-sm border-t dark:border-slate-800 flex" dir="rtl">
        {([
          { key: "products",  Icon: Grid3X3,       label: "منتجاتي",  badge: 0 },
          { key: "orders",    Icon: ShoppingBag,    label: "الطلبات",  badge: 0 },
          { key: "messages",  Icon: MessageCircle,  label: "الرسائل",  badge: 0 },
          { key: "tasks",     Icon: TrendingUp,     label: "مهامي",    badge: [!!profile?.photo_url, !!profile?.bio, !!profile?.membership, products.length > 0].filter(v => !v).length },
          { key: "account",   Icon: User,           label: "الحساب",   badge: 0 },
        ] as const).map(({ key, Icon, label, badge }) => (
          <button key={key} onClick={() => setMainTab(key as any)}
            className={cn("flex-1 flex flex-col items-center gap-1 py-3 transition-all relative",
              mainTab === key ? "text-orange-500" : "text-slate-400 dark:text-slate-500")}>
            <div className="relative">
              <Icon className={cn("w-5 h-5 transition-transform", mainTab === key && "scale-110")} />
              {badge > 0 && (
                <span className="absolute -top-1.5 -left-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center">
                  {badge}
                </span>
              )}
            </div>
            <span className="text-[10px] font-black">{label}</span>
            {mainTab === key && <div className="w-1 h-1 rounded-full bg-orange-500" />}
          </button>
        ))}
      </div>

      {/* ── Product Detail Overlay ── */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" dir="rtl">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedProduct(null)} />
          <div className="relative w-full sm:max-w-sm bg-white dark:bg-[#1A2332] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden z-10">
            {selectedProduct.image && (
              <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-52 object-cover" />
            )}
            <div className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-black text-lg dark:text-white leading-tight">{selectedProduct.name}</h3>
                  {selectedProduct.category && (
                    <span className="text-[10px] font-black text-orange-500 bg-orange-50 dark:bg-orange-950/20 px-2 py-0.5 rounded-full mt-1 inline-block">
                      {selectedProduct.category}
                    </span>
                  )}
                </div>
                <span className="font-black text-lg text-orange-500 whitespace-nowrap">
                  {Number(selectedProduct.price).toLocaleString("ar-EG")} ج
                </span>
              </div>
              {selectedProduct.description && (
                <p className="text-sm text-slate-500 dark:text-slate-400 font-bold leading-relaxed">{selectedProduct.description}</p>
              )}
              <div className="flex items-center gap-4 pt-1">
                <div className="flex items-center gap-1 text-slate-400">
                  <Heart className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold">{selectedProduct.likes}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <Eye className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold">{selectedProduct.views}</span>
                </div>
              </div>

              {/* VIP toggle */}
              <button onClick={() => toggleVip(selectedProduct.id, !!selectedProduct.is_vip)}
                className={cn("w-full py-2.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95",
                  selectedProduct.is_vip ? "bg-yellow-400 text-black" : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300")}>
                <Star className={cn("w-4 h-4", selectedProduct.is_vip && "fill-black")} />
                {selectedProduct.is_vip ? "⭐ VIP مفعّل — اضغط لإلغائه" : "تفعيل VIP للمنتج"}
              </button>

              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    const supabase = createClient();
                    const newStatus = selectedProduct.status === "active" ? "archived" : "active";
                    await supabase.from("products").update({ status: newStatus }).eq("id", selectedProduct.id);
                    setProducts(prev => prev.map(p => p.id === selectedProduct.id ? { ...p, status: newStatus } : p));
                    toast({ title: newStatus === "archived" ? "تم الأرشفة" : "تم إعادة النشر" });
                    setSelectedProduct(null);
                  }}
                  className="flex-1 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 font-black text-sm dark:text-white active:scale-95 transition-all">
                  {selectedProduct.status === "active" ? "أرشفة" : "إعادة نشر"}
                </button>
                <button
                  onClick={async () => {
                    if (!confirm("هل تريد حذف المنتج نهائياً؟")) return;
                    const supabase = createClient();
                    await supabase.from("products").delete().eq("id", selectedProduct.id);
                    setProducts(prev => prev.filter(p => p.id !== selectedProduct.id));
                    toast({ title: "🗑️ تم حذف المنتج" });
                    setSelectedProduct(null);
                  }}
                  className="flex-1 py-3 rounded-2xl bg-red-50 dark:bg-red-950/20 border-2 border-red-100 dark:border-red-900 text-red-500 font-black text-sm active:scale-95 transition-all">
                  حذف
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showAddModal && user && (
        <AddProductModal
          sellerId={user.uid} sellerName={displayName}
          onClose={() => setShowAddModal(false)}
          onPublished={p => setProducts(prev => [p, ...prev])}
        />
      )}
      {showEditModal && profile && (
        <EditProfileModal
          profile={profile}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveProfile}
        />
      )}
    </div>
  );
}
