"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useUser } from "@/lib/supabase-hooks";
import { VicksLogo } from "@/components/VicksLogo";
import { cn } from "@/lib/utils";

interface ProfileData {
  full_name: string | null;
  photo_url: string | null;
  membership: string | null;
  is_verified: boolean;
  unique_id: string | null;
  whatsapp_verified?: boolean;
  telegram_verified?: boolean;
}

export default function TasksPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.replace("/login"); return; }
    createClient()
      .from("profiles")
      .select("full_name,photo_url,membership,is_verified,unique_id,whatsapp_verified,telegram_verified")
      .eq("id", user.uid)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setProfile(data as ProfileData);
        setLoading(false);
      });
  }, [authLoading, user]);

  if (authLoading || loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] dark:bg-[#0f1621]">
      <Loader2 className="animate-spin w-8 h-8 text-orange-500" />
    </div>
  );

  const tasks = [
    {
      icon: "👤", title: "أكمل اسمك الكامل",
      sub: "اسمك يظهر للتجار والعملاء",
      reward: null,
      done: !!profile?.full_name,
      action: () => router.push("/profile/edit"),
      actionLabel: "أضف اسمك",
    },
    {
      icon: "🖼️", title: "أضف صورة للحساب",
      sub: "صورة واضحة تزيد من الثقة",
      reward: null,
      done: !!profile?.photo_url,
      action: () => router.push("/profile/edit"),
      actionLabel: "أضف صورة",
    },
    {
      icon: "✅", title: "وثّق بريدك الإلكتروني",
      sub: "حسابك يصبح مؤكداً ومحمياً",
      reward: null,
      done: !!profile?.is_verified,
      action: () => router.push("/verify"),
      actionLabel: "وثّق الآن",
    },
    {
      icon: "📱", title: "تحقق WhatsApp",
      sub: "اربط حسابك بواتساب",
      reward: "+50 نقطة",
      done: !!profile?.whatsapp_verified,
      action: () => router.push("/profile/edit"),
      actionLabel: "تحقق الآن",
    },
    {
      icon: "✈️", title: "تحقق Telegram",
      sub: "اربط حسابك بتيليغرام",
      reward: "+50 نقطة",
      done: !!profile?.telegram_verified,
      action: () => router.push("/profile/edit"),
      actionLabel: "تحقق الآن",
    },
    {
      icon: "⭐", title: "فعّل عضوية VIP",
      sub: "احصل على مميزات إضافية",
      reward: null,
      done: !!profile?.membership,
      action: () => router.push("/profile/vip"),
      actionLabel: "استعرض الباقات",
    },
    {
      icon: "#️⃣", title: "رقم العضوية",
      sub: "رقمك الفريد في المنصة",
      reward: null,
      done: !!profile?.unique_id,
      action: null,
      actionLabel: "",
    },
  ];

  const doneTasks = tasks.filter(t => t.done).length;
  const pct = Math.round((doneTasks / tasks.length) * 100);

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0f1621] font-cairo" dir="rtl">
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-[#0f1621]/80 backdrop-blur-sm border-b dark:border-slate-800 flex items-center justify-between px-4 py-3">
        <button onClick={() => router.push("/verify")} className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
          <ChevronLeft className="w-4 h-4 text-slate-500" />
        </button>
        <div className="flex items-center gap-2">
          <VicksLogo className="w-7 h-7" />
          <span className="font-black text-sm dark:text-white">المهام</span>
        </div>
        <div className="w-9" />
      </div>

      <div className="max-w-sm mx-auto px-4 py-6 space-y-4">
        {/* Progress */}
        <div className="bg-white dark:bg-[#1A2332] rounded-3xl border dark:border-slate-700 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-black text-base dark:text-white">اكتمال الملف الشخصي</p>
            <span className="font-black text-2xl text-orange-500">{pct}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-l from-orange-500 to-orange-400 transition-all duration-700"
              style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs font-bold text-slate-400">{doneTasks} من {tasks.length} مهام مكتملة</p>
        </div>

        {/* Rewards banner */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-400 rounded-2xl p-4 flex items-center gap-3">
          <span className="text-2xl">🎁</span>
          <div>
            <p className="font-black text-white text-sm">اكسب حتى 100 نقطة</p>
            <p className="text-orange-100 text-[11px] font-bold">أكمل تحقق واتساب وتيليغرام</p>
          </div>
        </div>

        <p className="font-black text-xs text-slate-400 px-1">المهام المطلوبة</p>
        {tasks.map((task, i) => (
          <div key={i} className={cn(
            "bg-white dark:bg-[#1A2332] rounded-2xl border p-4 shadow-sm transition-all",
            task.done ? "border-green-100 dark:border-green-900/30" : "border-slate-100 dark:border-slate-700"
          )}>
            <div className="flex items-start gap-3">
              <div className={cn(
                "w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0",
                task.done ? "bg-green-50 dark:bg-green-950/20" : "bg-orange-50 dark:bg-orange-950/20"
              )}>
                {task.done ? "✅" : task.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={cn("font-black text-sm", task.done ? "line-through text-slate-400" : "dark:text-white")}>{task.title}</p>
                  {task.reward && !task.done && (
                    <span className="text-[10px] font-black text-orange-500 bg-orange-50 dark:bg-orange-950/20 px-2 py-0.5 rounded-full">{task.reward}</span>
                  )}
                  {task.reward && task.done && (
                    <span className="text-[10px] font-black text-green-500 bg-green-50 dark:bg-green-950/20 px-2 py-0.5 rounded-full">تم الكسب ✓</span>
                  )}
                </div>
                <p className="text-[11px] font-bold text-slate-400 mt-0.5">{task.sub}</p>
                {!task.done && task.action && (
                  <button onClick={task.action}
                    className="mt-2 px-4 py-1.5 bg-orange-500 text-white text-xs font-black rounded-xl active:scale-95 transition-all">
                    {task.actionLabel}
                  </button>
                )}
              </div>
              {task.done && (
                <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs">✓</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {doneTasks === tasks.length && (
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-5 text-center text-white shadow-lg shadow-orange-200/50">
            <p className="text-2xl mb-2">🎉</p>
            <p className="font-black text-lg">أحسنت! اكتمل ملفك الشخصي</p>
            <p className="text-sm text-orange-100 mt-1 font-bold">حسابك الآن جاهز بالكامل</p>
          </div>
        )}
      </div>
    </div>
  );
}
