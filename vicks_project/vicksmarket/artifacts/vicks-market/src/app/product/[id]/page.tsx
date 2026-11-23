"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { 
  ArrowRight, Share2, Heart, Phone, Star, User, BadgeCheck, Loader2, 
  Send, MapPin, Eye, ShieldCheck, Zap, Sparkles, Video, MessageCircle
} from "lucide-react";
import { useUser, useDoc } from "@/lib/supabase-hooks";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { VicksCompareDialog } from "@/components/VicksCompareDialog";
import { CommentsSheet } from "@/components/CommentsSheet";
import { cn } from "@/lib/utils";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [isFavorite, setIsFavorite] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [commentsOpen, setCommentsOpen] = useState(false);

  const productId = params.id as string;
  const { data: product, loading: productLoading } = useDoc("products", productId);
  const { data: profile } = useDoc("users", user?.uid ?? null);

  const isBanned = profile?.status === 'banned' || profile?.status === 'suspended';
  const isVerified = user?.emailVerified;

  useEffect(() => {
    if (productId) {
      const supabase = createClient();
      supabase.from("products").select("views").eq("id", productId).maybeSingle().then(({ data }) => {
        if (data) {
          supabase.from("products").update({ views: (data.views || 0) + 1 }).eq("id", productId);
        }
      });
    }
  }, [productId]);

  useEffect(() => {
    if (profile && productId) {
      setIsFavorite((profile.likedProducts || []).includes(productId));
    }
  }, [profile, productId]);

  const toggleFavorite = async () => {
    if (!user) { router.push("/login"); return; }
    if (!isVerified) {
      toast({ variant: "destructive", title: "بريد غير مفعل", description: "يجب تفعيل بريدك لتتمكن من إضافة المنتجات للمفضلة." });
      return;
    }
    if (isBanned) {
      toast({ variant: "destructive", title: "خطأ في الاتصال", description: "عذراً، حدث خطأ في الخادم، يرجى المحاولة لاحقاً." });
      return;
    }
    const supabase = createClient();
    const currentLiked: string[] = profile?.likedProducts || [];
    let newLiked: string[];
    if (isFavorite) {
      newLiked = currentLiked.filter((id: string) => id !== productId);
      toast({ title: "تمت الإزالة من المفضلة" });
    } else {
      newLiked = [...currentLiked, productId];
      toast({ title: "تمت الإضافة للمفضلة" });
    }
    setIsFavorite(!isFavorite);
    await supabase.from("users").update({ likedProducts: newLiked }).eq("id", user.uid);
  };

  const handleRate = async (stars: number) => {
    if (!user) { router.push("/login"); return; }
    if (!isVerified) {
      toast({ variant: "destructive", title: "بريد غير مفعل", description: "فعل بريدك لتقييم المنتجات." });
      return;
    }
    setUserRating(stars);
    toast({ title: "شكراً لتقييمك!", description: `لقد منحت هذا المنتج ${stars} نجوم.` });
  };

  const handleGuaranteedBuy = () => {
    if (!user) { router.push('/login'); return; }
    if (!isVerified) {
      toast({ variant: "destructive", title: "بريد غير مفعل", description: "برجاء تفعيل بريدك لإتمام عمليات الشراء بضمان." });
      return;
    }
    if (isBanned) {
      toast({ variant: "destructive", title: "خطأ في السيرفر", description: "عذراً، حدث خطأ في الخادم، يرجى المحاولة لاحقاً." });
      return;
    }
    toast({ 
      title: "نظام ضمان فيكس النشط", 
      description: "سيتم تعليق النقاط في حساب وسيط حتى تأكيد الاستلام من طرفك لضمان حقك كاملاً." 
    });
  };

  const handleContact = () => {
    if (!user) { router.push('/login'); return; }
    if (!isVerified) {
      toast({ variant: "destructive", title: "بريد غير مفعل", description: "يجب تفعيل بريدك للتواصل مع التاجر." });
      return;
    }
    if (product?.phone) {
      window.open(`https://wa.me/${product.phone}`, '_blank');
    }
  };

  if (productLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-orange-500 w-10 h-10" /></div>;
  if (!product) return <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center gap-4"><h1 className="text-xl font-black">المنتج غير موجود</h1><Button onClick={() => router.push('/')} className="bg-orange-500">العودة للرئيسية</Button></div>;

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#1A2332] font-cairo pb-24" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#1A2332]/90 backdrop-blur-md border-b dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <button onClick={() => router.back()} className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center">
          <ArrowRight className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </button>
        <span className="font-black text-sm dark:text-white">تفاصيل المنتج</span>
        <button onClick={() => navigator.share?.({ title: product.name, url: window.location.href })} className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center">
          <Share2 className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </button>
      </header>

      <div className="max-w-md mx-auto">
        {/* Product Image */}
        <div className="relative w-full aspect-square bg-slate-100 dark:bg-slate-800">
          <img src={product.image || `https://picsum.photos/seed/${productId}/600/600`} alt={product.name} className="w-full h-full object-cover" />
          <button onClick={toggleFavorite} className={cn("absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all", isFavorite ? "bg-red-500 text-white scale-110" : "bg-white text-slate-400")}>
            <Heart className={cn("w-5 h-5", isFavorite && "fill-current")} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Title + Price */}
          <div className="space-y-2">
            <h1 className="text-xl font-black dark:text-white leading-tight">{product.name}</h1>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-black text-orange-500">{product.price?.toLocaleString()} <span className="text-sm">ج.م</span></span>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(s => (
                  <button key={s} onClick={() => handleRate(s)}>
                    <Star className={cn("w-4 h-4", (userRating || product.rating || 0) >= s ? "text-yellow-400 fill-current" : "text-slate-200")} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-slate-400 font-bold">
            <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {product.views || 0}</span>
            <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {product.likes || 0}</span>
            <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> {product.comments || 0}</span>
            {product.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {product.location}</span>}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-4 gap-3">
            <button onClick={handleGuaranteedBuy} className="flex flex-col items-center gap-2 group">
              <div className="w-14 h-14 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-200">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-[9px] font-black dark:text-slate-300 uppercase">شراء بضمان</span>
            </button>
            <button onClick={() => product?.phone && window.open(`tel:${product.phone}`, '_blank')} className="flex flex-col items-center gap-2 group">
              <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 text-green-500 flex items-center justify-center shadow-lg border dark:border-slate-700">
                <Phone className="w-6 h-6" />
              </div>
              <span className="text-[9px] font-black dark:text-slate-300 uppercase">اتصال</span>
            </button>
            <button onClick={() => setCommentsOpen(true)} className="flex flex-col items-center gap-2 group">
              <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 text-blue-500 flex items-center justify-center shadow-lg border dark:border-slate-700">
                <MessageCircle className="w-6 h-6" />
              </div>
              <span className="text-[9px] font-black dark:text-slate-300 uppercase">تعليقات</span>
            </button>
            <button onClick={handleContact} className="flex flex-col items-center gap-2 group">
              <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 text-emerald-500 flex items-center justify-center shadow-lg border dark:border-slate-700">
                <Send className="w-6 h-6" />
              </div>
              <span className="text-[9px] font-black dark:text-slate-300 uppercase">واتساب</span>
            </button>
          </div>

          {/* Description */}
          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border dark:border-slate-800 space-y-3 shadow-inner">
            <h3 className="font-black text-md dark:text-white flex items-center gap-2">
              <div className="w-1.5 h-4 bg-orange-500 rounded-full" /> وصف المنتج
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-loose font-medium">{product.description || "لا يوجد وصف متوفر لهذا المنتج الفاخر."}</p>
          </div>

          {/* Seller card */}
          <div className="bg-slate-900 dark:bg-black p-6 rounded-[3rem] flex items-center justify-between shadow-2xl border-b-4 border-orange-500">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 border-2 border-slate-700">
                {product.sellerImage ? <img src={product.sellerImage} alt={product.seller} className="w-full h-full rounded-2xl object-cover" /> : <User className="w-8 h-8" />}
              </div>
              <div className="space-y-0.5">
                <p className="text-xl font-black text-white">{product.seller}</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] text-orange-500 font-black uppercase tracking-widest">تاجر موثق بضمان فيكس</span>
                  <BadgeCheck className="w-3.5 h-3.5 text-blue-500 fill-white" />
                </div>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="h-12 px-6 rounded-xl text-[10px] font-black border-slate-700 text-white bg-slate-800/50 hover:bg-orange-500 hover:border-orange-500 transition-all" 
              onClick={() => {
                if (!user) router.push('/login');
                else if (!isVerified) toast({variant: "destructive", title: "بريد غير مفعل"});
                else if (isBanned) toast({title: "خطأ", description: "عذراً، حدث خطأ في الخادم."});
                else router.push(`/chat?id=${product.sellerId}`);
              }}
            >
              دردشة فورية
            </Button>
          </div>
        </div>
      </div>
      <CommentsSheet open={commentsOpen} onClose={() => setCommentsOpen(false)} productId={productId} />
    </div>
  );
}
