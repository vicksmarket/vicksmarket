"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldAlert, Tag, Loader2, Globe, Video, Coins, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser, useDoc } from "@/lib/supabase-hooks";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";

const worldCountries = [
  { name: "القاهرة", currency: "ج.م" },
  { name: "الجيزة", currency: "ج.م" },
  { name: "الإسكندرية", currency: "ج.م" },
  { name: "سوهاج", currency: "ج.م" },
  { name: "أسيوط", currency: "ج.م" },
  { name: "المنصورة", currency: "ج.م" },
  { name: "طنطا", currency: "ج.م" }
];

export default function AddProductPage() {
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();
  
  const { data: profile } = useDoc("users", user?.uid ?? null);

  const isBanned = profile?.status === 'banned' || profile?.status === 'suspended';
  const usedCount = profile?.productsCount || 0;
  const maxLimit = profile?.maxProducts || 5;
  const hasReachedLimit = usedCount >= maxLimit;

  useEffect(() => {
    if (profile && isBanned) {
      toast({ variant: "destructive", title: "خطأ في السيرفر", description: "الصفحة غير متوفرة حالياً (Error: 403)." });
      router.push('/');
    }
  }, [profile, isBanned, router, toast]);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "سوبر ماركت",
    description: "",
    imageUrl: "",
    videoUrl: "",
    discount: "",
    location: profile?.location || "القاهرة",
    tags: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile || isBanned) return;

    if (hasReachedLimit) {
      toast({ variant: "destructive", title: "وصلت للحد الأقصى!", description: "يرجى ترقية الباقة في صفحة VIP لزيادة عدد المنتجات المتاحة." });
      router.push('/vip');
      return;
    }
    
    setLoading(true);
    try {
      const supabase = createClient();
      if (!supabase) throw new Error("Supabase client not available");
      const productData = {
        name: formData.name,
        price: Number(formData.price),
        category: formData.category,
        description: formData.description,
        image: formData.imageUrl || `https://picsum.photos/seed/${Date.now()}/600/600`,
        videoUrl: formData.videoUrl,
        seller: profile.shopName || profile.fullName || "متجر فيكس",
        sellerImage: profile.photoURL || null,
        phone: profile.phone || null,
        telegram: profile.telegram || null,
        isOnline: true,
        sellerId: user.uid,
        isOriginal: profile.isVerified,
        createdAt: new Date().toISOString(),
        isReported: false,
        views: 0,
        location: formData.location,
        tags: formData.tags.split(",").map((t: string) => t.trim()).filter((t: string) => t !== "")
      };

      const { error: productError } = await supabase.from("products").insert(productData);
      if (productError) throw productError;

      await supabase.from("users").update({ productsCount: (usedCount + 1) }).eq('id', user.uid);

      toast({ title: "تمت الإضافة بنجاح", description: "تم فحص المنتج ونشره." });
      router.push("/");
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "حدث خطأ أثناء النشر." });
    } finally {
      setLoading(false);
    }
  };

  if (isBanned) return null;

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#1A2332] p-4 text-right font-cairo pb-20" dir="rtl">
      <header className="flex items-center justify-between mb-8">
        <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center bg-white dark:bg-[#252D3D] rounded-full shadow-sm">
          <ArrowLeft className="w-5 h-5 text-orange-500 rotate-180" />
        </button>
        <h1 className="font-black text-lg dark:text-white">نشر إعلان جديد</h1>
        <div className="w-10" />
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        {hasReachedLimit && (
          <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-2xl border border-red-200 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-[11px] font-bold text-red-600">وصلت للحد الأقصى ({maxLimit} منتجات). يرجى الترقية لـ VIP.</p>
          </div>
        )}

        <div className="bg-white dark:bg-[#252D3D] p-6 rounded-[2.5rem] shadow-sm border-b-4 border-orange-500 space-y-4">
          <div className="bg-orange-50 dark:bg-orange-950/20 p-3 rounded-2xl flex items-center gap-2 mb-2">
             <ShieldAlert className="w-4 h-4 text-orange-500" />
             <p className="text-[10px] font-bold text-orange-600">الحصة المتبقية: {maxLimit - usedCount} منتجات.</p>
          </div>

          <div className="space-y-1.5">
            <Label className="font-bold text-xs pr-2">اسم المنتج</Label>
            <input required disabled={hasReachedLimit} value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="ايفون 15 برو" className="w-full h-12 px-4 rounded-2xl border-2 border-orange-50 dark:bg-slate-800 outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="font-bold text-xs pr-2">السعر (ج.م)</Label>
              <input required disabled={hasReachedLimit} type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} placeholder="0.00" className="w-full h-12 px-4 rounded-2xl border-2 border-orange-50 dark:bg-slate-800 outline-none" />
            </div>
            <div className="space-y-1.5">
              <Label className="font-bold text-xs pr-2">الموقع</Label>
              <Select disabled={hasReachedLimit} value={formData.location} onValueChange={(val) => setFormData({...formData, location: val})}>
                <SelectTrigger className="h-12 rounded-2xl border-2 border-orange-50 dark:bg-slate-800">
                  <SelectValue placeholder="المحافظة" />
                </SelectTrigger>
                <SelectContent>
                  {worldCountries.map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="font-bold text-xs pr-2">رابط الصورة (اختياري)</Label>
            <input disabled={hasReachedLimit} value={formData.imageUrl} onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} placeholder="https://..." className="w-full h-12 px-4 rounded-2xl border-2 border-orange-50 dark:bg-slate-800 outline-none" />
          </div>

          <div className="space-y-1.5">
            <Label className="font-bold text-xs pr-2">وصف المنتج</Label>
            <Textarea required disabled={hasReachedLimit} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="اكتب تفاصيل المنتج..." className="rounded-2xl border-2 border-orange-50 dark:bg-slate-800 min-h-[100px]" />
          </div>
        </div>

        <Button type="submit" disabled={loading || hasReachedLimit} className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white text-lg font-black rounded-3xl shadow-xl transition-all">
          {loading ? <Loader2 className="animate-spin" /> : <span>نشر الإعلان الآن</span>}
        </Button>
      </form>
    </div>
  );
}
