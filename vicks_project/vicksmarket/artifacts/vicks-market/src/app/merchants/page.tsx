
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Store, BadgeCheck, Star, MapPin, ChevronLeft, Sparkles } from "lucide-react";
import { MOCK_MERCHANTS } from "@/app/lib/mock-data";
import { VicksHeader } from "@/components/VicksHeader";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ExploreMerchantsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#1A2332] font-cairo text-right pb-20" dir="rtl">
      <VicksHeader />
      
      <main className="p-4 space-y-8">
        <section className="text-center py-6 space-y-2">
           <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto text-white shadow-xl shadow-orange-500/20 mb-4">
              <Store className="w-8 h-8" />
           </div>
           <h1 className="text-2xl font-black dark:text-white uppercase tracking-tighter">استكشف تجار فيكس</h1>
           <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">تجار موثقون بضمان فيكس 100%</p>
        </section>

        <div className="space-y-4">
           {MOCK_MERCHANTS.map((m) => (
             <div 
               key={m.uid} 
               onClick={() => router.push(`/merchant-profile/${m.uid}`)}
               className="bg-white dark:bg-slate-800 p-5 rounded-[2.5rem] shadow-sm border border-slate-50 dark:border-slate-700 flex items-center gap-4 cursor-pointer hover:scale-[1.02] transition-all group"
             >
                <div className="relative">
                   <div className="w-20 h-20 rounded-3xl bg-slate-100 overflow-hidden border-2 border-white shadow-md">
                      <img src={m.photoURL} alt={m.fullName} className="w-full h-full object-cover" />
                   </div>
                   <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-900 p-1 rounded-full shadow-lg">
                      <BadgeCheck className={cn("w-5 h-5", m.verificationType === 'gold' ? "text-yellow-500" : "text-blue-500")} />
                   </div>
                </div>

                <div className="flex-1 space-y-1">
                   <div className="flex items-center justify-between">
                      <h3 className="font-black text-sm dark:text-white group-hover:text-orange-500 transition-colors">{m.shopName}</h3>
                      <div className="flex items-center gap-0.5 text-yellow-400">
                         <Star className="w-3 h-3 fill-current" />
                         <span className="text-[10px] font-black text-slate-400">{m.rating}</span>
                      </div>
                   </div>
                   <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-orange-500" />
                      <span className="text-[10px] font-bold text-slate-400">{m.location}</span>
                   </div>
                   <div className="pt-1">
                      <span className="text-[8px] font-black text-orange-500 uppercase tracking-widest bg-orange-50 dark:bg-orange-950/20 px-2 py-0.5 rounded-full border border-orange-100">ID: {m.unique_id}</span>
                   </div>
                </div>

                <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all">
                   <ChevronLeft className="w-4 h-4" />
                </div>
             </div>
           ))}
        </div>

        <section className="bg-slate-900 rounded-[3rem] p-8 text-white space-y-6 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 left-0 p-10 opacity-10 pointer-events-none">
              <Sparkles className="w-32 h-32 text-orange-500" />
           </div>
           <div className="relative z-10 space-y-4">
              <h2 className="text-xl font-black flex items-center gap-2">
                 <BadgeCheck className="w-6 h-6 text-yellow-500" /> هل تود الانضمام لقائمة الصفوة؟
              </h2>
              <p className="text-xs font-bold opacity-70 leading-relaxed">
                 التجار الموثقون في هذه القائمة يحصلون على 10 أضعاف المشاهدات وضمان كامل لعمليات البيع.
              </p>
              <Button onClick={() => router.push('/vip')} className="w-full h-12 bg-orange-500 hover:bg-orange-600 rounded-xl font-black">وثق حسابك كتاجر ذهبي الآن</Button>
           </div>
        </section>
      </main>
    </div>
  );
}
