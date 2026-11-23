
"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ViewGridRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.push('/?view=grid');
  }, [router]);
  return <div className="p-8 text-center">جاري تغيير العرض للشبكة...</div>;
}
