"use client";

import React, { useState, useMemo, Suspense } from "react";
import { VicksHeader } from "@/components/VicksHeader";
import { VicksCategoryBar } from "@/components/VicksCategoryBar";
import { VicksFooter } from "@/components/VicksFooter";
import { VicksStoriesBar } from "@/components/VicksStoriesBar";
import { VicksMallSection } from "@/components/VicksMallSection";
import { VicksScrollProvider } from "@/components/VicksScrollContext";
import { TranslateProvider } from "@/components/TranslateContext";
import { TranslatePanel } from "@/components/TranslatePanel";
import { Bot, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCollection } from "@/lib/supabase-hooks";
import { MOCK_PRODUCTS } from "@/app/lib/mock-data";
import { VicksProductCard } from "@/components/VicksProductCard";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const MALLS = [
  { id: "carrefour", name: "CARREFOUR",      route: "/malls/carrefour", color: "bg-blue-600"    },
  { id: "arabia",   name: "MALL OF ARABIA",  route: "/malls/arabia",    color: "bg-emerald-600" },
  { id: "titan",    name: "TITAN MALL",      route: "/malls/titan",     color: "bg-slate-800"   },
  { id: "capital",  name: "CAPITAL MALL",    route: "/malls/capital",   color: "bg-orange-600"  },
  { id: "luxury",   name: "LUXURY MALL",     route: "/malls/luxury",    color: "bg-yellow-600"  },
];

/* ── Per-mall row ── */
function MallRow({ mall, activeCategory, viewMode }: { mall: typeof MALLS[0]; activeCategory: string; viewMode: "grid"|"list" }) {
  const { data: db_ } = useCollection("products", [{ column: "mall", value: mall.id }], { orderBy: "createdAt", limit: 8 });

  const products = useMemo(() => {
    let src = (db_ && db_.length > 0) ? db_ : MOCK_PRODUCTS.filter(p => p.mall === mall.id);
    if (activeCategory !== "الكل") {
      const map: Record<string,string[]> = {
        "عروض اليوم": [], "إلكترونيات": ["إلكترونيات","أجهزة إلكترونية"], "ملابس": ["ملابس"]
      };
      const allowed = map[activeCategory] ?? [];
      if (allowed.length) src = src.filter((p:any) => allowed.includes(p.category));
    }
    return src;
  }, [db_, mall.id, activeCategory]);

  if (!products.length) return null;
  return <VicksMallSection mallId={mall.id} mallName={mall.name} route={mall.route} products={products} accentColor={mall.color} viewMode={viewMode} />;
}

/* ── Used Mall row ── */
function UsedMallRow({ viewMode }: { viewMode: "grid"|"list" }) {
  const { data: db_ } = useCollection("products", [{ column: "mall", value: "used" }], { orderBy: "createdAt", limit: 8 });
  const products = useMemo(() => (db_ && db_.length > 0) ? db_ : MOCK_PRODUCTS.filter(p => p.mall === "used"), [db_]);
  if (!products.length) return null;

  return (
    <div className="bg-white dark:bg-[#1A2332]">
      <div className="flex items-center justify-between px-4 py-2" dir="rtl">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-5 rounded-full bg-amber-500" />
          <span className="text-[11px] font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">USED MALL</span>
          <span className="text-[9px] font-black text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-full border border-amber-200">مستعمل</span>
        </div>
        <button className="flex items-center gap-1 text-orange-500 font-black text-[10px]">
          <RefreshCw className="w-3 h-3" /> ENTER
        </button>
      </div>
      <VicksMallSection mallId="used" mallName="" route="/malls/used" products={products} accentColor="bg-amber-500" viewMode={viewMode} hideHeader />
    </div>
  );
}

const SHELF_OFFSETS = [0, 3, 6, 9, 12];

/* ── VicksMarket featured shelves ── */
function VicksMarketSection() {
  const { data: dbProducts } = useCollection("products", [], { orderBy: "createdAt", limit: 40 });
  const all = useMemo(
    () => (dbProducts && dbProducts.length > 0) ? dbProducts : MOCK_PRODUCTS,
    [dbProducts]
  );

  return (
    <div className="bg-white dark:bg-[#1A2332]">
      <div className="flex items-center justify-between px-4 py-1.5" dir="rtl">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 rounded-full bg-orange-500" />
          <span className="text-[10px] font-black text-slate-700 dark:text-slate-100 uppercase tracking-widest flex items-center gap-1">
            VICKS MARKET <Sparkles className="w-3 h-3 text-orange-400" />
          </span>
        </div>
      </div>
      {SHELF_OFFSETS.map((offset, si) => {
        const shelf = all.slice(offset, offset + 8);
        if (!shelf.length) return null;
        return (
          <ScrollArea key={si} className="w-full whitespace-nowrap" dir="rtl">
            <div className="flex px-2 gap-2 pb-3 pt-1">
              {shelf.map((p: any) => (
                <div key={`${si}-${p.id}`} className="inline-block flex-shrink-0">
                  <VicksProductCard {...p} price={String(p.price)} layout="grid" />
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="h-0 opacity-0" />
          </ScrollArea>
        );
      })}
    </div>
  );
}

/* ── Home inner ── */
function HomeContent() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [viewMode, setViewMode] = useState<"grid"|"list">("grid");

  return (
    <>
      <VicksCategoryBar onCategoryChange={setActiveCategory} activeCategory={activeCategory} onViewChange={setViewMode} viewMode={viewMode} />
      <TranslatePanel />
      <VicksStoriesBar />
      <main className="flex-grow pb-24" dir="rtl">
        {MALLS.map(m => <MallRow key={m.id} mall={m} activeCategory={activeCategory} viewMode={viewMode} />)}
        <UsedMallRow viewMode={viewMode} />
        <VicksMarketSection />
      </main>

      {/* Floating AI bot */}
      <button onClick={() => router.push("/ai-chat")} className="fixed bottom-6 right-6 w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center text-white z-50 hover:scale-110 transition-transform active:scale-95" style={{boxShadow:"0 4px 20px rgba(249,115,22,0.45)"}}>
        <Bot className="w-6 h-6" />
        <div className="absolute -top-1 -left-1 w-4 h-4 bg-white dark:bg-[#252D3D] rounded-full flex items-center justify-center border-2 border-orange-500">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
        </div>
      </button>
    </>
  );
}

export default function Home() {
  return (
    <VicksScrollProvider>
      <TranslateProvider>
      <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#1A2332]" dir="rtl">
        <VicksHeader />
        <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin text-orange-500 w-8 h-8" /></div>}>
          <HomeContent />
        </Suspense>
        <VicksFooter />
      </div>
      </TranslateProvider>
    </VicksScrollProvider>
  );
}
