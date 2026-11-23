'use client';

import React, { useState, useEffect } from 'react';
import { Download, Sparkles, Smartphone, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/lib/supabase-hooks';
import { createClient } from '@/utils/supabase/client';

export function VicksPWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      toast({ title: "مبروك يا ملك!", description: "تم تثبيت تطبيق فيكس ماركت بنجاح." });
    });

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      toast({ description: "التطبيق مثبت بالفعل أو متصفحك لا يدعم التثبيت المباشر." });
      return;
    }

    setLoading(true);
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted' && user) {
      try {
        const supabase = createClient();
        const { data: current } = await supabase.from("users").select("points").eq("id", user.uid).maybeSingle();
        const newPoints = (current?.points || 0) + 50;
        await supabase.from("users").update({ points: newPoints }).eq("id", user.uid);
        toast({ title: "+50 نقطة!", description: "تمت إضافة مكافأة تثبيت التطبيق لحسابك." });
      } catch (e) {
        // silently ignore points update failure
      }
    }
    setLoading(false);
    setDeferredPrompt(null);
  };

  if (isInstalled) return null;

  return (
    <section className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
        <Smartphone className="w-24 h-24 rotate-12" />
      </div>
      
      <div className="relative z-10 space-y-4">
        <div className="flex items-center gap-2">
          <div className="bg-white/20 p-2 rounded-xl">
             <Download className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-black uppercase tracking-tight">حمل التطبيق الآن</h2>
        </div>
        
        <p className="text-sm font-bold opacity-90 leading-relaxed">
          ثبّت "فيكس ماركت" على موبايلك واحصل على <span className="text-yellow-300 font-black">50 نقطة فوراً</span> وتجربة تصفح بسرعة البرق!
        </p>

        <Button 
          onClick={handleInstall}
          disabled={loading}
          className="w-full h-14 bg-white text-orange-600 hover:bg-slate-50 font-black rounded-2xl shadow-lg gap-2"
        >
          {loading ? <Loader2 className="animate-spin" /> : (
            <>
              <Sparkles className="w-5 h-5 fill-orange-500 text-orange-500" />
              <span>تحميل وتثبيت التطبيق</span>
            </>
          )}
        </Button>
      </div>
    </section>
  );
}
