"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Crown, Coins, Loader2, Check, Star, Zap, Hash, Calendar, ChevronDown, ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VicksLogo } from "@/components/VicksLogo";
import { useUser, useDoc } from "@/lib/supabase-hooks";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const DEFAULTS = { gold: 600, silver: 200, blue: 99 };

const PLANS_META = [
  { id: "blue", name: "الباقة الزرقاء", nameEn: "BLUE", icon: "🔵", gradient: "from-blue-600 to-blue-400", border: "border-blue-300", bg: "bg-blue-50 dark:bg-blue-950/20", tc: "text-blue-600", badge: "text-blue-500", maxProducts: 20, maxReels: 0, features: ["نشر حتى 20 منتجاً", "شارة توثيق زرقاء", "ظهور أساسي في البحث", "دعم فني عادي"] },
  { id: "silver", name: "الباقة الفضية", nameEn: "SILVER", icon: "⚪", gradient: "from-slate-600 to-slate-400", border: "border-slate-300", bg: "bg-slate-50 dark:bg-slate-900/40", tc: "text-slate-600", badge: "text-slate-500", maxProducts: 50, maxReels: 1, features: ["نشر حتى 50 منتجاً", "رفع 1 رييل شهرياً", "شارة توثيق فضية", "أولوية ظهور متوسطة", "دعم فني سريع"] },
  { id: "gold", name: "الباقة الذهبية", nameEn: "GOLD", icon: "👑", gradient: "from-yellow-600 to-yellow-400", border: "border-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-950/20", tc: "text-yellow-600", badge: "text-yellow-500", maxProducts: 999999, maxReels: 999, features: ["منتجات غير محدودة ∞", "ريلز غير محدودة ∞", "شارة ذهبية حصرية", "أولوية ظهور مطلقة", "دعم VIP خاص 24/7"] },
];

const DURATIONS = [
  { months: 1, label: "شهر", discount: 0 },
  { months: 3, label: "3 أشهر", discount: 10 },
  { months: 6, label: "6 أشهر", discount: 20 },
  { months: 12, label: "سنة", discount: 30 },
];

export default function VIPPage() {
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();

  const [prices, setPrices] = useState(DEFAULTS);
  const [specialIds, setSpecialIds] = useState<{ id: string; discount: number }[]>([]);
  const [selectedDuration, setSelectedDuration] = useState(1);
  const [specialId, setSpecialId] = useState("");
  const [specialDiscount, setSpecialDiscount] = useState(0);
  const [specialChecked, setSpecialChecked] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);

  const { data: profile } = useDoc("users", user?.uid ?? null);

  useEffect(() => {
    const supabase = createClient();
    supabase.from("config").select("*").eq("id", "vip_pricing").maybeSingle().then(({ data }) => {
      if (data) {
        setPrices({ gold: data.gold ?? DEFAULTS.gold, silver: data.silver ?? DEFAULTS.silver, blue: data.blue ?? DEFAULTS.blue });
        setSpecialIds(data.specialIds ?? []);
      }
    });
  }, []);

  const checkSpecialId = () => {
    const found = specialIds.find(s => s.id === specialId.trim());
    if (found) {
      setSpecialDiscount(found.discount);
      setSpecialChecked(true);
      toast({ title: `🎉 رقم مميز! خصم ${found.discount}% على جميع الباقات` });
    } else {
      setSpecialChecked(false);
      setSpecialDiscount(0);
      toast({ variant: "destructive", title: "الرقم غير موجود في قائمة الأرقام المميزة" });
    }
  };

  const getFinalPrice = (basePrice: number) => {
    const durationDiscount = DURATIONS.find(d => d.months === selectedDuration)?.discount || 0;
    const totalDiscount = Math.min(durationDiscount + specialDiscount, 70);
    const monthly = basePrice * (1 - totalDiscount / 100);
    return Math.round(monthly * selectedDuration);
  };

  const handleSubscribe = async (planId: string) => {
    if (!user) { router.push('/login'); return; }
    if (!profile) { toast({ variant: "destructive", title: "يرجى تسجيل الدخول أولاً" }); return; }

    const plan = PLANS_META.find(p => p.id === planId);
    if (!plan) return;

    const finalPrice = getFinalPrice((prices as any)[planId]);
    if ((profile.points || 0) < finalPrice) {
      toast({ variant: "destructive", title: "نقاطك غير كافية", description: `تحتاج ${finalPrice} نقطة` });
      return;
    }

    setIsProcessing(true);
    try {
      const supabase = createClient();
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + selectedDuration);

      await supabase.from("users").update({
        points: (profile.points || 0) - finalPrice,
        isVerified: true,
        verificationType: planId,
        verificationExpiresAt: expiresAt.toISOString(),
        maxProducts: plan.maxProducts,
        role: "merchant",
      }).eq('id', user.uid);

      toast({ title: `🎉 تم الاشتراك في ${plan.name}!`, description: `صالحة لـ ${selectedDuration === 1 ? 'شهر' : `${selectedDuration} أشهر`}` });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الاشتراك" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#1A2332] font-cairo pb-24 text-right" dir="rtl">
      <header className="sticky top-0 z-50 bg-white dark:bg-[#1A2332] border-b dark:border-slate-800 px-4 py-3 flex items-center justify-between shadow-sm">
        <button onClick={() => router.back()} className="w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
          <ArrowLeft className="w-4 h-4 text-slate-600 rotate-180" />
        </button>
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-yellow-500" />
          <span className="font-black text-sm dark:text-white">باقات VIP</span>
        </div>
        <VicksLogo className="w-8 h-8" />
      </header>

      <div className="p-4 space-y-4">
        {/* Points display */}
        {profile && (
          <div className="bg-gradient-to-l from-orange-500 to-yellow-500 rounded-3xl p-4 text-white text-center shadow-lg">
            <p className="text-[10px] font-black uppercase opacity-80">نقاطك الحالية</p>
            <p className="text-4xl font-black">{(profile.points || 0).toLocaleString()}</p>
            <p className="text-[10px] font-bold opacity-70">نقطة فيكس</p>
          </div>
        )}

        {/* Duration selector */}
        <div className="bg-white dark:bg-[#252D3D] rounded-2xl p-3 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 mb-2">اختر مدة الاشتراك</p>
          <div className="grid grid-cols-4 gap-1">
            {DURATIONS.map(d => (
              <button key={d.months} onClick={() => setSelectedDuration(d.months)}
                className={cn("py-2 rounded-xl font-black text-[10px] transition-all",
                  selectedDuration === d.months ? "bg-orange-500 text-white shadow-md" : "bg-slate-100 dark:bg-slate-800 text-slate-500")}>
                {d.label}
                {d.discount > 0 && <span className="block text-[8px] opacity-70">-{d.discount}%</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Special ID */}
        <div className="bg-white dark:bg-[#252D3D] rounded-2xl p-3 shadow-sm flex gap-2">
          <Input value={specialId} onChange={e => setSpecialId(e.target.value)} placeholder="رقم ID مميز (خصم خاص)" className="h-10 rounded-xl font-bold dark:bg-slate-900 text-sm flex-1" />
          <Button onClick={checkSpecialId} className="h-10 px-4 rounded-xl bg-slate-900 text-white font-black text-[11px]">
            {specialChecked ? <Check className="w-4 h-4 text-green-400" /> : "تحقق"}
          </Button>
        </div>

        {/* Plans */}
        {PLANS_META.map(plan => {
          const finalPrice = getFinalPrice((prices as any)[plan.id]);
          const isCurrentPlan = profile?.verificationType === plan.id && profile?.isVerified;
          return (
            <div key={plan.id} className={cn("rounded-[2.5rem] border-2 overflow-hidden shadow-md", plan.border, plan.bg)}>
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{plan.icon}</span>
                      <span className={cn("font-black text-lg", plan.tc)}>{plan.name}</span>
                      {isCurrentPlan && <span className="text-[9px] bg-green-500 text-white px-2 py-0.5 rounded-full font-black">باقتك الحالية</span>}
                    </div>
                    <p className="text-[10px] font-bold text-slate-400">{plan.maxProducts === 999999 ? 'منتجات غير محدودة' : `حتى ${plan.maxProducts} منتج`}</p>
                  </div>
                  <div className="text-left">
                    <span className={cn("text-2xl font-black", plan.tc)}>{finalPrice}</span>
                    <span className="text-[10px] font-bold text-slate-400 block">نقطة</span>
                  </div>
                </div>

                <button onClick={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)}
                  className="flex items-center gap-1 text-[10px] font-black text-slate-400 mb-3">
                  {expandedPlan === plan.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  عرض المميزات
                </button>

                {expandedPlan === plan.id && (
                  <ul className="space-y-1 mb-3 animate-in slide-in-from-top-2 duration-200">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                        <Check className={cn("w-3.5 h-3.5 flex-shrink-0", plan.badge)} />
                        {f}
                      </li>
                    ))}
                  </ul>
                )}

                <Button onClick={() => handleSubscribe(plan.id)} disabled={isProcessing || isCurrentPlan}
                  className={cn("w-full h-12 rounded-2xl font-black text-sm bg-gradient-to-l text-white", plan.gradient)}>
                  {isProcessing ? <Loader2 className="animate-spin w-4 h-4" /> : isCurrentPlan ? "✓ مشترك حالياً" : `اشترك الآن • ${finalPrice} نقطة`}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
