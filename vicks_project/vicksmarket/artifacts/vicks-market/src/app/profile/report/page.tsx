"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Flag, CheckCircle2 } from "lucide-react";
import { VicksLogo } from "@/components/VicksLogo";
import { cn } from "@/lib/utils";

const CATEGORIES = ["خطأ تقني", "مشكلة دفع", "إساءة استخدام", "محتوى مسيء", "أخرى"];

export default function ReportPage() {
  const router = useRouter();
  const [selectedCat, setSelectedCat] = useState("");
  const [reportText, setReportText] = useState("");
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!reportText.trim()) return;
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0f1621] font-cairo" dir="rtl">
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-[#0f1621]/80 backdrop-blur-sm border-b dark:border-slate-800 flex items-center justify-between px-4 py-3">
        <button onClick={() => router.push("/verify")} className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
          <ChevronLeft className="w-4 h-4 text-slate-500" />
        </button>
        <div className="flex items-center gap-2">
          <VicksLogo className="w-7 h-7" />
          <span className="font-black text-sm dark:text-white">الإبلاغ عن مشكلة</span>
        </div>
        <div className="w-9" />
      </div>

      <div className="max-w-sm mx-auto px-4 py-6 space-y-4">
        {sent ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-green-50 dark:bg-green-950/20 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <p className="font-black text-xl dark:text-white">تم إرسال البلاغ!</p>
            <p className="text-sm font-bold text-slate-400">شكراً لك، سنراجع بلاغك خلال 24 ساعة</p>
            <button onClick={() => router.push("/verify")}
              className="mt-4 px-8 py-3 bg-orange-500 text-white font-black rounded-2xl active:scale-95 transition-all">
              العودة للملف
            </button>
          </div>
        ) : (
          <>
            {/* Hero */}
            <div className="bg-red-50 dark:bg-red-950/20 rounded-3xl p-5 text-center">
              <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-3">
                <Flag className="w-7 h-7 text-red-500" />
              </div>
              <p className="font-black dark:text-white">الإبلاغ عن مشكلة</p>
              <p className="text-xs font-bold text-slate-400 mt-1">سنراجع بلاغك خلال 24 ساعة</p>
            </div>

            {/* Category */}
            <div className="bg-white dark:bg-[#1A2332] rounded-3xl border dark:border-slate-700 p-4 shadow-sm">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3">نوع المشكلة</p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setSelectedCat(cat)}
                    className={cn("px-3 py-1.5 rounded-xl text-xs font-black transition-all active:scale-95",
                      selectedCat === cat ? "bg-orange-500 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300")}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Text */}
            <div className="bg-white dark:bg-[#1A2332] rounded-3xl border dark:border-slate-700 p-4 shadow-sm">
              <label className="block">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 block">وصف المشكلة</span>
                <textarea value={reportText} onChange={e => setReportText(e.target.value)} rows={6}
                  placeholder="اشرح المشكلة التي واجهتها بالتفصيل..."
                  className="w-full rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm font-bold dark:text-white focus:outline-none focus:border-orange-400 resize-none" />
              </label>
            </div>

            <button onClick={handleSend} disabled={!reportText.trim()}
              className="w-full py-4 bg-red-500 hover:bg-red-600 text-white font-black text-base rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 shadow-lg">
              <Flag className="w-4 h-4" /> إرسال البلاغ
            </button>
          </>
        )}
      </div>
    </div>
  );
}
