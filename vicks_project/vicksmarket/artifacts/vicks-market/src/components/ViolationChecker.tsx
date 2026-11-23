"use client";

import React, { useEffect, useState, useRef } from "react";
import { useUser, useDoc } from "@/lib/supabase-hooks";
import { createClient } from "@/utils/supabase/client";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Gavel } from "lucide-react";

export function ViolationChecker() {
  const { user } = useUser();
  const { data: profile } = useDoc("users", user?.uid ?? null);
  const isUpdating = useRef(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (profile && user && !isUpdating.current) {
      const now = Date.now();
      const supabase = createClient();

      // 1. فحص انتهاء الحظر
      if (profile.status === 'suspended' && profile.banExpiresAt) {
        const expires = new Date(profile.banExpiresAt).getTime();
        if (now > expires) {
          isUpdating.current = true;
          supabase.from("users").update({ status: 'active', banExpiresAt: null }).eq('id', user.uid)
            .finally(() => { isUpdating.current = false; });
        }
      }

      // 2. فحص انتهاء التوثيق
      if (profile.isVerified && profile.verificationExpiresAt) {
        const expires = new Date(profile.verificationExpiresAt).getTime();
        if (now > expires) {
          isUpdating.current = true;
          supabase.from("users").update({ isVerified: false, verificationExpiresAt: null, verificationType: null }).eq('id', user.uid)
            .finally(() => { isUpdating.current = false; });
        }
      }

      if (profile.warningMessage) {
        setShowModal(true);
      }
    }
  }, [profile, user]);

  const handleClose = async () => {
    if (user) {
      const supabase = createClient();
      await supabase.from("users").update({ warningMessage: null }).eq('id', user.uid);
    }
    setShowModal(false);
  };

  if (!profile) return null;

  return (
    <Dialog open={showModal} onOpenChange={() => {}}>
      <DialogContent className="rounded-[2.5rem] p-8 border-4 border-orange-500 text-right font-cairo" dir="rtl">
        <DialogHeader className="flex flex-col items-center gap-4">
           <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 shadow-inner">
             <AlertTriangle className="w-10 h-10" />
           </div>
           <DialogTitle className="text-2xl font-black text-orange-600">تنبيه إداري رسمي</DialogTitle>
           <DialogDescription className="text-slate-600 font-bold text-center leading-relaxed">
             {profile.warningMessage || "يرجى الالتزام بسياسات فيكس ماركت لضمان استمرار حسابك."}
           </DialogDescription>
        </DialogHeader>

        <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-3xl border-2 border-dashed border-orange-100 mt-4">
           <p className="text-[10px] font-black text-orange-500 uppercase flex items-center gap-2">
             <Gavel className="w-3 h-3" /> ملاحظة الإدارة
           </p>
           <p className="text-xs font-bold mt-1">المخالفة المسجلة: {profile.warningMessage}</p>
        </div>

        <DialogFooter className="mt-6">
          <Button onClick={handleClose} className="w-full h-14 bg-orange-500 hover:bg-orange-600 rounded-2xl font-black text-white shadow-lg">
            فهمت، سألتزم بالقوانين
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
