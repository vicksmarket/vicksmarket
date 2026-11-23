"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";

interface ScrollCtx { headerHidden: boolean }
const Ctx = createContext<ScrollCtx>({ headerHidden: false });

export function VicksScrollProvider({ children }: { children: React.ReactNode }) {
  const [headerHidden, setHeaderHidden] = useState(false);
  const lastY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const handler = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y < 10) {
          setHeaderHidden(false);
        } else if (y > lastY.current + 6) {
          setHeaderHidden(true);
        } else if (y < lastY.current - 4) {
          setHeaderHidden(false);
        }
        lastY.current = y;
        ticking.current = false;
      });
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return <Ctx.Provider value={{ headerHidden }}>{children}</Ctx.Provider>;
}

export const useScrollHeader = () => useContext(Ctx);
