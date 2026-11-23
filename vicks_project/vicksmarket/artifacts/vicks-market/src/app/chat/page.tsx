"use client";

import React, { useMemo, useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight, User, MessageSquare, Send, Loader2
} from "lucide-react";
import { useUser, useDoc } from "@/lib/supabase-hooks";
import { useRealtimeCollection } from "@/lib/supabase-hooks";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { MOCK_MERCHANTS } from "@/app/lib/mock-data";

function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetId = searchParams.get("id");

  const { user, loading: userLoading } = useUser();
  const { toast } = useToast();

  const [activeConv, setActiveConv] = useState<any>(null);
  const [msgText, setMsgText] = useState("");
  const [convReady, setConvReady] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Require authentication for chat
  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/login");
    }
  }, [user, userLoading, router]);

  const senderId = user?.uid ?? "";

  const mockMerchant = useMemo(() => MOCK_MERCHANTS.find(m => m.uid === targetId), [targetId]);
  const { data: dbMerchant } = useDoc(targetId && !targetId.startsWith("mock-") ? "users" : null, targetId && !targetId.startsWith("mock-") ? targetId : null);
  const merchant = mockMerchant || dbMerchant;

  // Load conversations for authenticated user
  const { data: convs, loading: convsLoading } = useRealtimeCollection(
    senderId ? "conversations" : null,
    [{ column: "participants", op: "contains", value: senderId }],
    { orderBy: "updatedAt", pollMs: 5000 }
  );

  // Auto-open or create conversation when targetId is set
  useEffect(() => {
    if (!targetId || !senderId || convsLoading) return;
    const existing = (convs as any[])?.find((c: any) => c.participants?.includes(targetId));
    if (existing) {
      setActiveConv(existing);
      setConvReady(true);
      return;
    }
    const convId = [senderId, targetId].sort().join("_");
    const newConv = {
      id: convId,
      participants: [senderId, targetId],
      merchantId: targetId,
      customerId: senderId,
      customerLabel: user?.email || "مستخدم",
      isGuest: false,
      lastMessage: "",
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    const supabase = createClient();
    supabase.from("conversations").upsert(newConv).then(({ error }) => {
      if (error) {
        console.warn("[chat] failed to create conversation:", error.message);
        toast({ variant: "destructive", title: "فشل فتح المحادثة", description: "تأكد من تسجيل دخولك." });
        return;
      }
      setActiveConv(newConv);
      setConvReady(true);
    });
  }, [targetId, senderId, convs, convsLoading, user, toast]);

  const { data: messages } = useRealtimeCollection(
    activeConv?.id ? "messages" : null,
    [{ column: "conversationId", value: activeConv?.id ?? "" }],
    { orderBy: "createdAt", orderAsc: true, pollMs: 2000 }
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!msgText.trim() || !activeConv?.id || !senderId) return;
    const supabase = createClient();
    const msgData = {
      conversationId: activeConv.id,
      text: msgText,
      senderId,
      senderEmail: user?.email || null,
      createdAt: new Date().toISOString(),
    };
    const { error: insertError } = await supabase.from("messages").insert(msgData);
    if (insertError) {
      toast({ variant: "destructive", title: "فشل إرسال الرسالة", description: "تأكد من اتصالك وحاول مجدداً." });
      return;
    }
    const { error: updateError } = await supabase.from("conversations")
      .update({ lastMessage: msgText, updatedAt: new Date().toISOString() })
      .eq("id", activeConv.id);
    if (updateError) {
      console.warn("[chat] failed to update conversation:", updateError.message);
    }
    setMsgText("");
  };

  if (userLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-orange-500" /></div>;
  if (!user) return null; // redirect handled in useEffect

  return (
    <div className="flex flex-col h-screen bg-[#F8F9FA] dark:bg-[#1A2332] font-cairo text-right" dir="rtl">
      {/* Header */}
      <header className="p-4 bg-white dark:bg-[#1A2332] border-b shadow-sm flex items-center gap-3 sticky top-0 z-50">
        <button onClick={() => router.back()} className="w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center flex-shrink-0">
          <ArrowRight className="w-4 h-4" />
        </button>
        {merchant ? (
          <div className="flex items-center gap-2 flex-1">
            <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
              {(merchant as any).photoURL
                ? <img src={(merchant as any).photoURL} alt="" className="w-full h-full object-cover" />
                : <User className="w-5 h-5 m-2 text-slate-400" />}
            </div>
            <div>
              <p className="text-sm font-black dark:text-white">{(merchant as any).shopName || merchant.fullName}</p>
              <p className="text-[9px] text-green-500 font-bold">{(merchant as any).isOnline ? "متاح الآن" : "غير متاح"}</p>
            </div>
          </div>
        ) : (
          <span className="font-black text-sm dark:text-white flex-1">المحادثات</span>
        )}
      </header>

      <main className="flex-1 overflow-hidden">
        {!activeConv ? (
          /* Conversations list */
          <div className="p-4 space-y-3">
            {convsLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-orange-500" /></div>
            ) : (convs as any[])?.length === 0 ? (
              <div className="text-center py-20">
                <MessageSquare className="w-12 h-12 mx-auto text-slate-200 mb-3" />
                <p className="font-black text-slate-400">لا توجد محادثات بعد</p>
              </div>
            ) : (convs as any[])?.map((conv: any) => (
              <div key={conv.id} onClick={() => setActiveConv(conv)}
                className="bg-white dark:bg-[#252D3D] rounded-2xl p-4 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow border dark:border-slate-800">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm dark:text-white truncate">{conv.customerLabel || conv.merchantId}</p>
                  <p className="text-[10px] text-slate-400 font-bold truncate">{conv.lastMessage || "محادثة جديدة"}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Active conversation */
          <div className="flex flex-col h-full">
            <ScrollArea className="flex-1 p-3">
              <div className="flex flex-col gap-3">
                {(messages as any[])?.map((m: any) => (
                  <div key={m.id} className={cn("flex", m.senderId === senderId ? "justify-start" : "justify-end")}>
                    <div className={cn(
                      "max-w-[80%] p-3 rounded-2xl shadow-sm",
                      m.senderId === senderId
                        ? "bg-orange-500 text-white rounded-tr-none"
                        : "bg-white dark:bg-slate-800 dark:text-white rounded-tl-none border border-slate-100 dark:border-slate-700"
                    )}>
                      <p className="text-xs leading-relaxed">{m.text}</p>
                      <div className="mt-1 flex items-center gap-1 opacity-50 justify-end">
                        <span className="text-[7px] font-black">
                          {m.createdAt
                            ? new Date(m.createdAt).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })
                            : "..."}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            <footer className="p-3 bg-white dark:bg-[#1A2332] border-t dark:border-slate-800">
              <div className="flex gap-2">
                <Input value={msgText} onChange={e => setMsgText(e.target.value)} placeholder="اكتب رسالتك..."
                  className="rounded-full h-11 pr-4 font-bold border-2 border-slate-100 dark:border-slate-700 flex-1"
                  onKeyPress={e => e.key === "Enter" && handleSend()} />
                <Button onClick={handleSend} disabled={!msgText.trim()}
                  className="w-11 h-11 rounded-full bg-orange-500 p-0 text-white shadow-lg active:scale-90 transition-transform flex-shrink-0">
                  <Send className="w-4 h-4 -rotate-45" />
                </Button>
              </div>
            </footer>
          </div>
        )}
      </main>
    </div>
  );
}

export default function ChatPage() {
  return (
    <div className="flex flex-col h-screen bg-[#F8F9FA] dark:bg-[#1A2332] font-cairo" dir="rtl">
      <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin text-orange-500" /></div>}>
        <ChatContent />
      </Suspense>
    </div>
  );
}
