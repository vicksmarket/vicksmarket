"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, Loader2, Camera, Sparkles, Bot, User, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { VicksLogo } from "@/components/VicksLogo";
import { generalChat } from "@/ai/flows/general-chat";
import { VisualSearchDialog } from "@/components/VicksVisualSearch";
import { cn } from "@/lib/utils";
import { useUser } from "@/lib/supabase-hooks";

const ADMIN_EMAILS = ["mom1113694362@gmail.com", "vicksmarket@gmail.com", "mom01113694362@icloud.com"];

export default function AIChatPage() {
  const router = useRouter();
  const { user } = useUser();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email);
  const welcomeMsg = isAdmin
    ? "أهلاً بك يا مدير في مركز قيادة VICKS AI. أنا رهن إشارتك، تحب نراجع إيه النهاردة؟"
    : "أهلاً بك في VICKS AI! أنا مساعدك الشخصي، أقدر أبحثلك عن أي منتج أو أقولك السعر ده لقطة ولا لأ. تأمرني بإيه يا ملك؟";

  const [messages, setMessages] = useState([{ role: "model" as const, text: welcomeMsg }]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const handleSend = async () => {
    if (!message.trim() || loading) return;
    const userMessage = message.trim();
    const newMessages = [...messages, { role: "user" as const, text: userMessage }];
    setMessages(newMessages);
    setMessage("");
    setLoading(true);
    try {
      const history = messages.map(m => ({ role: m.role === "model" ? "model" as const : "user" as const, text: m.text }));
      const result = await generalChat({ message: userMessage, userEmail: user?.email || undefined, history });
      setMessages(prev => [...prev, { role: "model", text: result.response }]);
    } catch {
      setMessages(prev => [...prev, { role: "model", text: "يا غالي حصلت مشكلة في الشبكة، جرب تاني كدا." }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-[#1A2332] text-right font-cairo" dir="rtl">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b dark:border-slate-800 bg-white dark:bg-[#1A2332] sticky top-0 z-10">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
          <ArrowLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
        </button>
        <div className="flex-1 flex items-center justify-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-sm dark:text-white uppercase tracking-widest">VICKS AI</span>
        </div>
        <VicksLogo className="w-8 h-8 opacity-60" />
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={cn("flex gap-2", m.role === "user" ? "justify-start flex-row-reverse" : "justify-start")}>
            <div className={cn("w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
              m.role === "user" ? "bg-orange-500" : "bg-gradient-to-br from-orange-400 to-orange-600")}>
              {m.role === "user" ? <User className="w-3.5 h-3.5 text-white" /> : <Bot className="w-3.5 h-3.5 text-white" />}
            </div>
            <div className={cn("max-w-[80%] px-4 py-3 rounded-[1.5rem] text-xs font-bold leading-relaxed",
              m.role === "user"
                ? "bg-orange-500 text-white rounded-tr-none"
                : "bg-slate-50 dark:bg-slate-800 dark:text-white rounded-tl-none border border-slate-100 dark:border-slate-700")}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2 items-start">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0 mt-1">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 px-4 py-3 rounded-[1.5rem] rounded-tl-none">
              <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <footer className="px-3 py-3 border-t dark:border-slate-800 bg-white dark:bg-[#1A2332]">
        <div className="flex gap-2">
          <div className="flex gap-1">
            <VisualSearchDialog mode="upload">
              <button className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-blue-500"><Plus className="w-4 h-4" /></button>
            </VisualSearchDialog>
            <VisualSearchDialog mode="camera">
              <button className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-orange-500"><Camera className="w-4 h-4" /></button>
            </VisualSearchDialog>
          </div>
          <Input
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyPress={e => e.key === "Enter" && handleSend()}
            placeholder="اسأل عن أي منتج..."
            className="flex-1 h-11 rounded-full border-2 border-slate-100 dark:border-slate-700 pr-4 font-bold dark:bg-slate-900"
          />
          <Button onClick={handleSend} disabled={!message.trim() || loading}
            className="w-11 h-11 rounded-full bg-orange-500 p-0 flex-shrink-0">
            <Send className="w-4 h-4 -rotate-45" />
          </Button>
        </div>
      </footer>
    </div>
  );
}
