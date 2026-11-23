"use client";

import React, { useState } from "react";
import Image from "next/image";
import { BadgeCheck, Heart, MessageCircle, User, Star, X, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { CommentsSheet } from "@/components/CommentsSheet";

/* ── Brand SVG icons ── */
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#25D366" />
      <path fill="#fff" d="M23.5 8.5A10.45 10.45 0 0 0 16 5.5C10.2 5.5 5.5 10.2 5.5 16c0 1.85.48 3.65 1.4 5.24L5.5 26.5l5.38-1.41A10.48 10.48 0 0 0 16 26.5c5.8 0 10.5-4.7 10.5-10.5 0-2.8-1.09-5.44-3-7.5zm-7.5 16.13a8.72 8.72 0 0 1-4.44-1.22l-.32-.19-3.2.84.85-3.12-.2-.33A8.72 8.72 0 0 1 7.27 16c0-4.82 3.92-8.73 8.73-8.73 2.33 0 4.52.91 6.17 2.56a8.68 8.68 0 0 1 2.56 6.17c0 4.82-3.91 8.63-8.73 8.63zm4.79-6.53c-.26-.13-1.54-.76-1.78-.85-.24-.09-.41-.13-.58.13-.17.26-.66.85-.81 1.02-.15.17-.3.19-.56.06-.26-.13-1.1-.41-2.1-1.3a7.9 7.9 0 0 1-1.45-1.8c-.15-.26-.02-.4.11-.53.12-.12.26-.3.39-.45.13-.15.17-.26.26-.43.09-.17.04-.32-.02-.45-.06-.13-.58-1.4-.8-1.92-.2-.5-.42-.43-.58-.44H13c-.15 0-.39.06-.6.28-.2.22-.78.76-.78 1.86s.8 2.16.91 2.31c.11.15 1.57 2.4 3.81 3.37.53.23.94.37 1.27.47.53.17 1.01.14 1.39.09.43-.06 1.31-.54 1.5-1.06.18-.52.18-.97.13-1.06-.06-.09-.22-.15-.48-.28z" />
    </svg>
  );
}

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 240" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="tg-grad" x1="120" y1="0" x2="120" y2="240" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2AABEE"/>
          <stop offset="100%" stopColor="#229ED9"/>
        </linearGradient>
      </defs>
      <circle cx="120" cy="120" r="120" fill="url(#tg-grad)"/>
      <path fill="white" fillRule="evenodd" d="M54 114c36.3-15.8 60.5-26.2 72.6-31.3 34.6-14.4 41.8-16.9 46.4-17 1 0 3.3.3 4.8 1.4 1.2.9 1.6 2.2 1.7 3.1.1.9.3 3 .1 4.6-1.8 18.8-9.5 64.4-13.4 85.5-1.7 8.9-5 11.9-8.2 12.2-7 .6-12.3-4.6-19-9-10.6-6.9-16.5-11.2-26.8-17.9-11.9-7.8-4.2-12.1 2.6-19.1 1.8-1.8 32.6-29.9 33.2-32.4.1-.3.1-.6-.2-.9-.4-.2-.9-.1-1.3 0-.6.1-9.5 6-26.8 17.6-2.5 1.7-4.8 2.6-6.9 2.5-2.3 0-6.6-1.3-9.9-2.3-4-1.3-7.1-1.9-6.9-4.1.1-1.1 1.7-2.3 4.6-3.5z"/>
    </svg>
  );
}

/* ── Product Bottom Sheet ── */
function ProductSheet({ open, onClose, product }: {
  open: boolean; onClose: () => void;
  product: { id: string; name: string; price: string; image: string; description?: string; seller: string; sellerImage?: string; isOnline?: boolean; phone?: string; telegram?: string; rating?: number; location?: string; };
}) {
  const [rating, setRating] = useState(0);
  const [liked, setLiked] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end" style={{ background: "rgba(0,0,0,0.6)" }} onClick={onClose}>
      <div
        className="w-full bg-white dark:bg-[#1A2332] rounded-t-[2rem] overflow-hidden animate-in slide-in-from-bottom duration-300"
        style={{ height: "72vh" }}
        onClick={e => e.stopPropagation()} dir="rtl"
      >
        <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full" /></div>
        <div className="overflow-y-auto h-full pb-12 no-scrollbar">
          {/* Image */}
          <div className="relative w-full" style={{ height: "44%" }}>
            <Image src={product.image} alt={product.name} fill className="object-cover" sizes="100vw" />
            <button onClick={onClose} className="absolute top-3 left-3 w-8 h-8 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white"><X className="w-4 h-4" /></button>
          </div>
          <div className="px-4 pt-3 space-y-2.5">
            {/* Seller */}
            <div className="flex items-center gap-2">
              {product.sellerImage ? <img src={product.sellerImage} className="w-7 h-7 rounded-full object-cover" alt="" /> : <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center"><User className="w-4 h-4 text-slate-400" /></div>}
              <span className="text-[11px] font-black text-slate-500">{product.seller}</span>
              {product.isOnline && <span className="w-2 h-2 rounded-full bg-yellow-400" />}
            </div>
            <h2 className="text-lg font-black dark:text-white leading-snug">{product.name}</h2>
            <div className="flex items-center justify-between">
              <p className="text-orange-500 font-black text-2xl"><span className="text-xs">ج.م </span>{Number(product.price.replace(/[^0-9.]/g, "")).toLocaleString("ar-EG")}</p>
              <div className="flex gap-0.5">{[1,2,3,4,5].map(s => (<button key={s} onClick={() => setRating(s)}><Star className={cn("w-5 h-5 transition-all", s <= rating ? "text-yellow-400 fill-yellow-400" : "text-slate-200 dark:text-slate-600")} /></button>))}</div>
            </div>
            {product.description && <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{product.description}</p>}
            {product.location && <div className="flex items-center gap-1 text-slate-400"><MapPin className="w-3.5 h-3.5 text-red-400" /><span className="text-[11px] font-bold">{product.location}</span></div>}
            <div className="flex items-center gap-2 pt-1">
              <button onClick={() => window.open(`https://wa.me/${(product.phone||"201113694362").replace(/\D/g,"")}`)} className="flex-1 h-12 rounded-2xl flex items-center justify-center gap-2 bg-[#25D366] text-white font-black text-[11px] shadow-md active:scale-95"><WhatsAppIcon className="w-6 h-6" />واتساب</button>
              {product.telegram && <button onClick={() => window.open(`https://t.me/${product.telegram}`)} className="flex-1 h-12 rounded-2xl flex items-center justify-center gap-2 bg-[#2AABEE] text-white font-black text-[11px] shadow-md active:scale-95"><TelegramIcon className="w-6 h-6" />تليجرام</button>}
              <button onClick={() => setLiked(v => !v)} className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all active:scale-110", liked ? "bg-red-50 border-red-200 text-red-500" : "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400")}>
                <Heart className={cn("w-5 h-5", liked && "fill-current")} />
              </button>
              <button onClick={() => setCommentsOpen(true)} className="w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-400 active:scale-110">
                <MessageCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <CommentsSheet open={commentsOpen} onClose={() => setCommentsOpen(false)} productId={product.id} />
    </div>
  );
}

/* ── Card Props ── */
interface CardProps {
  id: string; name: string; price: string | number; image: string;
  seller: string; sellerId: string; sellerImage?: string;
  rating?: number; ratingCount?: number; isVerified?: boolean; isGold?: boolean; isOnline?: boolean;
  phone?: string; telegram?: string; description?: string; location?: string;
  views?: number; likes?: number; comments?: number;
  layout?: "grid" | "list";
  fluid?: boolean;
}

export function VicksProductCard({
  id, name, price, image, seller, sellerId, sellerImage,
  rating = 0, ratingCount = 0, isVerified = true, isGold = false, isOnline = false,
  phone = "201113694362", telegram, description, location,
  likes = 0, comments = 0, layout = "grid", fluid = false
}: CardProps) {
  const router = useRouter();
  const [localRating, setLocalRating] = useState(0);
  const [localRatingCount, setLocalRatingCount] = useState(ratingCount);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [commentCount] = useState(comments);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);

  const priceStr = String(price);
  const numPrice = Number(priceStr.replace(/[^0-9.]/g, ""));
  const displayPrice = numPrice.toLocaleString("ar-EG");

  const sheetProps = { id, name, price: priceStr, image, description, seller, sellerImage, isOnline, phone, telegram, rating: localRating, location };

  const productUrl = typeof window !== "undefined" ? `${window.location.origin}/product/${id}` : `/product/${id}`;
  const waMsg = encodeURIComponent(`${image}\n\nمرحباً، أنا مهتم بهذا المنتج:\n*${name}*\nالسعر: ${displayPrice} ج.م\n${productUrl}`);
  const tgMsg = encodeURIComponent(`مرحباً، أنا مهتم بهذا المنتج:\n${name}\nالسعر: ${displayPrice} ج.م`);
  const wa = (e: React.MouseEvent) => { e.stopPropagation(); window.open(`https://wa.me/${(phone||"201113694362").replace(/\D/g,"")}?text=${waMsg}`,"_blank"); };
  const tg = (e: React.MouseEvent) => { e.stopPropagation(); telegram && window.open(`https://t.me/${telegram}?text=${tgMsg}&url=${encodeURIComponent(image)}`,"_blank"); };
  const toggleLike = (e: React.MouseEvent) => { e.stopPropagation(); setLiked(v => !v); setLikeCount(v => liked ? v - 1 : v + 1); };
  const goComment = (e: React.MouseEvent) => { e.stopPropagation(); setCommentsOpen(true); };

  /* ── LIST layout ── */
  if (layout === "list") {
    return (
      <>
        <div className="flex gap-3 bg-white dark:bg-[#252D3D] rounded-2xl p-2.5 shadow-sm border border-slate-100 dark:border-slate-800 cursor-pointer mx-3 mb-2 active:scale-[0.98] transition-transform" dir="rtl" onClick={() => setSheetOpen(true)}>
          <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
            <Image src={image} alt={name} fill className="object-cover" sizes="80px" />
          </div>
          <div className="flex-1 flex flex-col gap-1 min-w-0">
            <p className="text-[10px] font-black text-slate-400 truncate">{seller}</p>
            <h3 className="font-black text-[12px] text-slate-800 dark:text-slate-100 line-clamp-2">{name}</h3>
            <p className="text-orange-500 font-black text-sm"><span className="text-[9px]">ج.م</span>{displayPrice}</p>
            <div className="flex items-center gap-1.5 mt-auto">
              <button onClick={wa} className="w-6 h-6 rounded-full active:scale-90"><WhatsAppIcon className="w-6 h-6" /></button>
              {telegram && <button onClick={tg} className="w-6 h-6 rounded-full active:scale-90"><TelegramIcon className="w-6 h-6" /></button>}
            </div>
          </div>
        </div>
        <ProductSheet open={sheetOpen} onClose={() => setSheetOpen(false)} product={sheetProps} />
        <CommentsSheet open={commentsOpen} onClose={() => setCommentsOpen(false)} productId={id} />
      </>
    );
  }

  /* ── GRID layout ── */
  const cardClass = cn(
    "overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-[#252D3D] rounded-2xl flex flex-col select-none",
    fluid ? "w-full" : "w-[158px] min-w-[158px]"
  );

  return (
    <>
      <div className={cardClass}>
        {/* Seller header strip */}
        <div className="flex items-center gap-1.5 px-2.5 py-2 cursor-pointer border-b border-slate-50 dark:border-slate-800/80" dir="rtl" onClick={() => router.push(`/merchant-profile/${sellerId}`)}>
          <div className="relative w-5 h-5 flex-shrink-0">
            {sellerImage
              ? <img src={sellerImage} className="w-5 h-5 rounded-full object-cover" alt={seller} />
              : <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center"><User className="w-3 h-3 text-slate-400" /></div>}
            <span className={cn("absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white dark:border-[#252D3D]", isOnline ? "bg-yellow-400" : "bg-slate-300")} />
          </div>
          <p className="text-[9px] font-black text-slate-600 dark:text-slate-300 truncate flex-1">{seller}</p>
          {isVerified && <BadgeCheck className={cn("w-3 h-3 flex-shrink-0", isGold ? "text-yellow-500" : "text-blue-500")} />}
        </div>

        {/* Image — tap opens sheet */}
        <div className="relative w-full overflow-hidden cursor-pointer bg-slate-50 dark:bg-slate-800" style={{ height: fluid ? "auto" : 180, aspectRatio: fluid ? "4/3" : undefined }} onClick={() => setSheetOpen(true)}>
          <Image src={image} alt={name} fill className="object-cover" sizes={fluid ? "50vw" : "158px"} />
        </div>

        {/* Stars + Price */}
        <div className="px-2.5 pt-2 flex items-center justify-between gap-1" dir="rtl">
          <p className="text-orange-500 font-black text-[15px] leading-tight"><span className="text-[8px] font-bold ml-0.5">ج.م</span>{displayPrice}</p>
          <div className="flex items-center gap-px">
            {[1,2,3,4,5].map(s => (
              <button key={s} onClick={() => { setLocalRating(s); setLocalRatingCount(v => v + 1); }} className="p-px">
                <Star className={cn("w-2.5 h-2.5 transition-all", s <= localRating ? "text-yellow-400 fill-yellow-400" : "text-slate-200 dark:text-slate-600")} />
              </button>
            ))}
            {localRatingCount > 0 && <span className="text-[8px] font-black text-slate-400 mr-0.5">({localRatingCount})</span>}
          </div>
        </div>

        {/* Name — tap opens sheet */}
        <div className="px-2.5 pt-0.5 pb-1 flex-1 cursor-pointer" onClick={() => setSheetOpen(true)}>
          <h3 className="font-black text-[10px] text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug" dir="rtl">{name}</h3>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-2 pb-2.5 pt-1 border-t border-slate-50 dark:border-slate-800/80" dir="rtl">
          <div className="flex items-center gap-1">
            <button onClick={wa} className="w-7 h-7 rounded-full flex items-center justify-center active:scale-90 transition-transform"><WhatsAppIcon className="w-7 h-7" /></button>
            {telegram && <button onClick={tg} className="w-7 h-7 rounded-full flex items-center justify-center active:scale-90 transition-transform"><TelegramIcon className="w-7 h-7" /></button>}
          </div>
          <div className="flex items-center gap-2">
            {/* Like + count */}
            <button onClick={toggleLike} className={cn("flex items-center gap-0.5 px-1.5 h-7 rounded-full border transition-all active:scale-110", liked ? "bg-red-50 dark:bg-red-950/30 text-red-500 border-red-100" : "bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-700")}>
              <Heart className={cn("w-3.5 h-3.5 flex-shrink-0", liked && "fill-current")} />
              {likeCount > 0 && <span className="text-[9px] font-black leading-none">{likeCount}</span>}
            </button>
            {/* Comment + count */}
            <button onClick={goComment} className="flex items-center gap-0.5 px-1.5 h-7 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 active:scale-110 transition-transform">
              <MessageCircle className="w-3.5 h-3.5 flex-shrink-0" />
              {commentCount > 0 && <span className="text-[9px] font-black leading-none">{commentCount}</span>}
            </button>
          </div>
        </div>
      </div>
      <ProductSheet open={sheetOpen} onClose={() => setSheetOpen(false)} product={sheetProps} />
      <CommentsSheet open={commentsOpen} onClose={() => setCommentsOpen(false)} productId={id} />
    </>
  );
}
