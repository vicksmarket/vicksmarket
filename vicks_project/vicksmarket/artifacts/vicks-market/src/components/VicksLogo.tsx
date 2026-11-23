
"use client";

import React from "react";

export function VicksLogo({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      {/* الخلفية البيضاء ذات الزوايا الدائرية (اختياري حسب الاستخدام) */}
      <rect width="100" height="100" rx="20" fill="#F0F2F5" />
      
      {/* جسم الحقيبة البرتقالي */}
      <rect x="15" y="35" width="70" height="55" rx="12" fill="#FF6B00" />
      
      {/* المقبض الأخضر الداكن */}
      <path 
        d="M35 35C35 25 40 18 50 18C60 18 65 25 65 35" 
        stroke="#004D40" 
        strokeWidth="6" 
        strokeLinecap="round"
      />
      
      {/* نقاط تثبيت المقبض */}
      <circle cx="35" cy="35" r="4" fill="#004D40" />
      <circle cx="65" cy="35" r="4" fill="#004D40" />

      {/* الابتسامة (السهم المنحني) - بلون أخضر داكن */}
      <path 
        d="M28 65C35 75 55 80 72 65" 
        stroke="#004D40" 
        strokeWidth="7" 
        strokeLinecap="round" 
        fill="none"
      />
      
      {/* الدائرة في بداية السهم (اليسار) */}
      <circle cx="28" cy="65" r="4.5" fill="#004D40" />
      
      {/* رأس السهم (اليمين) */}
      <path 
        d="M65 58L78 63L68 76" 
        fill="#004D40" 
      />
    </svg>
  );
}
