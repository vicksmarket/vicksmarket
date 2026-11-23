"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye, EyeOff, Loader2, Mail, Lock, Store,
  ShieldCheck, Check, UserPlus, Send, CheckCircle2
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { VicksLogo } from "@/components/VicksLogo";
import { cn } from "@/lib/utils";
import { saveSignupEmailOtp, verifySignupEmailOtp } from "@/app/actions/otp-actions";

/* ── Robot Captcha ── */
function RobotCheckbox({ verified, onVerify, hasError }: {
  verified: boolean; onVerify: () => void; hasError: boolean;
}) {
  const [checking, setChecking] = useState(false);
  return (
    <div className={cn(
      "rounded-2xl border-2 bg-slate-50 dark:bg-slate-800 px-4 py-4 transition-colors",
      hasError ? "border-red-400" : verified ? "border-green-400" : "border-slate-100 dark:border-slate-700"
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => {
            if (verified || checking) return;
            setChecking(true);
            setTimeout(() => { setChecking(false); onVerify(); }, 1400);
          }} className={cn(
            "w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300",
            verified ? "bg-orange-500 border-orange-500"
            : checking ? "border-orange-400 bg-white dark:bg-slate-700"
            : hasError ? "border-red-400 bg-white dark:bg-slate-700"
            : "border-slate-400 bg-white dark:bg-slate-700 hover:border-orange-400"
          )}>
            {checking ? <Loader2 className="w-3.5 h-3.5 text-orange-500 animate-spin" />
             : verified ? <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
             : null}
          </button>
          <span className="text-sm font-black text-slate-700 dark:text-slate-200">لست روبوت</span>
        </div>
        <div className="flex flex-col items-center opacity-60">
          <ShieldCheck className="w-6 h-6 text-orange-400" />
          <span className="text-[9px] font-bold text-slate-400 mt-0.5">التحقق</span>
        </div>
      </div>
    </div>
  );
}

const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

export default function SignupPage() {
  const router = useRouter();
  const sb     = createClient();

  /* fields */
  const [shopName,    setShopName]    = useState("");
  const [email,       setEmail]       = useState("");
  const [otpCode,     setOtpCode]     = useState("");
  const [password,    setPassword]    = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass,    setShowPass]    = useState(false);
  const [showConf,    setShowConf]    = useState(false);
  const [captchaOk,   setCaptchaOk]   = useState(false);
  const [captchaErr,  setCaptchaErr]  = useState(false);

  /* OTP state */
  const [otpSent,     setOtpSent]     = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpSending,  setOtpSending]  = useState(false);
  const [otpError,    setOtpError]    = useState("");
  const [countdown,   setCountdown]   = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* submit */
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  /* countdown ticker */
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const startCountdown = () => {
    setCountdown(60);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() =>
      setCountdown(c => { if (c <= 1) { clearInterval(timerRef.current!); return 0; } return c - 1; }), 1000);
  };

  /* ── إرسال الكود عبر النظام المخصص (Resend) ── */
  const handleSendOtp = async () => {
    if (!isValidEmail(email) || otpSending || otpVerified) return;
    setOtpError(""); setError("");
    setOtpSending(true);
    try {
      const result = await saveSignupEmailOtp(email.trim().toLowerCase());
      if (!result.success) throw new Error(result.error || "فشل إرسال الكود");
      setOtpSent(true);
      startCountdown();
    } catch (err: any) {
      setOtpError(err.message || "تعذّر إرسال الكود — تأكد من صحة البريد");
    } finally {
      setOtpSending(false);
    }
  };

  /* trigger send when email becomes valid */
  const emailValid = isValidEmail(email);

  /* ── إنشاء الحساب ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setCaptchaErr(false);

    if (!otpSent || otpCode.trim().length < 6) { setError("أرسل الكود وأدخل الـ 6 أرقام"); return; }
    if (password.length < 6)                    { setError("كلمة المرور 6 أحرف على الأقل"); return; }
    if (password !== confirmPass)                { setError("كلمتا المرور غير متطابقتين"); return; }
    if (!captchaOk)                              { setCaptchaErr(true); return; }

    setLoading(true);
    try {
      /* 1. تحقق من الكود عبر النظام المخصص */
      const verifyResult = await verifySignupEmailOtp(email.trim().toLowerCase(), otpCode.trim());
      if (!verifyResult.success) {
        setError(verifyResult.error || "الكود غير صحيح أو انتهت صلاحيته");
        setLoading(false);
        return;
      }
      setOtpVerified(true);

      /* 2. أنشئ الحساب عبر Admin API */
      const res = await fetch("/vkapi/auth/create-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email:    email.trim().toLowerCase(),
          password,
          shopName: shopName.trim(),
          skipOtp:  true,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409 || data.error === "email_already_exists") {
          setError("هذا البريد مسجّل بالفعل — جارٍ تحويلك لتسجيل الدخول…");
          setTimeout(() => router.replace("/login"), 2000);
          setLoading(false);
          return;
        }
        throw new Error(data.error || "فشل إنشاء الحساب");
      }

      /* 3. سجّل دخولاً مباشراً بعد الإنشاء */
      const { error: signInErr } = await sb.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (signInErr) console.warn("[signup] signIn after create:", signInErr.message);

      router.replace("/");
    } catch (err: any) {
      setError(err.message || "حدث خطأ، حاول مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0f1621] flex flex-col items-center justify-center px-4 font-cairo" dir="rtl">
      <div className="w-full max-w-sm space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-1">
            <VicksLogo className="w-8 h-8" />
            <span className="font-black text-xl text-slate-800 dark:text-white">Vicks Market</span>
          </div>
          <h1 className="font-black text-2xl text-slate-800 dark:text-white">إنشاء حساب</h1>
          <p className="text-sm font-bold text-slate-400">انضم إلى Vicks Market</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">

          {/* Global error */}
          {error && (
            <div className="rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-4 py-3 text-center">
              <p className="text-sm font-black text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Shop name */}
          <div className="relative">
            <Store className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" value={shopName} onChange={e => setShopName(e.target.value)}
              placeholder="اسم المتجر"
              className="w-full rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800
                         pr-11 pl-4 py-4 text-sm font-black text-slate-700 dark:text-slate-200
                         placeholder:text-slate-400 placeholder:font-bold focus:outline-none focus:border-orange-400 transition-colors" />
          </div>

          {/* Email + send button */}
          <div className="relative flex gap-2">
            <div className="relative flex-1">
              <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email" value={email}
                onChange={e => { setEmail(e.target.value); setOtpSent(false); setOtpVerified(false); setOtpCode(""); setCountdown(0); }}
                placeholder="البريد الإلكتروني"
                className="w-full rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800
                           pr-11 pl-4 py-4 text-sm font-black text-slate-700 dark:text-slate-200
                           placeholder:text-slate-400 placeholder:font-bold focus:outline-none focus:border-orange-400 transition-colors" />
            </div>
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={!emailValid || otpSending || otpVerified || countdown > 0}
              className={cn(
                "flex-shrink-0 px-4 rounded-2xl text-xs font-black flex items-center gap-1.5 transition-all",
                otpVerified
                  ? "bg-green-100 text-green-600 dark:bg-green-900/30"
                  : "bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-40"
              )}>
              {otpSending   ? <Loader2 className="w-4 h-4 animate-spin" />
               : otpVerified ? <><CheckCircle2 className="w-4 h-4" /> موثّق</>
               : countdown > 0 ? `${countdown}s`
               : <><Send className="w-3.5 h-3.5" /> {otpSent ? "إعادة" : "إرسال كود"}</>}
            </button>
          </div>

          {/* OTP error */}
          {otpError && (
            <p className="text-xs font-black text-red-500 text-center px-2">{otpError}</p>
          )}

          {/* OTP code field — shown after send */}
          {otpSent && !otpVerified && (
            <div className="space-y-1">
              <p className="text-xs font-black text-slate-500 text-center">
                ✉️ أرسلنا كوداً على بريدك — أدخله هنا
              </p>
              <div className="relative">
                <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text" inputMode="numeric" maxLength={6}
                  value={otpCode} onChange={e => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="الكود المكوّن من 6 أرقام"
                  className="w-full rounded-2xl border-2 border-orange-200 dark:border-orange-800 bg-white dark:bg-slate-800
                             pr-11 pl-4 py-4 text-center text-xl font-black tracking-[0.4em] text-orange-600 dark:text-orange-400
                             placeholder:text-slate-300 placeholder:text-sm placeholder:font-bold placeholder:tracking-normal
                             focus:outline-none focus:border-orange-400 transition-colors" />
              </div>
            </div>
          )}

          {/* Password */}
          <div className="relative">
            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type={showPass ? "text" : "password"} value={password}
              onChange={e => setPassword(e.target.value)} placeholder="كلمة المرور"
              className="w-full rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800
                         pr-11 pl-12 py-4 text-sm font-black text-slate-700 dark:text-slate-200
                         placeholder:text-slate-400 placeholder:font-bold focus:outline-none focus:border-orange-400 transition-colors" />
            <button type="button" onClick={() => setShowPass(v => !v)}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-500 transition-colors">
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type={showConf ? "text" : "password"} value={confirmPass}
              onChange={e => setConfirmPass(e.target.value)} placeholder="تأكيد كلمة المرور"
              className="w-full rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800
                         pr-11 pl-12 py-4 text-sm font-black text-slate-700 dark:text-slate-200
                         placeholder:text-slate-400 placeholder:font-bold focus:outline-none focus:border-orange-400 transition-colors" />
            <button type="button" onClick={() => setShowConf(v => !v)}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-orange-500 transition-colors">
              {showConf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Captcha */}
          <RobotCheckbox verified={captchaOk} onVerify={() => setCaptchaOk(true)} hasError={captchaErr} />

          {/* Submit */}
          <button
            type="submit" disabled={loading || !otpSent}
            className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-black
                       text-base rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-orange-200/50">
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري الإنشاء…</>
              : <><UserPlus className="w-4 h-4" /> إنشاء الحساب</>}
          </button>
        </form>

        <p className="text-center text-sm font-bold text-slate-400">
          لديك حساب؟{" "}
          <Link href="/login" className="text-orange-500 hover:text-orange-600 font-black transition-colors">
            تسجيل الدخول
          </Link>
        </p>
      </div>
    </div>
  );
}
