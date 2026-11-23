"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Sparkles, Zap, Laptop, ShoppingBag, LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";

const CATS = [
  { name: "الكل",            icon: <Sparkles className="w-3 h-3" /> },
  { name: "عروض اليوم",      icon: <Zap className="w-3 h-3" /> },
  { name: "إلكترونيات",      icon: <Laptop className="w-3 h-3" /> },
  { name: "ملابس",            icon: <ShoppingBag className="w-3 h-3" /> },
];

interface Props {
  onCategoryChange?: (cat: string) => void;
  activeCategory?: string;
  onViewModeChange?: (v: "grid" | "list") => void;
  viewMode?: "grid" | "list";
}

export function VicksCategoryBar({ onCategoryChange, activeCategory = "الكل", onViewModeChange, viewMode = "grid" }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevScrollLeft = useRef(0);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // showToggle: scroll-driven (hides when scroll goes back)
  const [showToggle, setShowToggle] = useState(false);
  // pinned: stays visible until any page movement
  const [pinned, setPinned] = useState(false);

  const visible = showToggle || pinned;

  // Unpin on any main-page scroll or touch
  const unpin = useCallback(() => {
    setPinned(false);
  }, []);

  useEffect(() => {
    const mainEl = document.querySelector("main");
    const target = mainEl || window;
    target.addEventListener("scroll", unpin, { passive: true });
    target.addEventListener("touchmove", unpin, { passive: true });
    return () => {
      target.removeEventListener("scroll", unpin);
      target.removeEventListener("touchmove", unpin);
    };
  }, [unpin]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const abs = Math.abs(scrollRef.current.scrollLeft);
    const prevAbs = Math.abs(prevScrollLeft.current);

    // Show when scrolled left
    setShowToggle(abs > 30);

    // Swipe back to right (was scrolled, now returning) → pin
    if (prevAbs > 30 && abs < prevAbs) {
      setPinned(true);
    }

    prevScrollLeft.current = scrollRef.current.scrollLeft;
  };

  // Long press on toggle area → pin
  const onLongPressStart = () => {
    longPressTimer.current = setTimeout(() => {
      setPinned(true);
    }, 400);
  };
  const onLongPressEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  return (
    <div className="bg-white dark:bg-[#1A2332] border-b dark:border-slate-800 shadow-sm">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex items-center gap-2 px-3 py-2 overflow-x-auto no-scrollbar"
        dir="rtl"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {/* Grid/List toggle — hidden by default */}
        <div
          className={cn(
            "flex-shrink-0 transition-all duration-200 overflow-hidden",
            visible ? "w-8 opacity-100" : "w-0 opacity-0 pointer-events-none"
          )}
          onPointerDown={onLongPressStart}
          onPointerUp={onLongPressEnd}
          onPointerLeave={onLongPressEnd}
        >
          <button
            onClick={() => onViewModeChange?.(viewMode === "grid" ? "list" : "grid")}
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full font-black border-2 transition-all active:scale-90",
              pinned
                ? "ring-2 ring-orange-300"
                : "",
              viewMode === "list"
                ? "bg-slate-900 border-slate-900 text-white"
                : "bg-orange-500 border-orange-500 text-white"
            )}
          >
            {viewMode === "grid" ? <List className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
          </button>
        </div>

        <div className={cn(
          "h-5 bg-slate-200 dark:bg-slate-700 flex-shrink-0 transition-all duration-200",
          visible ? "w-px opacity-100" : "w-0 opacity-0"
        )} />

        {CATS.map(cat => {
          const active = cat.name === activeCategory;
          return (
            <button
              key={cat.name}
              onClick={() => onCategoryChange?.(cat.name)}
              className={cn(
                "flex items-center gap-1.5 h-8 px-3 rounded-full whitespace-nowrap text-[11px] font-black border-2 flex-shrink-0 transition-all active:scale-95",
                active
                  ? "bg-orange-500 border-orange-500 text-white shadow-sm"
                  : "bg-white dark:bg-[#252D3D] border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-orange-200"
              )}
            >
              {cat.name}
              <span className={active ? "text-white" : "text-orange-500"}>{cat.icon}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
