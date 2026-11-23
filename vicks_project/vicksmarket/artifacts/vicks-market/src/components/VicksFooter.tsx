"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, MessageCircle, Lightbulb, Users } from "lucide-react";
import { VicksLogo } from "./VicksLogo";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/supabase-hooks";

export function VicksFooter() {
  const router = useRouter();
  const { user } = useUser();

  const handleChatWithOwner = () => {
    if (!user) { router.push("/login"); return; }
    router.push("/owner-chat");
  };

  return (
    <footer className="bg-white dark:bg-[#1A2332] border-t dark:border-slate-800 mt-0 pt-4 pb-20 px-4 text-right font-cairo" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* ── 3 quick-access cards ── */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { href: "/complaints", icon: <ShieldAlert className="w-5 h-5 text-red-500" />, bg: "bg-red-50 dark:bg-red-900/20", border: "border-red-100 dark:border-red-800", title: "الشكاوى", desc: "بلّغنا عن مشكلة" },
            { href: "/suggestions", icon: <Lightbulb className="w-5 h-5 text-yellow-500" />, bg: "bg-yellow-50 dark:bg-yellow-900/20", border: "border-yellow-100 dark:border-yellow-800", title: "الاقتراحات", desc: "شاركنا أفكارك" },
            { href: "/groups",      icon: <Users      className="w-5 h-5 text-orange-500" />, bg: "bg-orange-50 dark:bg-orange-900/20", border: "border-orange-100 dark:border-orange-800", title: "المجموعات", desc: "تفاعل مع الأعضاء" },
          ].map(c => (
            <Link key={c.href} href={c.href}
              className={`flex flex-col items-center text-center gap-1.5 p-3 rounded-2xl border ${c.bg} ${c.border} cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]`}>
              <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm flex-shrink-0">
                {c.icon}
              </div>
              <h4 className="font-black text-[11px] text-slate-800 dark:text-white leading-tight">{c.title}</h4>
              <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 leading-snug hidden sm:block">{c.desc}</p>
            </Link>
          ))}
        </div>

        <div className="flex flex-col items-center gap-2 text-center">
          <VicksLogo className="w-12 h-12 opacity-50 grayscale hover:grayscale-0 transition-all" />
          <h3 className="font-black text-sm dark:text-white uppercase tracking-tighter">VICKS MARKET</h3>
          <p className="text-[10px] text-slate-400 font-bold max-w-xs">سوقك الموثق والآمن لبيع وشراء كل احتياجاتك بذكاء.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          <div className="space-y-2">
            <h4 className="font-black text-orange-500 text-[10px] uppercase">المتجر</h4>
            <ul className="space-y-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
              <li><Link href="/offers">العروض اليومية</Link></li>
              <li><Link href="/vip">خدمات VIP</Link></li>
              <li><Link href="/faq">الأسئلة الشائعة</Link></li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-black text-blue-500 text-[10px] uppercase">قانوني</h4>
            <ul className="space-y-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
              <li><Link href="/terms">الشروط والأحكام</Link></li>
              <li><Link href="/verify-email">تحقق الحساب</Link></li>
            </ul>
          </div>
          <div className="col-span-2 md:col-span-1 space-y-2">
            <h4 className="font-black text-red-500 text-[10px] uppercase">تواصل</h4>
            <button
              onClick={handleChatWithOwner}
              className="flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-xl text-[10px] font-black shadow-md hover:bg-black transition-all"
            >
              <MessageCircle className="w-3.5 h-3.5 text-orange-500" />
              تحدث مع صاحب المتجر
            </button>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-1 text-red-500">
            <ShieldAlert className="w-4 h-4" />
            <h4 className="font-black text-[10px]">إخلاء مسؤولية قانوني</h4>
          </div>
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed">
            Vicks Market هو منصة للوساطة والربط بين البائع والمشتري فقط. إدارة الموقع غير مسؤولة عن جودة أو قانونية المنتجات المعروضة من قبل المستخدمين.
          </p>
        </div>

        <div className="text-center pt-3 border-t dark:border-slate-800">
          <p className="text-[9px] font-black text-slate-300 uppercase">© {new Date().getFullYear()} VICKS MARKET . ALL RIGHTS RESERVED BY MOM</p>
        </div>
      </div>
    </footer>
  );
}
