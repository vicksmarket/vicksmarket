"use client";

import React, { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowRight, BadgeCheck, Star, ShoppingBag, Loader2, User,
  MapPin, Info, LayoutGrid, List, Hash, MessageCircle, Copy, Check
} from "lucide-react";
import { useDoc, useCollection } from "@/lib/supabase-hooks";
import { MOCK_MERCHANTS, MOCK_PRODUCTS } from "@/app/lib/mock-data";
import { cn } from "@/lib/utils";
import { VicksProductCard } from "@/components/VicksProductCard";

const CATS = ["الكل", "إلكترونيات", "ملابس", "أثاث", "جمال", "مستعمل", "ساعات", "حقائب"];

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#25D366" />
      <path fill="#fff" d="M23.5 8.5A10.45 10.45 0 0 0 16 5.5C10.2 5.5 5.5 10.2 5.5 16c0 1.85.48 3.65 1.4 5.24L5.5 26.5l5.38-1.41A10.48 10.48 0 0 0 16 26.5c5.8 0 10.5-4.7 10.5-10.5 0-2.8-1.09-5.44-3-7.5zm-7.5 16.13a8.72 8.72 0 0 1-4.44-1.22l-.32-.19-3.2.84.85-3.12-.2-.33A8.72 8.72 0 0 1 7.27 16c0-4.82 3.92-8.73 8.73-8.73 2.33 0 4.52.91 6.17 2.56a8.68 8.68 0 0 1 2.56 6.17c0 4.82-3.91 8.63-8.73 8.63zm4.79-6.53c-.26-.13-1.54-.76-1.78-.85-.24-.09-.41-.13-.58.13-.17.26-.66.85-.81 1.02-.15.17-.3.19-.56.06-.26-.13-1.1-.41-2.1-1.3a7.9 7.9 0 0 1-1.45-1.8c-.15-.26-.02-.4.11-.53.12-.12.26-.3.39-.45.13-.15.17-.26.26-.43.09-.17.04-.32-.02-.45-.06-.13-.58-1.4-.8-1.92-.2-.5-.42-.43-.58-.44H13c-.15 0-.39.06-.6.28-.2.22-.78.76-.78 1.86s.8 2.16.91 2.31c.11.15 1.57 2.4 3.81 3.37.53.23.94.37 1.27.47.53.17 1.01.14 1.39.09.43-.06 1.31-.54 1.5-1.06.18-.52.18-.97.13-1.06-.06-.09-.22-.15-.48-.28z" />
    </svg>
  );
}

export default function MerchantPublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [activeCategory, setActiveCategory] = useState("الكل");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [copied, setCopied] = useState(false);

  const mockMerchant = useMemo(() => MOCK_MERCHANTS.find(m => m.uid === id), [id]);
  const isMockId = id.startsWith("mock-");
  const { data: dbMerchant, loading: merchantLoading } = useDoc(isMockId ? null : "users", isMockId ? null : id);
  const merchant = mockMerchant || dbMerchant;

  const { data: dbProducts, loading: productsLoading } = useCollection(
    isMockId ? null : "products",
    isMockId ? [] : [{ column: "sellerId", value: id }]
  );
  const allProducts = isMockId
    ? MOCK_PRODUCTS.filter(p => p.sellerId === id)
    : (dbProducts || []);

  const products = useMemo(() => {
    if (activeCategory === "الكل") return allProducts;
    return allProducts.filter((p: any) => p.category === activeCategory);
  }, [allProducts, activeCategory]);

  const loading = merchantLoading || productsLoading;

  if (loading && !mockMerchant) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-orange-500 w-10 h-10" /></div>;
  if (!merchant) return <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center gap-4"><h1 className="text-xl font-black">التاجر غير موجود</h1><button onClick={() => router.push('/')} className="text-orange-500 font-bold">← رجوع</button></div>;

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#1A2332] font-cairo pb-24" dir="rtl">
      {/* Cover */}
      <div className="relative h-40 bg-gradient-to-br from-slate-800 to-slate-900">
        <button onClick={() => router.back()} className="absolute top-4 right-4 w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
          <ArrowRight className="w-4 h-4 text-white" />
        </button>
        {(merchant as any).coverURL && <img src={(merchant as any).coverURL} alt="cover" className="w-full h-full object-cover opacity-50" />}
      </div>

      {/* Profile */}
      <div className="px-4 -mt-12 relative z-10">
        <div className="flex items-end gap-3 mb-4">
          <div className="w-20 h-20 rounded-2xl border-4 border-white dark:border-[#1A2332] overflow-hidden bg-slate-200 shadow-xl flex-shrink-0">
            {(merchant as any).photoURL ? (
              <img src={(merchant as any).photoURL} alt={merchant.fullName || (merchant as any).shopName} className="w-full h-full object-cover" />
            ) : <User className="w-10 h-10 m-5 text-slate-400" />}
          </div>
          <div className="pb-1 flex-1">
            <div className="flex items-center gap-1.5">
              <h1 className="font-black text-lg dark:text-white">{(merchant as any).shopName || merchant.fullName}</h1>
              {(merchant as any).isVerified && <BadgeCheck className={cn("w-5 h-5", (merchant as any).verificationType === 'gold' ? "text-yellow-500" : "text-blue-500")} />}
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
              {(merchant as any).location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{(merchant as any).location}</span>}
              <span className="flex items-center gap-1"><Hash className="w-3 h-3" />{(merchant as any).unique_id}</span>
            </div>
          </div>
          <button onClick={() => { navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: "المنتجات", value: products.length },
            { label: "التقييم", value: `${(merchant as any).rating || 5} ⭐` },
            { label: "الحالة", value: (merchant as any).isOnline ? "متاح" : "غير متاح" }
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-slate-800 rounded-2xl p-3 text-center shadow-sm">
              <div className="font-black text-lg dark:text-white">{s.value}</div>
              <div className="text-[9px] font-bold text-slate-400">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Contact buttons */}
        <div className="flex gap-2 mb-4">
          {(merchant as any).phone && (
            <button onClick={() => window.open(`https://wa.me/${(merchant as any).phone}`, '_blank')}
              className="flex-1 h-12 rounded-2xl bg-[#25D366] text-white font-black text-sm flex items-center justify-center gap-2">
              <WhatsAppIcon className="w-5 h-5" /> واتساب
            </button>
          )}
          <button onClick={() => router.push(`/chat?id=${id}`)}
            className="flex-1 h-12 rounded-2xl bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black text-sm flex items-center justify-center gap-2">
            <MessageCircle className="w-4 h-4" /> رسالة
          </button>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-4">
          {CATS.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={cn("flex-shrink-0 px-4 py-2 rounded-full text-[11px] font-black transition-all",
                activeCategory === cat ? "bg-orange-500 text-white shadow-md" : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400")}>
              {cat}
            </button>
          ))}
        </div>

        {/* View toggle */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold text-slate-400">{products.length} منتج</span>
          <div className="flex gap-1">
            <button onClick={() => setViewMode("grid")} className={cn("w-8 h-8 rounded-xl flex items-center justify-center", viewMode === "grid" ? "bg-orange-500 text-white" : "bg-white dark:bg-slate-800 text-slate-400")}>
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode("list")} className={cn("w-8 h-8 rounded-xl flex items-center justify-center", viewMode === "list" ? "bg-orange-500 text-white" : "bg-white dark:bg-slate-800 text-slate-400")}>
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Products */}
        {products.length > 0 ? (
          <div className={cn(viewMode === "grid" ? "grid grid-cols-2 gap-3" : "flex flex-col gap-3")}>
            {products.map((p: any) => (
              <VicksProductCard key={p.id} {...p} price={String(p.price)} layout={viewMode} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 space-y-3">
            <ShoppingBag className="w-12 h-12 mx-auto text-slate-200" />
            <p className="font-black text-slate-400 text-sm">لا توجد منتجات في هذه الفئة</p>
          </div>
        )}
      </div>
    </div>
  );
}
