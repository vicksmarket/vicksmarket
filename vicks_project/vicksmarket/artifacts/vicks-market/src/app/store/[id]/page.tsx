"use client";

import React, { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowRight, BadgeCheck, Star, ShoppingBag, Loader2, User,
  MapPin, Hash, MessageCircle, Copy, Check, UserPlus, UserCheck,
  Eye, Heart, Users
} from "lucide-react";
import { useDoc, useCollection } from "@/lib/supabase-hooks";
import { createClient } from "@/utils/supabase/client";
import { MOCK_MERCHANTS, MOCK_PRODUCTS } from "@/app/lib/mock-data";
import { cn } from "@/lib/utils";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#25D366" />
      <path fill="#fff" d="M23.5 8.5A10.45 10.45 0 0 0 16 5.5C10.2 5.5 5.5 10.2 5.5 16c0 1.85.48 3.65 1.4 5.24L5.5 26.5l5.38-1.41A10.48 10.48 0 0 0 16 26.5c5.8 0 10.5-4.7 10.5-10.5 0-2.8-1.09-5.44-3-7.5zm-7.5 16.13a8.72 8.72 0 0 1-4.44-1.22l-.32-.19-3.2.84.85-3.12-.2-.33A8.72 8.72 0 0 1 7.27 16c0-4.82 3.92-8.73 8.73-8.73 2.33 0 4.52.91 6.17 2.56a8.68 8.68 0 0 1 2.56 6.17c0 4.82-3.91 8.63-8.73 8.63zm4.79-6.53c-.26-.13-1.54-.76-1.78-.85-.24-.09-.41-.13-.58.13-.17.26-.66.85-.81 1.02-.15.17-.3.19-.56.06-.26-.13-1.1-.41-2.1-1.3a7.9 7.9 0 0 1-1.45-1.8c-.15-.26-.02-.4.11-.53.12-.12.26-.3.39-.45.13-.15.17-.26.26-.43.09-.17.04-.32-.02-.45-.06-.13-.58-1.4-.8-1.92-.2-.5-.42-.43-.58-.44H13c-.15 0-.39.06-.6.28-.2.22-.78.76-.78 1.86s.8 2.16.91 2.31c.11.15 1.57 2.4 3.81 3.37.53.23.94.37 1.27.47.53.17 1.01.14 1.39.09.43-.06 1.31-.54 1.5-1.06.18-.52.18-.97.13-1.06-.06-.09-.22-.15-.48-.28z" />
    </svg>
  );
}

function StoreProductCard({ product }: { product: any }) {
  const router = useRouter();
  const priceNum = Number(String(product.price).replace(/[^0-9.]/g, ""));
  const displayPrice = priceNum.toLocaleString("ar-EG");

  return (
    <div
      onClick={() => router.push(`/product/${product.id}`)}
      className="bg-white dark:bg-[#252D3D] rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm cursor-pointer active:scale-[0.97] transition-transform"
      dir="rtl"
    >
      {/* Product image */}
      <div className="relative w-full aspect-square bg-slate-100 dark:bg-slate-800">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="w-8 h-8 text-slate-300" />
          </div>
        )}
        {/* Price badge */}
        <div className="absolute bottom-2 right-2 bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md">
          <span className="text-[8px]">ج.م</span>{displayPrice}
        </div>
      </div>

      {/* Info */}
      <div className="p-2.5">
        <h3 className="font-black text-[11px] text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug mb-1.5">
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          {/* Rating */}
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(s => (
              <Star
                key={s}
                className={cn("w-2.5 h-2.5", s <= (product.rating || 5) ? "text-yellow-400 fill-yellow-400" : "text-slate-200 dark:text-slate-600")}
              />
            ))}
          </div>
          {/* Stats */}
          <div className="flex items-center gap-2 text-[9px] text-slate-400 font-bold">
            {(product.likes || 0) > 0 && (
              <span className="flex items-center gap-0.5">
                <Heart className="w-2.5 h-2.5" />{product.likes}
              </span>
            )}
            {(product.views || 0) > 0 && (
              <span className="flex items-center gap-0.5">
                <Eye className="w-2.5 h-2.5" />{product.views}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const CATS = ["الكل", "إلكترونيات", "ملابس", "أثاث", "جمال", "مستعمل", "ساعات", "حقائب"];

export default function StorePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [activeCategory, setActiveCategory] = useState("الكل");
  const [copied, setCopied] = useState(false);
  const [following, setFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState<number | null>(null);

  const isMockId = id.startsWith("mock-");
  const mockMerchant = useMemo(() => MOCK_MERCHANTS.find(m => m.uid === id), [id]);

  const { data: dbMerchant, loading: merchantLoading } = useDoc(
    isMockId ? null : "users",
    isMockId ? null : id
  );
  const merchant: any = mockMerchant || dbMerchant;

  const { data: dbProducts, loading: productsLoading } = useCollection(
    isMockId ? null : "products",
    isMockId ? [] : [{ column: "sellerId", value: id }]
  );
  const allProducts = isMockId
    ? MOCK_PRODUCTS.filter((p: any) => p.sellerId === id)
    : (dbProducts || []);

  const products = useMemo(() => {
    if (activeCategory === "الكل") return allProducts;
    return allProducts.filter((p: any) => p.category === activeCategory);
  }, [allProducts, activeCategory]);

  // Sync followersCount from DB once merchant loads
  React.useEffect(() => {
    if (merchant && followersCount === null) {
      setFollowersCount(merchant.followers_count ?? 0);
    }
  }, [merchant, followersCount]);

  const loading = merchantLoading || productsLoading;

  const handleFollow = async () => {
    if (isMockId || following) return;
    setFollowing(true);
    const newCount = (followersCount ?? 0) + 1;
    setFollowersCount(newCount);

    const supabase = createClient();
    if (!supabase) return;

    // Try users table first, then profiles
    const { error } = await supabase
      .from("users")
      .update({ followers_count: newCount })
      .eq("id", id);

    if (error) {
      // Fallback to profiles table
      await supabase
        .from("profiles")
        .update({ followers_count: newCount })
        .eq("id", id);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading && !mockMerchant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-orange-500 w-10 h-10" />
      </div>
    );
  }

  if (!merchant) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center gap-4" dir="rtl">
        <ShoppingBag className="w-16 h-16 text-slate-200" />
        <h1 className="text-xl font-black dark:text-white">المتجر غير موجود</h1>
        <button onClick={() => router.push("/")} className="text-orange-500 font-bold">← رجوع للرئيسية</button>
      </div>
    );
  }

  const shopName = merchant.shopName || merchant.shop_name || merchant.fullName || merchant.full_name || "متجر";
  const photoURL = merchant.photoURL || merchant.photo_url;
  const coverURL = merchant.coverURL || merchant.cover_url;
  const bio = merchant.bio;
  const isVerified = merchant.isVerified || merchant.is_verified;
  const isGold = merchant.verificationType === "gold" || merchant.verification_type === "gold";
  const location = merchant.location;
  const uniqueId = merchant.unique_id;
  const phone = merchant.phone;
  const rating = merchant.rating || 5;
  const isOnline = merchant.isOnline || merchant.is_online;

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#1A2332] font-cairo pb-24" dir="rtl">

      {/* Cover Banner */}
      <div className="relative h-44 bg-gradient-to-br from-orange-600 via-orange-500 to-amber-400 overflow-hidden">
        {coverURL && (
          <img src={coverURL} alt="cover" className="w-full h-full object-cover opacity-40" />
        )}
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 right-4 w-9 h-9 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center"
        >
          <ArrowRight className="w-4 h-4 text-white" />
        </button>

        {/* Copy link */}
        <button
          onClick={handleCopyLink}
          className="absolute top-4 left-4 w-9 h-9 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center"
        >
          {copied
            ? <Check className="w-4 h-4 text-green-300" />
            : <Copy className="w-4 h-4 text-white" />}
        </button>

        {/* Store name overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      {/* Profile section */}
      <div className="px-4 -mt-14 relative z-10">
        <div className="flex items-end gap-3 mb-4">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-3xl border-4 border-white dark:border-[#1A2332] overflow-hidden bg-slate-200 shadow-xl flex-shrink-0">
            {photoURL ? (
              <img src={photoURL} alt={shopName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200">
                <User className="w-10 h-10 text-orange-400" />
              </div>
            )}
          </div>

          {/* Name + meta */}
          <div className="pb-1 flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <h1 className="font-black text-xl dark:text-white truncate">{shopName}</h1>
              {isVerified && (
                <BadgeCheck className={cn("w-5 h-5 flex-shrink-0", isGold ? "text-yellow-500" : "text-blue-500")} />
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-500 dark:text-slate-400 font-bold">
              {location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />{location}
                </span>
              )}
              {uniqueId && (
                <span className="flex items-center gap-1">
                  <Hash className="w-3 h-3" />{uniqueId}
                </span>
              )}
              <span className="flex items-center gap-1">
                <span className={cn("w-2 h-2 rounded-full", isOnline ? "bg-green-400" : "bg-slate-300")} />
                {isOnline ? "متاح الآن" : "غير متاح"}
              </span>
            </div>
          </div>
        </div>

        {/* Bio */}
        {bio && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl px-4 py-3 mb-4 shadow-sm border border-slate-100 dark:border-slate-700">
            <p className="text-[12px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{bio}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { label: "المنتجات", value: allProducts.length, icon: <ShoppingBag className="w-4 h-4 text-orange-500" /> },
            { label: "المتابعون", value: followersCount ?? (merchant.followers_count || 0), icon: <Users className="w-4 h-4 text-blue-500" /> },
            { label: "التقييم", value: `${rating}★`, icon: <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> },
            { label: "الفئات", value: new Set(allProducts.map((p: any) => p.category).filter(Boolean)).size || 1, icon: <Hash className="w-4 h-4 text-purple-500" /> },
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-slate-800 rounded-2xl p-2.5 text-center shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="flex justify-center mb-1">{s.icon}</div>
              <div className="font-black text-sm dark:text-white">{s.value}</div>
              <div className="text-[9px] font-bold text-slate-400">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mb-5">
          {/* Follow button */}
          <button
            onClick={handleFollow}
            disabled={following || isMockId}
            className={cn(
              "flex-1 h-12 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.97]",
              following
                ? "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                : "bg-orange-500 text-white shadow-md shadow-orange-200 dark:shadow-none"
            )}
          >
            {following
              ? <><UserCheck className="w-4 h-4" /> تتابع المتجر</>
              : <><UserPlus className="w-4 h-4" /> متابعة المتجر</>}
          </button>

          {/* WhatsApp */}
          {phone && (
            <button
              onClick={() => window.open(`https://wa.me/${phone.replace(/\D/g, "")}`, "_blank")}
              className="w-12 h-12 rounded-2xl bg-[#25D366] flex items-center justify-center shadow-sm active:scale-[0.97] transition-transform"
            >
              <WhatsAppIcon className="w-6 h-6" />
            </button>
          )}

          {/* Chat */}
          <button
            onClick={() => router.push(`/chat?id=${id}`)}
            className="w-12 h-12 rounded-2xl bg-slate-900 dark:bg-white flex items-center justify-center shadow-sm active:scale-[0.97] transition-transform"
          >
            <MessageCircle className="w-5 h-5 text-white dark:text-slate-900" />
          </button>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-4">
          {CATS.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "flex-shrink-0 px-4 py-2 rounded-full text-[11px] font-black transition-all",
                activeCategory === cat
                  ? "bg-orange-500 text-white shadow-md"
                  : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products count + section header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-black text-sm dark:text-white">منتجات المتجر</h2>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
            {products.length} منتج
          </span>
        </div>

        {/* Products grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {products.map((p: any) => (
              <StoreProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 space-y-3">
            <ShoppingBag className="w-12 h-12 mx-auto text-slate-200 dark:text-slate-700" />
            <p className="font-black text-slate-400 text-sm">لا توجد منتجات في هذه الفئة</p>
          </div>
        )}
      </div>
    </div>
  );
}
