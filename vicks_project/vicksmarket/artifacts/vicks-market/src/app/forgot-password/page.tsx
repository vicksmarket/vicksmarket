"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sendEmailResetOtp, verifyEmailResetOtp, completePasswordReset } from "@/app/actions/otp-actions";
import { VicksLogo } from "@/components/VicksLogo";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [step, setStep] = useState<"email" | "otp" | "newpass">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [timer, setTimer] = useState(0);
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (timer <= 0) return;
    const t = setInterval(() => setTimer(v => v - 1), 1000);
    return () => clearInterval(t);
  }, [timer]);

  const sendCode = async () => {
    if (!email) { toast({ variant: "destructive", title: "أدخل البريد الإلكتروني" }); return; }
    setLoading(true);
    const result = await sendEmailResetOtp(email);
    setLoading(false);
    if (!result.success) { toast({ variant: "destructive", title: "فشل إرسال الكود", description: result.error }); return; }
    setTimer(120); setStep("otp");
    toast({ title: "📧 تم إرسال كود التحقق!" });
  };

  const verifyOtp = async () => {
    setLoading(true);
    const result = await verifyEmailResetOtp(email, otp);
    setLoading(false);
    if (!result.success) {
      toast({ variant: "destructive", title: "الكود غير صحيح", description: result.error });
      return;
    }
    // Store the short-lived reset token issued by the server
    setResetToken(result.resetToken ?? "");
    setStep("newpass");
  };

  const resetPassword = async () => {
    if (newPass.length < 6) { toast({ variant: "destructive", title: "كلمة المرور 6 أحرف على الأقل" }); return; }
    if (newPass !== confirmPass) { toast({ variant: "destructive", title: "كلمتا المرور غير متطابقتين" }); return; }
    if (!resetToken) { toast({ variant: "destructive", title: "رمز إعادة التعيين مفقود — أعد المحاولة" }); return; }
    setLoading(true);
    // Use admin API via server action — no active session required
    const result = await completePasswordReset(resetToken, newPass);
    setLoading(false);
    if (!result.success) {
      toast({ variant: "destructive", title: "فشل التغيير", description: result.error });
      return;
    }
    toast({ title: "✅ تم تغيير كلمة المرور!" });
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#1A2332] flex flex-col" dir="rtl">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
        <Link href="/login" className="w-9 h-9 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full">
          <ArrowRight className="w-4 h-4 text-slate-600 dark:text-slate-300" />
        </Link>
        <span className="font-black text-sm dark:text-white">استعادة كلمة المرور</span>
        <VicksLogo className="w-8 h-8" />
      </div>

      {/* Steps indicator */}
      <div className="flex items-center justify-center gap-2 py-4">
        {(["email","otp","newpass"] as const).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-colors
              ${step === s ? "bg-orange-500 text-white" : (["email","otp","newpass"].indexOf(step) > i ? "bg-green-500 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-400")}`}>
              {["email","otp","newpass"].indexOf(step) > i ? "✓" : i + 1}
            </div>
            {i < 2 && <div className={`w-8 h-0.5 rounded-full transition-colors ${["email","otp","newpass"].indexOf(step) > i ? "bg-green-400" : "bg-slate-100 dark:bg-slate-700"}`} />}
          </div>
        ))}
      </div>

      <div className="flex-1 px-5 pt-4 pb-10 max-w-md mx-auto w-full space-y-4">

        {step === "email" && (
          <>
            <div className="text-center space-y-1 mb-6">
              <p className="font-black text-slate-700 dark:text-slate-200">أدخل بريدك الإلكتروني</p>
              <p className="text-xs text-slate-400">سنرسل لك كود التحقق</p>
            </div>
            <div className="relative">
              <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="البريد الإلكتروني"
                className="w-full h-12 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pr-11 pl-4 font-bold text-sm focus:outline-none focus:border-orange-400 transition-colors" />
            </div>
            <button onClick={sendCode} disabled={loading || !email}
              className="w-full h-14 bg-orange-500 text-white font-black rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-60">
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "إرسال الكود"}
            </button>
          </>
        )}

        {step === "otp" && (
          <>
            <div className="text-center space-y-1 mb-6">
              <p className="font-black text-slate-700 dark:text-slate-200">أدخل كود التحقق</p>
              <p className="text-xs text-slate-400">أُرسل إلى {email}</p>
              {timer > 0 && <p className="text-xs font-black text-orange-500">⏱ {timer}ث</p>}
            </div>
            <input maxLength={6} inputMode="numeric" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="● ● ● ● ● ●"
              className="w-full h-14 rounded-2xl border-2 border-orange-200 dark:border-orange-800 bg-slate-50 dark:bg-slate-800 text-center font-black tracking-[0.5rem] text-xl focus:outline-none focus:border-orange-400" />
            <button onClick={verifyOtp} disabled={otp.length < 6 || loading}
              className="w-full h-14 bg-orange-500 text-white font-black rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-60">
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "تحقق من الكود"}
            </button>
            {timer === 0 && (
              <button onClick={sendCode} className="w-full text-xs font-black text-orange-500 text-center py-2">
                إعادة إرسال الكود
              </button>
            )}
          </>
        )}

        {step === "newpass" && (
          <>
            <div className="text-center space-y-1 mb-6">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
              <p className="font-black text-slate-700 dark:text-slate-200">أدخل كلمة المرور الجديدة</p>
            </div>
            <div className="relative">
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400" />
              <input type={showPass ? "text" : "password"} value={newPass} onChange={e => setNewPass(e.target.value)}
                placeholder="كلمة المرور الجديدة"
                className="w-full h-12 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pr-11 pl-11 font-bold text-sm focus:outline-none focus:border-orange-400 transition-colors" />
              <button type="button" onClick={() => setShowPass(v => !v)} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type={showPass ? "text" : "password"} value={confirmPass} onChange={e => setConfirmPass(e.target.value)}
                placeholder="تأكيد كلمة المرور"
                className={`w-full h-12 rounded-2xl border-2 bg-slate-50 dark:bg-slate-800 pr-11 pl-4 font-bold text-sm focus:outline-none transition-colors
                  ${confirmPass && newPass !== confirmPass ? "border-red-300" : "border-slate-100 dark:border-slate-700 focus:border-orange-400"}`} />
            </div>
            <button onClick={resetPassword} disabled={loading || !newPass || !confirmPass}
              className="w-full h-14 bg-orange-500 text-white font-black rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-60">
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "حفظ كلمة المرور"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
