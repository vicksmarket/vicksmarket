"use client";

import React, { useMemo } from "react";
import { VicksProductCard } from "./VicksProductCard";
import { useCollection } from "@/lib/supabase-hooks";
import { Loader2 } from "lucide-react";
import { MOCK_PRODUCTS } from "@/app/lib/mock-data";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface VicksProductGridProps {
  layout?: "grid" | "list";
  category?: string;
  products?: any[];
}

/**
 * شبكة عرض المنتجات مع دعم السحب الأفقي RTL للغة العربية.
 */
export function VicksProductGrid({ layout = "grid", category = "الكل", products: initialProducts }: VicksProductGridProps) {
  const filters = category !== "الكل" ? [{ column: "category", value: category }] : [];
  const { data: fetchedProducts, loading } = useCollection(
    initialProducts ? null : "products",
    filters,
    { orderBy: "createdAt", limit: 10 }
  );

  const products = useMemo(() => {
    if (initialProducts) return initialProducts.slice(0, 10);
    if (fetchedProducts && fetchedProducts.length > 0) return fetchedProducts;
    const mockSource = category === "الكل" ? MOCK_PRODUCTS : MOCK_PRODUCTS.filter(p => p.category === category);
    return mockSource.slice(0, 10);
  }, [initialProducts, fetchedProducts, category]);

  if (loading && !initialProducts) {
    return (
      <div className="flex justify-center items-center py-5">
        <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div className="w-full border-none">
      <ScrollArea className="w-full whitespace-nowrap" dir="rtl">
        <div className="flex px-0 gap-0">
          {products.map((product: any) => (
            <div key={product.id} className="inline-block p-0 m-0">
              <VicksProductCard
                {...product}
                price={product.price?.toString()}
              />
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="h-0 opacity-0" />
      </ScrollArea>
    </div>
  );
}
