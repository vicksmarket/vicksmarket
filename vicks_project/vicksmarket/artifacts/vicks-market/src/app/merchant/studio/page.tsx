"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Store, ShoppingBag, Zap, Plus, Loader2, Save, ArrowRight, Settings, Phone, Globe, LayoutDashboard, Sparkles
} from "lucide-react";
import { useUser, useDoc } from "@/lib/supabase-hooks";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { VicksLogo } from "@/components/VicksLogo";
import { cn } from "@/lib/utils";

export default function MerchantStudioPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const { toast } = useToast();
  
  const { data: profile } = useDoc("users", user?.uid ?? null);

  const [loading, setLoading] = useState(false);
  
  const [shopData, setShopData] = useState({
    shopName: "", phone: "", telegram: "", photoURL: "", coverURL: ""
  });
  const [prodData, setProdData] = useState({
    name: "", price: "", description: "", category: "إلكترونيات", image: ""
  });
  const [storyImage, setStoryImage] = useState("");
  const [targetProductId, setTargetProductId] = useState("");

  useEffect(() => {
    if (profile) {
      setShopData({
        shopName: profile.shopName || profile.fullName || "",
        phone: profile.phone || "",
        telegram: profile.telegram || "",
        photoURL: profile.photoURL || "",
        coverURL: profile.coverURL || ""
      });
    }
  }, [profile]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const supabase = createClient();
      await supabase.from("users").update({ ...shopData, role: "merchant" }).eq('id', user.uid);
      toast({ title: "تم تحديث بيانات المتجر ✅" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل التحديث" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!user || !profile) return;
    setLoading(true);
    try {
      const supabase = createClient();
      await supabase.from("products").insert({
        ...prodData,
        price: Number(prodData.price),
        seller: profile.shopName || profile.fullName,
        sellerId: user.uid,
        isOriginal: profile.isVerified,
        createdAt: new Date().toISOString(),
        views: 0,
        rating: 5
      });
      toast({ title: "تم نشر المنتج بنجاح 🛍️" });
      setProdData({ name: "", price: "", description: "", category: "إلكترونيات", image: "" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل النشر" });
    } finally {
      setLoading(false);
    }
  };

  const handlePostStory = async () => {
    if (!user || !profile) return;
    setLoading(true);
    try {
      const supabase = createClient();
      await supabase.from("stories").insert({
        sellerId: user.uid,
        sellerName: profile.shopName || profile.fullName,
        sellerImage: profile.photoURL || "",
        image: storyImage || `https://picsum.photos/seed/${Date.now()}/1080/1920`,
        productId: targetProductId || null,
        isGold: profile.verificationType === 'gold',
        createdAt: new Date().toISOString(),
        expiresAt: Date.now() + (24 * 60 * 60 * 1000)
      });
      toast({ title: "تم نشر الاستوري! 🔥" });
      setStoryImage("");
    } catch (e) {
      toast({ variant: "destructive", title: "فشل النشر" });
    } finally {
      setLoading(false);
    }
  };

  if (userLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-orange-500" /></div>;
  if (!user) { router.push('/login'); return null; }

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#1A2332] font-cairo pb-24 text-right" dir="rtl">
      <header className="sticky top-0 z-50 bg-white dark:bg-[#1A2332] border-b dark:border-slate-800 px-4 py-3 flex items-center justify-between shadow-sm">
        <button onClick={() => router.back()} className="w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
          <ArrowRight className="w-4 h-4 text-slate-600" />
        </button>
        <div className="flex items-center gap-2">
          <span className="font-black text-sm dark:text-white">ستوديو التاجر</span>
          <Sparkles className="w-4 h-4 text-orange-500" />
        </div>
        <VicksLogo className="w-8 h-8" />
      </header>

      <main className="max-w-md mx-auto p-4">
        <Tabs defaultValue="profile" dir="rtl">
          <TabsList className="w-full rounded-2xl bg-slate-100 dark:bg-slate-800 mb-6">
            <TabsTrigger value="profile" className="flex-1 rounded-xl font-black text-[11px]"><Settings className="w-3 h-3 ml-1" />الملف</TabsTrigger>
            <TabsTrigger value="product" className="flex-1 rounded-xl font-black text-[11px]"><ShoppingBag className="w-3 h-3 ml-1" />منتج</TabsTrigger>
            <TabsTrigger value="story" className="flex-1 rounded-xl font-black text-[11px]"><Zap className="w-3 h-3 ml-1" />ستوري</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <div className="bg-white dark:bg-[#252D3D] p-5 rounded-[2.5rem] shadow-sm space-y-3">
              <h3 className="font-black text-sm dark:text-white flex items-center gap-2"><Store className="w-4 h-4 text-orange-500" />بيانات المتجر</h3>
              {[
                { key: "shopName", label: "اسم المتجر", icon: <Store className="w-4 h-4 text-orange-500" /> },
                { key: "phone", label: "رقم الواتساب", icon: <Phone className="w-4 h-4 text-green-500" /> },
                { key: "telegram", label: "يوزر تليجرام", icon: <Globe className="w-4 h-4 text-blue-500" /> },
                { key: "photoURL", label: "رابط صورة الملف", icon: <LayoutDashboard className="w-4 h-4 text-slate-400" /> },
              ].map(f => (
                <div key={f.key} className="relative">
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">{f.icon}</div>
                  <Input value={(shopData as any)[f.key]} onChange={e => setShopData({...shopData, [f.key]: e.target.value})}
                    placeholder={f.label} className="h-12 rounded-2xl border-2 border-slate-100 dark:border-slate-700 pr-10 font-bold dark:bg-slate-900" />
                </div>
              ))}
              <Button onClick={handleUpdateProfile} disabled={loading} className="w-full h-12 bg-orange-500 text-white font-black rounded-2xl">
                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <><Save className="w-4 h-4 ml-2" />حفظ التعديلات</>}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="product" className="space-y-4">
            <div className="bg-white dark:bg-[#252D3D] p-5 rounded-[2.5rem] shadow-sm space-y-3">
              <h3 className="font-black text-sm dark:text-white flex items-center gap-2"><ShoppingBag className="w-4 h-4 text-blue-500" />نشر منتج جديد</h3>
              {[
                { key: "name", label: "اسم المنتج" },
                { key: "price", label: "السعر", type: "number" },
                { key: "image", label: "رابط الصورة" },
              ].map(f => (
                <Input key={f.key} type={f.type || "text"} value={(prodData as any)[f.key]}
                  onChange={e => setProdData({...prodData, [f.key]: e.target.value})}
                  placeholder={f.label} className="h-12 rounded-2xl border-2 border-slate-100 dark:border-slate-700 font-bold dark:bg-slate-900" />
              ))}
              <Textarea value={prodData.description} onChange={e => setProdData({...prodData, description: e.target.value})}
                placeholder="وصف المنتج..." className="rounded-2xl border-2 border-slate-100 dark:border-slate-700 font-bold dark:bg-slate-900" />
              <Button onClick={handleAddProduct} disabled={loading || !prodData.name} className="w-full h-12 bg-blue-600 text-white font-black rounded-2xl">
                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <><Plus className="w-4 h-4 ml-2" />نشر المنتج</>}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="story" className="space-y-4">
            <div className="bg-white dark:bg-[#252D3D] p-5 rounded-[2.5rem] shadow-sm space-y-3">
              <h3 className="font-black text-sm dark:text-white flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-500" />نشر ستوري (24 ساعة)</h3>
              <Input value={storyImage} onChange={e => setStoryImage(e.target.value)}
                placeholder="رابط صورة الستوري (1080×1920)" className="h-12 rounded-2xl border-2 border-slate-100 dark:border-slate-700 font-bold dark:bg-slate-900" />
              <Input value={targetProductId} onChange={e => setTargetProductId(e.target.value)}
                placeholder="ID المنتج المرتبط (اختياري)" className="h-12 rounded-2xl border-2 border-slate-100 dark:border-slate-700 font-bold dark:bg-slate-900" />
              <Button onClick={handlePostStory} disabled={loading} className="w-full h-12 bg-yellow-500 text-white font-black rounded-2xl">
                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <><Zap className="w-4 h-4 ml-2" />نشر الستوري الآن</>}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
