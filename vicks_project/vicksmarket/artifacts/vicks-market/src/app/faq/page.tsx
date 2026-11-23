
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, HelpCircle, Coins, ShieldCheck, MessageSquare, Flame } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { VicksLogo } from "@/components/VicksLogo";

export default function FAQPage() {
  const router = useRouter();

  const faqs = [
    {
      question: "كيف أحصل على نقاط مجانية؟",
      answer: "يمكنك الحصول على 50 نقطة فوراً عند تثبيت التطبيق (PWA)، كما يمكنك مشاهدة إعلان في صفحة VIP لتحصل على 25 نقطة (متاح 10 مرات يومياً).",
      icon: <Coins className="w-4 h-4 text-orange-500" />
    },
    {
      question: "ما هي شروط توثيق الحساب؟",
      answer: "التوثيق المميز متاح في صفحة VIP مقابل 100 نقطة فقط. التوثيق يمنحك شارة ذهبية بجانب اسمك ويضع منتجاتك في أولوية البحث.",
      icon: <ShieldCheck className="w-4 h-4 text-blue-500" />
    },
    {
      question: "لماذا تختفي المحادثات بعد 12 ساعة؟",
      answer: "نعتمد نظام 'التدمير الذاتي' للمحادثات لضمان خصوصيتك وسرعة استجابة الموقع. إذا لم تتم الصفقة خلال 12 ساعة، يمكنك بدء محادثة جديدة.",
      icon: <MessageSquare className="w-4 h-4 text-green-500" />
    },
    {
      question: "كيف أجعل منتجي يظهر في 'التريند'؟",
      answer: "المنتجات الأكثر مشاهدة تظهر تلقائياً في قسم التريند. شارك رابط منتجك مع أصدقائك لزيادة المشاهدات وتصدر القائمة.",
      icon: <Flame className="w-4 h-4 text-red-500" />
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#1A2332] p-6 text-right font-cairo" dir="rtl">
      <header className="flex items-center justify-between mb-10">
        <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 rounded-full shadow-sm">
          <ArrowLeft className="w-5 h-5 rotate-180" />
        </button>
        <div className="flex items-center gap-2">
          <span className="font-black uppercase text-lg dark:text-white">Vicks Help</span>
          <VicksLogo className="w-8 h-8" />
        </div>
      </header>

      <main className="max-w-md mx-auto space-y-8">
        <div className="text-center space-y-2">
           <div className="w-20 h-20 bg-orange-100 dark:bg-orange-950/20 rounded-full flex items-center justify-center mx-auto text-orange-500 mb-4">
              <HelpCircle className="w-10 h-10" />
           </div>
           <h1 className="text-2xl font-black dark:text-white">الأسئلة الشائعة</h1>
           <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">كل ما تريد معرفته عن فيكس</p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="bg-white dark:bg-[#252D3D] rounded-3xl border px-4 shadow-sm overflow-hidden">
              <AccordionTrigger className="hover:no-underline py-5">
                <div className="flex items-center gap-3 text-right">
                  {faq.icon}
                  <span className="font-black text-sm dark:text-slate-200">{faq.question}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed pb-5 pr-7">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="p-6 bg-orange-500 rounded-[2.5rem] text-white text-center shadow-xl">
           <p className="font-black text-sm">لم تجد إجابة؟ اسأل VICKS AI في الشات الآن!</p>
        </div>
      </main>
    </div>
  );
}
