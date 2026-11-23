
"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ViewListRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.push('/?view=list');
  }, [router]);
  return <div className="p-8 text-center">جاري تغيير العرض للأفقي...</div>;
}
