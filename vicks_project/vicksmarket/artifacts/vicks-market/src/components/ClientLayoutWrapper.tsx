
"use client";

import React, { useEffect, useState } from 'react';
import { Language } from '@/lib/translations';

/**
 * @fileOverview مغلف لمعالجة اللغات والاتجاهات على جهة العميل فقط لمنع أخطاء الـ Hydration.
 */
export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedLang = localStorage.getItem('vicks_lang') as Language;
    if (savedLang) {
      document.documentElement.lang = savedLang;
      document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
    }
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return <>{children}</>;
}
