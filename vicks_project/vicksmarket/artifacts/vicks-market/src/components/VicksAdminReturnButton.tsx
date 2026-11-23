"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Crown, ArrowRight } from "lucide-react";
import { useUser, useDoc } from "@/lib/supabase-hooks";
import { Button } from "@/components/ui/button";

export function VicksAdminReturnButton() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUser();
  const [tempRole, setTempRole] = useState<string | null>(null);

  const { data: profile } = useDoc("users", user?.uid ?? null);

  useEffect(() => {
    const role = localStorage.getItem('vicks_temp_role');
    setTempRole(role);
  }, [pathname]);

  const isOwner = profile?.unique_id === "1000000000";

  const handleReturn = () => {
    localStorage.removeItem('vicks_temp_role');
    router.push('/merchant');
    setTimeout(() => window.location.reload(), 100);
  };

  if (!isOwner || !tempRole) return null;

  return (
    <div className="fixed bottom-24 left-6 z-[100] animate-in slide-in-from-left-10 duration-500">
      <Button 
        onClick={handleReturn}
        className="h-14 px-6 rounded-full bg-slate-900 border-2 border-orange-500 text-white shadow-2xl hover:scale-110 transition-all group flex items-center gap-3"
      >
        <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white shadow-lg">
           <Crown className="w-4 h-4" />
        </div>
        <div className="flex flex-col items-start leading-none">
           <span className="text-[10px] font-black uppercase tracking-tight">العودة للمالك</span>
           <span className="text-[8px] font-bold text-orange-500">إنهاء وضع الـ {tempRole === 'merchant' ? 'تاجر' : 'زبون'}</span>
        </div>
        <ArrowRight className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
      </Button>
    </div>
  );
}
