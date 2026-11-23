import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

/** Returns the public base URL of this app (e.g. https://xxx.replit.dev/vicks-market) */
function getAppBase(req: NextRequest): string {
  // Replit injects REPLIT_DOMAINS = "<host>" (no protocol, no path)
  const replitDomain = process.env.REPLIT_DOMAINS;
  if (replitDomain) {
    // The artifact is mounted at /vicks-market on the Replit proxy
    return `https://${replitDomain.split(",")[0].trim()}/vicks-market`;
  }

  // Fallback: derive from request headers
  const host =
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host") ||
    "localhost";
  const proto = req.headers.get("x-forwarded-proto") || "https";
  return `${proto}://${host}`;
}

export async function POST(req: NextRequest) {
  try {
    const { planId, planName, amount } = await req.json();

    if (!planId || !planName || !amount) {
      return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "يجب تسجيل الدخول أولاً" }, { status: 401 });
    }

    const tapKey = process.env.TAP_SECRET_KEY;
    if (!tapKey) {
      return NextResponse.json({ error: "مفتاح Tap غير مُهيأ" }, { status: 500 });
    }

    const base        = getAppBase(req);
    const redirectUrl = `${base}/profile/vip/success?plan=${planId}&uid=${user.id}`;

    console.log("[Tap] redirect_url →", redirectUrl);

    const tapRes = await fetch("https://api.tap.company/v2/charges", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${tapKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        currency: "EGP",
        customer_initiated: true,
        threeDSecure: true,
        save_card: false,
        description: `اشتراك ${planName} - Vicks Market`,
        metadata: {
          user_id: user.id,
          plan_id: planId,
        },
        customer: {
          first_name: user.user_metadata?.name || user.email?.split("@")[0] || "مستخدم",
          email: user.email,
        },
        source: { id: "src_all" },
        redirect: { url: redirectUrl },
      }),
    });

    const tapData = await tapRes.json();

    if (!tapRes.ok || !tapData?.transaction?.url) {
      console.error("[Tap] charge error:", JSON.stringify(tapData, null, 2));
      return NextResponse.json(
        { error: tapData?.errors?.[0]?.description || "فشل إنشاء الدفع" },
        { status: 500 }
      );
    }

    console.log("[Tap] charge created:", tapData.id);
    return NextResponse.json({ url: tapData.transaction.url, chargeId: tapData.id });
  } catch (err) {
    console.error("[Tap] checkout exception:", err);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
