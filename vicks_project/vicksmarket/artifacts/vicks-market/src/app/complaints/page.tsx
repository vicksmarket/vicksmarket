"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, Loader2, CheckCircle2, ChevronDown } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { VicksHeader } from "@/components/VicksHeader";
import { VicksFooter } from "@/components/VicksFooter";

const TYPES = ["نصب واحتيال", "منتج مخالف", "سوء تعامل", "أخرى"];

export default function ComplaintsPage() {
  const router = useRouter();
  const [reportedId, setReportedId] = useState("");
  const [type, setType] = useState(TYPES[0]);
  const [details, setDetails] = useState("");
  const [reporterName, setReporterName] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim() || !reportedId.trim()) { setError("الرجاء تعبئة جميع الحقول المطلوبة"); return; }
    setError(""); setLoading(true);
    try {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      const { error: err } = await sb.from("complaints").insert({
        reported_user_id: reportedId.trim(),
        reporter_id: user?.id ?? null,
        reporter_name: reporterName.trim() || (user?.email ?? "زائر"),
        type,
        details: details.trim(),
        status: "pending",
      });
      if (err) throw err;
      setDone(true);
    } catch (err: any) {
      setError(err.message || "حدث خطأ، حاول مرة أخرى");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#1A2332] font-cairo" dir="rtl">
      <VicksHeader />
      <div className="max-w-lg mx-auto px-4 pt-8 pb-24">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h1 className="font-black text-xl dark:text-white">تقديم شكوى</h1>
            <p className="text-xs text-slate-400 font-bold">ساعدنا في الحفاظ على بيئة آمنة</p>
          </div>
        </div>

        {done ? (
          <div className="bg-white dark:bg-[#252D3D] rounded-3xl p-8 text-center shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
            <h2 className="font-black text-lg dark:text-white">تم استلام شكواك</h2>
            <p className="text-sm text-slate-500 font-bold">سيتم مراجعتها من قِبل الإدارة في أقرب وقت</p>
            <button onClick={() => router.push("/")} className="w-full h-12 bg-orange-500 text-white font-black rounded-2xl active:scale-95 transition-transform">
              العودة للرئيسية
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-[#252D3D] rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
            {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-600 text-sm font-bold rounded-2xl px-4 py-3 text-center">{error}</div>}

            <div>
              <label className="text-xs font-black text-slate-500 dark:text-slate-400 mb-1.5 block">ID أو اسم المستخدم المُشتكى عليه *</label>
              <input required value={reportedId} onChange={e => setReportedId(e.target.value)}
                placeholder="مثال: 12345678 أو اسم المتجر"
                className="w-full h-12 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 font-bold text-sm dark:text-white focus:outline-none focus:border-orange-400 transition-colors" />
            </div>

            <div>
              <label className="text-xs font-black text-slate-500 dark:text-slate-400 mb-1.5 block">نوع الشكوى *</label>
              <div className="relative">
                <select value={type} onChange={e => setType(e.target.value)}
                  className="w-full h-12 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 font-bold text-sm dark:text-white focus:outline-none focus:border-orange-400 appearance-none">
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-xs font-black text-slate-500 dark:text-slate-400 mb-1.5 block">تفاصيل الشكوى *</label>
              <textarea required value={details} onChange={e => setDetails(e.target.value)} rows={4}
                placeholder="اشرح المشكلة بالتفصيل..."
                className="w-full rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 font-bold text-sm dark:text-white focus:outline-none focus:border-orange-400 transition-colors resize-none" />
            </div>

            <div>
              <label className="text-xs font-black text-slate-500 dark:text-slate-400 mb-1.5 block">اسمك أو ID حسابك (اختياري)</label>
              <input value={reporterName} onChange={e => setReporterName(e.target.value)}
                placeholder="اتركه فارغاً للبقاء مجهولاً"
                className="w-full h-12 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 font-bold text-sm dark:text-white focus:outline-none focus:border-orange-400 transition-colors" />
            </div>

            <button type="submit" disabled={loading}
              className="w-full h-14 bg-red-500 hover:bg-red-600 text-white font-black text-base rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-70">
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <><ShieldAlert className="w-5 h-5" /> إرسال الشكوى</>}
            </button>
          </form>
        )}
      </div>
      <VicksFooter />
    </div>
  );
}
