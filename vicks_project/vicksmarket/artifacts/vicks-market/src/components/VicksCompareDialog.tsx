
"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, TrendingDown, TrendingUp, Info } from "lucide-react";
import { compareWithMarket } from "@/ai/flows/compare-product";

interface CompareDialogProps {
  productName: string;
  price: number;
  category: string;
  children: React.ReactNode;
}

export function VicksCompareDialog({ productName, price, category, children }: CompareDialogProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [open, setOpen] = useState(false);

  const handleCompare = async () => {
    setLoading(true);
    setOpen(true);
    try {
      const data = await compareWithMarket({ productName, currentPrice: price, category });
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div onClick={handleCompare} className="cursor-pointer">
        {children}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-[2.5rem] p-8 max-w-md text-right font-cairo" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-500" />
              مقارنة فيكس الذكية
            </DialogTitle>
            <DialogDescription className="text-[10px] font-bold">تحليل سعر المنتج ومقارنته بالسوق المصري</DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="py-12 flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
              <p className="text-sm font-black animate-pulse">جاري تحليل أسعار السوق...</p>
            </div>
          ) : result && (
            <div className="space-y-6">
              <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-3xl border-2 border-dashed border-orange-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-500">حالة السعر:</span>
                  {result.isGoodDeal ? (
                    <span className="flex items-center gap-1 text-emerald-500 font-black text-sm">
                      <TrendingDown className="w-4 h-4" /> لقطة (سعر ممتاز)
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-orange-500 font-black text-sm">
                      <TrendingUp className="w-4 h-4" /> مرتفع قليلاً
                    </span>
                  )}
                </div>
                <p className="text-sm font-black leading-relaxed">{result.advice}</p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-black flex items-center gap-1">
                  <Info className="w-4 h-4 text-blue-500" /> بدائل مقترحة:
                </h4>
                <div className="grid gap-2">
                  {result.alternatives.map((alt: string, i: number) => (
                    <div key={i} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-[10px] font-bold border border-blue-100 dark:border-blue-900/30">
                      {alt}
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={() => setOpen(false)} className="w-full h-12 bg-orange-500 rounded-2xl font-black text-white">
                شكراً يا فيكس
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
