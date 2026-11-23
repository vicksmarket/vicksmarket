"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail, Phone, RotateCw, Loader2, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VicksLogo } from "@/components/VicksLogo";
import { useUser, useDoc } from "@/lib/supabase-hooks";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { sendOTPEmail } from "@/app/actions/auth-actions";
import { cn } from "@/lib/utils";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();

  const { data: verification, loading: verifLoading } = useDoc("verifications", user?.uid ?? null);

  const [loading, setLoading] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleVerify = async () => {
    if (!user || !verification) return;
    const isMerchant = verification.role === 'merchant';
    if (emailOtp.length !== 6) {
      toast({ variant: "destructive", title: "كود الإيميل ناقص", description: "أدخل الـ 6 أرقام الخاصة بالإيميل." });
      return;
    }
    if (isMerchant && phoneOtp.length !== 6) {
      toast({ variant: "destructive", title: "كود الهاتف مطلوب", description: "يجب على التاجر تأكيد رقم الهاتف أيضاً." });
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const isEmailValid = verification.emailCode === emailOtp;
      const isPhoneValid = !isMerchant || verification.phoneCode === phoneOtp;

      if (isEmailValid && isPhoneValid) {
        await supabase.from("users").update({ isVerified: true }).eq('id', user.uid);
        await supabase.from("verifications").delete().eq('id', user.uid);
        toast({ title: "تم التفعيل بنجاح!", description: "أهلاً بك في عالم فيكس ماركت الاحترافي." });
        router.push('/');
      } else {
        toast({ variant: "destructive", title: "أكواد خاطئة", description: "تأكد من الأرقام التي أدخلتها وحاول مجدداً." });
      }
    } catch (e: any) {
      toast({ variant: "destructive", title: "خطأ", description: e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!user || !verification || timeLeft > 0) return;
    setLoading(true);
    const newEmailOtp = Math.floor(100000 + Math.random() * 900000).toString();
    try {
      const supabase = createClient();
      await supabase.from("verifications").update({ emailCode: newEmailOtp }).eq('id', user.uid);
      await sendOTPEmail(user.email!, newEmailOtp, 'verification');
      setTimeLeft(60);
      toast({ title: "تم إعادة الإرسال", description: "تفقد بريدك الإلكتروني الآن." });
    } catch (error) {
      toast({ variant: "destructive", title: "فشل الإرسال", description: "حاول مجدداً بعد قليل." });
    } finally {
      setLoading(false);
    }
  };

  if (verifLoading) return <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#1A2332]"><Loader2 className="animate-spin text-orange-500 w-12 h-12" /></div>;
  if (!verification) return <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center gap-4 bg-white dark:bg-[#1A2332]">
    <h1 className="text-xl font-black">لا توجد طلبات تفعيل نشطة</h1>
    <Button onClick={() => router.push('/')} className="bg-orange-500">العودة للرئيسية</Button>
  </div>;

  return (
    <div className="min-h-screen bg-white dark:bg-[#1A2332] text-right font-cairo flex flex-col items-center justify-center p-6" dir="rtl">
      <div className="w-full max-w-md space-y-10">
        <header className="flex flex-col items-center gap-6 text-center">
           <VicksLogo className="w-24 h-24" />
           <div className="space-y-2">
             <h1 className="text-3xl font-black dark:text-white uppercase tracking-tighter">
               {verification.role === 'merchant' ? 'تحقق التاجر المزدوج' : 'تحقق الإيميل'}
             </h1>
             <p className="text-xs font-bold text-slate-400">أدخل الأكواد التي أرسلناها إليك لتفعيل حسابك</p>
           </div>
        </header>

        <div className="space-y-8 bg-slate-50 dark:bg-black/20 p-8 rounded-[3rem] border-2 border-slate-100 dark:border-slate-800">
          <div className="space-y-3">
            <Label className="flex items-center justify-between pr-2">
              <span className="font-black text-orange-500 text-xs uppercase flex items-center gap-2">
                <Mail className="w-4 h-4" /> كود تأكيد الإيميل
              </span>
              <span className="text-[10px] font-bold text-slate-400">{user?.email}</span>
            </Label>
            <Input maxLength={6} value={emailOtp} onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ""))}
              className="h-16 rounded-2xl border-2 border-orange-100 text-center text-3xl font-black tracking-[1rem] focus:border-orange-500 dark:bg-slate-900"
              placeholder="000000" />
          </div>

          {verification.role === 'merchant' && (
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Label className="flex items-center gap-2 pr-2 font-black text-blue-500 text-xs uppercase">
                <Phone className="w-4 h-4" /> كود تأكيد الهاتف (SMS)
              </Label>
              <Input maxLength={6} value={phoneOtp} onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, ""))}
                className="h-16 rounded-2xl border-2 border-blue-100 text-center text-3xl font-black tracking-[1rem] focus:border-blue-500 dark:bg-slate-900"
                placeholder="000000" />
            </div>
          )}

          <Button onClick={handleVerify} disabled={loading}
            className="w-full h-16 bg-slate-900 hover:bg-black text-white text-xl font-black rounded-3xl shadow-2xl transition-all active:scale-95">
            {loading ? <Loader2 className="animate-spin" /> : "تفعيل الحساب والدخول"}
          </Button>

          <div className="text-center">
            {timeLeft > 0 ? (
              <div className="flex items-center justify-center gap-2 text-slate-400">
                <Timer className="w-4 h-4 animate-pulse text-orange-500" />
                <span className="text-xs font-black">إعادة إرسال الكود بعد: <span className="text-orange-500">{timeLeft} ثانية</span></span>
              </div>
            ) : (
              <button onClick={handleResend} disabled={loading}
                className="flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 transition-colors mx-auto">
                <RotateCw className="w-4 h-4" />
                <span className="text-xs font-black underline underline-offset-4">إرسال كود جديد الآن</span>
              </button>
            )}
          </div>
        </div>

        <footer className="text-center opacity-30 pt-4">
           <p className="text-[10px] font-black uppercase tracking-widest">Vicks Security Protocol v2.5</p>
        </footer>
      </div>
    </div>
  );
}
