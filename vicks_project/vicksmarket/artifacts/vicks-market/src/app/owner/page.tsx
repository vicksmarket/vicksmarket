"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Crown, Pencil, ShieldBan, Trash2, Coins, Search, Check, X, Loader2,
  ArrowRight, Star, Users, Package, Send, Settings2, Plus, CalendarDays,
  Clock, BadgeCheck, Ban, UserX, Zap, ChevronDown, BarChart3, TrendingUp, ShoppingBag, AlertCircle, Database
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VicksLogo } from "@/components/VicksLogo";
import { useUser } from "@/lib/supabase-hooks";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const OWNER_EMAIL = "vicksmarket@gmail.com";
const ADMIN_EMAILS = [OWNER_EMAIL];
const DEFAULT_VIP = { gold: 600, silver: 200, blue: 99 };

type TabId = "stats" | "quick" | "merchants" | "products" | "points" | "vip";

interface StatsData {
  totalUsers: number;
  totalProducts: number;
  totalMerchants: number;
  vipByTier: { gold: number; silver: number; blue: number };
  activeVip: number;
  expiredVip: number;
  recentVip: any[];
  totalPointsSpent: number;
}

function CtrlInput({ value, onChange, placeholder, type = "text", className = "" }: {
  value: string; onChange: (v: string) => void; placeholder: string; type?: string; className?: string;
}) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className={cn("h-11 flex-1 rounded-xl border-2 border-orange-200 dark:border-orange-800/50 bg-white dark:bg-slate-900 px-3 text-sm font-bold text-right outline-none focus:border-orange-400 placeholder:text-slate-300 dark:placeholder:text-slate-600 dark:text-white transition-colors", className)} />
  );
}

function Card({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-[#252D3D] rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
        {icon}
        <span className="font-black text-sm dark:text-white">{title}</span>
      </div>
      <div className="p-4 space-y-3">{children}</div>
    </div>
  );
}

export default function OwnerDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabId>("stats");
  const isOwner = user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase());

  useEffect(() => {
    if (!authLoading && !isOwner) router.replace("/owner/login");
  }, [authLoading, isOwner, router]);

  // ── QUICK tab state ──
  const [verifyId, setVerifyId] = useState("");
  const [verifyType, setVerifyType] = useState("blue");
  const [verifyLoading, setVerifyLoading] = useState(false);

  // ── POINTS tab state ──
  const [ptId, setPtId] = useState("");
  const [ptAmount, setPtAmount] = useState("");
  const [ptLoading, setPtLoading] = useState(false);

  // ── BAN tab state ──
  const [banId, setBanId] = useState("");
  const [banDuration, setBanDuration] = useState("1w");
  const [banWarn, setBanWarn] = useState("");
  const [banLoading, setBanLoading] = useState(false);

  // ── PRODUCT moderation ──
  const [products, setProducts] = useState<any[]>([]);
  const [prodLoading, setProdLoading] = useState(false);

  // ── MERCHANTS tab state ──
  const [merchants, setMerchants] = useState<any[]>([]);
  const [merchantsLoading, setMerchantsLoading] = useState(false);
  const [merchantSearch, setMerchantSearch] = useState("");

  // ── VIP pricing ──
  const [vipPrices, setVipPrices] = useState(DEFAULT_VIP);
  const [vipSaving, setVipSaving] = useState(false);

  // ── Warning message ──
  const [warnId, setWarnId] = useState("");
  const [warnMsg, setWarnMsg] = useState("");

  // ── Temp role for owner preview ──
  const [tempRole, setTempRole] = useState<string | null>(null);

  // ── STATS tab state ──
  const [stats, setStats] = useState<StatsData | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    setTempRole(localStorage.getItem("vicks_temp_role"));
    loadVipPrices();
  }, []);

  useEffect(() => {
    if (activeTab === "products") loadReportedProducts();
    if (activeTab === "merchants") loadMerchants();
    if (activeTab === "stats") loadStats();
  }, [activeTab]);

  const loadStats = async () => {
    setStatsLoading(true);
    try {
      const supabase = createClient();
      if (!supabase) throw new Error("Supabase not configured");
      const now = new Date().toISOString();

      const [usersRes, productsRes] = await Promise.all([
        supabase.from("users").select("*"),
        supabase.from("products").select("id, sellerId, createdAt"),
      ]);

      const allUsers: any[] = usersRes.data || [];
      const allProducts: any[] = productsRes.data || [];

      const merchants = allUsers.filter(u => u.role === "merchant" || u.isVerified);
      const vipUsers = allUsers.filter(u => u.isVerified);
      const activeVip = vipUsers.filter(u => !u.verificationExpiresAt || u.verificationExpiresAt > now);
      const expiredVip = vipUsers.filter(u => u.verificationExpiresAt && u.verificationExpiresAt <= now);

      const vipByTier = {
        gold: vipUsers.filter(u => u.verificationType === "gold").length,
        silver: vipUsers.filter(u => u.verificationType === "silver").length,
        blue: vipUsers.filter(u => u.verificationType === "blue").length,
      };

      // Recent VIP: last 10 users who are verified, sorted by verificationExpiresAt or createdAt
      const recentVip = [...vipUsers]
        .sort((a, b) => {
          const ta = a.verificationExpiresAt || a.createdAt || "";
          const tb = b.verificationExpiresAt || b.createdAt || "";
          return tb.localeCompare(ta);
        })
        .slice(0, 10);

      setStats({
        totalUsers: allUsers.length,
        totalProducts: allProducts.length,
        totalMerchants: merchants.length,
        vipByTier,
        activeVip: activeVip.length,
        expiredVip: expiredVip.length,
        recentVip,
        totalPointsSpent: 0, // points spent not tracked in DB yet
      });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل تحميل الإحصاءات" });
    } finally {
      setStatsLoading(false);
    }
  };

  const findUserByUniqueId = async (uniqueId: string) => {
    const supabase = createClient();
    const { data } = await supabase.from("users").select("*").eq("unique_id", uniqueId.trim()).maybeSingle();
    return data;
  };

  const loadVipPrices = async () => {
    const supabase = createClient();
    const { data } = await supabase.from("config").select("*").eq("id", "vip_pricing").maybeSingle();
    if (data) setVipPrices({ gold: data.gold ?? DEFAULT_VIP.gold, silver: data.silver ?? DEFAULT_VIP.silver, blue: data.blue ?? DEFAULT_VIP.blue });
  };

  const loadReportedProducts = async () => {
    setProdLoading(true);
    const supabase = createClient();
    const { data } = await supabase.from("products").select("*").eq("isReported", true).order("createdAt", { ascending: false });
    setProducts(data || []);
    setProdLoading(false);
  };

  const loadMerchants = async () => {
    setMerchantsLoading(true);
    const supabase = createClient();
    const { data } = await supabase.from("users").select("*").eq("role", "merchant").order("createdAt", { ascending: false });
    setMerchants(data || []);
    setMerchantsLoading(false);
  };

  const parseDuration = (dur: string): string | null => {
    const m = dur.toLowerCase().match(/^(\d+)([hdwmy])$/);
    if (!m) return null;
    const d = new Date();
    const v = parseInt(m[1]);
    switch (m[2]) {
      case 'h': d.setHours(d.getHours() + v); break;
      case 'd': d.setDate(d.getDate() + v); break;
      case 'w': d.setDate(d.getDate() + v * 7); break;
      case 'm': d.setMonth(d.getMonth() + v); break;
      case 'y': d.setFullYear(d.getFullYear() + v); break;
      default: return null;
    }
    return d.toISOString();
  };

  const handleVerify = async () => {
    if (!verifyId) return;
    setVerifyLoading(true);
    try {
      const supabase = createClient();
      const target = await findUserByUniqueId(verifyId);
      if (!target) { toast({ variant: "destructive", title: "المستخدم غير موجود" }); return; }
      await supabase.from("users").update({ isVerified: true, verificationType: verifyType }).eq('id', target.id);
      toast({ title: `تم توثيق ${target.fullName || target.unique_id} بشارة ${verifyType} ✅` });
      setVerifyId("");
    } catch (e) {
      toast({ variant: "destructive", title: "فشل التوثيق" });
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleGivePoints = async (action: 'add' | 'sub') => {
    if (!ptId || !ptAmount) return;
    setPtLoading(true);
    try {
      const supabase = createClient();
      const target = await findUserByUniqueId(ptId);
      if (!target) { toast({ variant: "destructive", title: "المستخدم غير موجود" }); return; }
      const delta = action === 'add' ? Number(ptAmount) : -Number(ptAmount);
      await supabase.from("users").update({ points: (target.points || 0) + delta }).eq('id', target.id);
      toast({ title: `تم ${action === 'add' ? 'إضافة' : 'خصم'} ${ptAmount} نقطة ✅` });
      setPtId(""); setPtAmount("");
    } catch (e) {
      toast({ variant: "destructive", title: "فشل العملية" });
    } finally {
      setPtLoading(false);
    }
  };

  const handleBan = async () => {
    if (!banId) return;
    setBanLoading(true);
    try {
      const supabase = createClient();
      const target = await findUserByUniqueId(banId);
      if (!target) { toast({ variant: "destructive", title: "المستخدم غير موجود" }); return; }
      const expiresAt = parseDuration(banDuration);
      const update: any = { status: 'suspended', banExpiresAt: expiresAt };
      if (banWarn.trim()) update.warningMessage = banWarn.trim();
      await supabase.from("users").update(update).eq('id', target.id);
      toast({ title: `تم حظر ${target.fullName || target.unique_id} ✅` });
      setBanId(""); setBanWarn("");
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الحظر" });
    } finally {
      setBanLoading(false);
    }
  };

  const handleUnban = async (uniqueId: string) => {
    const supabase = createClient();
    const target = await findUserByUniqueId(uniqueId);
    if (!target) return;
    await supabase.from("users").update({ status: 'active', banExpiresAt: null, warningMessage: null }).eq('id', target.id);
    toast({ title: "تم رفع الحظر ✅" });
    if (activeTab === "merchants") loadMerchants();
  };

  const handleDeleteProduct = async (id: string) => {
    const supabase = createClient();
    await supabase.from("products").delete().eq('id', id);
    setProducts(prev => prev.filter(p => p.id !== id));
    toast({ title: "تم حذف المنتج" });
  };

  const handleApproveProduct = async (id: string) => {
    const supabase = createClient();
    await supabase.from("products").update({ isReported: false }).eq('id', id);
    setProducts(prev => prev.filter(p => p.id !== id));
    toast({ title: "تم إبراء المنتج من المخالفة" });
  };

  const handleSaveVipPrices = async () => {
    setVipSaving(true);
    try {
      const supabase = createClient();
      await supabase.from("config").upsert({ id: "vip_pricing", ...vipPrices });
      toast({ title: "تم حفظ أسعار VIP ✅" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الحفظ" });
    } finally {
      setVipSaving(false);
    }
  };

  const handleSendWarning = async () => {
    if (!warnId || !warnMsg) return;
    const supabase = createClient();
    const target = await findUserByUniqueId(warnId);
    if (!target) { toast({ variant: "destructive", title: "المستخدم غير موجود" }); return; }
    await supabase.from("users").update({ warningMessage: warnMsg }).eq('id', target.id);
    toast({ title: "تم إرسال التحذير ✅" });
    setWarnId(""); setWarnMsg("");
  };

  const activateTempRole = (role: string) => {
    localStorage.setItem('vicks_temp_role', role);
    localStorage.setItem('vicks_admin_mode', 'active');
    localStorage.setItem('admin_access_granted', 'true');
    setTempRole(role);
    router.push('/');
    setTimeout(() => window.location.reload(), 100);
  };

  const filteredMerchants = merchants.filter(m =>
    !merchantSearch || m.fullName?.includes(merchantSearch) || m.shopName?.includes(merchantSearch) || m.unique_id?.includes(merchantSearch)
  );

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-[#1A2332]"><Loader2 className="animate-spin text-orange-500 w-12 h-12" /></div>;
  if (!isOwner) return null;

  const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "stats",     label: "إحصاء",   icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { id: "quick",     label: "سريع",    icon: <Zap className="w-3.5 h-3.5" /> },
    { id: "merchants", label: "تجار",    icon: <Users className="w-3.5 h-3.5" /> },
    { id: "products",  label: "منتجات",  icon: <Package className="w-3.5 h-3.5" /> },
    { id: "points",    label: "نقاط",    icon: <Coins className="w-3.5 h-3.5" /> },
    { id: "vip",       label: "VIP",     icon: <Crown className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#1A2332] font-cairo pb-28 text-right" dir="rtl">
      <header className="sticky top-0 z-50 bg-white dark:bg-[#1A2332] border-b dark:border-slate-800 px-4 py-3 flex items-center justify-between shadow-sm">
        <VicksLogo className="w-8 h-8" />
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="font-black text-sm dark:text-white">لوحة المالك</span>
          <Crown className="w-4 h-4 text-yellow-500" />
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => router.push('/owner/setup')}
            className="w-9 h-9 bg-blue-50 dark:bg-blue-950/20 rounded-full flex items-center justify-center" title="إعداد قاعدة البيانات">
            <Database className="w-4 h-4 text-blue-500" />
          </button>
          <button onClick={async () => { const s = createClient(); await s.auth.signOut(); router.push('/owner/login'); }}
            className="w-9 h-9 bg-red-50 dark:bg-red-950/20 rounded-full flex items-center justify-center">
            <X className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </header>

      {/* Tab bar */}
      <div className="flex gap-1 px-4 pt-4 pb-0 overflow-x-auto scrollbar-hide">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={cn("flex items-center gap-1 px-4 py-2.5 rounded-2xl font-black text-[11px] transition-all flex-shrink-0",
              activeTab === t.id ? "bg-orange-500 text-white shadow-lg" : "bg-white dark:bg-[#252D3D] text-slate-500 dark:text-slate-400")}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-4">
        {/* STATS */}
        {activeTab === "stats" && (
          <div className="space-y-4">
            {statsLoading ? (
              <div className="flex justify-center py-16"><Loader2 className="animate-spin text-orange-500 w-8 h-8" /></div>
            ) : stats ? (
              <>
                {/* Platform overview */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "مستخدمين", value: stats.totalUsers, icon: <Users className="w-4 h-4 text-blue-500" />, color: "bg-blue-50 dark:bg-blue-950/20" },
                    { label: "منتجات", value: stats.totalProducts, icon: <ShoppingBag className="w-4 h-4 text-orange-500" />, color: "bg-orange-50 dark:bg-orange-950/20" },
                    { label: "تجار", value: stats.totalMerchants, icon: <Crown className="w-4 h-4 text-yellow-500" />, color: "bg-yellow-50 dark:bg-yellow-950/20" },
                  ].map(s => (
                    <div key={s.label} className={cn("rounded-2xl p-3 text-center", s.color)}>
                      <div className="flex justify-center mb-1">{s.icon}</div>
                      <p className="font-black text-lg dark:text-white">{s.value}</p>
                      <p className="text-[9px] font-bold text-slate-400">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* VIP stats */}
                <Card title="اشتراكات VIP" icon={<Crown className="w-4 h-4 text-yellow-500" />}>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-green-50 dark:bg-green-950/20 rounded-xl p-3 text-center">
                      <p className="font-black text-xl text-green-600">{stats.activeVip}</p>
                      <p className="text-[9px] font-bold text-slate-400">اشتراك نشط</p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-950/20 rounded-xl p-3 text-center">
                      <p className="font-black text-xl text-red-500">{stats.expiredVip}</p>
                      <p className="text-[9px] font-bold text-slate-400">اشتراك منتهي</p>
                    </div>
                  </div>
                  <div className="space-y-2 pt-1">
                    {[
                      { tier: "gold", label: "الباقة الذهبية", icon: "👑", count: stats.vipByTier.gold, color: "bg-yellow-100 dark:bg-yellow-950/30 text-yellow-700" },
                      { tier: "silver", label: "الباقة الفضية", icon: "⚪", count: stats.vipByTier.silver, color: "bg-slate-100 dark:bg-slate-800 text-slate-600" },
                      { tier: "blue", label: "الباقة الزرقاء", icon: "🔵", count: stats.vipByTier.blue, color: "bg-blue-100 dark:bg-blue-950/30 text-blue-700" },
                    ].map(t => (
                      <div key={t.tier} className={cn("flex items-center justify-between rounded-xl px-3 py-2", t.color)}>
                        <span className="font-black text-xs">{t.icon} {t.label}</span>
                        <span className="font-black text-sm">{t.count} مشترك</span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Recent VIP subscribers */}
                <Card title="آخر المشتركين VIP" icon={<TrendingUp className="w-4 h-4 text-orange-500" />}>
                  {stats.recentVip.length === 0 ? (
                    <p className="text-center text-slate-400 text-xs font-bold py-4">لا يوجد مشتركين بعد</p>
                  ) : (
                    <div className="space-y-2">
                      {stats.recentVip.map(u => {
                        const isActive = !u.verificationExpiresAt || u.verificationExpiresAt > new Date().toISOString();
                        const expDate = u.verificationExpiresAt ? new Date(u.verificationExpiresAt).toLocaleDateString('ar-EG') : 'دائم';
                        return (
                          <div key={u.id} className="flex items-center gap-2 py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden flex-shrink-0">
                              {u.photoURL ? <img src={u.photoURL} alt="" className="w-full h-full object-cover" /> :
                                <span className="flex items-center justify-center w-full h-full text-[10px]">
                                  {u.verificationType === 'gold' ? '👑' : u.verificationType === 'silver' ? '⚪' : '🔵'}
                                </span>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-black text-[11px] dark:text-white truncate">{u.shopName || u.fullName || u.unique_id}</p>
                              <p className="text-[9px] text-slate-400 font-bold">ينتهي: {expDate}</p>
                            </div>
                            <span className={cn("text-[9px] font-black px-2 py-0.5 rounded-full", isActive ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500")}>
                              {isActive ? "نشط" : "منتهي"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>

                <Button onClick={loadStats} variant="outline" className="w-full h-11 rounded-xl font-black text-xs">
                  <TrendingUp className="w-4 h-4 ml-1" /> تحديث الإحصاءات
                </Button>
              </>
            ) : (
              <div className="text-center py-16">
                <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-400 font-bold text-sm">فشل تحميل البيانات</p>
                <Button onClick={loadStats} className="mt-4 h-10 bg-orange-500 text-white rounded-xl font-black text-xs">إعادة المحاولة</Button>
              </div>
            )}
          </div>
        )}

        {/* QUICK */}
        {activeTab === "quick" && (
          <div className="space-y-4">
            {/* Preview as role */}
            <Card title="معاينة دور" icon={<BadgeCheck className="w-4 h-4 text-orange-500" />}>
              <p className="text-[10px] font-bold text-slate-400">معاينة الموقع كتاجر أو زبون</p>
              <div className="flex gap-2">
                <Button onClick={() => activateTempRole("merchant")} className="flex-1 h-11 bg-blue-600 text-white rounded-xl font-black text-xs">
                  تاجر
                </Button>
                <Button onClick={() => activateTempRole("customer")} className="flex-1 h-11 bg-slate-700 text-white rounded-xl font-black text-xs">
                  زبون
                </Button>
              </div>
            </Card>

            {/* Quick verify */}
            <Card title="توثيق سريع" icon={<BadgeCheck className="w-4 h-4 text-blue-500" />}>
              <div className="flex gap-2">
                <CtrlInput value={verifyId} onChange={setVerifyId} placeholder="unique_id المستخدم" />
                <Select value={verifyType} onValueChange={setVerifyType}>
                  <SelectTrigger className="w-28 h-11 rounded-xl border-2 border-orange-200 dark:bg-slate-900 font-bold text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blue">🔵 زرقاء</SelectItem>
                    <SelectItem value="gold">👑 ذهبية</SelectItem>
                    <SelectItem value="silver">⚪ فضية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleVerify} disabled={!verifyId || verifyLoading} className="w-full h-11 bg-blue-600 text-white rounded-xl font-black">
                {verifyLoading ? <Loader2 className="animate-spin w-4 h-4" /> : "تفعيل التوثيق"}
              </Button>
            </Card>

            {/* Warning */}
            <Card title="إرسال تحذير" icon={<ShieldBan className="w-4 h-4 text-yellow-500" />}>
              <CtrlInput value={warnId} onChange={setWarnId} placeholder="unique_id المستخدم" />
              <textarea value={warnMsg} onChange={e => setWarnMsg(e.target.value)} placeholder="نص التحذير..."
                className="w-full h-20 rounded-xl border-2 border-orange-200 dark:bg-slate-900 px-3 py-2 text-sm font-bold text-right outline-none resize-none dark:text-white" />
              <Button onClick={handleSendWarning} disabled={!warnId || !warnMsg} className="w-full h-11 bg-yellow-600 text-white rounded-xl font-black">
                إرسال التحذير
              </Button>
            </Card>
          </div>
        )}

        {/* MERCHANTS */}
        {activeTab === "merchants" && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input value={merchantSearch} onChange={e => setMerchantSearch(e.target.value)} placeholder="بحث بالاسم أو ID..."
                className="w-full h-11 rounded-xl border-2 border-orange-100 dark:bg-slate-900 pr-10 px-4 font-bold text-sm outline-none text-right dark:text-white" />
            </div>
            {merchantsLoading ? <div className="flex justify-center py-8"><Loader2 className="animate-spin text-orange-500" /></div>
              : filteredMerchants.map(m => (
                <div key={m.id} className="bg-white dark:bg-[#252D3D] rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex-shrink-0">
                    {m.photoURL ? <img src={m.photoURL} alt="" className="w-full h-full object-cover" /> : <Crown className="w-5 h-5 m-2.5 text-slate-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm dark:text-white truncate">{m.shopName || m.fullName}</p>
                    <div className="flex items-center gap-2 text-[9px] text-slate-400">
                      <span>#{m.unique_id}</span>
                      <span className={cn("font-bold", m.status === 'suspended' ? "text-red-500" : "text-green-500")}>{m.status === 'suspended' ? '🚫 محظور' : '✓ نشط'}</span>
                      {m.verificationType && <span className="text-blue-500">{m.verificationType === 'gold' ? '👑' : m.verificationType === 'silver' ? '⚪' : '🔵'} موثق</span>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {m.status === 'suspended' ? (
                      <button onClick={() => handleUnban(m.unique_id)} className="w-8 h-8 bg-green-50 dark:bg-green-950/20 rounded-xl flex items-center justify-center">
                        <Check className="w-4 h-4 text-green-500" />
                      </button>
                    ) : (
                      <button onClick={async () => { const s = createClient(); await s.from("users").update({ status: 'suspended' }).eq('id', m.id); loadMerchants(); }}
                        className="w-8 h-8 bg-red-50 dark:bg-red-950/20 rounded-xl flex items-center justify-center">
                        <Ban className="w-4 h-4 text-red-500" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* PRODUCTS (reported) */}
        {activeTab === "products" && (
          <div className="space-y-3">
            {prodLoading ? <div className="flex justify-center py-8"><Loader2 className="animate-spin text-orange-500" /></div>
              : products.length === 0 ? <div className="text-center py-16 text-slate-400 font-bold">لا توجد منتجات مُبلَّغ عنها</div>
              : products.map(p => (
                <div key={p.id} className="bg-white dark:bg-[#252D3D] rounded-2xl p-3 flex gap-3 shadow-sm">
                  <img src={p.image || `https://picsum.photos/seed/${p.id}/100/100`} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm dark:text-white truncate">{p.name}</p>
                    <p className="text-[10px] text-orange-500 font-bold">{p.price?.toLocaleString()} ج.م</p>
                    <p className="text-[9px] text-slate-400 font-bold">{p.seller}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button onClick={() => handleApproveProduct(p.id)} className="w-8 h-8 bg-green-50 dark:bg-green-950/20 rounded-xl flex items-center justify-center">
                      <Check className="w-4 h-4 text-green-500" />
                    </button>
                    <button onClick={() => handleDeleteProduct(p.id)} className="w-8 h-8 bg-red-50 dark:bg-red-950/20 rounded-xl flex items-center justify-center">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* POINTS */}
        {activeTab === "points" && (
          <Card title="إدارة النقاط" icon={<Coins className="w-4 h-4 text-orange-500" />}>
            <CtrlInput value={ptId} onChange={setPtId} placeholder="unique_id المستخدم" />
            <CtrlInput type="number" value={ptAmount} onChange={setPtAmount} placeholder="عدد النقاط" />
            <div className="flex gap-2">
              <Button onClick={() => handleGivePoints('add')} disabled={!ptId || !ptAmount || ptLoading} className="flex-1 h-11 bg-green-600 text-white rounded-xl font-black text-xs">
                {ptLoading ? <Loader2 className="animate-spin w-4 h-4" /> : "+ إضافة نقاط"}
              </Button>
              <Button onClick={() => handleGivePoints('sub')} disabled={!ptId || !ptAmount || ptLoading} className="flex-1 h-11 bg-red-500 text-white rounded-xl font-black text-xs">
                {ptLoading ? <Loader2 className="animate-spin w-4 h-4" /> : "- خصم نقاط"}
              </Button>
            </div>
            <div className="mt-2 space-y-2">
              <p className="font-black text-xs text-slate-400">حظر المستخدم</p>
              <CtrlInput value={banId} onChange={setBanId} placeholder="unique_id" />
              <CtrlInput value={banDuration} onChange={setBanDuration} placeholder="المدة (1w, 3m, p)" />
              <input value={banWarn} onChange={e => setBanWarn(e.target.value)} placeholder="سبب الحظر (اختياري)"
                className="w-full h-11 rounded-xl border-2 border-orange-200 dark:bg-slate-900 px-3 text-sm font-bold text-right outline-none dark:text-white" />
              <Button onClick={handleBan} disabled={!banId || banLoading} className="w-full h-11 bg-slate-900 text-white rounded-xl font-black">
                {banLoading ? <Loader2 className="animate-spin w-4 h-4" /> : "تطبيق الحظر"}
              </Button>
            </div>
          </Card>
        )}

        {/* VIP PRICING */}
        {activeTab === "vip" && (
          <Card title="أسعار باقات VIP" icon={<Crown className="w-4 h-4 text-yellow-500" />}>
            {(["gold", "silver", "blue"] as const).map(tier => (
              <div key={tier} className="flex items-center gap-3">
                <span className="text-lg">{tier === "gold" ? "👑" : tier === "silver" ? "⚪" : "🔵"}</span>
                <CtrlInput type="number" value={String(vipPrices[tier])} onChange={v => setVipPrices(p => ({ ...p, [tier]: Number(v) }))} placeholder={`سعر ${tier} (نقاط)`} className="flex-1" />
              </div>
            ))}
            <Button onClick={handleSaveVipPrices} disabled={vipSaving} className="w-full h-11 bg-yellow-600 text-white rounded-xl font-black">
              {vipSaving ? <Loader2 className="animate-spin w-4 h-4" /> : "حفظ الأسعار"}
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
