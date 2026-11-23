"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck, Mail, LogOut, Home, Loader2, CheckCircle2, AlertCircle,
  RefreshCw, Crown, Menu, X, Edit3, Star, Phone, Flag, HelpCircle,
  ChevronLeft, MessageSquare, Shield, BookOpen, ShoppingBag, ChevronDown
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useUser } from "@/lib/supabase-hooks";
import { VicksLogo } from "@/components/VicksLogo";
import { sendOTPEmail } from "@/app/actions/auth-actions";
import { cn } from "@/lib/utils";

interface Profile {
  full_name: string | null;
  shop_name: string | null;
  photo_url: string | null;
  role: string;
  unique_id: string | null;
  points: number;
  is_verified: boolean;
  membership?: string | null;
}

const MALLS = [
  { id: "vicks", name: "Vicks Market", emoji: "🛍️", points: 0,  color: "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800" },
  { id: "m1",    name: "مول العرب",    emoji: "🏪", points: 20, color: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800" },
  { id: "m2",    name: "سيتي ستارز",   emoji: "⭐", points: 30, color: "bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800" },
  { id: "m3",    name: "مول مصر",      emoji: "🏬", points: 25, color: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800" },
  { id: "m4",    name: "كايرو فيستيفال", emoji: "🎉", points: 15, color: "bg-pink-50 dark:bg-pink-950/20 border-pink-200 dark:border-pink-800" },
  { id: "m5",    name: "مول الطيران",  emoji: "✈️", points: 10, color: "bg-cyan-50 dark:bg-cyan-950/20 border-cyan-200 dark:border-cyan-800" },
];

/* ── Publish Product Modal ── */
function PublishProductModal({ open, onClose, userPoints }: { open: boolean; onClose: () => void; userPoints: number }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [published, setPublished] = useState(false);

  const chosenMall = MALLS.find(m => m.id === selected);
  const canPublish = selected !== null && (chosenMall ? userPoints >= chosenMall.points : true);

  const handlePublish = () => {
    if (!canPublish) return;
    setPublished(true);
    setTimeout(() => { setPublished(false); setSelected(null); onClose(); }, 2000);
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0" dir="rtl">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-[#1A2332] rounded-t-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="flex items-center justify-between px-5 pb-4 border-b dark:border-slate-700">
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
            <X className="w-4 h-4 text-slate-500" />
          </button>
          <span className="font-black text-sm dark:text-white">اختر وجهة النشر</span>
          <div className="w-8" />
        </div>

        {published ? (
          <div className="flex flex-col items-center gap-4 py-12 px-5 text-center">
            <div className="w-16 h-16 rounded-full bg-green-50 dark:bg-green-950/20 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <p className="font-black text-lg dark:text-white">تم نشر المنتج! 🎉</p>
          </div>
        ) : (
          <div className="overflow-y-auto p-4 space-y-3 flex-1">
            <p className="text-xs font-bold text-slate-400 text-center mb-2">
              نقاطك الحالية: <span className="text-orange-500 font-black">{userPoints} نقطة</span>
            </p>
            {MALLS.map(mall => (
              <button key={mall.id} onClick={() => setSelected(mall.id)}
                className={cn(
                  "w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all active:scale-[0.98]",
                  selected === mall.id ? "border-orange-400 bg-orange-50 dark:bg-orange-950/20" : mall.color
                )}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{mall.emoji}</span>
                  <div className="text-right">
                    <p className="font-black text-sm dark:text-white">{mall.name}</p>
                    <p className="text-[11px] font-bold text-slate-400 mt-0.5">
                      {mall.points === 0 ? "مجاني" : `${mall.points} نقطة للنشر`}
                    </p>
                  </div>
                </div>
                {selected === mall.id && <CheckCircle2 className="w-5 h-5 text-orange-500 flex-shrink-0" />}
                {mall.points > userPoints && mall.points > 0 && selected !== mall.id && (
                  <span className="text-[10px] font-black text-red-400 bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded-full">نقاط غير كافية</span>
                )}
              </button>
            ))}
            <button onClick={handlePublish} disabled={!canPublish}
              className="w-full py-4 mt-2 bg-orange-500 hover:bg-orange-600 text-white font-black text-base rounded-2xl active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-orange-200/50">
              نشر المنتج {chosenMall && chosenMall.points > 0 ? `· ${chosenMall.points} نقطة` : ""}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Publish Story Modal ── */
function PublishStoryModal({ open, onClose, userPoints }: { open: boolean; onClose: () => void; userPoints: number }) {
  const STORY_COST = 5;
  const [published, setPublished] = useState(false);

  const handlePublish = () => {
    if (userPoints < STORY_COST) return;
    setPublished(true);
    setTimeout(() => { setPublished(false); onClose(); }, 2000);
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" dir="rtl">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-[#1A2332] rounded-t-3xl shadow-2xl p-5 space-y-4">
        <div className="flex justify-center pt-1 pb-2">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="flex items-center justify-between border-b dark:border-slate-700 pb-4">
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
            <X className="w-4 h-4 text-slate-500" />
          </button>
          <span className="font-black text-sm dark:text-white">نشر Story</span>
          <div className="w-8" />
        </div>

        {published ? (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-50 dark:bg-green-950/20 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <p className="font-black text-lg dark:text-white">تم نشر القصة! 🎉</p>
          </div>
        ) : (
          <>
            <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-3xl p-5 text-white text-center">
              <p className="text-4xl mb-2">📸</p>
              <p className="font-black text-lg">نشر قصة جديدة</p>
              <p className="text-pink-100 text-sm font-bold mt-1">اعرض منتجاتك على الصفحة الرئيسية</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="font-black text-sm dark:text-white">تكلفة النشر</p>
                <p className="text-[11px] font-bold text-slate-400 mt-0.5">تُخصم من نقاطك الحالية</p>
              </div>
              <div className="text-center">
                <p className="font-black text-2xl text-orange-500">{STORY_COST}</p>
                <p className="text-[10px] font-bold text-slate-400">نقطة</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm px-1">
              <span className="font-bold text-slate-400">نقاطك</span>
              <span className="font-black dark:text-white">{userPoints} نقطة</span>
            </div>
            {userPoints < STORY_COST && (
              <p className="text-center text-xs font-bold text-red-500">نقاطك غير كافية لنشر قصة</p>
            )}
            <button onClick={handlePublish} disabled={userPoints < STORY_COST}
              className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black text-base rounded-2xl active:scale-95 transition-all disabled:opacity-50 shadow-lg">
              نشر الآن · {STORY_COST} نقاط
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Side Drawer ── */
function SideDrawer({
  open, onClose, profile, user
}: {
  open: boolean;
  onClose: () => void;
  profile: Profile | null;
  user: any;
}) {
  const router = useRouter();

  const handleSignOut = async () => {
    await createClient().auth.signOut();
    router.replace("/login");
  };

  const navigate = (path: string) => { onClose(); router.push(path); };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex" dir="rtl">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative ml-0 mr-auto w-[82%] max-w-sm h-full bg-white dark:bg-[#1A2332] shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-6 pb-4 border-b dark:border-slate-700">
          <div className="w-8" />
          <span className="font-black text-sm dark:text-white">القائمة</span>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="mx-4 mt-4 mb-2 bg-orange-50 dark:bg-orange-950/20 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0">
              {profile?.photo_url
                ? <img src={profile.photo_url} alt="" className="w-full h-full object-cover" />
                : <span className="text-white font-black text-xl">{(profile?.full_name || user?.email || "م")[0]}</span>
              }
            </div>
            <div className="min-w-0">
              <p className="font-black text-sm dark:text-white truncate">{profile?.full_name || "مستخدم"}</p>
              <p className="text-[11px] font-bold text-orange-500 truncate">{user?.email}</p>
            </div>
          </div>

          <div className="py-2 space-y-0.5">
            {[
              { icon: Edit3,         label: "تعديل البيانات",    sub: "الاسم والصورة",      path: "/profile/edit"    },
              { icon: Star,          label: "عضوية VIP",          sub: "المميزات والباقات",  path: "/profile/vip"     },
              { icon: CheckCircle2,  label: "المهام",             sub: "اكتمال الملف الشخصي", path: "/profile/tasks"  },
              { icon: MessageSquare, label: "اتصل بالمالك",       sub: "تواصل مع الدعم",    path: "/profile/contact" },
              { icon: Flag,          label: "الإبلاغ عن مشكلة",  sub: "أبلغنا عن أي خطأ",  path: "/profile/report"  },
            ].map(item => (
              <button key={item.path} onClick={() => navigate(item.path)}
                className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors active:scale-[0.98]">
                <div className="w-10 h-10 rounded-2xl bg-orange-50 dark:bg-orange-950/20 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-4 h-4 text-orange-500" />
                </div>
                <div className="flex-1 text-right">
                  <p className="font-black text-sm dark:text-white">{item.label}</p>
                  <p className="text-[11px] font-bold text-slate-400 mt-0.5">{item.sub}</p>
                </div>
                <ChevronLeft className="w-4 h-4 text-slate-300" />
              </button>
            ))}
          </div>

          <div className="mx-4 my-2 border-t dark:border-slate-700" />
          {[
            { icon: Shield,     label: "سياسة الخصوصية" },
            { icon: HelpCircle, label: "المساعدة والدعم" },
          ].map(item => (
            <button key={item.label}
              className="w-full flex items-center gap-4 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                <item.icon className="w-4 h-4 text-slate-500" />
              </div>
              <p className="font-bold text-sm text-slate-600 dark:text-slate-300 flex-1 text-right">{item.label}</p>
            </button>
          ))}

          <div className="px-4 pt-4 pb-8">
            <button onClick={handleSignOut}
              className="w-full py-3.5 rounded-2xl border-2 border-red-100 dark:border-red-900 text-red-500 font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-red-50 dark:hover:bg-red-950/10">
              <LogOut className="w-4 h-4" /> تسجيل الخروج
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function VerifyPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();

  const [profile, setProfile]               = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [drawerOpen, setDrawerOpen]         = useState(false);
  const [showPublishProduct, setShowPublishProduct] = useState(false);
  const [showPublishStory,   setShowPublishStory]   = useState(false);

  const [verifyStep, setVerifyStep]   = useState<"idle" | "sent" | "done">("idle");
  const [otp, setOtp]                 = useState("");
  const [otpInput, setOtpInput]       = useState("");
  const [otpExpiry, setOtpExpiry]     = useState(0);
  const [otpError, setOtpError]       = useState("");
  const [countdown, setCountdown]     = useState(0);
  const [sending, setSending]         = useState(false);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.replace("/login"); return; }
    const sb = createClient();
    sb.from("profiles").select("*").eq("id", user.uid).maybeSingle().then(async ({ data }) => {
      if (data) {
        setProfile(data as Profile);
      } else {
        // Auto-create profile if missing (e.g. test accounts)
        const newProfile = {
          id: user.uid,
          full_name: user.displayName || null,
          shop_name: user.displayName || null,
          role: "customer",
          unique_id: Math.floor(10000000 + Math.random() * 90000000).toString(),
          points: 1000,
          is_verified: false,
          created_at: new Date().toISOString(),
        };
        await sb.from("profiles").upsert(newProfile);
        setProfile(newProfile as Profile);
      }
      setProfileLoading(false);
    });
  }, [authLoading, user]);

  const handleSendCode = async () => {
    if (!user?.email) return;
    setSending(true); setOtpError("");
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const res = await sendOTPEmail(user.email, code, "verification");
    setSending(false);
    if (!res.success) { setOtpError(res.error || "فشل الإرسال"); return; }
    setOtp(code); setOtpExpiry(Date.now() + 10 * 60 * 1000);
    setVerifyStep("sent"); setCountdown(60);
  };

  const handleConfirm = async () => {
    if (Date.now() > otpExpiry) { setOtpError("انتهت صلاحية الكود"); return; }
    if (otpInput.trim() !== otp) { setOtpError("الكود غير صحيح"); return; }
    await createClient().from("profiles").update({ is_verified: true }).eq("id", user!.uid);
    setProfile(prev => prev ? { ...prev, is_verified: true } : prev);
    setVerifyStep("done"); setOtpError("");
  };

  if (authLoading || profileLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] dark:bg-[#1A2332]">
      <Loader2 className="animate-spin w-8 h-8 text-orange-500" />
    </div>
  );
  if (!user) return null;

  const isEmailVerified = user.emailVerified || profile?.is_verified;
  const displayName = profile?.shop_name || profile?.full_name || user.displayName || "مستخدم";
  const roleLabel = profile?.role === "merchant" ? "تاجر" : profile?.role === "admin" ? "مدير" : "عميل";
  const userPoints = profile?.points || 0;

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0f1621] font-cairo" dir="rtl">
      {/* Nav */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-[#0f1621]/80 backdrop-blur-sm border-b dark:border-slate-800 flex items-center justify-between px-4 py-3">
        <button onClick={() => router.push("/")} className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
          <Home className="w-4 h-4 text-orange-500" />
        </button>
        <div className="flex items-center gap-2">
          <VicksLogo className="w-7 h-7" />
          <span className="font-black text-sm dark:text-white">ملفي الشخصي</span>
        </div>
        <button onClick={() => setDrawerOpen(true)} className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
          <Menu className="w-4 h-4 text-slate-600 dark:text-slate-300" />
        </button>
      </div>

      <div className="max-w-sm mx-auto px-4 py-6 space-y-4">

        {/* ── Profile card ── */}
        <div className="bg-white dark:bg-[#1A2332] rounded-3xl shadow-sm border dark:border-slate-800 overflow-hidden">
          {/* Points + ID — top row */}
          <div className="grid grid-cols-2 divide-x divide-x-reverse dark:divide-slate-700 border-b dark:border-slate-800">
            <div className="p-4 text-center">
              <p className="font-black text-2xl text-orange-500">{userPoints}</p>
              <p className="text-[11px] text-slate-400 font-bold mt-0.5">نقاط</p>
            </div>
            <div className="p-4 text-center">
              <p className="font-black text-base dark:text-white tracking-wide">{profile?.unique_id || "—"}</p>
              <p className="text-[11px] text-slate-400 font-bold mt-0.5">رقم العضوية</p>
            </div>
          </div>

          {/* Avatar + name */}
          <div className="flex flex-col items-center gap-3 pt-5 pb-4">
            <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-orange-400 ring-offset-2 dark:ring-offset-[#1A2332] bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
              {profile?.photo_url
                ? <img src={profile.photo_url} alt={displayName} className="w-full h-full object-cover" />
                : <span className="text-white font-black text-3xl">{displayName[0]}</span>
              }
            </div>
            <div className="text-center">
              <h1 className="font-black text-xl dark:text-white">{displayName}</h1>
              <span className="inline-block mt-1 px-3 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/30 text-orange-500 text-xs font-black">{roleLabel}</span>
            </div>
          </div>

          {/* Email row */}
          <div className="mx-4 mb-5 bg-slate-50 dark:bg-slate-800 rounded-2xl p-3 flex items-center gap-2">
            <Mail className="w-4 h-4 text-orange-400 flex-shrink-0" />
            <span className="text-sm font-bold dark:text-white truncate flex-1">{user.email}</span>
          </div>
        </div>

        {/* ── Publish buttons ── */}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setShowPublishStory(true)}
            className="flex flex-col items-center gap-2 py-5 bg-gradient-to-br from-pink-500 to-purple-600 text-white rounded-3xl active:scale-95 transition-all shadow-lg">
            <span className="text-2xl">📸</span>
            <span className="font-black text-sm">نشر Story</span>
            <span className="text-[10px] text-pink-100 font-bold">5 نقاط</span>
          </button>
          <button onClick={() => setShowPublishProduct(true)}
            className="flex flex-col items-center gap-2 py-5 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-3xl active:scale-95 transition-all shadow-lg">
            <span className="text-2xl">🛍️</span>
            <span className="font-black text-sm">نشر منتج</span>
            <span className="text-[10px] text-orange-100 font-bold">اختر الوجهة</span>
          </button>
        </div>

        {/* ── Email verification ── */}
        <div className="bg-white dark:bg-[#1A2332] rounded-3xl p-5 shadow-sm border dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isEmailVerified ? "bg-green-50 dark:bg-green-950/20" : "bg-orange-50 dark:bg-orange-950/20"}`}>
              {isEmailVerified ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <AlertCircle className="w-5 h-5 text-orange-500" />}
            </div>
            <div>
              <p className="font-black text-sm dark:text-white">
                {isEmailVerified ? "البريد الإلكتروني موثّق" : "البريد الإلكتروني غير موثّق"}
              </p>
              <p className="text-[11px] text-slate-400 font-bold mt-0.5">
                {isEmailVerified ? "حسابك مؤكد ومحمي" : "قم بتوثيق بريدك للحصول على حساب آمن"}
              </p>
            </div>
          </div>

          {!isEmailVerified && verifyStep === "idle" && (
            <button onClick={handleSendCode} disabled={sending}
              className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-60">
              {sending ? <Loader2 className="animate-spin w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
              إرسال كود التحقق على البريد
            </button>
          )}

          {!isEmailVerified && verifyStep === "sent" && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-center text-slate-500 dark:text-slate-400">
                أدخل الكود المرسل إلى <span className="text-orange-500">{user.email}</span>
              </p>
              <input autoFocus type="text" inputMode="numeric" maxLength={6}
                value={otpInput} onChange={e => setOtpInput(e.target.value.replace(/\D/g, ""))}
                placeholder="● ● ● ● ● ●"
                className="w-full h-14 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 text-center font-black text-2xl tracking-[0.5rem] dark:text-white focus:outline-none focus:border-orange-400" />
              {otpError && <p className="text-red-500 text-xs font-bold text-center">{otpError}</p>}
              <button onClick={handleConfirm} disabled={otpInput.length < 6}
                className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-60">
                <ShieldCheck className="w-4 h-4" /> تأكيد التحقق
              </button>
              <div className="text-center">
                {countdown > 0
                  ? <p className="text-xs text-slate-400 font-bold">إعادة الإرسال بعد {countdown}ث</p>
                  : <button onClick={handleSendCode} disabled={sending}
                      className="text-orange-500 font-black text-xs hover:underline flex items-center gap-1 mx-auto">
                      <RefreshCw className="w-3 h-3" /> إعادة إرسال الكود
                    </button>}
              </div>
            </div>
          )}

          {(isEmailVerified || verifyStep === "done") && (
            <div className="flex items-center justify-center gap-2 py-2 text-green-600 dark:text-green-400">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-black text-sm">تم توثيق بريدك بنجاح ✓</span>
            </div>
          )}
        </div>

        {profile?.role === "merchant" && (
          <button onClick={() => router.push("/dashboard")}
            className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-orange-200/50">
            <Crown className="w-4 h-4" /> لوحة تحكم التاجر
          </button>
        )}
      </div>

      <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} profile={profile} user={user} />
      <PublishProductModal open={showPublishProduct} onClose={() => setShowPublishProduct(false)} userPoints={userPoints} />
      <PublishStoryModal   open={showPublishStory}   onClose={() => setShowPublishStory(false)}   userPoints={userPoints} />
    </div>
  );
}
