"use client";

import React from "react";
import { VicksProductCard } from "./VicksProductCard";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface MallSectionProps {
  mallId: string;
  mallName: string;
  route: string;
  products: any[];
  accentColor?: string;
  viewMode?: "grid" | "list";
  hideHeader?: boolean;
}

export function VicksMallSection({
  mallId, mallName, route, products, accentColor = "bg-orange-500", viewMode = "grid", hideHeader = false
}: MallSectionProps) {
  const router = useRouter();
  if (!products || products.length === 0) return null;

  return (
    <div className="bg-white dark:bg-[#1A2332]">
      {!hideHeader && (
        <div className="flex items-center justify-between px-4 py-1.5" dir="rtl">
          <div className="flex items-center gap-2">
            <div className={cn("w-1 h-4 rounded-full", accentColor)} />
            <span className="text-[10px] font-black text-slate-700 dark:text-slate-100 uppercase tracking-widest">{mallName}</span>
          </div>
          <button onClick={() => router.push(route)} className="flex items-center gap-1 text-orange-500 font-black text-[9px] hover:text-orange-600 transition-colors">
            <ArrowLeft className="w-3 h-3" /><span>ENTER</span>
          </button>
        </div>
      )}

      {viewMode === "list" ? (
        <div className="flex flex-col py-1" dir="rtl">
          {products.map((p: any) => (
            <VicksProductCard key={p.id} {...p} price={String(p.price)} layout="list" />
          ))}
        </div>
      ) : (
        <ScrollArea className="w-full whitespace-nowrap" dir="rtl">
          <div className="flex px-2 gap-2 pb-3 pt-1">
            {products.map((p: any) => (
              <div key={p.id} className="inline-block flex-shrink-0">
                <VicksProductCard {...p} price={String(p.price)} layout="grid" />
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="h-0 opacity-0" />
        </ScrollArea>
      )}
    </div>
  );
}
