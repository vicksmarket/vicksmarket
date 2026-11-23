"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, Clock, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useUser } from "@/lib/supabase-hooks";

const ADMIN_EMAILS = ["vicksmarket@gmail.com", "mom1113694362@gmail.com", "mom01113694362@icloud.com"];
const STATUS_COLORS: Record<string, string> = { pending: "text-yellow-600 bg-yellow-50", reviewed: "text-blue-600 bg-blue-50", resolved: "text-green-600 bg-green-50" };
const STATUS_AR: Record<string, string> = { pending: "قيد المراجعة", reviewed: "تمت المراجعة", resolved: "تم الحل" };

export default function AdminComplaintsPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase());

  useEffect(() => {
    if (!loading && !isAdmin) { router.replace("/"); }
  }, [loading, isAdmin]);

  const fetchComplaints = async () => {
    setFetching(true);
    const sb = createClient();
    const { data } = await sb.from("complaints").select("*").order("created_at", { ascending: false });
    setComplaints(data || []);
    setFetching(false);
  };

  useEffect(() => { if (isAdmin) fetchComplaints(); }, [isAdmin]);

  const updateStatus = async (id: string, status: string) => {
    const sb = createClient();
    await sb.from("complaints").update({ status }).eq("id", id);
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  };

  if (loading || !isAdmin) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#1A2332] font-cairo p-4 pb-24" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-red-500" />
            <h1 className="font-black text-xl dark:text-white">الشكاوى ({complaints.length})</h1>
          </div>
          <button onClick={fetchComplaints} className="w-9 h-9 bg-white dark:bg-[#252D3D] rounded-xl flex items-center justify-center border border-slate-100 dark:border-slate-700">
            <RefreshCw className={`w-4 h-4 text-slate-500 ${fetching ? "animate-spin" : ""}`} />
          </button>
        </div>

        {complaints.length === 0 && !fetching && (
          <div className="text-center py-20 text-slate-400 font-bold">لا توجد شكاوى حتى الآن</div>
        )}

        {complaints.map(c => (
          <div key={c.id} className="bg-white dark:bg-[#252D3D] rounded-2xl p-4 mb-3 shadow-sm border border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${STATUS_COLORS[c.status] || STATUS_COLORS.pending}`}>
                {STATUS_AR[c.status] || c.status}
              </span>
              <span className="text-[9px] font-bold text-slate-400">{new Date(c.created_at).toLocaleDateString("ar-EG")}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="font-black text-slate-500">المُشتكى عليه:</span><p className="font-bold dark:text-white">{c.reported_user_id}</p></div>
              <div><span className="font-black text-slate-500">المُشتكي:</span><p className="font-bold dark:text-white">{c.reporter_name || "مجهول"}</p></div>
              <div><span className="font-black text-slate-500">النوع:</span><p className="font-bold text-red-500">{c.type}</p></div>
            </div>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 rounded-xl p-3">{c.details}</p>
            <div className="flex gap-2">
              <button onClick={() => updateStatus(c.id, "reviewed")} disabled={c.status === "reviewed"}
                className="flex-1 h-8 text-[10px] font-black rounded-xl bg-blue-50 text-blue-600 disabled:opacity-40 active:scale-95">
                تمت المراجعة
              </button>
              <button onClick={() => updateStatus(c.id, "resolved")} disabled={c.status === "resolved"}
                className="flex-1 h-8 text-[10px] font-black rounded-xl bg-green-50 text-green-600 disabled:opacity-40 active:scale-95">
                تم الحل
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
