"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Camera, User, Loader2, CheckCircle2, Phone, Send } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useUser } from "@/lib/supabase-hooks";
import { VicksLogo } from "@/components/VicksLogo";
import { cn } from "@/lib/utils";

type VerifyStep = "idle" | "sent" | "done";

function PhoneVerifyField({
  label, icon, color, placeholder,
  verified, step, onSend, onConfirm, sending,
}: {
  label: string; icon: React.ReactNode; color: string; placeholder: string;
  verified: boolean; step: VerifyStep;
  onSend: (phone: string) => void;
  onConfirm: (code: string) => void;
  sending: boolean;
}) {
  const [phone, setPhone] = useState("");
  const [code, setCode]   = useState("");
  return (
    <div className={cn("rounded-2xl border-2 p-4 space-y-3 transition-all", verified ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/10" : "border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800")}>
      <div className="flex items-center gap-2">
        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", color)}>{icon}</div>
        <div className="flex-1">
          <p className="font-black text-sm dark:text-white">{label}</p>
          {verified && <p className="text-[11px] font-bold text-green-500 mt-0.5">✓ تم التحقق · +50 نقطة</p>}
          {!verified && <p className="text-[11px] font-bold text-slate-400 mt-0.5">أضف رقمك واحصل على 50 نقطة</p>}
        </div>
        {verified && <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />}
      </div>

      {!verified && step === "idle" && (
        <div className="flex gap-2">
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder={placeholder} type="tel"
            className="flex-1 h-11 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 text-sm font-bold dark:text-white focus:outline-none focus:border-orange-400" />
          <button onClick={() => onSend(phone)} disabled={phone.length < 8 || sending}
            className="h-11 px-4 bg-orange-500 text-white font-black text-xs rounded-xl active:scale-95 transition-all disabled:opacity-50 whitespace-nowrap">
            {sending ? <Loader2 className="animate-spin w-4 h-4" /> : "إرسال كود"}
          </button>
        </div>
      )}

      {!verified && step === "sent" && (
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">أدخل الكود المرسل إلى {placeholder}</p>
          <div className="flex gap-2">
            <input value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ""))} maxLength={6}
              placeholder="● ● ● ● ● ●" inputMode="numeric"
              className="flex-1 h-11 rounded-xl border-2 border-orange-400 bg-white dark:bg-slate-700 px-3 text-center font-black text-lg tracking-widest dark:text-white focus:outline-none" />
            <button onClick={() => onConfirm(code)} disabled={code.length < 4}
              className="h-11 px-4 bg-green-500 text-white font-black text-xs rounded-xl active:scale-95 transition-all disabled:opacity-50">
              تأكيد
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EditProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const [fullName,  setFullName]  = useState("");
  const [photoUrl,  setPhotoUrl]  = useState("");
  const [saving,    setSaving]    = useState(false);
  const [done,      setDone]      = useState(false);
  const [loading,   setLoading]   = useState(true);

  // WhatsApp
  const [waVerified, setWaVerified] = useState(false);
  const [waStep,     setWaStep]     = useState<VerifyStep>("idle");
  const [waOtp,      setWaOtp]      = useState("");
  const [waSending,  setWaSending]  = useState(false);

  // Telegram
  const [tgVerified, setTgVerified] = useState(false);
  const [tgStep,     setTgStep]     = useState<VerifyStep>("idle");
  const [tgOtp,      setTgOtp]      = useState("");
  const [tgSending,  setTgSending]  = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.replace("/login"); return; }
    createClient()
      .from("profiles")
      .select("full_name,photo_url,whatsapp_verified,telegram_verified")
      .eq("id", user.uid)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setFullName(data.full_name || "");
          setPhotoUrl(data.photo_url || "");
          setWaVerified(!!(data as any).whatsapp_verified);
          setTgVerified(!!(data as any).telegram_verified);
        }
        setLoading(false);
      });
  }, [authLoading, user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    await createClient().from("profiles").update({ full_name: fullName, photo_url: photoUrl }).eq("id", user.uid);
    setSaving(false);
    setDone(true);
    setTimeout(() => { setDone(false); router.push("/verify"); }, 1500);
  };

  /* WhatsApp */
  const handleWaSend = async (phone: string) => {
    setWaSending(true);
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setWaOtp(code);
    // Simulated — in production, send via WhatsApp Business API
    await new Promise(r => setTimeout(r, 800));
    setWaSending(false);
    setWaStep("sent");
  };
  const handleWaConfirm = async (input: string) => {
    if (input !== waOtp) return;
    const sb = createClient();
    try { await sb.from("profiles").update({ whatsapp_verified: true, points: (await sb.from("profiles").select("points").eq("id", user!.uid).maybeSingle().then(r => (r.data?.points || 0) + 50)) }).eq("id", user!.uid); } catch {}
    setWaVerified(true); setWaStep("done");
  };

  /* Telegram */
  const handleTgSend = async (phone: string) => {
    setTgSending(true);
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setTgOtp(code);
    await new Promise(r => setTimeout(r, 800));
    setTgSending(false);
    setTgStep("sent");
  };
  const handleTgConfirm = async (input: string) => {
    if (input !== tgOtp) return;
    const sb = createClient();
    try { await sb.from("profiles").update({ telegram_verified: true, points: (await sb.from("profiles").select("points").eq("id", user!.uid).maybeSingle().then(r => (r.data?.points || 0) + 50)) }).eq("id", user!.uid); } catch {}
    setTgVerified(true); setTgStep("done");
  };

  if (authLoading || loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] dark:bg-[#0f1621]">
      <Loader2 className="animate-spin w-8 h-8 text-orange-500" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0f1621] font-cairo" dir="rtl">
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-[#0f1621]/80 backdrop-blur-sm border-b dark:border-slate-800 flex items-center justify-between px-4 py-3">
        <button onClick={() => router.push("/verify")} className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
          <ChevronLeft className="w-4 h-4 text-slate-500" />
        </button>
        <div className="flex items-center gap-2">
          <VicksLogo className="w-7 h-7" />
          <span className="font-black text-sm dark:text-white">تعديل البيانات</span>
        </div>
        <div className="w-9" />
      </div>

      <div className="max-w-sm mx-auto px-4 py-6 space-y-5">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-orange-400 ring-offset-2 dark:ring-offset-[#0f1621] bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
            {photoUrl
              ? <img src={photoUrl} alt="" className="w-full h-full object-cover" onError={() => setPhotoUrl("")} />
              : <span className="text-white font-black text-3xl">{(fullName || user?.email || "م")[0]}</span>
            }
          </div>
          <p className="text-xs font-bold text-slate-400">أدخل رابط صورتك أدناه</p>
        </div>

        {/* Basic info */}
        <div className="bg-white dark:bg-[#1A2332] rounded-3xl border dark:border-slate-700 p-5 space-y-4 shadow-sm">
          <label className="block">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 block">رابط الصورة</span>
            <div className="relative">
              <Camera className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400" />
              <input value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} placeholder="https://..."
                className="w-full h-12 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pr-10 pl-3 text-sm font-bold dark:text-white focus:outline-none focus:border-orange-400" />
            </div>
          </label>

          <label className="block">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 block">الاسم الكامل</span>
            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400" />
              <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="اسمك الكامل"
                className="w-full h-12 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pr-10 pl-3 text-sm font-bold dark:text-white focus:outline-none focus:border-orange-400" />
            </div>
          </label>

          <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-3 space-y-1">
            <p className="text-[11px] font-bold text-slate-400">البريد الإلكتروني</p>
            <p className="text-sm font-black dark:text-white">{user?.email}</p>
            <p className="text-[10px] text-slate-400">لا يمكن تغيير البريد الإلكتروني</p>
          </div>
        </div>

        {/* Verification section */}
        <div className="space-y-3">
          <p className="font-black text-xs text-slate-400 px-1">تحقق واكسب نقاط</p>

          <PhoneVerifyField
            label="تحقق WhatsApp" icon={<Phone className="w-4 h-4 text-green-600" />}
            color="bg-green-100 dark:bg-green-900/30" placeholder="05xxxxxxxx"
            verified={waVerified} step={waStep}
            onSend={handleWaSend} onConfirm={handleWaConfirm} sending={waSending}
          />

          <PhoneVerifyField
            label="تحقق Telegram" icon={<Send className="w-4 h-4 text-blue-500" />}
            color="bg-blue-100 dark:bg-blue-900/30" placeholder="@username أو رقمك"
            verified={tgVerified} step={tgStep}
            onSend={handleTgSend} onConfirm={handleTgConfirm} sending={tgSending}
          />
        </div>

        <button onClick={handleSave} disabled={saving || done}
          className={`w-full py-4 font-black text-base rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg ${done ? "bg-green-500 text-white" : "bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-60 shadow-orange-200/50"}`}>
          {saving ? <Loader2 className="animate-spin w-5 h-5" />
           : done  ? <><CheckCircle2 className="w-5 h-5" /> تم الحفظ!</>
           : "حفظ التغييرات"}
        </button>
      </div>
    </div>
  );
}
