import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "بريد إلكتروني غير صحيح" }, { status: 400 });
    }

    const emailLower = email.trim().toLowerCase();

    // استخدم anon client مباشرةً — أبسط طريقة
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );

    const { error } = await supabase.auth.signInWithOtp({
      email: emailLower,
      options: { shouldCreateUser: true },
    });

    if (error) {
      console.error("[OTP] full error:", JSON.stringify(error), "| status:", (error as any).status, "| code:", (error as any).code);
      return NextResponse.json(
        { error: error.message || error.name || JSON.stringify(error) },
        { status: 500 }
      );
    }

    console.log("[OTP] sent via Supabase to:", emailLower);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[OTP] exception:", err);
    return NextResponse.json({ error: err.message || "خطأ في الخادم" }, { status: 500 });
  }
}
