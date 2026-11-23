
"use client";

import { ArrowLeft, Paperclip, Upload, File } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function AttachPage() {
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
        <h1 className="text-xl font-bold dark:text-white">إرفاق ملف</h1>
        <div className="w-10" />
      </header>

      <main className="space-y-6">
        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-12 flex flex-col items-center justify-center gap-4 bg-white dark:bg-[#252D3D]">
          <Upload className="w-12 h-12 text-orange-500" />
          <div className="text-center">
            <p className="font-bold dark:text-white">اسحب الملف هنا</p>
            <p className="text-xs text-slate-500 mt-1">أو اضغط لاختيار ملف من جهازك</p>
          </div>
          <Button className="bg-orange-500 rounded-xl px-8 mt-2">اختيار ملف</Button>
        </div>

        <div className="space-y-3">
          <h3 className="font-bold text-sm dark:text-white">الملفات الأخيرة</h3>
          {[1, 2].map(i => (
            <div key={i} className="flex items-center gap-3 p-4 bg-white dark:bg-[#252D3D] rounded-2xl shadow-sm">
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-blue-500">
                <File className="w-5 h-5" />
              </div>
              <div className="flex-1 text-right">
                <p className="text-sm font-bold dark:text-white">صورة المنتج_{i}.jpg</p>
                <p className="text-[10px] text-slate-400">1.2 MB • منذ يومين</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
