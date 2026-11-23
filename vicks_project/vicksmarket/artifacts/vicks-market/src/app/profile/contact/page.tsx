"use client";
import { useRouter } from "next/navigation";
import { ChevronLeft, Phone, Mail, MessageSquare } from "lucide-react";
import { VicksLogo } from "@/components/VicksLogo";
import { cn } from "@/lib/utils";

const CONTACTS = [
  { icon: MessageSquare, label: "واتساب",             sub: "+20 100 000 0000",         color: "bg-green-50 dark:bg-green-950/20 text-green-600" },
  { icon: Mail,          label: "البريد الإلكتروني",  sub: "support@vicksmarket.com",  color: "bg-blue-50 dark:bg-blue-950/20 text-blue-600" },
  { icon: Phone,         label: "الهاتف",             sub: "+20 100 000 0000",         color: "bg-purple-50 dark:bg-purple-950/20 text-purple-600" },
];

export default function ContactPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0f1621] font-cairo" dir="rtl">
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-[#0f1621]/80 backdrop-blur-sm border-b dark:border-slate-800 flex items-center justify-between px-4 py-3">
        <button onClick={() => router.push("/verify")} className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
          <ChevronLeft className="w-4 h-4 text-slate-500" />
        </button>
        <div className="flex items-center gap-2">
          <VicksLogo className="w-7 h-7" />
          <span className="font-black text-sm dark:text-white">اتصل بالمالك</span>
        </div>
        <div className="w-9" />
      </div>

      <div className="max-w-sm mx-auto px-4 py-6 space-y-4">
        {/* Hero */}
        <div className="bg-orange-50 dark:bg-orange-950/20 rounded-3xl p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mx-auto mb-3">
            <Phone className="w-8 h-8 text-orange-500" />
          </div>
          <p className="font-black text-lg dark:text-white">تواصل مع فريق Vicks Market</p>
          <p className="text-sm font-bold text-slate-400 mt-1">نحن هنا لمساعدتك</p>
        </div>

        {/* Channels */}
        <div className="space-y-3">
          {CONTACTS.map(c => (
            <button key={c.label}
              className="w-full flex items-center gap-4 bg-white dark:bg-[#1A2332] rounded-2xl border dark:border-slate-700 p-4 active:scale-[0.98] transition-all shadow-sm">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0", c.color)}>
                <c.icon className="w-5 h-5" />
              </div>
              <div className="text-right">
                <p className="font-black text-sm dark:text-white">{c.label}</p>
                <p className="text-[11px] font-bold text-slate-400 mt-0.5">{c.sub}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Hours */}
        <div className="bg-white dark:bg-[#1A2332] rounded-2xl border dark:border-slate-700 p-4 text-center shadow-sm">
          <p className="text-xs font-bold text-slate-400 mb-1">ساعات العمل</p>
          <p className="font-black text-sm dark:text-white">السبت – الخميس، ٩ص – ١٠م</p>
        </div>
      </div>
    </div>
  );
}
