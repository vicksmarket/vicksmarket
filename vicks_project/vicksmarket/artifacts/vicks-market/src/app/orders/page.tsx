"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ShoppingBag, Package, CheckCircle2, Clock, XCircle, ChevronLeft } from "lucide-react";
import { useUser } from "@/lib/supabase-hooks";
import { VicksLogo } from "@/components/VicksLogo";

const MOCK_ORDERS = [
  { id: "ORD-001", product: "آيفون 15 برو", price: "55,000", status: "delivered", date: "2026-07-28", image: "https://images.unsplash.com/photo-1695048133142-1a20484429be?w=100&h=100&fit=crop" },
  { id: "ORD-002", product: "سماعة Sony WH-1000XM5", price: "8,000", status: "pending", date: "2026-08-01", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop" },
  { id: "ORD-003", product: "لاب توب Dell XPS 15", price: "42,000", status: "processing", date: "2026-08-02", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=100&h=100&fit=crop" },
];

const STATUS_CONFIG = {
  delivered:  { label: "تم التسليم",  color: "bg-green-50  dark:bg-green-900/20  text-green-600",  icon: CheckCircle2 },
  pending:    { label: "قيد الانتظار", color: "bg-amber-50  dark:bg-amber-900/20  text-amber-600",  icon: Clock },
  processing: { label: "جارٍ التجهيز", color: "bg-blue-50   dark:bg-blue-900/20   text-blue-600",   icon: Package },
  cancelled:  { label: "ملغي",         color: "bg-red-50    dark:bg-red-900/20    text-red-500",    icon: XCircle },
} as const;

const TABS = ["الكل", "قيد الانتظار", "جارٍ التجهيز", "تم التسليم", "ملغي"];
const TAB_MAP: Record<string, string> = { "قيد الانتظار": "pending", "جارٍ التجهيز": "processing", "تم التسليم": "delivered", "ملغي": "cancelled" };

export default function OrdersPage() {
  const router = useRouter();
  const { user, loading } = useUser();
  const [activeTab, setActiveTab] = useState("الكل");

  const filtered = MOCK_ORDERS.filter(o => activeTab === "الكل" || o.status === TAB_MAP[activeTab]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8" dir="rtl">
      <ShoppingBag className="w-16 h-16 text-slate-200" />
      <p className="font-black text-slate-400 text-center">يجب تسجيل الدخول لعرض طلباتك</p>
      <button onClick={() => router.push("/login")} className="px-8 py-3 bg-orange-500 text-white font-black rounded-2xl active:scale-95">
        تسجيل الدخول
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#1A2332] flex flex-col" dir="rtl">
      {/* Header */}
      <div className="bg-white dark:bg-[#252D3D] px-4 py-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 sticky top-0 z-10">
        <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded-full active:scale-90">
          <ArrowRight className="w-4 h-4 text-slate-600 dark:text-slate-300" />
        </button>
        <div className="flex items-center gap-2">
          <span className="font-black text-sm dark:text-white">طلباتي</span>
          <span className="text-[10px] bg-orange-500 text-white px-2 py-0.5 rounded-full font-black">{MOCK_ORDERS.length}</span>
        </div>
        <VicksLogo className="w-8 h-8" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide bg-white dark:bg-[#252D3D] border-b border-slate-100 dark:border-slate-800">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-black transition-colors
              ${activeTab === tab ? "bg-orange-500 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Orders list */}
      <div className="flex-1 p-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <ShoppingBag className="w-14 h-14 text-slate-200 dark:text-slate-700" />
            <p className="text-slate-400 font-black text-sm">لا توجد طلبات</p>
          </div>
        ) : filtered.map(order => {
          const cfg = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG];
          const Icon = cfg.icon;
          return (
            <div key={order.id} className="bg-white dark:bg-[#252D3D] rounded-2xl p-4 flex gap-3 items-center shadow-sm border border-slate-100 dark:border-slate-800 active:scale-[0.99] transition-transform cursor-pointer">
              <img src={order.image} alt={order.product} className="w-16 h-16 rounded-xl object-cover flex-shrink-0 bg-slate-100" onError={e => { (e.target as HTMLImageElement).src = "/icon-512.png"; }} />
              <div className="flex-1 min-w-0">
                <p className="font-black text-sm dark:text-white truncate">{order.product}</p>
                <p className="text-orange-500 font-black text-xs">{order.price} ج.م</p>
                <p className="text-slate-400 text-[10px] font-bold mt-0.5">{order.date} · {order.id}</p>
                <span className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-black ${cfg.color}`}>
                  <Icon className="w-3 h-3" /> {cfg.label}
                </span>
              </div>
              <ChevronLeft className="w-4 h-4 text-slate-300 flex-shrink-0" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
