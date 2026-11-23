"use client";

import React, { useMemo, useState } from "react";
import { X, Star, Send, User, MessageCircle, Heart, CornerUpLeft, Sparkles, Loader2 } from "lucide-react";
import { useUser } from "@/lib/supabase-hooks";
import { useRealtimeCollection } from "@/lib/supabase-hooks";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface CommentDoc {
  id: string;
  userId: string;
  userName: string;
  text: string;
  rating: number;
  likes?: number;
  likedBy?: string[];
  createdAt?: any;
}

const FAKE_COMMENTS = [
  { id: "f1", userId: "fake1", userName: "مريم عبد الله", text: "المنتج جميل جداً والتوصيل كان سريع، شكراً فيكس ماركت!", rating: 5, likes: 12, likedBy: [] },
  { id: "f2", userId: "fake2", userName: "أحمد سامي", text: "الجودة ممتازة بس السعر شوية غالي عن المتاجر التانية.", rating: 4, likes: 5, likedBy: [] },
  { id: "f3", userId: "fake3", userName: "نور حسن", text: "استلمت المنتج النهاردة، مطابق تماماً للصورة 👌", rating: 5, likes: 8, likedBy: [] },
  { id: "f4", userId: "fake4", userName: "كريم عادل", text: "ياريت يكون فيه ألوان تانية متاحة، عدا كده تجربة حلوة.", rating: 4, likes: 3, likedBy: [] },
];

function CommentReplies({ productId, commentId }: { productId: string; commentId: string }) {
  const { user } = useUser();
  const { toast } = useToast();
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const { data: replies } = useRealtimeCollection(
    "comments",
    [{ column: "productId", value: productId }, { column: "parentId", value: commentId }],
    { orderBy: "createdAt", orderAsc: true, pollMs: 10000 }
  );

  const sendReply = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      const supabase = createClient();
      const uid = user?.uid || `guest-${Date.now()}`;
      const name = user?.email?.split("@")[0] || "زائر " + Math.floor(1000 + Math.random() * 9000);
      await supabase.from("comments").insert({
        productId,
        parentId: commentId,
        userId: uid,
        userName: name,
        text: replyText.trim(),
        rating: 0,
        createdAt: new Date().toISOString(),
      });
      setReplyText("");
      setShowForm(false);
    } catch (e: any) {
      toast({ variant: "destructive", title: "تعذر إرسال الرد", description: e.message });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mt-2 pr-4 border-r-2 border-orange-100 dark:border-orange-900/30 space-y-2">
      {(replies as any[])?.map((r: any) => (
        <div key={r.id} className="flex items-start gap-2 animate-in slide-in-from-right-2 duration-200">
          <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
            <User className="w-3 h-3 text-blue-500" />
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-2xl rounded-tr-none px-3 py-2 text-[10px]">
            <p className="font-black text-blue-700 dark:text-blue-300">{r.userName}</p>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mt-0.5">{r.text}</p>
          </div>
        </div>
      ))}

      {!showForm ? (
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 text-[9px] font-black text-blue-500 hover:text-blue-700 transition-colors">
          <CornerUpLeft className="w-3 h-3" /> رد على هذا التعليق
        </button>
      ) : (
        <div className="flex gap-1.5 items-center mt-1 animate-in slide-in-from-bottom-2 duration-200">
          <input value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="ردك هنا..."
            className="flex-1 h-8 text-[10px] px-3 rounded-full bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 outline-none font-bold text-right"
            onKeyDown={e => e.key === 'Enter' && sendReply()} />
          <button onClick={sendReply} disabled={sending} className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white flex-shrink-0 disabled:opacity-50">
            {sending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3 -rotate-45" />}
          </button>
          <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}

interface Props {
  open: boolean;
  onClose: () => void;
  productId: string;
}

export function CommentsSheet({ open, onClose, productId }: Props) {
  const { user } = useUser();
  const { toast } = useToast();
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [sending, setSending] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<string[]>([]);

  // op:'is' maps to PostgREST `.is()` which handles IS NULL correctly
  const { data: dbComments, loading } = useRealtimeCollection(
    open ? "comments" : null,
    [{ column: "productId", value: productId }, { column: "parentId", op: "is" as const, value: null }],
    { orderBy: "createdAt", orderAsc: false, pollMs: 8000 }
  );

  const comments = useMemo(() => {
    if (dbComments && (dbComments as any[]).length > 0) return dbComments as CommentDoc[];
    return FAKE_COMMENTS;
  }, [dbComments]);

  const handleLike = async (comment: CommentDoc) => {
    if (!user) { toast({ variant: "destructive", title: "سجل دخولك لتقييم التعليقات" }); return; }
    const supabase = createClient();
    const liked = (comment.likedBy || []).includes(user.uid);
    const newLikedBy = liked ? (comment.likedBy || []).filter((id: string) => id !== user.uid) : [...(comment.likedBy || []), user.uid];
    await supabase.from("comments").update({ likedBy: newLikedBy, likes: newLikedBy.length }).eq('id', comment.id);
  };

  const sendComment = async () => {
    if (!newComment.trim()) { toast({ variant: "destructive", title: "لازم تكتب تعليق أولاً" }); return; }
    setSending(true);
    try {
      const supabase = createClient();
      const uid = user?.uid || `guest-${Date.now()}`;
      const name = user?.email?.split("@")[0] || "زائر " + Math.floor(1000 + Math.random() * 9000);
      await supabase.from("comments").insert({
        productId,
        parentId: null,
        userId: uid,
        userName: name,
        text: newComment.trim(),
        rating,
        likes: 0,
        likedBy: [],
        createdAt: new Date().toISOString(),
      });
      setNewComment("");
      setRating(5);
      toast({ title: "تم نشر تعليقك! 🎉" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "فشل النشر", description: e.message });
    } finally {
      setSending(false);
    }
  };

  const toggleReplies = (commentId: string) => {
    setExpandedReplies(prev =>
      prev.includes(commentId) ? prev.filter(id => id !== commentId) : [...prev, commentId]
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex flex-col" dir="rtl">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative mt-auto bg-white dark:bg-[#1A2332] rounded-t-[3rem] max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-full duration-400 ease-out">
        {/* Handle */}
        <div className="flex justify-center pt-4 pb-2 flex-shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-4 flex-shrink-0">
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <X className="w-4 h-4 text-slate-500" />
          </button>
          <h2 className="font-black text-lg dark:text-white flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-orange-500" /> آراء المشترين
          </h2>
          <span className="text-[10px] font-black text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
            {comments.length}
          </span>
        </div>

        {/* Comment form */}
        <div className="mx-4 mb-4 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] p-4 space-y-3 flex-shrink-0">
          <div className="flex items-center gap-1">
            {[1,2,3,4,5].map(s => (
              <button key={s} onClick={() => setRating(s)} onMouseEnter={() => setHoverRating(s)} onMouseLeave={() => setHoverRating(0)}>
                <Star className={cn("w-6 h-6 transition-all", (hoverRating || rating) >= s ? "text-yellow-400 fill-yellow-400 scale-110" : "text-slate-200")} />
              </button>
            ))}
            <span className="text-[10px] font-black text-slate-400 mr-auto">تقييمك للمنتج</span>
          </div>
          <div className="flex gap-2">
            <input value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="شاركنا رأيك بصدق..."
              className="flex-1 h-11 bg-white dark:bg-slate-900 rounded-full px-5 text-[12px] font-bold border-2 border-transparent focus:border-orange-300 outline-none dark:text-white text-right"
              onKeyDown={e => e.key === 'Enter' && sendComment()} />
            <button onClick={sendComment} disabled={sending || !newComment.trim()}
              className="w-11 h-11 rounded-full bg-orange-500 flex items-center justify-center text-white shadow-lg disabled:opacity-40 transition-all active:scale-90">
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 -rotate-45" />}
            </button>
          </div>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-4">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-orange-500" /></div>
          ) : comments.map((c: CommentDoc) => (
            <div key={c.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-orange-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="font-black text-xs dark:text-white truncate">{c.userName}</p>
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={cn("w-2.5 h-2.5", c.rating >= s ? "text-yellow-400 fill-yellow-400" : "text-slate-200")} />
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300 leading-relaxed">{c.text}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <button onClick={() => handleLike(c)} className={cn("flex items-center gap-1 text-[9px] font-black transition-all", c.likedBy?.includes(user?.uid ?? '') ? "text-red-500" : "text-slate-400 hover:text-red-400")}>
                      <Heart className={cn("w-3 h-3", c.likedBy?.includes(user?.uid ?? '') && "fill-current")} />
                      {c.likes || 0}
                    </button>
                    <button onClick={() => toggleReplies(c.id)} className="flex items-center gap-1 text-[9px] font-black text-blue-500 hover:text-blue-700 transition-colors">
                      <CornerUpLeft className="w-3 h-3" />
                      {expandedReplies.includes(c.id) ? "إخفاء الردود" : "الردود"}
                    </button>
                  </div>
                  {expandedReplies.includes(c.id) && (
                    <CommentReplies productId={productId} commentId={c.id} />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
