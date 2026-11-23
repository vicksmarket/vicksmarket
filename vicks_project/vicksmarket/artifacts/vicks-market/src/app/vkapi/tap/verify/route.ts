import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

const PLAN_LABELS: Record<string, string> = {
  silver: "VIP Silver",
  gold: "VIP Gold",
  pro: "VIP Pro",
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tapId  = searchParams.get("tap_id");
    const planId = searchParams.get("plan");
    const uid    = searchParams.get("uid");

    if (!tapId || !planId || !uid) {
      return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
    }

    const tapKey = process.env.TAP_SECRET_KEY;
    if (!tapKey) {
      return NextResponse.json({ error: "مفتاح Tap غير مُهيأ" }, { status: 500 });
    }

    // Retrieve charge from Tap
    const tapRes = await fetch(`https://api.tap.company/v2/charges/${tapId}`, {
      headers: { "Authorization": `Bearer ${tapKey}` },
    });

    const charge = await tapRes.json();

    if (!tapRes.ok) {
      return NextResponse.json({ error: "فشل التحقق من الدفع" }, { status: 500 });
    }

    const status = charge.status; // CAPTURED, AUTHORIZED, FAILED, CANCELLED...

    if (status === "CAPTURED") {
      // Update membership in Supabase
      const supabase = await createClient();
      const membershipLabel = PLAN_LABELS[planId] ?? planId;

      // Calculate expiry (30 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const { error } = await supabase
        .from("profiles")
        .update({
          membership: membershipLabel,
          membership_expires_at: expiresAt.toISOString(),
          last_tap_charge_id: tapId,
        })
        .eq("id", uid);

      if (error) {
        console.error("Supabase update error:", error);
        // Still return success - payment went through, we'll fix DB manually if needed
      }

      return NextResponse.json({
        status: "success",
        membership: membershipLabel,
        amount: charge.amount,
        currency: charge.currency,
      });
    }

    return NextResponse.json({ status: "failed", tapStatus: status });
  } catch (err) {
    console.error("Tap verify error:", err);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
