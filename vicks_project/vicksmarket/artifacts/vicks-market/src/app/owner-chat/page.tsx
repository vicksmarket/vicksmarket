"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, Loader2, ShieldCheck, Clock } from "lucide-react";
import { useUser } from "@/lib/supabase-hooks";
import { useRealtimeCollection } from "@/lib/supabase-hooks";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const ADMIN_EMAILS = ["vicksmarket@gmail.com", "mom1113694362@gmail.com"];

export default function OwnerChatPage() {
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();
  const [msgText, setMsgText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase());

  const { data: messages, loading } = useRealtimeCollection(
    user ? "owner_chat_messages" : null,
    [{ column: "threadId", value: user?.uid ?? "" }],
    { orderBy: "createdAt", orderAsc: true, pollMs: 3000 }
  );

  const canSendMessage = (() => {
    if (!messages || messages.length === 0) return true;
    const lastMsg = (messages as any[])[messages.length - 1];
    return lastMsg.senderId !== user?.uid;
  })();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!msgText.trim() || !user || (!canSendMessage && !isAdmin) || isSending) return;

    setIsSending(true);
    try {
      const supabase = createClient();
      await supabase.from("owner_chat_messages").insert({
        threadId: user.uid,
        text: msgText,
        senderId: user.uid,
        senderEmail: user.email,
        createdAt: new Date().toISOString(),
      });

      // Upsert the thread metadata
      await supabase.from("owner_chats").upsert({
        id: user.uid,
        lastMessage: msgText,
        updatedAt: new Date().toISOString(),
        unreadByAdmin: true,
        userEmail: user.email,
        userId: user.uid,
      });

      setMsgText("");
      toast({ title: "تم الإرسال بنجاح", description: "بانتظار رد الإدارة الآن." });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل إرسال الرسالة." });
    } finally {
      setIsSending(false);
    }
  };

  if (!user) return <div className="p-10 text-center font-bold">يرجى تسجيل الدخول أولاً</div>;

  return (
    <div className="flex flex-col h-screen bg-[#F8F9FA] dark:bg-[#1A2332] font-cairo text-right" dir="rtl">
      <header className="p-4 bg-white dark:bg-[#1A2332] border-b shadow-sm flex items-center justify-between sticky top-0 z-50">
        <button onClick={() => router.back()} className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 rotate-180" />
        </button>
        <div className="flex items-center gap-2">
           <div className="flex flex-col items-end">
              <span className="text-sm font-black dark:text-white">تواصل مع الإدارة</span>
              <span className="text-[9px] text-orange-500 font-bold">نظام الرد المباشر</span>
           </div>
           <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center border-2 border-orange-500">
              <ShieldCheck className="w-5 h-5 text-orange-500" />
           </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <ScrollArea className="h-full p-4">
          <div className="flex flex-col gap-4">
            <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-3xl border border-dashed border-orange-200 text-center">
               <p className="text-[10px] font-bold text-orange-600">يمكنك إرسال رسالة واحدة فقط، وبمجرد رد الإدارة ستتمكن من الرد مجدداً لضمان الجدية.</p>
            </div>

            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-orange-500" /></div>
            ) : (messages as any[])?.map((m: any) => (
              <div key={m.id} className={cn("flex", m.senderId === user.uid ? "justify-start" : "justify-end")}>
                <div className={cn(
                  "max-w-[85%] p-4 rounded-2xl shadow-sm",
                  m.senderId === user.uid 
                    ? "bg-slate-900 text-white rounded-tr-none" 
                    : "bg-white dark:bg-slate-800 dark:text-white rounded-tl-none border"
                )}>
                  <p className="text-xs font-bold">{m.text}</p>
                  <div className="mt-1 flex items-center gap-1 opacity-50">
                     <Clock className="w-2 h-2" />
                     <span className="text-[8px]">
                       {m.createdAt ? new Date(m.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : "جاري الإرسال..."}
                     </span>
                  </div>
                </div>
              </div>
            ))}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
      </main>

      <footer className="p-4 bg-white dark:bg-[#1A2332] border-t sticky bottom-0">
        {!canSendMessage && !isAdmin && (
          <div className="mb-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border flex items-center justify-center gap-2">
             <Loader2 className="w-3 h-3 animate-spin text-orange-500" />
             <span className="text-[10px] font-black text-slate-500">بانتظار رد الإدارة لتتمكن من الكتابة مجدداً...</span>
          </div>
        )}
        <div className="flex gap-2">
          <Input 
            value={msgText}
            onChange={(e) => setMsgText(e.target.value)}
            disabled={(!canSendMessage && !isAdmin) || isSending}
            placeholder={canSendMessage || isAdmin ? "اكتب رسالتك للإدارة..." : "لا يمكنك الإرسال حالياً"}
            className="rounded-full h-12 pr-5 font-bold border-2 border-slate-100 focus:border-orange-500 transition-all"
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button 
            onClick={handleSend}
            disabled={!msgText.trim() || (!canSendMessage && !isAdmin) || isSending}
            className="w-12 h-12 rounded-full bg-orange-500 p-0 text-white shadow-lg active:scale-95 transition-transform"
          >
            {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 -rotate-45" />}
          </Button>
        </div>
      </footer>
    </div>
  );
}
