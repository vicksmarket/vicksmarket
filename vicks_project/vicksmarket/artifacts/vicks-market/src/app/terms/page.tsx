
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck, Scale, AlertTriangle, Clock, Ban } from "lucide-react";
import { VicksLogo } from "@/components/VicksLogo";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function TermsPage() {
  const router = useRouter();

  const rules = [
    { title: "الصدق في العرض", desc: "يلتزم التاجر بعرض صور حقيقية ووصف دقيق للمنتج دون أي خداع." },
    { title: "منع المعاملات الخارجية", desc: "يمنع منعاً باتاً وضع أرقام هواتف أو روابط خارجية في وصف المنتج. الموقع غير مسؤول عن أي عملية تتم خارج النظام." },
    { title: "قيود تغيير البيانات", desc: "تغيير اسم المستخدم مسموح مرة كل 7 أيام، واسم المتجر مرة كل 30 يوم لضمان ثقة العملاء." },
    { title: "مكافحة الغش", desc: "تزييف التقييمات أو فتح حسابات مكررة لنفس التاجر يعرضه للحظر النهائي فوراً." }
  ];

  const violations = [
    { type: "تواصل خارجي", first: "إنذار + حذف", second: "حظر 7 أيام", third: "حظر نهائي" },
    { type: "منتج مقلد/مغشوش", first: "حذف + إنذار", second: "حظر 14 يوم", third: "حظر نهائي" },
    { type: "ألفاظ خارجة", first: "حظر شات 3 أيام", second: "حظر شات 15 يوم", third: "حظر نهائي" },
    { type: "تكرار حسابات", first: "حظر نهائي", second: "-", third: "-" }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#1A2332] p-6 text-right font-cairo" dir="rtl">
      <header className="flex items-center justify-between mb-10 max-w-4xl mx-auto">
        <button onClick={() => router.back()} className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 rotate-180" />
        </button>
        <div className="flex items-center gap-2">
          <span className="font-black uppercase text-lg dark:text-white">سياسات فيكس ماركت</span>
          <VicksLogo className="w-8 h-8" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-2">
           <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto text-orange-500 mb-4">
              <Scale className="w-10 h-10" />
           </div>
           <h1 className="text-3xl font-black dark:text-white">اتفاقية التاجر والمشتري</h1>
           <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">نظام صارم لبيئة تجارية آمنة</p>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rules.map((rule, i) => (
            <div key={i} className="p-6 bg-slate-50 dark:bg-slate-800 rounded-[2rem] border-r-8 border-orange-500 shadow-sm space-y-2">
              <h3 className="font-black text-orange-600 text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> {rule.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed">{rule.desc}</p>
            </div>
          ))}
        </section>

        <section className="space-y-6">
           <div className="flex items-center gap-3 border-r-4 border-red-500 pr-3">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <h2 className="text-xl font-black dark:text-white">جدول المخالفات والعقوبات</h2>
           </div>
           <div className="bg-white dark:bg-slate-800 rounded-[2rem] border overflow-hidden shadow-xl">
              <Table>
                 <TableHeader className="bg-slate-50 dark:bg-slate-900">
                    <TableRow>
                       <TableHead className="text-right font-black">نوع المخالفة</TableHead>
                       <TableHead className="text-right font-black">المرة الأولى</TableHead>
                       <TableHead className="text-right font-black">المرة الثانية</TableHead>
                       <TableHead className="text-right font-black">المرة الثالثة</TableHead>
                    </TableRow>
                 </TableHeader>
                 <TableBody>
                    {violations.map((v, i) => (
                      <TableRow key={i}>
                         <TableCell className="font-bold dark:text-white">{v.type}</TableCell>
                         <TableCell className="text-xs text-orange-500 font-black">{v.first}</TableCell>
                         <TableCell className="text-xs text-red-500 font-black">{v.second}</TableCell>
                         <TableCell className="text-xs text-red-700 font-black">{v.third}</TableCell>
                      </TableRow>
                    ))}
                 </TableBody>
              </Table>
           </div>
        </section>

        <section className="p-8 bg-slate-900 rounded-[3rem] text-white space-y-4 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 left-0 p-10 opacity-10">
              <Ban className="w-32 h-32" />
           </div>
           <h3 className="text-lg font-black flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" /> سياسة فك الحظر
           </h3>
           <p className="text-sm font-bold opacity-80 leading-relaxed">
              الحظر المؤقت ينتهي تلقائياً بعد مرور المدة المحددة، مع بقاء الحساب تحت "المراقبة" لمدة 30 يوم.
              الحظر النهائي لا يتم فكه إلا بتقديم وثائق رسمية (سجل تجاري، فواتير) وتخضع لمراجعة يدوية من الإدارة.
           </p>
        </section>

        <footer className="text-center py-10 opacity-50">
           <p className="text-[10px] font-black uppercase">VICKS MARKET SAFETY PROTOCOL v2.0</p>
        </footer>
      </main>
    </div>
  );
}
