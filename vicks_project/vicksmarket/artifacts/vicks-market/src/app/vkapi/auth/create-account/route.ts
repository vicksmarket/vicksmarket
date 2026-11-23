import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const { email, password, shopName, otpCode, skipOtp } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
    }

    const emailLower = email.trim().toLowerCase();

    // ── OTP check (optional — skipped when skipOtp is true) ──
    if (!skipOtp && otpCode) {
      const kvUrl = process.env.REPLIT_DB_URL!;
      const kvKey = `otp__${emailLower.replace(/[^a-z0-9]/g, "_")}`;
      const kvRes = await fetch(`${kvUrl}/${encodeURIComponent(kvKey)}`);
      const stored = kvRes.ok ? await kvRes.text() : "";
      if (!stored) {
        return NextResponse.json({ error: "لم يُرسل كود لهذا البريد — اطلب كوداً جديداً" }, { status: 400 });
      }
      const [storedCode, expiryStr] = stored.split(":");
      if (!storedCode || Date.now() > parseInt(expiryStr || "0")) {
        await fetch(`${kvUrl}/${encodeURIComponent(kvKey)}`, { method: "DELETE" });
        return NextResponse.json({ error: "انتهت صلاحية الكود — اطلب كوداً جديداً" }, { status: 400 });
      }
      if (otpCode.trim() !== storedCode) {
        return NextResponse.json({ error: "الكود غير صحيح" }, { status: 400 });
      }
      await fetch(`${kvUrl}/${encodeURIComponent(kvKey)}`, { method: "DELETE" });
    }

    // ── إنشاء المستخدم عبر Admin API ──
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    let userId: string;

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: emailLower,
      password,
      email_confirm: true,
    });

    if (createErr) {
      const isExisting =
        createErr.message?.toLowerCase().includes("already") ||
        (createErr as any).code === "email_exists" ||
        createErr.message?.includes("duplicate");

      if (isExisting) {
        // البريد مسجّل مسبقاً — أخبر الـ frontend ليحوّل للـ login
        return NextResponse.json({ error: "email_already_exists" }, { status: 409 });
      }
      console.error("[create-account] createUser:", createErr.message);
      return NextResponse.json({ error: createErr.message || "فشل إنشاء الحساب" }, { status: 400 });
    } else {
      userId = created.user.id;
    }

    // ── 3. إنشاء الملف الشخصي ──
    await admin.from("profiles").upsert({
      id:         userId,
      full_name:  shopName?.trim() || emailLower.split("@")[0],
      shop_name:  shopName?.trim() || null,
      role:       "customer",
      unique_id:  Math.floor(10000000 + Math.random() * 90000000).toString(),
      points:     1000,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[create-account] exception:", err);
    return NextResponse.json({ error: err.message || "خطأ في الخادم" }, { status: 500 });
  }
}
