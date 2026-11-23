
"use client";

import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Loader2, Image as ImageIcon } from "lucide-react";
import { visualProductSearch } from "@/ai/flows/visual-product-search";
import { useToast } from "@/hooks/use-toast";

interface VisualSearchDialogProps {
  children: React.ReactNode;
  mode?: "camera" | "upload";
}

export function VisualSearchDialog({ children, mode = "upload" }: VisualSearchDialogProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [results, setResults] = useState<string[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setResults(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        const response = await visualProductSearch({ photoDataUri: base64String });
        setResults(response.similarProducts);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "فشل البحث",
          description: "عذراً يا ملك، ملقيتش تفاصيل للصورة دي، جرب صورة أوضح.",
        });
      } finally {
        setIsUploading(false);
        // Clear input value to allow re-uploading the same file
        event.target.value = "";
      }
    };
    reader.readAsDataURL(file);
  };

  const triggerInput = () => {
    if (mode === "camera") {
      cameraInputRef.current?.click();
    } else {
      fileInputRef.current?.click();
    }
  };

  return (
    <Dialog onOpenChange={(open) => !open && setResults(null)}>
      <DialogTrigger asChild onClick={triggerInput}>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] font-cairo text-right" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl font-black">البحث البصري الذكي</DialogTitle>
          <DialogDescription className="text-xs font-bold text-slate-400">
            {mode === 'camera' ? 'تم التقاط الصورة، جاري تحليلها...' : 'اختر صورة من جهازك للبحث عن منتجات مشابهة.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-orange-100 rounded-3xl bg-slate-50 dark:bg-slate-900/50 gap-4">
          {isUploading ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
              <p className="text-sm font-black animate-pulse">فيكس بيحلل الصورة دلوقتي...</p>
            </div>
          ) : results ? (
            <div className="w-full space-y-4">
              <h4 className="font-black text-sm text-orange-600 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> نتائج البحث المقترحة:
              </h4>
              <ul className="space-y-2">
                {results.map((product, idx) => (
                  <li key={idx} className="p-4 bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-50 dark:border-slate-700 flex items-center gap-3 text-xs font-bold hover:border-orange-500 transition-all cursor-pointer shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-orange-50 dark:bg-orange-950/20 flex items-center justify-center">
                       <span className="text-orange-500 text-[10px]">{idx + 1}</span>
                    </div>
                    {product}
                  </li>
                ))}
              </ul>
              <Button 
                variant="outline" 
                className="w-full h-12 rounded-2xl border-2 font-black" 
                onClick={() => mode === 'camera' ? cameraInputRef.current?.click() : fileInputRef.current?.click()}
              >
                تجربة صورة تانية
              </Button>
            </div>
          ) : (
            <>
              <div className="w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-950/20 flex items-center justify-center text-orange-500">
                {mode === 'camera' ? <Camera className="w-10 h-10" /> : <Upload className="w-10 h-10" />}
              </div>
              <div className="flex flex-col gap-2 w-full">
                <Button 
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white gap-2 h-14 rounded-2xl font-black text-lg shadow-lg"
                  onClick={triggerInput}
                >
                  {mode === 'camera' ? <Camera className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
                  {mode === 'camera' ? 'افتح الكاميرا وصور' : 'ارفع صورة من الجهاز'}
                </Button>
                <p className="text-[10px] text-center text-slate-400 font-bold">
                  {mode === 'camera' ? 'صور المنتج بوضوح لأفضل النتائج' : 'يدعم JPG, PNG بجودة عالية'}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Hidden Inputs */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          className="hidden"
        />
        <input
          type="file"
          ref={cameraInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          capture="environment"
          className="hidden"
        />
      </DialogContent>
    </Dialog>
  );
}
