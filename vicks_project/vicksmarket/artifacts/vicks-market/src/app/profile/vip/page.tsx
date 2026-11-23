"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Star, CheckCircle2, Crown, Loader2, Hash, ShoppingCart, CreditCard } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useUser } from "@/lib/supabase-hooks";
import { VicksLogo } from "@/components/VicksLogo";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    id: "silver",
    name: "VIP Silver", price: "49 ج / شهر", amount: 49, color: "from-slate-400 to-slate-500",
    features: ["إضافة 20 منتج", "ظهور مميز في القائمة", "شارة VIP فضية"],
  },
  {
    id: "gold",
    name: "VIP Gold", price: "99 ج / شهر", amount: 99, color: "from-yellow-400 to-orange-500", popular: true,
    features: ["إضافة 100 منتج", "ظهور أولوية في الصفحة الرئيسية", "دعم عملاء 24/7", "تحليلات مبيعات"],
  },
  {
    id: "pro",
    name: "VIP Pro", price: "199 ج / شهر", amount: 199, color: "from-purple-500 to-indigo-600",
    features: ["منتجات غير محدودة", "متجر خاص باسمك", "إعلانات مدفوعة", "مدير حساب مخصص"],
  },
];

const BADGES = [
  {
    id: "gold",
    label: "توسيق ذهبي",
    points: 200,
    emoji: "🥇",
    ring: "ring-yellow-400",
    bg: "bg-gradient-to-br from-yellow-400 to-orange-400",
    badge: "bg-gradient-to-r from-yellow-400 to-orange-400",
    border: "border-yellow-300 dark:border-yellow-700",
    preview: "from-yellow-300 to-orange-400",
    glow: "shadow-yellow-200/60",
  },
  {
    id: "silver",
    label: "توسيق فضي",
    points: 120,
    emoji: "🥈",
    ring: "ring-slate-400",
    bg: "bg-gradient-to-br from-slate-300 to-slate-500",
    badge: "bg-gradient-to-r from-slate-300 to-slate-500",
    border: "border-slate-300 dark:border-slate-600",
    preview: "from-slate-300 to-slate-500",
    glow: "shadow-slate-200/60",
  },
  {
    id: "blue",
    label: "توسيق أزرق",
    points: 150,
    emoji: "💎",
    ring: "ring-blue-400",
    bg: "bg-gradient-to-br from-blue-400 to-indigo-600",
    badge: "bg-gradient-to-r from-blue-400 to-indigo-600",
    border: "border-blue-300 dark:border-blue-700",
    preview: "from-blue-400 to-indigo-600",
    glow: "shadow-blue-200/60",
  },
];

export default function VipPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const [membership,  setMembership]  = useState<string | null>(null);
  const [points,      setPoints]      = useState(0);
  const [uniqueId,    setUniqueId]    = useState<string | null>(null);
  const [activeBadge, setActiveBadge] = useState<string | null>(null);
  const [loading,     setLoading]     = useState(true);

  // ID purchase
  const [newId,       setNewId]       = useState("");
  const [idBuying,    setIdBuying]    = useState(false);
  const [idDone,      setIdDone]      = useState(false);
  const ID_COST = 100;

  // Badge purchase feedback
  const [buyingBadge, setBuyingBadge] = useState<string | null>(null);
  const [boughtBadge, setBoughtBadge] = useState<string | null>(null);

  // Subscription payment
  const [payingPlan,  setPayingPlan]  = useState<string | null>(null);
  const [payError,    setPayError]    = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.replace("/login"); return; }
    createClient()
      .from("profiles")
      .select("membership,points,unique_id,active_badge")
      .eq("id", user.uid)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setMembership(data.membership);
          setPoints(data.points || 0);
          setUniqueId(data.unique_id || null);
          setActiveBadge((data as any).active_badge || null);
        }
        setLoading(false);
      });
  }, [authLoading, user]);

  const handleBuyBadge = async (badge: typeof BADGES[0]) => {
    if (points < badge.points || buyingBadge) return;
    setBuyingBadge(badge.id);
    const newPoints = points - badge.points;
    try {
      await createClient()
        .from("profiles")
        .update({ active_badge: badge.id, points: newPoints })
        .eq("id", user!.uid);
      setPoints(newPoints);
      setActiveBadge(badge.id);
      setBoughtBadge(badge.id);
      setTimeout(() => setBoughtBadge(null), 2500);
    } catch {}
    setBuyingBadge(null);
  };

  const handleSubscribe = async (plan: typeof PLANS[0]) => {
    if (payingPlan) return;
    setPayingPlan(plan.id);
    setPayError(null);
    try {
      const res  = await fetch("/vkapi/tap/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id, planName: plan.name, amount: plan.amount }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setPayError(data.error || "حدث خطأ، حاول مرة أخرى");
        setPayingPlan(null);
        return;
      }
      // Redirect to Tap payment page
      window.location.href = data.url;
    } catch {
      setPayError("تعذّر الاتصال بخادم الدفع");
      setPayingPlan(null);
    }
  };

  const handleBuyId = async () => {
    if (newId.length < 4 || points < ID_COST || idBuying) return;
    setIdBuying(true);
    const newPoints = points - ID_COST;
    try {
      await createClient()
        .from("profiles")
        .update({ unique_id: newId, points: newPoints })
        .eq("id", user!.uid);
      setUniqueId(newId);
      setPoints(newPoints);
      setIdDone(true);
      setTimeout(() => setIdDone(false), 2500);
    } catch {}
    setIdBuying(false);
  };

  if (authLoading || loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] dark:bg-[#0f1621]">
      <Loader2 className="animate-spin w-8 h-8 text-orange-500" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0f1621] font-cairo" dir="rtl">
      {/* Nav */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-[#0f1621]/80 backdrop-blur-sm border-b dark:border-slate-800 flex items-center justify-between px-4 py-3">
        <button onClick={() => router.push("/verify")} className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
          <ChevronLeft className="w-4 h-4 text-slate-500" />
        </button>
        <div className="flex items-center gap-2">
          <VicksLogo className="w-7 h-7" />
          <span className="font-black text-sm dark:text-white">عضوية VIP</span>
        </div>
        <div className="w-9" />
      </div>

      <div className="max-w-sm mx-auto px-4 py-6 space-y-5">

        {/* Current plan card */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-5 text-white flex items-center justify-between shadow-lg shadow-orange-200/50">
          <div>
            <p className="text-xs font-bold text-orange-100 mb-1">باقتك الحالية</p>
            <p className="font-black text-2xl">{membership || "مجاني"}</p>
            <p className="text-xs text-orange-100 mt-1.5 flex items-center gap-1">
              <Star className="w-3 h-3 fill-orange-100" /> {points} نقطة
            </p>
          </div>
          <div className="relative w-16 h-16">
            <div className={cn("w-16 h-16 rounded-full flex items-center justify-center",
              activeBadge ? BADGES.find(b => b.id === activeBadge)?.bg ?? "bg-white/20" : "bg-white/20"
            )}>
              <Crown className="w-8 h-8 text-white" />
            </div>
            {activeBadge && (
              <div className={cn("absolute -bottom-1 -left-1 w-6 h-6 rounded-full flex items-center justify-center text-xs",
                BADGES.find(b => b.id === activeBadge)?.badge ?? ""
              )}>
                {BADGES.find(b => b.id === activeBadge)?.emoji}
              </div>
            )}
          </div>
        </div>

        {/* ── Badges section ── */}
        <div className="bg-white dark:bg-[#1A2332] rounded-3xl border dark:border-slate-700 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🎨</span>
            <p className="font-black text-sm dark:text-white">توسيقات الحساب</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {BADGES.map(badge => {
              const isActive  = activeBadge === badge.id;
              const canAfford = points >= badge.points;
              const isBuying  = buyingBadge === badge.id;
              const isDone    = boughtBadge === badge.id;
              return (
                <button key={badge.id} onClick={() => handleBuyBadge(badge)}
                  disabled={isActive || isBuying || !canAfford}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all active:scale-95",
                    isActive  ? `border-2 ${badge.border} bg-slate-50 dark:bg-slate-800`
                    : canAfford ? `${badge.border} hover:shadow-lg ${badge.glow}`
                    : "border-slate-100 dark:border-slate-700 opacity-50"
                  )}>
                  {/* Avatar ring preview */}
                  <div className={cn("w-12 h-12 rounded-full ring-4 flex items-center justify-center text-xl bg-white dark:bg-slate-700", badge.ring)}>
                    {badge.emoji}
                  </div>
                  <p className="font-black text-[11px] dark:text-white text-center leading-tight">{badge.label}</p>
                  {isActive ? (
                    <span className="text-[10px] font-black text-green-500">مفعّل ✓</span>
                  ) : isDone ? (
                    <span className="text-[10px] font-black text-green-500">تم! ✓</span>
                  ) : isBuying ? (
                    <Loader2 className="animate-spin w-3 h-3 text-orange-500" />
                  ) : (
                    <span className={cn("text-[10px] font-black", canAfford ? "text-orange-500" : "text-red-400")}>
                      {badge.points} نقطة
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] font-bold text-slate-400 text-center">اضغط على التوسيق لشرائه وتفعيله على حسابك</p>
        </div>

        {/* ── Buy custom ID section ── */}
        <div className="bg-white dark:bg-[#1A2332] rounded-3xl border dark:border-slate-700 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/20 flex items-center justify-center">
              <Hash className="w-4 h-4 text-orange-500" />
            </div>
            <div>
              <p className="font-black text-sm dark:text-white">شراء ID مخصص</p>
              <p className="text-[11px] font-bold text-slate-400 mt-0.5">غيّر رقمك لرقم تختاره</p>
            </div>
            <span className="mr-auto text-xs font-black text-orange-500 bg-orange-50 dark:bg-orange-950/20 px-2.5 py-1 rounded-full">
              {ID_COST} نقطة
            </span>
          </div>

          {/* Current ID display */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-3 flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-400">الـ ID الحالي</p>
            <p className="font-black text-base dark:text-white tracking-widest">{uniqueId || "—"}</p>
          </div>

          {/* New ID input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block">أدخل الـ ID الجديد</label>
            <div className="relative">
              <Hash className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400" />
              <input
                value={newId}
                onChange={e => setNewId(e.target.value.replace(/\D/g, "").slice(0, 8))}
                placeholder="أرقام فقط — حتى 8 خانات"
                inputMode="numeric"
                maxLength={8}
                className="w-full h-12 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pr-10 pl-3 text-sm font-black dark:text-white focus:outline-none focus:border-orange-400 tracking-widest"
              />
            </div>
            {points < ID_COST && (
              <p className="text-xs font-bold text-red-400">نقاطك غير كافية ({points}/{ID_COST})</p>
            )}
          </div>

          <button
            onClick={handleBuyId}
            disabled={newId.length < 4 || points < ID_COST || idBuying || idDone}
            className={cn(
              "w-full py-3.5 font-black text-sm rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all",
              idDone
                ? "bg-green-500 text-white"
                : "bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50 shadow-lg shadow-orange-200/50"
            )}>
            {idBuying ? <Loader2 className="animate-spin w-4 h-4" />
             : idDone  ? <><CheckCircle2 className="w-4 h-4" /> تم تغيير الـ ID!</>
             : <><ShoppingCart className="w-4 h-4" /> شراء الـ ID · {ID_COST} نقطة</>}
          </button>
        </div>

        {/* ── Subscription plans ── */}
        <p className="font-black text-xs text-slate-400 px-1">باقات الاشتراك</p>

        {payError && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-2xl px-4 py-3">
            <p className="text-sm font-black text-red-500 text-center">{payError}</p>
          </div>
        )}

        {PLANS.map(plan => {
          const isCurrentPlan = membership === plan.name;
          const isPaying      = payingPlan === plan.id;
          return (
            <div key={plan.id} className="bg-white dark:bg-[#1A2332] rounded-3xl border dark:border-slate-700 overflow-hidden shadow-sm">
              <div className={`bg-gradient-to-r ${plan.color} p-4 flex items-center justify-between`}>
                <div>
                  <p className="font-black text-white text-lg">{plan.name}</p>
                  <p className="text-white/80 text-sm font-bold">{plan.price}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {plan.popular && (
                    <span className="bg-white/20 backdrop-blur-sm text-white text-[10px] font-black px-2.5 py-1 rounded-full">
                      الأكثر طلباً
                    </span>
                  )}
                  {isCurrentPlan && (
                    <span className="bg-white/30 backdrop-blur-sm text-white text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> باقتك الحالية
                    </span>
                  )}
                </div>
              </div>
              <div className="p-4 space-y-3">
                <ul className="space-y-2">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleSubscribe(plan)}
                  disabled={isCurrentPlan || !!payingPlan}
                  className={cn(
                    "w-full py-3 font-black text-sm rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all",
                    isCurrentPlan
                      ? "bg-green-500/10 text-green-600 dark:text-green-400 cursor-default"
                      : "bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-60 shadow-md shadow-orange-200/40"
                  )}
                >
                  {isPaying ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> جاري الإنشاء…</>
                  ) : isCurrentPlan ? (
                    <><CheckCircle2 className="w-4 h-4" /> مشترك حالياً</>
                  ) : (
                    <><CreditCard className="w-4 h-4" /> ادفع الآن · {plan.amount} ج</>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
