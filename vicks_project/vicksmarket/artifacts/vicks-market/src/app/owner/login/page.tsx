"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Crown, Lock, Mail, Loader2, Eye, EyeOff, ShieldAlert } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useUser } from "@/lib/supabase-hooks";
import { useToast } from "@/hooks/use-toast";
import { VicksLogo } from "@/components/VicksLogo";

const OWNER_EMAIL = "vicksmarket@gmail.com";

export default function OwnerLoginPage() {
  const router = useRouter();
  const { user, loading } = useUser();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user?.email?.toLowerCase() === OWNER_EMAIL) {
      router.replace("/owner");
    }
  }, [user, loading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim().toLowerCase() !== OWNER_EMAIL) {
      toast({ variant: "destructive", title: "❌ غير مسموح", description: "هذه الصفحة للمالك فقط" });
      return;
    }
    setSubmitting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) throw error;
      router.replace("/owner");
    } catch (err: any) {
      const msg = err.message?.includes("Invalid login") ? "كلمة المرور غير صحيحة" : err.message;
      toast({ variant: "destructive", title: "فشل تسجيل الدخول", description: msg });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#1A2332]">
      <Loader2 className="animate-spin text-orange-500 w-10 h-10" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#1A2332] flex flex-col items-center justify-center px-5" dir="rtl">
      <div className="w-full max-w-sm bg-[#252D3D] rounded-3xl shadow-2xl p-7 space-y-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
            <Crown className="w-9 h-9 text-white" />
          </div>
          <div className="text-center">
            <h1 className="font-black text-white text-xl tracking-tight">VicksMarket</h1>
            <p className="text-orange-400 font-black text-xs mt-0.5">لوحة تحكم المالك</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-orange-950/30 border border-orange-800/40 rounded-2xl px-4 py-2.5">
          <ShieldAlert className="w-4 h-4 text-orange-400 flex-shrink-0" />
          <p className="text-[10px] font-bold text-orange-300">هذه الصفحة مخصصة للمالك فقط. الدخول غير المصرح به محظور.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-3">
          <div className="relative">
            <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-500" />
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="البريد الإلكتروني"
              className="w-full h-12 rounded-2xl bg-[#1A2332] border-2 border-slate-700 focus:border-orange-500 text-white font-bold pr-11 pl-4 text-sm outline-none transition-colors" />
          </div>
          <div className="relative">
            <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-500" />
            <input type={showPass ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} placeholder="كلمة المرور"
              className="w-full h-12 rounded-2xl bg-[#1A2332] border-2 border-slate-700 focus:border-orange-500 text-white font-bold pr-11 pl-11 text-sm outline-none transition-colors" />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <button type="submit" disabled={submitting}
            className="w-full h-12 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-sm transition-colors disabled:opacity-60 flex items-center justify-center">
            {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : "دخول المالك"}
          </button>
        </form>
      </div>
    </div>
  );
}
