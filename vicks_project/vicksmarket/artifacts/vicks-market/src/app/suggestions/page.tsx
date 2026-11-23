"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lightbulb, Loader2, CheckCircle2, ChevronDown } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { VicksHeader } from "@/components/VicksHeader";
import { VicksFooter } from "@/components/VicksFooter";

const TYPES = ["تحسين موجود", "فكرة جديدة", "شكوى تقنية"];

export default function SuggestionsPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [type, setType] = useState(TYPES[0]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) { setError("الرجاء كتابة نص الاقتراح"); return; }
    setError(""); setLoading(true);
    try {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      const { error: err } = await sb.from("suggestions").insert({
        user_id: user?.id ?? null,
        name: name.trim() || "مجهول",
        type,
        content: content.trim(),
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
          <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-2xl flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
          </div>
          <div>
            <h1 className="font-black text-xl dark:text-white">الاقتراحات</h1>
            <p className="text-xs text-slate-400 font-bold">رأيك يساعدنا على التحسين</p>
          </div>
        </div>

        {done ? (
          <div className="bg-white dark:bg-[#252D3D] rounded-3xl p-8 text-center shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
            <h2 className="font-black text-lg dark:text-white">شكراً على اقتراحك!</h2>
            <p className="text-sm text-slate-500 font-bold">سنأخذه بعين الاعتبار</p>
            <button onClick={() => router.push("/")} className="w-full h-12 bg-orange-500 text-white font-black rounded-2xl active:scale-95 transition-transform">
              العودة للرئيسية
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-[#252D3D] rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
            {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-600 text-sm font-bold rounded-2xl px-4 py-3 text-center">{error}</div>}

            <div>
              <label className="text-xs font-black text-slate-500 dark:text-slate-400 mb-1.5 block">اسمك (اختياري)</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="يمكنك الإرسال بدون اسم"
                className="w-full h-12 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 font-bold text-sm dark:text-white focus:outline-none focus:border-orange-400 transition-colors" />
            </div>

            <div>
              <label className="text-xs font-black text-slate-500 dark:text-slate-400 mb-1.5 block">نوع الاقتراح *</label>
              <div className="relative">
                <select value={type} onChange={e => setType(e.target.value)}
                  className="w-full h-12 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 font-bold text-sm dark:text-white focus:outline-none focus:border-orange-400 appearance-none">
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-xs font-black text-slate-500 dark:text-slate-400 mb-1.5 block">اقتراحك *</label>
              <textarea required value={content} onChange={e => setContent(e.target.value)} rows={5}
                placeholder="اكتب اقتراحك هنا..."
                className="w-full rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 font-bold text-sm dark:text-white focus:outline-none focus:border-orange-400 transition-colors resize-none" />
            </div>

            <button type="submit" disabled={loading}
              className="w-full h-14 bg-yellow-500 hover:bg-yellow-600 text-white font-black text-base rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-70">
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <><Lightbulb className="w-5 h-5" /> إرسال الاقتراح</>}
            </button>
          </form>
        )}
      </div>
      <VicksFooter />
    </div>
  );
}
