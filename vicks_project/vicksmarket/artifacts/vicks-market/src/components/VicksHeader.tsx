"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import { useTranslate } from "./TranslateContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { translations, Language } from "@/lib/translations";
import { VisualSearchDialog } from "@/components/VicksVisualSearch";
import { useScrollHeader } from "./VicksScrollContext";
import { Search, User, Sun, Moon, Camera, Plus, Crown, LayoutDashboard, X, Languages, LogIn, UserPlus, Users } from "lucide-react";
import { useUser, useDoc } from "@/lib/supabase-hooks";

const ADMIN_EMAILS = ["mom1113694362@gmail.com", "vicksmarket@gmail.com", "mom01113694362@icloud.com"];

function HeaderControls() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDark, setIsDark] = useState(false);
  const [lang, setLang] = useState<Language>("ar");
  const [isAdminLocal, setIsAdminLocal] = useState(false);
  const [tempRole, setTempRole] = useState<string | null>(null);
  const [showAuthMenu, setShowAuthMenu] = useState(false);
  const { showTranslate, setShowTranslate } = useTranslate();
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);

  const { data: profile } = useDoc("profiles", user?.uid ?? null);
  const t = translations[lang];

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") { document.documentElement.classList.add("dark"); setIsDark(true); }
    const savedLang = localStorage.getItem("vicks_lang") as Language;
    if (savedLang) setLang(savedLang);
    if (localStorage.getItem("vicks_admin_mode") === "active") setIsAdminLocal(true);
    setTempRole(localStorage.getItem("vicks_temp_role"));
  }, [profile]);

  const toggleDark = () => {
    document.documentElement.classList.toggle("dark");
    const next = isDark ? "light" : "dark";
    localStorage.setItem("theme", next);
    setIsDark(!isDark);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
      setSearchQuery("");
    }
  };

  const isAdmin = !tempRole && (isAdminLocal || (user?.email && ADMIN_EMAILS.includes(user.email)));
  const isMerchant = profile?.role === "merchant" || isAdmin;

  return (
    <>
      {tempRole && profile?.unique_id === "1000000000" && (
        <div className="bg-orange-500 text-white text-[8px] font-black text-center py-0.5 rounded-full mb-1 uppercase tracking-widest flex items-center justify-center gap-1">
          <Crown className="w-2 h-2" /> وضع معاينة {tempRole === "merchant" ? "تاجر" : "زبون"} <Crown className="w-2 h-2" />
        </div>
      )}

      <div className="flex items-center justify-between">
        {/* Left controls */}
        <div className="flex items-center gap-1.5">
          {/* Profile icon */}
          <div className="relative">
            <button
              disabled={authLoading}
              onClick={() => {
                if (authLoading) return;
                if (user) {
                  const role = profile?.role || (user as any)?.user_metadata?.role || "customer";
                  if (role === "merchant" || isAdmin) router.push("/dashboard");
                  else router.push("/verify");
                } else {
                  router.push("/login");
                }
              }}
              className="relative w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden disabled:opacity-60"
            >
              {authLoading ? (
                <span className="w-3 h-3 rounded-full border-2 border-orange-400 border-t-transparent animate-spin block" />
              ) : profile?.photoURL ? (
                <img src={profile.photoURL} alt="" className="w-full h-full object-cover rounded-full" />
              ) : (
                <User className="w-3.5 h-3.5 text-slate-500" />
              )}
              {!authLoading && user && <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white" />}
            </button>
            {/* Auth bottom sheet for guests */}
            {showAuthMenu && !user && (
              <>
                <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={() => setShowAuthMenu(false)} />
                <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#252D3D] rounded-t-3xl shadow-2xl p-5 flex flex-col gap-3" dir="rtl">
                  <div className="w-10 h-1 bg-slate-200 dark:bg-slate-600 rounded-full mx-auto mb-2" />
                  <p className="font-black text-sm text-center dark:text-white mb-1">أهلاً بك في Vicks Market</p>
                  <button onClick={() => { setShowAuthMenu(false); router.push("/login"); }}
                    className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-orange-500 text-white font-black text-sm active:scale-95 transition-transform">
                    <LogIn className="w-4 h-4" /> تسجيل الدخول
                  </button>
                  <button onClick={() => { setShowAuthMenu(false); router.push("/register"); }}
                    className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white font-black text-sm active:scale-95 transition-transform">
                    <UserPlus className="w-4 h-4" /> إنشاء حساب جديد
                  </button>
                </div>
              </>
            )}
          </div>
          <Button variant="ghost" size="icon" className="bg-slate-50 dark:bg-slate-800 rounded-full w-8 h-8" onClick={toggleDark}>
            {isDark ? <Sun className="w-3.5 h-3.5 text-yellow-400" /> : <Moon className="w-3.5 h-3.5 text-slate-500" />}
          </Button>
          <Button variant="ghost" size="icon" className="bg-slate-50 dark:bg-slate-800 rounded-full w-8 h-8" onClick={() => setShowSearch(v => !v)}>
            {showSearch ? <X className="w-3.5 h-3.5 text-orange-500" /> : <Search className="w-3.5 h-3.5 text-orange-500" />}
          </Button>
          {/* Translation button: short press = quick AR↔EN toggle, long press = show panel */}
          <Button
            variant="ghost"
            size="icon"
            className={`bg-slate-50 dark:bg-slate-800 rounded-full w-8 h-8 select-none ${showTranslate ? "ring-2 ring-orange-400" : ""}`}
            title="ترجمة الصفحة"
            onPointerDown={() => {
              didLongPress.current = false;
              longPressTimer.current = setTimeout(() => {
                didLongPress.current = true;
                setShowTranslate(true);
              }, 500);
            }}
            onPointerUp={() => {
              if (longPressTimer.current) clearTimeout(longPressTimer.current);
              if (!didLongPress.current) {
                import("@/components/TranslatePanel").then(({ quickToggleAREN }) => quickToggleAREN());
              }
            }}
            onPointerLeave={() => {
              if (longPressTimer.current) clearTimeout(longPressTimer.current);
            }}
          >
            <Languages className="w-3.5 h-3.5 text-orange-500" />
          </Button>
        </div>

        {/* Center: brand */}
        <Link href="/" className="flex flex-col items-center">
          <span translate="no" className="text-sm font-black tracking-tighter text-[#1A2332] dark:text-white uppercase leading-none">VICKS MARKET</span>
          <span className="text-[8px] font-bold text-orange-500">{t.subtitle}</span>
        </Link>

        {/* Right: groups + merchant dashboard + logo */}
        <div className="flex items-center gap-1.5">
          {isMerchant && (
            <Button variant="ghost" size="icon" className="bg-orange-50 dark:bg-orange-950/30 rounded-full w-8 h-8" onClick={() => router.push('/merchant')}>
              <LayoutDashboard className="w-3.5 h-3.5 text-orange-500" />
            </Button>
          )}
          <img src="/icon-512.png" alt="vicksmarket" className="w-8 h-8 object-contain" />
        </div>
      </div>

      {/* Expandable search bar */}
      <div className={cn("overflow-hidden transition-all duration-300", showSearch ? "max-h-20 mt-2 opacity-100" : "max-h-0 mt-0 opacity-0 pointer-events-none")}>
        <form onSubmit={handleSearch} className="flex items-center gap-2" dir="rtl">
          <div className="relative flex-1">
            <Input autoFocus={showSearch} value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-10 rounded-full border-2 border-orange-200 focus:border-orange-400 pr-10 text-xs dark:bg-slate-800 text-right font-bold"
              placeholder="ابحث عن منتج..." />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-orange-500" />
          </div>
          <Button type="submit" className="h-10 px-4 bg-orange-500 hover:bg-orange-600 text-white text-xs font-black rounded-full">بحث</Button>
          <div className="flex gap-1">
            <VisualSearchDialog mode="upload"><Button type="button" variant="ghost" size="icon" className="w-8 h-8 bg-slate-50 rounded-full text-blue-500"><Plus className="w-4 h-4" /></Button></VisualSearchDialog>
            <VisualSearchDialog mode="camera"><Button type="button" variant="ghost" size="icon" className="w-8 h-8 bg-slate-50 rounded-full text-orange-500"><Camera className="w-4 h-4" /></Button></VisualSearchDialog>
          </div>
        </form>
      </div>
    </>
  );
}

export function VicksHeader() {
  const { headerHidden } = useScrollHeader();
  const pathname = usePathname();
  if (pathname?.startsWith("/merchant-profile")) return null;
  return (
    <header
      className={cn(
        "w-full bg-white dark:bg-[#1A2332] px-4 py-2 sticky top-0 z-50 shadow-sm border-b dark:border-slate-800",
        "transition-[transform,margin] duration-300 ease-in-out",
        headerHidden ? "-translate-y-full" : "translate-y-0"
      )}
      style={{ marginBottom: headerHidden ? "-52px" : "0px" }}
    >
      <Suspense fallback={<div className="h-10 animate-pulse bg-slate-50 rounded-full" />}>
        <HeaderControls />
      </Suspense>
    </header>
  );
}
