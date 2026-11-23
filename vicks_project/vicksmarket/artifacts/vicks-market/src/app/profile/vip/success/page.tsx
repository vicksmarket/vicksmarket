"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Loader2, Crown } from "lucide-react";
import { VicksLogo } from "@/components/VicksLogo";

export default function VipSuccessPage() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const tapId  = searchParams.get("tap_id");
  const planId = searchParams.get("plan");
  const uid    = searchParams.get("uid");

  const [status,     setStatus]     = useState<"loading" | "success" | "failed">("loading");
  const [membership, setMembership] = useState<string>("");
  const [amount,     setAmount]     = useState<number>(0);

  useEffect(() => {
    if (!tapId || !planId || !uid) {
      setStatus("failed");
      return;
    }

    fetch(`/vkapi/tap/verify?tap_id=${tapId}&plan=${planId}&uid=${uid}`)
      .then(r => r.json())
      .then(data => {
        if (data.status === "success") {
          setMembership(data.membership);
          setAmount(data.amount);
          setStatus("success");
        } else {
          setStatus("failed");
        }
      })
      .catch(() => setStatus("failed"));
  }, [tapId, planId, uid]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0f1621] flex items-center justify-center px-4 font-cairo" dir="rtl">
      <div className="max-w-sm w-full">

        {/* Loading */}
        {status === "loading" && (
          <div className="bg-white dark:bg-[#1A2332] rounded-3xl p-8 text-center shadow-sm space-y-4">
            <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto" />
            <p className="font-black text-lg dark:text-white">جاري التحقق من الدفع…</p>
            <p className="text-sm font-bold text-slate-400">لحظة من فضلك</p>
          </div>
        )}

        {/* Success */}
        {status === "success" && (
          <div className="bg-white dark:bg-[#1A2332] rounded-3xl p-8 text-center shadow-sm space-y-5">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-orange-200/50">
              <Crown className="w-10 h-10 text-white" />
            </div>
            <div className="space-y-1">
              <CheckCircle2 className="w-6 h-6 text-green-500 mx-auto" />
              <p className="font-black text-2xl dark:text-white">تم الدفع بنجاح!</p>
              <p className="text-sm font-bold text-slate-400">مرحباً بك في {membership}</p>
            </div>
            {amount > 0 && (
              <div className="bg-orange-50 dark:bg-orange-950/20 rounded-2xl p-3">
                <p className="text-sm font-black text-orange-600 dark:text-orange-400">
                  تم خصم {amount} جنيه
                </p>
              </div>
            )}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => router.replace("/profile/vip")}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-black text-sm rounded-2xl active:scale-95 transition-all"
              >
                عرض عضويتي
              </button>
              <button
                onClick={() => router.replace("/verify")}
                className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black text-sm rounded-2xl active:scale-95 transition-all"
              >
                الرئيسية
              </button>
            </div>
          </div>
        )}

        {/* Failed */}
        {status === "failed" && (
          <div className="bg-white dark:bg-[#1A2332] rounded-3xl p-8 text-center shadow-sm space-y-5">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-950/30 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <div className="space-y-1">
              <p className="font-black text-2xl dark:text-white">لم يتم الدفع</p>
              <p className="text-sm font-bold text-slate-400">يمكنك المحاولة مرة أخرى</p>
            </div>
            <div className="space-y-2 pt-2">
              <button
                onClick={() => router.replace("/profile/vip")}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-black text-sm rounded-2xl active:scale-95 transition-all"
              >
                العودة وإعادة المحاولة
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-center gap-2 mt-6 opacity-40">
          <VicksLogo className="w-5 h-5" />
          <span className="text-xs font-black text-slate-500">Vicks Market</span>
        </div>
      </div>
    </div>
  );
}
