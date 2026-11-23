
"use client";

import React from "react";
import { VicksHeader } from "@/components/VicksHeader";
import { VicksCategoryBar } from "@/components/VicksCategoryBar";
import { VicksProductGrid } from "@/components/VicksProductGrid";

export default function HomeToolsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FA] dark:bg-[#1A2332] pb-24" dir="rtl">
      <VicksHeader />
      <VicksCategoryBar activeCategory="أدوات منزلية" />
      <main className="flex-grow p-4">
        <h1 className="text-2xl font-black mb-4 dark:text-white">قسم الأدوات المنزلية</h1>
        <VicksProductGrid category="أدوات منزلية" />
      </main>
    </div>
  );
}
