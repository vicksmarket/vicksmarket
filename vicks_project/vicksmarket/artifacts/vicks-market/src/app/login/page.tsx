"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye, EyeOff, Loader2, Mail, Lock
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { VicksLogo } from "@/components/VicksLogo";
import { cn } from "@/lib/utils";

const OWNER  = "mom01113694362@icloud.com";
const ADMINS = ["vicksmarket@gmail.com", "mom1113694362@gmail.com", OWNER];
const ADMIN_PIN = "202320";

const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

export default function LoginPage() {
  const router = useRouter();

  /* fields */
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  /* admin PIN */
  const [pinStep, setPinStep] = useState(false);
  const [pin,     setPin]     = useState("");

  /* general */
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  /* ── password login ── */
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const sb = createClient();
      const { data, error: err } = await sb.auth.signInWithPassword({
        email: email.trim().toLowerCase(), password,
      });
      if (err) throw err;
      await afterLogin(sb, data.user);
    } catch (err: any) {
      setError(err.message?.includes("Invalid login") ? "بريد إلكتروني أو كلمة مرور غير صحيحة" : err.message);
    } finally {
      setLoading(false);
    }
  };

  /* shared post-login routing */
  const afterLogin = async (sb: any, user: any) => {
    const userEmail = user?.email?.toLowerCase() || "";
    if (userEmail === OWNER) {
      localStorage.setItem("vicks_admin_mode", "active");
      router.replace("/owner"); return;
    }
    if (ADMINS.includes(userEmail)) { setPinStep(true); return; }
    const { data: profile } = await sb.from("profiles").select("role").eq("id", user.id).maybeSingle();
    const role = profile?.role || user.user_metadata?.role || "customer";
    router.replace(role === "merchant" ? "/dashboard" : "/");
  };

  /* ── Admin PIN screen ── */
  if (pinStep) return (
    <div className="min-h-screen bg-white dark:bg-[#1A2332] flex flex-col items-center justify-center p-6 gap-5" dir="rtl">
      <VicksLogo className="w-16 h-16" />
      <h2 className="font-black text-xl dark:text-white">أدخل PIN الإدارة</h2>
      <input autoFocus type="password" maxLength={6} inputMode="numeric" value={pin}
        onChange={e => setPin(e.target.value.replace(/\D/g, ""))}
        placeholder="● ● ● ● ● ●"
        className="w-full max-w-xs h-14 rounded-2xl border-2 border-orange-200 text-center font-black tracking-[0.5rem] text-2xl focus:outline-none focus:border-orange-400 dark:bg-slate-800 dark:text-white" />
      {error && <p className="text-red-500 text-sm font-bold">{error}</p>}
      <button onClick={() => {
        if (pin === ADMIN_PIN) { localStorage.setItem("vicks_admin_mode", "active"); router.replace("/merchant"); }
        else setError("PIN غير صحيح");
      }} disabled={pin.length < 6}
        className="w-full max-w-xs h-14 bg-orange-500 text-white font-black rounded-2xl disabled:opacity-50 active:scale-95 transition-transform">
        دخول
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-[#1A2332] flex flex-col" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1A2332] to-slate-700 pt-16 pb-10 px-6 flex flex-col items-center gap-3">
        <VicksLogo className="w-16 h-16" />
        <h1 className="text-white font-black text-2xl">أهلاً بك</h1>
        <p className="text-slate-400 text-xs font-bold">سجّل دخولك للمتابعة</p>
      </div>

      <div className="flex-1 px-5 pt-8 pb-10 max-w-sm mx-auto w-full space-y-4">

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl px-4 py-3 text-red-600 dark:text-red-400 text-sm font-bold text-center">
            {error}
          </div>
        )}

        {/* ── Email field ── */}
        <div className="relative">
          <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400 z-10" />
          <input
            type="email" value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="البريد الإلكتروني" autoComplete="email"
            className="w-full h-12 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pr-11 pl-4 font-bold text-sm dark:text-white focus:outline-none focus:border-orange-400 transition-colors" />
        </div>

        {/* ── Password login ── */}
        <form onSubmit={handlePasswordLogin} className="space-y-4">
          <div className="relative">
            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400" />
            <input required type={showPass ? "text" : "password"} value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="كلمة المرور" autoComplete="current-password"
              className="w-full h-12 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pr-11 pl-11 font-bold text-sm dark:text-white focus:outline-none focus:border-orange-400 transition-colors" />
            <button type="button" onClick={() => setShowPass(v => !v)} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="text-left">
            <Link href="/forgot-password" className="text-xs font-black text-orange-500 hover:underline">
              نسيت كلمة المرور؟
            </Link>
          </div>

          <button type="submit" disabled={loading || !email}
            className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white font-black text-base rounded-2xl shadow-lg shadow-orange-200/50 dark:shadow-none flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-70">
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "تسجيل الدخول"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400 font-bold pt-2">
          ليس لديك حساب؟{" "}
          <Link href="/signup" className="text-orange-500 font-black hover:underline">إنشاء حساب</Link>
        </p>
      </div>
    </div>
  );
}
