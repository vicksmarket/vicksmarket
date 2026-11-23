"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  LogOut, Home, Loader2, ShieldAlert, AlertCircle,
  Zap, Users, ShoppingCart, Search, Gavel, Wallet, ShieldCheck, Crown, UserCircle, Store, Clock, Info
} from "lucide-react";
import { VicksLogo } from "@/components/VicksLogo";
import { useUser, useCollection } from "@/lib/supabase-hooks";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const ADMIN_EMAILS = ["mom1113694362@gmail.com", "vicksmarket@gmail.com"];

export default function MerchantProfilePage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const { toast } = useToast();
  
  const [isAdminLocal, setIsAdminLocal] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [targetId, setTargetId] = useState("");
  const [pointsAmount, setPointsAmount] = useState("");
  const [verifType, setVerifType] = useState("blue");
  const [verifDuration, setVerifDuration] = useState("1m");
  const [banTime, setBanTime] = useState("1w");
  const [confirmModal, setConfirmModal] = useState({ open: false, type: '', data: {} as any });

  const { data: allUsers } = useCollection("users");
  const { data: allProducts } = useCollection("products");
  const { data: reportedProducts } = useCollection("products", [{ column: "isReported", value: true }]);

  useEffect(() => {
    const mockMode = localStorage.getItem('vicks_admin_mode');
    const accessGranted = localStorage.getItem('admin_access_granted');
    if (mockMode === 'active' && accessGranted) {
      setIsAdminLocal(true);
    }
  }, []);

  const parseDurationCommand = (command: string): string | null => {
    const cmd = command.toLowerCase().trim();
    if (cmd === 'permanent' || cmd === 'p' || cmd === 'inf') return null;
    const match = cmd.match(/^(\d+)([hdwmy])$/);
    if (!match) return null;
    const value = parseInt(match[1]);
    const unit = match[2];
    const date = new Date();
    switch (unit) {
      case 'h': date.setHours(date.getHours() + value); break;
      case 'd': date.setDate(date.getDate() + value); break;
      case 'w': date.setDate(date.getDate() + value * 7); break;
      case 'm': date.setMonth(date.getMonth() + value); break;
      case 'y': date.setFullYear(date.getFullYear() + value); break;
      default: return null;
    }
    return date.toISOString();
  };

  const findUserByUniqueId = async (id: string) => {
    const supabase = createClient();
    const { data } = await supabase.from("users").select("*").eq("unique_id", id.trim()).maybeSingle();
    return data;
  };

  const handlePointsAction = async (action: 'add' | 'sub') => {
    if (!targetId || !pointsAmount) return;
    setLoadingAction(true);
    try {
      const supabase = createClient();
      const targetUser = await findUserByUniqueId(targetId);
      if (!targetUser) { toast({ variant: "destructive", title: "المستخدم غير موجود" }); return; }
      const delta = action === 'add' ? Number(pointsAmount) : -Number(pointsAmount);
      const newPoints = (targetUser.points || 0) + delta;
      await supabase.from("users").update({ points: newPoints }).eq('id', targetUser.id);
      toast({ title: `تم ${action === 'add' ? 'إضافة' : 'خصم'} ${pointsAmount} نقطة ✅` });
      setConfirmModal({ ...confirmModal, open: false });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل العملية" });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleVerify = async () => {
    if (!targetId) return;
    setLoadingAction(true);
    try {
      const supabase = createClient();
      const targetUser = await findUserByUniqueId(targetId);
      if (!targetUser) { toast({ variant: "destructive", title: "المستخدم غير موجود" }); return; }
      const expiresAt = parseDurationCommand(verifDuration);
      await supabase.from("users").update({
        isVerified: true,
        verificationType: verifType,
        verificationExpiresAt: expiresAt,
      }).eq('id', targetUser.id);
      toast({ title: `تم توثيق الحساب بشارة ${verifType} ✅` });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل التوثيق" });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleShadowBan = async () => {
    if (!targetId) return;
    setLoadingAction(true);
    try {
      const supabase = createClient();
      const targetUser = await findUserByUniqueId(targetId);
      if (!targetUser) { toast({ variant: "destructive", title: "المستخدم غير موجود" }); return; }
      const expiresAt = parseDurationCommand(banTime);
      await supabase.from("users").update({
        status: 'suspended',
        banExpiresAt: expiresAt,
      }).eq('id', targetUser.id);
      toast({ title: "تم تطبيق الحظر ✅" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الحظر" });
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    const supabase = createClient();
    await supabase.from("products").delete().eq('id', productId);
    toast({ title: "تم حذف المنتج" });
  };

  if (userLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-orange-500 w-10 h-10" /></div>;
  if (!user) { router.push('/login'); return null; }

  const isAdmin = isAdminLocal || (user?.email && ADMIN_EMAILS.includes(user.email));
  if (!isAdmin) return <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-10 text-center">
    <ShieldAlert className="w-16 h-16 text-orange-500" />
    <h1 className="text-xl font-black">غير مصرح بالوصول</h1>
    <Button onClick={() => router.push('/')} className="bg-orange-500">العودة للرئيسية</Button>
  </div>;

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#1A2332] font-cairo pb-24 text-right" dir="rtl">
      <header className="sticky top-0 z-50 bg-white dark:bg-[#1A2332] border-b dark:border-slate-800 px-4 py-3 flex items-center justify-between shadow-sm">
        <button onClick={() => router.push('/')} className="w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
          <Home className="w-4 h-4 text-orange-500" />
        </button>
        <div className="flex items-center gap-2">
          <VicksLogo className="w-7 h-7" />
          <span className="font-black text-sm dark:text-white">لوحة الإدارة</span>
        </div>
        <button onClick={async () => { const s = createClient(); await s.auth.signOut(); router.push('/login'); }}
          className="w-9 h-9 bg-red-50 dark:bg-red-950/20 rounded-full flex items-center justify-center">
          <LogOut className="w-4 h-4 text-red-500" />
        </button>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 p-4">
        {[
          { label: "المستخدمون", value: allUsers?.length || 0, icon: <Users className="w-5 h-5 text-blue-500" /> },
          { label: "المنتجات", value: allProducts?.length || 0, icon: <ShoppingCart className="w-5 h-5 text-green-500" /> },
          { label: "المُبلَّغ عنها", value: reportedProducts?.length || 0, icon: <ShieldAlert className="w-5 h-5 text-red-500" /> },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-[#252D3D] rounded-2xl p-3 text-center shadow-sm">
            <div className="flex justify-center mb-1">{s.icon}</div>
            <div className="text-xl font-black dark:text-white">{s.value}</div>
            <div className="text-[9px] font-bold text-slate-400">{s.label}</div>
          </div>
        ))}
      </div>

      <main className="px-4">
        <Tabs defaultValue="points" dir="rtl">
          <TabsList className="w-full rounded-2xl bg-slate-100 dark:bg-slate-800 mb-4">
            <TabsTrigger value="points" className="flex-1 rounded-xl font-black text-[10px]">النقاط</TabsTrigger>
            <TabsTrigger value="verify" className="flex-1 rounded-xl font-black text-[10px]">التوثيق</TabsTrigger>
            <TabsTrigger value="ban" className="flex-1 rounded-xl font-black text-[10px]">الحظر</TabsTrigger>
          </TabsList>

          <TabsContent value="points" className="space-y-3">
            <div className="bg-white dark:bg-[#252D3D] rounded-2xl p-4 shadow-sm space-y-3">
              <h3 className="font-black text-sm dark:text-white flex items-center gap-2"><Wallet className="w-4 h-4 text-orange-500" />إدارة النقاط</h3>
              <div className="flex gap-2">
                <Input value={targetId} onChange={e => setTargetId(e.target.value)} placeholder="رقم ID المستخدم" className="h-11 rounded-xl font-bold dark:bg-slate-900" />
                <Input type="number" value={pointsAmount} onChange={e => setPointsAmount(e.target.value)} placeholder="الكمية" className="h-11 rounded-xl font-bold dark:bg-slate-900 w-24" />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setConfirmModal({ open: true, type: 'add', data: { id: targetId, amount: pointsAmount } })}
                  disabled={!targetId || !pointsAmount || loadingAction} className="flex-1 h-11 bg-green-600 text-white rounded-xl font-black text-xs">
                  + إضافة نقاط
                </Button>
                <Button onClick={() => setConfirmModal({ open: true, type: 'sub', data: { id: targetId, amount: pointsAmount } })}
                  disabled={!targetId || !pointsAmount || loadingAction} className="flex-1 h-11 bg-red-500 text-white rounded-xl font-black text-xs">
                  - خصم نقاط
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="verify" className="space-y-3">
            <div className="bg-white dark:bg-[#252D3D] rounded-2xl p-4 shadow-sm space-y-3">
              <h3 className="font-black text-sm dark:text-white flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-blue-500" />توثيق الحسابات</h3>
              <Input value={targetId} onChange={e => setTargetId(e.target.value)} placeholder="رقم ID المستخدم" className="h-11 rounded-xl font-bold dark:bg-slate-900" />
              <Select value={verifType} onValueChange={setVerifType}>
                <SelectTrigger className="h-11 rounded-xl font-bold dark:bg-slate-900"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="blue">🔵 زرقاء</SelectItem>
                  <SelectItem value="gold">👑 ذهبية</SelectItem>
                  <SelectItem value="silver">⚪ فضية</SelectItem>
                </SelectContent>
              </Select>
              <Input value={verifDuration} onChange={e => setVerifDuration(e.target.value)} placeholder="المدة (1m, 3m, 1y, p)" className="h-11 rounded-xl font-bold dark:bg-slate-900" />
              <Button onClick={handleVerify} disabled={!targetId || loadingAction} className="w-full h-12 bg-blue-600 text-white rounded-xl font-black">
                {loadingAction ? <Loader2 className="animate-spin w-4 h-4" /> : "تفعيل التوثيق"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="ban" className="space-y-3">
            <div className="bg-white dark:bg-[#252D3D] rounded-2xl p-4 shadow-sm space-y-3">
              <h3 className="font-black text-sm dark:text-white flex items-center gap-2"><Gavel className="w-4 h-4 text-red-500" />إدارة الحظر</h3>
              <Input value={targetId} onChange={e => setTargetId(e.target.value)} placeholder="رقم ID المستخدم" className="h-11 rounded-xl font-bold dark:bg-slate-900" />
              <Input value={banTime} onChange={e => setBanTime(e.target.value)} placeholder="مدة الحظر (3m, 6m, p)" className="h-11 rounded-xl font-bold dark:bg-slate-900" />
              <Button onClick={handleShadowBan} disabled={!targetId || loadingAction} className="w-full h-12 bg-red-600 text-white rounded-xl font-black">
                {loadingAction ? <Loader2 className="animate-spin w-4 h-4" /> : "تطبيق الحظر"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={confirmModal.open} onOpenChange={(o) => setConfirmModal({ ...confirmModal, open: o })}>
        <DialogContent className="rounded-[2rem] font-cairo text-right" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" /> تأكيد العملية
            </DialogTitle>
            <DialogDescription className="font-bold">
              هل أنت متأكد من {confirmModal.type.includes('add') ? 'إضافة' : 'خصم'}
              <span className="text-orange-600 px-1">{confirmModal.data.amount}</span> نقطة
              للحساب صاحب ID <span className="text-blue-600 px-1">{confirmModal.data.id}</span>؟
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button onClick={() => setConfirmModal({ ...confirmModal, open: false })} variant="outline" className="flex-1 rounded-xl font-black">إلغاء</Button>
            <Button onClick={() => handlePointsAction(confirmModal.type.includes('add') ? 'add' : 'sub')}
              className="flex-1 rounded-xl bg-slate-900 text-white font-black">تأكيد التنفيذ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
