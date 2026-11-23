"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Store, Mail, Lock, CheckCircle2, Send } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { saveSignupEmailOtp, verifySignupEmailOtp, sendSignupTelegramOtp, verifySignupTelegramOtp } from "@/app/actions/otp-actions";
import { VicksLogo } from "@/components/VicksLogo";

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [storeName, setStoreName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [telegram, setTelegram] = useState("");

  // Email OTP
  const [emailOtp, setEmailOtp] = useState("");
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpVerified, setEmailOtpVerified] = useState(false);
  const [emailOtpLoading, setEmailOtpLoading] = useState(false);
  const [emailTimer, setEmailTimer] = useState(0);

  // Telegram OTP
  const [telegramOtp, setTelegramOtp] = useState("");
  const [telegramOtpSent, setTelegramOtpSent] = useState(false);
  const [telegramOtpVerified, setTelegramOtpVerified] = useState(false);
  const [telegramOtpLoading, setTelegramOtpLoading] = useState(false);
  const [telegramTimer, setTelegramTimer] = useState(0);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (emailTimer <= 0) return;
    const t = setInterval(() => setEmailTimer(v => v - 1), 1000);
    return () => clearInterval(t);
  }, [emailTimer]);

  useEffect(() => {
    if (telegramTimer <= 0) return;
    const t = setInterval(() => setTelegramTimer(v => v - 1), 1000);
    return () => clearInterval(t);
  }, [telegramTimer]);

  // ── Email OTP ─────────────────────────────────────────────────────────────
  const sendEmailCode = async () => {
    if (!email) { toast({ variant: "destructive", title: "أدخل البريد الإلكتروني" }); return; }
    setEmailOtpLoading(true);
    const result = await saveSignupEmailOtp(email);
    setEmailOtpLoading(false);
    if (!result.success) { toast({ variant: "destructive", title: "فشل إرسال الكود", description: result.error }); return; }
    setEmailTimer(60); setEmailOtpSent(true); setEmailOtp(""); setEmailOtpVerified(false);
    toast({ title: "📧 تم إرسال الكود!" });
  };

  const verifyEmailCode = async () => {
    setEmailOtpLoading(true);
    const result = await verifySignupEmailOtp(email, emailOtp);
    setEmailOtpLoading(false);
    if (result.success) { setEmailOtpVerified(true); toast({ title: "✅ تم التحقق من البريد!" }); }
    else toast({ variant: "destructive", title: "الكود غير صحيح", description: result.error });
  };

  // ── Telegram OTP ──────────────────────────────────────────────────────────
  const sendTelegramCode = async () => {
    if (!telegram) { toast({ variant: "destructive", title: "أدخل معرف تيليجرام" }); return; }
    setTelegramOtpLoading(true);
    const result = await sendSignupTelegramOtp(telegram);
    setTelegramOtpLoading(false);
    if (!result.success) {
      toast({
        variant: "destructive",
        title: "فشل إرسال الكود",
        description: result.needStart
          ? "ابدأ محادثة مع @VicksMarketBot أولاً ثم أعد المحاولة"
          : result.error,
      });
      return;
    }
    setTelegramTimer(60); setTelegramOtpSent(true); setTelegramOtp(""); setTelegramOtpVerified(false);
    toast({ title: "✈️ تم إرسال الكود عبر تيليجرام!" });
  };

  const verifyTelegramCode = async () => {
    setTelegramOtpLoading(true);
    const result = await verifySignupTelegramOtp(telegram, telegramOtp);
    setTelegramOtpLoading(false);
    if (result.success) { setTelegramOtpVerified(true); toast({ title: "✅ تم التحقق من تيليجرام!" }); }
    else toast({ variant: "destructive", title: "الكود غير صحيح", description: result.error });
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOtpVerified) { toast({ variant: "destructive", title: "يجب التحقق من البريد الإلكتروني أولاً" }); return; }
    if (password.length < 6) { toast({ variant: "destructive", title: "كلمة المرور 6 أحرف على الأقل" }); return; }
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: storeName,
            shop_name: storeName,
            role: "customer",
            telegram: telegram || null,
          },
        },
      });
      if (error) throw error;
      if (data.user) {
        await supabase.from("profiles").upsert({
          id: data.user.id,
          full_name: storeName,
          shop_name: storeName,
          telegram: telegram || null,
          unique_id: Math.floor(10000000 + Math.random() * 90000000).toString(),
          role: "customer",
          created_at: new Date().toISOString(),
        });
      }
      toast({ title: "🎉 تم إنشاء الحساب!" });
      router.push("/login");
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "فشل التسجيل",
        description: err.message?.includes("already registered")
          ? "هذا البريد مسجّل مسبقاً"
          : err.message,
      });
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#1A2332] flex flex-col" dir="rtl">
      {/* Hero */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 px-6 pt-14 pb-10 flex flex-col items-center gap-3">
        <VicksLogo className="w-16 h-16" />
        <h1 className="text-white font-black text-2xl tracking-tight">إنشاء حساب</h1>
        <p className="text-orange-100 text-xs font-bold">انضم إلى آلاف التجار والمتسوقين</p>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 px-5 pt-6 pb-10 max-w-md mx-auto w-full space-y-4">

        {/* Store Name */}
        <div className="relative">
          <Store className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400" />
          <input required value={storeName} onChange={e => setStoreName(e.target.value)}
            placeholder="اسم المتجر أو الاسم الكامل"
            className="w-full h-13 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pr-11 pl-4 py-3.5 font-bold text-sm focus:outline-none focus:border-orange-400 transition-colors" />
        </div>

        {/* ── Email + OTP ────────────────────────────────────────────────── */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400" />
              <input required type="email" value={email}
                onChange={e => { setEmail(e.target.value); setEmailOtpVerified(false); setEmailOtpSent(false); }}
                placeholder="البريد الإلكتروني"
                className="w-full h-12 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pr-11 pl-4 font-bold text-sm focus:outline-none focus:border-orange-400 transition-colors" />
            </div>
            <button type="button" onClick={sendEmailCode}
              disabled={!email || emailTimer > 0 || emailOtpLoading || emailOtpVerified}
              className="h-12 px-4 rounded-2xl bg-orange-500 text-white font-black text-xs disabled:opacity-50 whitespace-nowrap active:scale-95 transition-transform flex items-center gap-1">
              {emailOtpLoading && !emailOtpSent ? <Loader2 className="animate-spin w-3 h-3" /> : null}
              {emailOtpVerified ? "✓" : emailTimer > 0 ? `${emailTimer}ث` : "أرسل كود"}
            </button>
          </div>

          {emailOtpSent && !emailOtpVerified && (
            <div className="flex gap-2 animate-in slide-in-from-top-1 duration-200">
              <input maxLength={6} inputMode="numeric" value={emailOtp}
                onChange={e => setEmailOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="● ● ● ● ● ●"
                className="flex-1 h-12 rounded-2xl border-2 border-orange-200 dark:border-orange-800 bg-slate-50 dark:bg-slate-800 text-center font-black tracking-widest text-lg focus:outline-none focus:border-orange-400" />
              <button type="button" onClick={verifyEmailCode}
                disabled={emailOtp.length < 6 || emailOtpLoading}
                className="h-12 px-4 rounded-2xl bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black text-xs disabled:opacity-50 active:scale-95 transition-transform flex items-center gap-1">
                {emailOtpLoading ? <Loader2 className="animate-spin w-3 h-3" /> : "تحقق"}
              </button>
            </div>
          )}
          {emailOtpVerified && (
            <div className="flex items-center gap-2 text-green-500 text-xs font-black px-1">
              <CheckCircle2 className="w-4 h-4" /> تم التحقق من البريد
            </div>
          )}
        </div>

        {/* ── Telegram verification (optional) ───────────────────────────── */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 px-1">
            معرف تيليجرام <span className="text-slate-400 font-normal">(اختياري — للتواصل وإشعارات الطلبات)</span>
          </p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Send className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-500" />
              <input type="text" value={telegram}
                onChange={e => { setTelegram(e.target.value); setTelegramOtpVerified(false); setTelegramOtpSent(false); }}
                placeholder="@username"
                className="w-full h-12 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pr-11 pl-4 font-bold text-sm focus:outline-none focus:border-sky-400 transition-colors" />
            </div>
            {telegram && !telegramOtpVerified && (
              <button type="button" onClick={sendTelegramCode}
                disabled={telegramTimer > 0 || telegramOtpLoading}
                className="h-12 px-4 rounded-2xl bg-sky-500 text-white font-black text-xs disabled:opacity-50 whitespace-nowrap active:scale-95 transition-transform flex items-center gap-1">
                {telegramOtpLoading && !telegramOtpSent ? <Loader2 className="animate-spin w-3 h-3" /> : null}
                {telegramTimer > 0 ? `${telegramTimer}ث` : "أرسل كود"}
              </button>
            )}
          </div>

          {telegramOtpSent && !telegramOtpVerified && (
            <div className="flex gap-2 animate-in slide-in-from-top-1 duration-200">
              <input maxLength={6} inputMode="numeric" value={telegramOtp}
                onChange={e => setTelegramOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="● ● ● ● ● ●"
                className="flex-1 h-12 rounded-2xl border-2 border-sky-200 dark:border-sky-800 bg-slate-50 dark:bg-slate-800 text-center font-black tracking-widest text-lg focus:outline-none focus:border-sky-400" />
              <button type="button" onClick={verifyTelegramCode}
                disabled={telegramOtp.length < 6 || telegramOtpLoading}
                className="h-12 px-4 rounded-2xl bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black text-xs disabled:opacity-50 active:scale-95 transition-transform flex items-center gap-1">
                {telegramOtpLoading ? <Loader2 className="animate-spin w-3 h-3" /> : "تحقق"}
              </button>
            </div>
          )}
          {telegramOtpVerified && (
            <div className="flex items-center gap-2 text-green-500 text-xs font-black px-1">
              <CheckCircle2 className="w-4 h-4" /> تم التحقق من تيليجرام
            </div>
          )}
        </div>

        {/* Password */}
        <div className="relative">
          <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400" />
          <input required type={showPass ? "text" : "password"} value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="كلمة المرور (6 أحرف+)"
            className="w-full h-12 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pr-11 pl-11 font-bold text-sm focus:outline-none focus:border-orange-400 transition-colors" />
          <button type="button" onClick={() => setShowPass(v => !v)} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Submit */}
        <button type="submit" disabled={loading}
          className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white text-base font-black rounded-2xl shadow-lg shadow-orange-200 dark:shadow-none active:scale-95 transition-all flex items-center justify-center gap-2 mt-2">
          {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "إنشاء الحساب"}
        </button>

        {/* Already have account */}
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 font-bold pt-2">
          لديك حساب بالفعل؟{" "}
          <Link href="/login" className="text-orange-500 font-black hover:underline">سجّل الدخول</Link>
        </p>
      </form>
    </div>
  );
}
