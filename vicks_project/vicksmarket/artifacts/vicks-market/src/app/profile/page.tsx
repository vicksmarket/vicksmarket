"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Home, Loader2, LogOut, ChevronLeft, Mail, Hash, User, Store, CheckCircle2 } from "lucide-react";
import { useUser, useDoc } from "@/lib/supabase-hooks";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { VicksLogo } from "@/components/VicksLogo";
import { cn } from "@/lib/utils";

/* ────── row component ────── */
function InfoRow({ icon, label, value, className }: {
  icon: React.ReactNode; label: string; value: React.ReactNode; className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between py-3.5 border-b border-slate-100 dark:border-slate-700/60 last:border-0", className)}>
      <div className="flex items-center gap-2.5">
        <span className="text-slate-400">{icon}</span>
        <span className="text-xs font-black text-slate-500 dark:text-slate-400">{label}</span>
      </div>
      <div className="text-sm font-black text-slate-700 dark:text-slate-200 text-left max-w-[55%] truncate">{value}</div>
    </div>
  );
}

/* ────── editable row ────── */
function EditableRow({ icon, label, value, onChange, onSave, saving }: {
  icon: React.ReactNode; label: string; value: string;
  onChange: (v: string) => void; onSave: () => void; saving: boolean;
}) {
  return (
    <div className="py-3.5 border-b border-slate-100 dark:border-slate-700/60 last:border-0 space-y-2">
      <div className="flex items-center gap-2.5">
        <span className="text-slate-400">{icon}</span>
        <span className="text-xs font-black text-slate-500 dark:text-slate-400">{label}</span>
      </div>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          className="flex-1 h-10 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50
                     px-3 text-sm font-black text-slate-700 dark:text-slate-200 focus:outline-none focus:border-orange-400 transition-colors"
        />
        <button
          onClick={onSave} disabled={saving}
          className="px-4 h-10 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-black transition-colors"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "حفظ"}
        </button>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const { toast } = useToast();

  const [saving,      setSaving]      = useState<string | null>(null);
  const [fullName,    setFullName]    = useState("");
  const [shopName,    setShopName]    = useState("");

  const { data: profile, loading: profileLoading } = useDoc("profiles", user?.uid ?? null);
  const isBanned = profile?.status === "banned" || profile?.status === "suspended";

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || profile.fullName || "");
      setShopName(profile.shop_name || profile.shopName || "");
    }
  }, [profile]);

  useEffect(() => {
    if (!userLoading && !user) router.replace("/login");
  }, [user, userLoading, router]);

  const handleSave = async (field: "full_name" | "shop_name", value: string) => {
    if (!user) return;
    setSaving(field);
    const { error } = await createClient().from("profiles").update({ [field]: value }).eq("id", user.uid);
    setSaving(null);
    if (error) toast({ variant: "destructive", title: "فشل الحفظ" });
    else       toast({ title: "تم الحفظ ✓" });
  };

  const handleSignOut = async () => {
    await createClient().auth.signOut();
    router.push("/login");
  };

  if (userLoading || (user && profileLoading)) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-orange-500 w-8 h-8" />
    </div>
  );

  if (!user) return null;

  if (!profile) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6" dir="rtl">
      <p className="font-black text-slate-500 text-sm">لم يُعثر على بيانات الملف الشخصي.</p>
      <button onClick={handleSignOut} className="px-6 py-3 bg-orange-500 text-white font-black rounded-2xl text-sm">
        تسجيل الخروج
      </button>
    </div>
  );

  const points    = profile.points   ?? 0;
  const uniqueId  = profile.unique_id ?? "—";
  const isMerchant = profile.role === "merchant";

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0f1621] font-cairo pb-24" dir="rtl">

      {/* ── Header ── */}
      <header className="bg-white dark:bg-[#1A2332] border-b border-slate-100 dark:border-slate-700/50 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <button onClick={() => router.push("/")}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
            <Home className="w-4 h-4 text-orange-500" />
          </button>

          <h1 className="font-black text-base dark:text-white">إعدادات الحساب</h1>

          {/* Logo + points badge */}
          <div className="relative">
            <VicksLogo className="w-8 h-8" />
            <span className="absolute -top-1.5 -left-2 min-w-[20px] h-5 px-1
                             bg-orange-500 text-white text-[10px] font-black
                             rounded-full flex items-center justify-center leading-none shadow">
              {points > 999 ? `${Math.floor(points / 1000)}k` : points}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-5 space-y-4">

        {/* Banned warning */}
        {isBanned && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl px-4 py-3 text-center">
            <p className="text-xs font-black text-red-600 dark:text-red-400">
              تم تقييد حسابك مؤقتاً — بعض الميزات قد لا تعمل.
            </p>
          </div>
        )}

        {/* ── Unified card ── */}
        <div className="bg-white dark:bg-[#1A2332] rounded-3xl px-5 shadow-sm border border-slate-100 dark:border-slate-700/40">

          {/* Editable: full name */}
          <EditableRow
            icon={<User className="w-4 h-4" />}
            label="الاسم بالكامل"
            value={fullName}
            onChange={setFullName}
            onSave={() => handleSave("full_name", fullName)}
            saving={saving === "full_name"}
          />

          {/* Editable: shop name — merchants only */}
          {isMerchant && (
            <EditableRow
              icon={<Store className="w-4 h-4" />}
              label="اسم المتجر"
              value={shopName}
              onChange={setShopName}
              onSave={() => handleSave("shop_name", shopName)}
              saving={saving === "shop_name"}
            />
          )}

          {/* Email */}
          <InfoRow
            icon={<Mail className="w-4 h-4" />}
            label="البريد الإلكتروني"
            value={user.email ?? "—"}
          />

          {/* Email verified */}
          <InfoRow
            icon={<CheckCircle2 className="w-4 h-4 text-green-500" />}
            label="حالة البريد"
            value={<span className="text-green-600 dark:text-green-400 text-xs font-black">موثّق ✓</span>}
          />

          {/* ID number — below email */}
          <InfoRow
            icon={<Hash className="w-4 h-4" />}
            label="رقم الآيدي"
            value={uniqueId}
          />

        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="w-full h-14 rounded-[2rem] border-2 border-red-100 dark:border-red-900/40 bg-white dark:bg-[#1A2332]
                     text-red-500 font-black flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <LogOut className="w-5 h-5" /> تسجيل الخروج
        </button>
      </main>
    </div>
  );
}
