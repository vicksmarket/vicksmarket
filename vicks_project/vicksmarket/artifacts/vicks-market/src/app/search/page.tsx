"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { VicksProductCard } from "@/components/VicksProductCard";
import { createClient } from "@/utils/supabase/client";
import { MOCK_PRODUCTS } from "@/app/lib/mock-data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VicksLogo } from "@/components/VicksLogo";
import { cn } from "@/lib/utils";

const governorates = ["الكل","القاهرة","الجيزة","الإسكندرية","سوهاج","أسيوط","المنصورة","طنطا"];

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get("q") || "";

  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [location, setLocation] = useState("الكل");
  const [category, setCategory] = useState("الكل");

  useEffect(() => {
    setLoading(true);
    const supabase = createClient();
    if (!q.trim()) {
      // No query — show recent products from Supabase
      supabase.from("products").select("*")
        .order("createdAt", { ascending: false })
        .limit(30)
        .then(({ data, error }) => {
          if (!error && data && data.length > 0) {
            setProducts(data);
          } else {
            setProducts(MOCK_PRODUCTS.slice(0, 20));
          }
          setLoading(false);
        });
      return;
    }
    supabase.from("products").select("*")
      .or(`name.ilike.%${q}%,description.ilike.%${q}%,category.ilike.%${q}%`)
      .limit(30)
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          setProducts(data);
        } else {
          // Fallback to mock data
          const mockResults = MOCK_PRODUCTS.filter(p =>
            p.name.includes(q) || p.description?.includes(q) || p.category?.includes(q)
          );
          setProducts(mockResults.length > 0 ? mockResults : MOCK_PRODUCTS.slice(0, 20));
        }
        setLoading(false);
      });
  }, [q]);

  const filteredProducts = useMemo(() => {
    let src = products;
    if (location !== "الكل") src = src.filter((p: any) => p.location === location);
    if (category !== "الكل") src = src.filter((p: any) => p.category === category);
    return src;
  }, [products, location, category]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#1A2332] font-cairo pb-24 text-right" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-[#1A2332] border-b dark:border-slate-800 px-4 py-3 flex items-center gap-3 shadow-sm">
        <button onClick={() => router.back()} className="w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center flex-shrink-0">
          <ArrowRight className="w-4 h-4 text-slate-600" />
        </button>
        <div className="flex-1 flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-full px-4 h-10">
          <Search className="w-4 h-4 text-orange-500 flex-shrink-0" />
          <span className="text-sm font-bold text-slate-600 dark:text-slate-300 truncate">{q || "جميع المنتجات"}</span>
        </div>
        <VicksLogo className="w-8 h-8 flex-shrink-0" />
      </header>

      {/* Filters */}
      <section className="flex gap-2 p-4 overflow-x-auto">
        <Select value={location} onValueChange={setLocation}>
          <SelectTrigger className="w-[130px] h-9 rounded-xl border-orange-50 dark:bg-slate-900 text-[10px] font-bold">
            <SelectValue placeholder="المحافظة" />
          </SelectTrigger>
          <SelectContent>
            {governorates.map(gov => <SelectItem key={gov} value={gov}>{gov}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[120px] h-9 rounded-xl border-orange-50 dark:bg-slate-900 text-[10px] font-bold">
            <Sparkles className="w-3 h-3 ml-1 text-blue-500" />
            <SelectValue placeholder="القسم" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="الكل">كل الأقسام</SelectItem>
            <SelectItem value="سوبر ماركت">سوبر ماركت</SelectItem>
            <SelectItem value="إلكترونيات">إلكترونيات</SelectItem>
            <SelectItem value="ملابس">ملابس</SelectItem>
            <SelectItem value="جمال وعناية">جمال وعناية</SelectItem>
          </SelectContent>
        </Select>
      </section>

      <main>
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-orange-500" /></div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 px-4">
            {filteredProducts.map(p => (
              <VicksProductCard 
                key={p.id}
                id={p.id}
                name={p.name}
                price={p.price?.toString()}
                image={p.image}
                seller={p.seller}
                location={p.location}
                views={p.views}
                isVerified={p.isOriginal}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 space-y-4">
             <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
               <Search className="w-10 h-10 text-slate-300" />
             </div>
             <p className="font-black text-slate-400">لم نجد أي نتائج تطابق بحثك يا ملك.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin text-orange-500" /></div>}>
      <SearchContent />
    </Suspense>
  );
}
