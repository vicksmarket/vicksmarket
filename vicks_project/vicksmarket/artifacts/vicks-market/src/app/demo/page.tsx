
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { VicksHeader } from "@/components/VicksHeader";
import { VicksProductGrid } from "@/components/VicksProductGrid";
import { Button } from "@/components/ui/button";
import { Sparkles, ShoppingBag, ShieldCheck, Zap } from "lucide-react";

export default function DemoPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#1A2332] font-cairo pb-20" dir="rtl">
      <VicksHeader />
      
      <main className="p-4 space-y-10">
        <section className="text-center py-10 space-y-4">
           <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto text-white shadow-2xl shadow-orange-500/30">
              <Sparkles className="w-10 h-10 animate-pulse" />
           </div>
           <h1 className="text-3xl font-black dark:text-white">جولة تجريبية في فيكس</h1>
           <p className="text-slate-500 font-bold max-w-xs mx-auto">هذه الصفحة تعرض لك كيف سيبدو الموقع عندما يمتلئ بالمنتجات والتجار.</p>
        </section>

        <section className="space-y-4">
           <div className="flex items-center gap-2 border-r-4 border-orange-500 pr-3">
              <ShoppingBag className="w-5 h-5 text-orange-500" />
              <h2 className="text-xl font-black dark:text-white uppercase">أحدث الإلكترونيات (Demo)</h2>
           </div>
           <VicksProductGrid category="إلكترونيات" />
        </section>

        <section className="space-y-4">
           <div className="flex items-center gap-2 border-r-4 border-blue-500 pr-3">
              <ShieldCheck className="w-5 h-5 text-blue-500" />
              <h2 className="text-xl font-black dark:text-white uppercase">أدوات منزلية موثقة (Demo)</h2>
           </div>
           <VicksProductGrid category="أدوات منزلية" />
        </section>

        <section className="bg-slate-900 rounded-[3rem] p-8 text-white space-y-6 shadow-2xl">
           <div className="flex items-center gap-3">
              <Zap className="w-8 h-8 text-yellow-500 fill-yellow-500" />
              <h2 className="text-2xl font-black">جاهز لإطلاق موقعك؟</h2>
           </div>
           <p className="text-sm font-bold opacity-80 leading-relaxed">
             بمجرد أن تبدأ في إضافة منتجات حقيقية عبر صفحة "إضافة منتج"، ستختفي هذه المنتجات التجريبية تلقائياً ويظهر شغلك الحقيقي للناس.
           </p>
           <Button onClick={() => router.push('/add-product')} className="w-full h-14 bg-orange-500 rounded-2xl font-black text-lg">إضافة أول منتج حقيقي الآن</Button>
        </section>
      </main>
    </div>
  );
}
