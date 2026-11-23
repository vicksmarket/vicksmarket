
"use client";

import { ArrowLeft, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function FavoritesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#1A2332] p-4 text-right" dir="rtl">
      <header className="flex items-center justify-between mb-8">
        <button 
          onClick={() => router.back()} 
          className="w-10 h-10 flex items-center justify-center bg-white dark:bg-[#252D3D] rounded-full shadow-sm"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300 rotate-180" />
        </button>
        <h1 className="text-xl font-bold dark:text-white">المفضلة</h1>
        <div className="w-10" />
      </header>

      <main className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-24 h-24 bg-red-50 dark:bg-red-950/20 rounded-full flex items-center justify-center">
          <Heart className="w-12 h-12 text-red-500 fill-red-500" />
        </div>
        <h2 className="text-lg font-bold dark:text-white">قائمة أمنياتك فارغة</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">أضف المنتجات التي تعجبك هنا للعودة إليها لاحقاً.</p>
        <Button onClick={() => router.push('/')} className="bg-orange-500 rounded-full px-8">ابدأ التسوق</Button>
      </main>
    </div>
  );
}
