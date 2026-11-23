"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Search, Sun, Moon, X, LayoutGrid, List, SlidersHorizontal } from "lucide-react";
import { VicksProductCard } from "./VicksProductCard";
import { useCollection } from "@/lib/supabase-hooks";
import { MOCK_PRODUCTS } from "@/app/lib/mock-data";
import { cn } from "@/lib/utils";
import { Input } from "./ui/input";

interface Props {
  mallId: string;
  mallName: string;
  mallNameAr?: string;
  subtitle?: string;
  gradient: string;
  textColor?: string;
  accentBg?: string;
}

type SortKey = "newest" | "price_asc" | "price_desc" | "popular";

const SORT_LABELS: Record<SortKey, string> = {
  newest:     "الأحدث",
  price_asc:  "الأرخص",
  price_desc: "الأغلى",
  popular:    "الأكثر إعجاباً",
};

/* Skeleton card while loading */
function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#252D3D] animate-pulse">
      <div className="h-6 bg-slate-100 dark:bg-slate-700 m-2 rounded-xl" />
      <div className="h-44 bg-slate-200 dark:bg-slate-700" />
      <div className="p-2.5 space-y-2">
        <div className="h-3 w-2/3 bg-slate-100 dark:bg-slate-700 rounded" />
        <div className="h-3 w-1/2 bg-slate-100 dark:bg-slate-700 rounded" />
      </div>
    </div>
  );
}

export function VicksMallPage({
  mallId, mallName, mallNameAr, subtitle, gradient,
  textColor = "text-white", accentBg = "bg-white/20",
}: Props) {
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeCategory, setActiveCategory] = useState<string>("الكل");
  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const [showSort, setShowSort] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleDark = () => {
    document.documentElement.classList.toggle("dark");
    const next = !isDark;
    localStorage.setItem("theme", next ? "dark" : "light");
    setIsDark(next);
  };

  // Live Supabase query — camelCase column matches the products schema
  const { data: dbProducts, loading, error: dbError } = useCollection(
    "products",
    [{ column: "mall", value: mallId }],
    { orderBy: "createdAt", orderAsc: false }
  );

  // Source: live DB when populated, mock fallback ONLY when DB returned empty (not on error)
  const source: any[] = useMemo(() => {
    if (loading) return [];
    if (dbError) return []; // surface error state, don't hide it with mocks
    if (dbProducts && dbProducts.length > 0) return dbProducts;
    // DB is reachable but empty → show mock data as placeholder
    return MOCK_PRODUCTS.filter((p) => p.mall === mallId);
  }, [dbProducts, loading, dbError, mallId]);

  // Unique categories for filter chips
  const categories = useMemo(() => {
    const cats = Array.from(new Set(source.map((p: any) => p.category).filter(Boolean)));
    return ["الكل", ...cats];
  }, [source]);

  // Reset category when mall changes
  useEffect(() => { setActiveCategory("الكل"); }, [mallId]);

  const filtered = useMemo(() => {
    let list = activeCategory === "الكل" ? source : source.filter((p: any) => p.category === activeCategory);
    if (searchQ.trim()) {
      const q = searchQ.trim();
      list = list.filter((p: any) => p.name?.includes(q) || p.description?.includes(q));
    }
    switch (sortKey) {
      case "price_asc":  return [...list].sort((a, b) => Number(a.price) - Number(b.price));
      case "price_desc": return [...list].sort((a, b) => Number(b.price) - Number(a.price));
      case "popular":    return [...list].sort((a, b) => (Number(b.likes) || 0) - (Number(a.likes) || 0));
      default:           return list; // newest — already ordered by created_at desc from DB
    }
  }, [source, activeCategory, searchQ, sortKey]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#1A2332] font-cairo pb-24" dir="rtl">
      {/* Header */}
      <header className={cn("sticky top-0 z-50 shadow-md bg-gradient-to-l", gradient)}>
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => router.push("/")}
            className={cn("w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0", accentBg)}
          >
            <ArrowRight className={cn("w-4 h-4", textColor)} />
          </button>

          <div className="flex flex-col items-center">
            <span className={cn("font-black text-sm uppercase tracking-widest", textColor)}>{mallName}</span>
            {mallNameAr && <span className={cn("text-[9px] font-bold opacity-70", textColor)}>{mallNameAr}</span>}
          </div>

          <div className="flex items-center gap-1.5">
            <button onClick={() => setShowSort(v => !v)} className={cn("w-9 h-9 rounded-full flex items-center justify-center relative", accentBg)}>
              <SlidersHorizontal className={cn("w-4 h-4", textColor)} />
              {sortKey !== "newest" && (
                <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-orange-400 border border-white" />
              )}
            </button>
            <button onClick={() => setShowSearch(v => !v)} className={cn("w-9 h-9 rounded-full flex items-center justify-center", accentBg)}>
              {showSearch ? <X className={cn("w-4 h-4", textColor)} /> : <Search className={cn("w-4 h-4", textColor)} />}
            </button>
            <button onClick={toggleDark} className={cn("w-9 h-9 rounded-full flex items-center justify-center", accentBg)}>
              {isDark
                ? <Sun className={cn("w-4 h-4", textColor)} />
                : <Moon className={cn("w-4 h-4", textColor)} />}
            </button>
            <button onClick={() => setViewMode(v => v === "grid" ? "list" : "grid")} className={cn("w-9 h-9 rounded-full flex items-center justify-center", accentBg)}>
              {viewMode === "grid"
                ? <List className={cn("w-4 h-4", textColor)} />
                : <LayoutGrid className={cn("w-4 h-4", textColor)} />}
            </button>
          </div>
        </div>

        {/* Search bar */}
        {showSearch && (
          <div className="px-4 pb-3 animate-in slide-in-from-top-2 duration-200">
            <Input
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              placeholder="ابحث داخل المول..."
              className="h-10 rounded-full bg-white/10 border-white/20 text-white placeholder:text-white/60 font-bold text-sm text-right"
              autoFocus
            />
          </div>
        )}

        {/* Sort dropdown */}
        {showSort && (
          <div className="px-4 pb-3 animate-in slide-in-from-top-2 duration-150">
            <div className="flex flex-wrap gap-2 justify-end">
              {(Object.entries(SORT_LABELS) as [SortKey, string][]).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => { setSortKey(key); setShowSort(false); }}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-[11px] font-black border transition-all",
                    sortKey === key
                      ? "bg-white text-slate-800 border-white"
                      : "bg-white/10 text-white border-white/20"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Subtitle */}
      {subtitle && (
        <div className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 text-right">{subtitle}</div>
      )}

      {/* Category filter chips */}
      {!loading && categories.length > 2 && (
        <div className="overflow-x-auto flex gap-2 px-4 pb-3 no-scrollbar" dir="rtl">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-black border transition-all whitespace-nowrap",
                activeCategory === cat
                  ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                  : "bg-white dark:bg-[#252D3D] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Products grid / list */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : dbError ? (
        <div className="flex flex-col items-center justify-center py-24 px-8 text-center gap-3">
          <span className="text-5xl">⚠️</span>
          <p className="font-black text-red-500 text-sm">تعذّر تحميل المنتجات</p>
          <p className="text-[11px] text-slate-400 font-bold">{(dbError as any)?.message || "خطأ في الاتصال بقاعدة البيانات"}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-8 text-center gap-3">
          <span className="text-5xl">🏪</span>
          <p className="font-black text-slate-500 dark:text-slate-400 text-sm">لا توجد منتجات{activeCategory !== "الكل" ? ` في ${activeCategory}` : ""}</p>
          {activeCategory !== "الكل" && (
            <button onClick={() => setActiveCategory("الكل")} className="text-orange-500 font-black text-sm underline">
              عرض الكل
            </button>
          )}
        </div>
      ) : (
        <main className={cn("p-4", viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-3 gap-4" : "flex flex-col gap-3")}>
          {filtered.map((p: any) => (
            <VicksProductCard key={p.id} {...p} price={String(p.price)} layout={viewMode} />
          ))}
        </main>
      )}

      {/* Result count footer */}
      {!loading && filtered.length > 0 && (
        <p className="text-center text-[10px] font-bold text-slate-400 dark:text-slate-600 pb-2">
          {filtered.length} منتج
        </p>
      )}
    </div>
  );
}
