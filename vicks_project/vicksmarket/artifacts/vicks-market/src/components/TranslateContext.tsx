"use client";
import React, { createContext, useContext, useState } from "react";

interface TranslateCtx {
  showTranslate: boolean;
  setShowTranslate: (v: boolean) => void;
}

const Ctx = createContext<TranslateCtx>({ showTranslate: false, setShowTranslate: () => {} });

export function TranslateProvider({ children }: { children: React.ReactNode }) {
  const [showTranslate, setShowTranslate] = useState(false);
  return <Ctx.Provider value={{ showTranslate, setShowTranslate }}>{children}</Ctx.Provider>;
}

export function useTranslate() { return useContext(Ctx); }
