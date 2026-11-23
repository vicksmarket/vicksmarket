"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, Send, User } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const RATE_LIMIT_MS = 3000; // 3 seconds between messages

export default function GroupChatPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [nickname, setNickname] = useState("");
  const [nickSet, setNickSet] = useState(false);
  const [sending, setSending] = useState(false);
  const [lastSent, setLastSent] = useState(0);
  const [groupName, setGroupName] = useState("مجموعة Vicks Market");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load nickname from localStorage
  useEffect(() => {
    const sb = createClient();
    const saved = localStorage.getItem("vicks_group_nickname");
    if (saved) { setNickname(saved); setNickSet(true); }
    else {
      sb.auth.getUser().then(({ data: { user } }) => {
        if (user?.email) { setNickname(user.email.split("@")[0]); setNickSet(true); localStorage.setItem("vicks_group_nickname", user.email.split("@")[0]); }
      });
    }
    // fetch group name
    sb.from("groups").select("name").eq("id", id).maybeSingle().then(({ data }) => { if (data?.name) setGroupName(data.name); });
  }, [id]);

  // Polling for messages every 3 seconds
  const fetchMessages = async () => {
    const sb = createClient();
    const { data } = await sb.from("group_messages").select("*").eq("group_id", id).order("created_at", { ascending: true }).limit(100);
    if (data) setMessages(data);
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleNickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;
    localStorage.setItem("vicks_group_nickname", nickname.trim());
    setNickname(nickname.trim());
    setNickSet(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    const now = Date.now();
    if (now - lastSent < RATE_LIMIT_MS) return;
    setSending(true);
    setLastSent(now);
    const sb = createClient();
    await sb.from("group_messages").insert({ group_id: id, sender_name: nickname, message: text.trim() });
    setText("");
    await fetchMessages();
    setSending(false);
  };

  // Nickname setup screen
  if (!nickSet) return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#1A2332] flex items-center justify-center p-6 font-cairo" dir="rtl">
      <div className="w-full max-w-sm bg-white dark:bg-[#252D3D] rounded-3xl p-6 shadow-lg space-y-4 border border-slate-100 dark:border-slate-800">
        <div className="text-center">
          <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
            <User className="w-8 h-8 text-orange-500" />
          </div>
          <h2 className="font-black text-lg dark:text-white">اختر اسمك في المجموعة</h2>
          <p className="text-xs text-slate-400 font-bold mt-1">يمكنك الدخول بدون تسجيل</p>
        </div>
        <form onSubmit={handleNickSubmit} className="space-y-3">
          <input autoFocus value={nickname} onChange={e => setNickname(e.target.value)} maxLength={30}
            placeholder="اسمك في الشات..."
            className="w-full h-12 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 font-bold text-sm dark:text-white focus:outline-none focus:border-orange-400" />
          <button type="submit" disabled={!nickname.trim()}
            className="w-full h-12 bg-orange-500 text-white font-black rounded-2xl disabled:opacity-50 active:scale-95 transition-transform">
            دخول المجموعة
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-[#F8F9FA] dark:bg-[#1A2332] font-cairo" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-[#252D3D] border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
        <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800">
          <ArrowRight className="w-4 h-4 text-slate-500" />
        </button>
        <div className="flex-1">
          <h1 className="font-black text-sm dark:text-white">{groupName}</h1>
          <p className="text-[10px] text-slate-400 font-bold">مفتوح للجميع</p>
        </div>
        <button onClick={() => { setNickSet(false); }} className="text-[10px] font-black text-orange-500 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-lg">
          {nickname}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 no-scrollbar">
        {messages.length === 0 && (
          <div className="text-center text-slate-400 text-xs font-bold mt-20">لا توجد رسائل بعد — كن أول من يكتب!</div>
        )}
        {messages.map(m => {
          const isMe = m.sender_name === nickname;
          return (
            <div key={m.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
              {!isMe && <span className="text-[9px] font-black text-slate-400 mb-0.5 px-1">{m.sender_name}</span>}
              <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm font-bold break-words
                ${isMe ? "bg-orange-500 text-white rounded-tr-sm" : "bg-white dark:bg-[#252D3D] text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-700 rounded-tl-sm shadow-sm"}`}>
                {m.message}
              </div>
              <span className="text-[8px] text-slate-300 px-1 mt-0.5">
                {new Date(m.created_at).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex items-center gap-2 px-3 py-3 bg-white dark:bg-[#252D3D] border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
        <input ref={inputRef} value={text} onChange={e => setText(e.target.value)} maxLength={500}
          placeholder="اكتب رسالة..."
          className="flex-1 h-11 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 text-sm font-bold dark:text-white focus:outline-none focus:border-orange-400" />
        <button type="submit" disabled={!text.trim() || sending}
          className="w-11 h-11 bg-orange-500 rounded-2xl flex items-center justify-center text-white disabled:opacity-40 active:scale-90 transition-transform flex-shrink-0">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
