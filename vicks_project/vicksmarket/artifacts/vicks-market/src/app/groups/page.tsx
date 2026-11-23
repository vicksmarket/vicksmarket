"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, MessageCircle, ChevronLeft } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { VicksHeader } from "@/components/VicksHeader";

const DEFAULT_GROUPS = [
  { id: "vicksmarket", name: "group vicksmarket", description: "المجموعة الرسمية لـ Vicks Market" },
];

export default function GroupsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [lastMsgs, setLastMsgs] = useState<Record<string, string>>({});

  useEffect(() => {
    const sb = createClient();
    (async () => {
      const { data } = await sb.from("groups").select("*").order("created_at", { ascending: true });
      const list = (data && data.length > 0) ? data : DEFAULT_GROUPS;
      setGroups(list);
      // fetch last message for each
      for (const g of list) {
        const { data: msgs } = await sb.from("group_messages").select("message").eq("group_id", g.id).order("created_at", { ascending: false }).limit(1);
        if (msgs?.[0]) setLastMsgs(prev => ({ ...prev, [g.id]: msgs[0].message }));
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#1A2332] font-cairo" dir="rtl">
      <VicksHeader />
      <div className="max-w-lg mx-auto px-4 pt-6 pb-24">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center">
            <Users className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h1 className="font-black text-xl dark:text-white">المجموعات</h1>
            <p className="text-xs text-slate-400 font-bold">تحدث مع الجميع بحرية</p>
          </div>
        </div>

        {(groups.length === 0 ? DEFAULT_GROUPS : groups).map(g => (
          <Link key={g.id} href={`/groups/${g.id}`}
            className="flex items-center gap-3 bg-white dark:bg-[#252D3D] rounded-2xl p-4 mb-3 shadow-sm border border-slate-100 dark:border-slate-800 active:scale-[0.98] transition-transform">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-black text-sm dark:text-white">{g.name}</h3>
              <p className="text-xs text-slate-400 font-bold truncate">{lastMsgs[g.id] || g.description || "لا توجد رسائل بعد"}</p>
            </div>
            <ChevronLeft className="w-4 h-4 text-slate-300 flex-shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
