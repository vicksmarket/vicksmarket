
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Flame, Bot } from "lucide-react";
import { VicksLogo } from "@/components/VicksLogo";
import { VicksProductCard } from "@/components/VicksProductCard";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { VicksCategoryBar } from "@/components/VicksCategoryBar";
import Image from "next/image";

const todayOffers = [
  { id: "o1", name: "ايفون 13 عرض", price: "14,000", discount: "70%", image: "https://picsum.photos/seed/iphone13/400/400" },
  { id: "o2", name: "تليفزيون LG", price: "3,200", discount: "50%", image: "https://picsum.photos/seed/lgtv/400/400" },
  { id: "o3", name: "لابتوب HP", price: "9,500", discount: "40%", image: "https://picsum.photos/seed/hplaptop/400/400" },
];

const allOffers = [
  { id: "a1", name: "ايفون 13 عرض", price: "14,000", discount: "70%", image: "https://picsum.photos/seed/iphone13/400/400", seller: "متجر النور" },
  { id: "a2", name: "تليفزيون LG", price: "3,200", discount: "50%", image: "https://picsum.photos/seed/lgtv/400/400", seller: "متجر النور" },
  { id: "a3", name: "سماعات رأس", price: "1,200", discount: "60%", image: "https://picsum.photos/seed/headphones/400/400", seller: "متجر النور" },
  { id: "a4", name: "لابتوب عمل", price: "8,500", discount: "30%", image: "https://picsum.photos/seed/laptop2/400/400", seller: "متجر النور" },
];

export default function OffersPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white dark:bg-[#1A2332] text-right font-cairo pb-24" dir="rtl">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 border-b dark:border-slate-800 sticky top-0 bg-white dark:bg-[#1A2332] z-50">
        <button 
          onClick={() => router.back()} 
          className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-[#252D3D] rounded-full"
        >
          <ChevronLeft className="w-6 h-6 text-slate-600 dark:text-slate-300 rotate-180" />
        </button>
        
        <div className="flex items-center gap-2">
          <span className="font-black text-[#1A2332] dark:text-white text-lg tracking-tighter uppercase">VICKS MARKET</span>
          <div className="w-8 h-8">
            <VicksLogo className="w-full h-full" />
          </div>
        </div>
        <div className="w-10" />
      </header>

      {/* Category Bar with active state */}
      <VicksCategoryBar activeCategory="عروض" />

      <main className="space-y-8 pt-6">
        {/* Today's Offers Section */}
        <section className="space-y-4">
          <div className="px-4 flex items-center justify-between">
             <h2 className="text-xl font-black flex items-center gap-2 dark:text-white">
               <span>عروض اليوم</span>
               <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
             </h2>
          </div>
          
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex px-4 gap-4 pb-4">
              {todayOffers.map((item) => (
                <div 
                  key={item.id} 
                  className="min-w-[140px] bg-white dark:bg-[#252D3D] rounded-[2rem] shadow-sm border dark:border-slate-700 overflow-hidden relative cursor-pointer"
                  onClick={() => router.push(`/product/${item.id}`)}
                >
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-full z-10">
                    {item.discount}
                  </div>
                  <div className="aspect-square bg-slate-50 dark:bg-[#1E293B] flex items-center justify-center p-4">
                    <div className="relative w-full h-full">
                      <Image src={item.image} alt={item.name} fill className="object-contain" />
                    </div>
                  </div>
                  <div className="p-3 text-center space-y-1">
                    <p className="text-[10px] font-bold text-slate-800 dark:text-slate-200 truncate">{item.name}</p>
                    <p className="text-orange-500 font-black text-xs">{item.price} ج.م</p>
                  </div>
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </section>

        {/* All Offers Grid */}
        <section className="px-4 space-y-4">
          <h2 className="text-xl font-black dark:text-white">جميع العروض</h2>
          <div className="grid grid-cols-2 gap-4">
            {allOffers.map((product) => (
              <VicksProductCard 
                key={product.id} 
                {...product} 
                category="عروض"
                seller={product.seller || "متجر فيكس"}
              />
            ))}
          </div>
        </section>
      </main>

      {/* Floating Action Button (AI Bot) */}
      <button 
        onClick={() => router.push('/ai-chat')}
        className="fixed bottom-6 right-6 w-12 h-12 bg-orange-500 rounded-full shadow-2xl flex items-center justify-center text-white z-50 hover:scale-110 transition-transform active:scale-95"
      >
        <Bot className="w-6 h-6" />
        <div className="absolute top-0 left-0 w-3.5 h-3.5 bg-white dark:bg-[#252D3D] rounded-full flex items-center justify-center border-2 border-orange-500">
          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
        </div>
      </button>
    </div>
  );
}
