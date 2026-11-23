
"use client";

import React, { useState, useEffect } from "react";
import { X, Send, Heart, MessageCircle, BadgeCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface StoryViewerProps {
  story: any;
  isOpen: boolean;
  onClose: () => void;
}

export function VicksStoryViewer({ story, isOpen, onClose }: StoryViewerProps) {
  const [progress, setProgress] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [reply, setReply] = useState("");

  useEffect(() => {
    if (isOpen) {
      setProgress(0);
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            onClose();
            return 100;
          }
          return prev + 1;
        });
      }, 50); // 5 seconds duration
      return () => clearInterval(timer);
    }
  }, [isOpen, onClose]);

  const handleWhatsApp = () => {
    const text = `أهلاً يا ${story.seller}، بخصوص الاستوري الخاصة بك على فيكس ماركت: \n(رد آلي من تطبيق فيكس)`;
    window.open(`https://wa.me/${story.phone?.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleTelegram = () => {
    if (!story.telegram) return;
    window.open(`https://t.me/${story.telegram}`, "_blank");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col font-cairo" dir="rtl">
      {/* Linear Progress Bar */}
      <div className="absolute top-2 left-4 right-4 z-50">
        <Progress value={progress} className="h-1 bg-white/20" />
      </div>

      {/* Header */}
      <header className="absolute top-6 left-0 right-0 px-4 py-4 flex items-center justify-between z-50 bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden">
              <img src={story.sellerImage} alt={story.seller} className="w-full h-full object-cover" />
           </div>
           <div className="flex flex-col items-start leading-none">
              <div className="flex items-center gap-1.5">
                 <span className="text-white font-black text-sm">{story.seller}</span>
                 <BadgeCheck className={cn("w-4 h-4", story.isGold ? "text-yellow-400" : "text-blue-400")} />
              </div>
              <span className="text-white/60 text-[8px] font-bold">منذ قليل • VICKS STORIES</span>
           </div>
        </div>
        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-white bg-white/10 rounded-full backdrop-blur-md">
           <X className="w-6 h-6" />
        </button>
      </header>

      {/* Story Media */}
      <main className="flex-1 relative overflow-hidden flex items-center justify-center">
         <img 
           src={story.image} 
           alt="Story content" 
           className="w-full h-full object-cover" 
         />
         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
      </main>

      {/* Footer Interaction Bar */}
      <footer className="p-4 pb-8 space-y-4 bg-black/40 backdrop-blur-sm z-50">
        <div className="flex items-center gap-3">
           <div className="flex-1 relative">
              <Input 
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder={`اكتب رداً لـ ${story.seller}...`} 
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-12 rounded-full pr-5 font-bold"
              />
              <Send className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
           </div>
           
           <div className="flex items-center gap-2">
              <button 
                onClick={handleWhatsApp}
                className="w-12 h-12 bg-[#25D366] rounded-full flex items-center justify-center text-white shadow-lg active:scale-90 transition-transform"
              >
                <MessageCircle className="w-6 h-6 fill-white" />
              </button>
              
              <button 
                onClick={handleTelegram}
                className="w-12 h-12 bg-[#0088cc] rounded-full flex items-center justify-center text-white shadow-lg active:scale-90 transition-transform"
              >
                <Send className="w-6 h-6 fill-white" />
              </button>

              <button 
                onClick={() => setIsLiked(!isLiked)}
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center shadow-lg active:scale-125 transition-all",
                  isLiked ? "bg-red-500 text-white" : "bg-white/10 text-white"
                )}
              >
                <Heart className={cn("w-6 h-6", isLiked && "fill-current")} />
              </button>
           </div>
        </div>
      </footer>
    </div>
  );
}
