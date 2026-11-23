"use client";

import React, { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { Smartphone, Globe, X } from "lucide-react";

const HIDE_ON = ["/login", "/signup", "/forgot-password"];

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "vicks_pwa_dismissed_v2";
const AUTO_HIDE_MS = 8000;

export function PwaInstallBanner() {
  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [installing, setInstalling] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Must be after all hooks — no early return before hooks
  const hideOnThisPage = HIDE_ON.includes(pathname);

  const hide = (permanent = false) => {
    setVisible(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (permanent) localStorage.setItem(DISMISSED_KEY, "1");
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Already dismissed permanently
    if (localStorage.getItem(DISMISSED_KEY)) return;
    // Already installed
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    // Capture install prompt when browser fires it (Android Chrome)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Show banner after short delay regardless of prompt availability
    const showTimer = setTimeout(() => {
      setVisible(true);
      timerRef.current = setTimeout(() => hide(false), AUTO_HIDE_MS);
    }, 1000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      clearTimeout(showTimer);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInstall = async () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (deferredPrompt) {
      setInstalling(true);
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") hide(true);
      } finally {
        setInstalling(false);
      }
    } else {
      // Fallback: guide user to browser menu
      alert("افتح قائمة المتصفح (⋮) واضغط «إضافة إلى الشاشة الرئيسية»");
      hide(true);
    }
  };

  const handleBrowser = () => hide(true);

  if (hideOnThisPage) return null;

  return (
    <div
      dir="rtl"
      className={[
        "fixed top-0 inset-x-0 z-[300] transition-transform duration-500 ease-in-out",
        visible ? "translate-y-0" : "-translate-y-full",
      ].join(" ")}
    >
      {/* Progress bar */}
      <div className="absolute bottom-0 inset-x-0 h-[2px] bg-orange-100 overflow-hidden">
        {visible && (
          <div
            className="h-full bg-orange-400 animate-shrink-width"
            style={{ animationDuration: `${AUTO_HIDE_MS}ms` }}
          />
        )}
      </div>

      <div className="bg-white dark:bg-[#1A2332] shadow-lg border-b border-slate-100 dark:border-slate-700 px-4 py-3 flex items-center gap-3">
        {/* Logo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/app-logo.png"
          alt="vicksmarket"
          className="w-11 h-11 object-contain flex-shrink-0 rounded-2xl"
        />

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="font-black text-sm text-[#1A2332] dark:text-white leading-tight">vicksmarket</p>
          <p className="text-[10px] text-slate-400 font-bold">سوقك المفضل الموثوق</p>
        </div>

        {/* Install button */}
        <button
          onClick={handleInstall}
          disabled={installing}
          className="h-9 px-3 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white rounded-xl font-black text-[11px] flex items-center gap-1.5 transition-all disabled:opacity-60 flex-shrink-0"
        >
          <Smartphone className="w-3.5 h-3.5" />
          {installing ? "..." : "تحميل كتطبيق"}
        </button>

        {/* Web button */}
        <button
          onClick={handleBrowser}
          className="h-9 px-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 active:scale-95 text-slate-600 dark:text-slate-200 rounded-xl font-black text-[11px] flex items-center gap-1.5 transition-all flex-shrink-0"
        >
          <Globe className="w-3.5 h-3.5" />
          ويب
        </button>

        {/* Close */}
        <button
          onClick={() => hide(true)}
          className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-slate-500 flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
