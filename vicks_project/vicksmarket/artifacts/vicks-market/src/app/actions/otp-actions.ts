"use server";

/**
 * OTP generation and verification — uses in-memory store (no DB tables required).
 * Falls back gracefully: OTPs live for 10 min within the Node process.
 */

import { otpSave, otpVerify } from "@/lib/otp-store";
import { createResetToken, verifyResetToken } from "@/lib/token-sign";
import { createServiceClient } from "@/utils/supabase/service";
import { sendOTPEmail, sendOTPTelegram } from "@/app/actions/auth-actions";

const OTP_TTL_MS        = 10 * 60 * 1000; // 10 minutes
const RESET_TOKEN_TTL_MS = 5 * 60 * 1000; // 5 minutes

// ── Email password reset ─────────────────────────────────────────────────────

export async function sendEmailResetOtp(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    otpSave(`reset:${email.toLowerCase().trim()}`, code, OTP_TTL_MS);
    return await sendOTPEmail(email, code, "reset");
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

/**
 * Verify the email reset OTP.
 * On success, issues a HMAC-signed stateless resetToken — survives server restarts.
 */
export async function verifyEmailResetOtp(
  email: string,
  inputCode: string
): Promise<{ success: boolean; resetToken?: string; error?: string }> {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    const ok = otpVerify(`reset:${normalizedEmail}`, inputCode);
    if (!ok) return { success: false, error: "الكود غير صحيح أو انتهت صلاحيته" };

    // Stateless HMAC token — no server storage needed
    const resetToken = createResetToken(normalizedEmail, RESET_TOKEN_TTL_MS);
    return { success: true, resetToken };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

/**
 * Complete password reset using a HMAC-signed stateless resetToken.
 */
export async function completePasswordReset(
  resetToken: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verify & decode stateless token — no DB or in-memory lookup needed
    const email = verifyResetToken(resetToken);
    if (!email) return { success: false, error: "رمز إعادة التعيين غير صالح أو منتهي الصلاحية" };

    const supabase = createServiceClient();
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    if (listError) return { success: false, error: listError.message };

    const user = users.find(u => u.email?.toLowerCase() === email);
    if (!user) return { success: false, error: "لم يتم العثور على حساب بهذا البريد الإلكتروني" };

    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      password: newPassword,
    });
    if (updateError) return { success: false, error: updateError.message };

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ── Phone password reset ─────────────────────────────────────────────────────

export async function sendPhoneResetOtp(phone: string): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanPhone = phone.replace(/\D/g, "");
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    otpSave(`phone_reset:${cleanPhone}`, code, OTP_TTL_MS);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function verifyPhoneResetOtp(
  phone: string,
  inputCode: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanPhone = phone.replace(/\D/g, "");
    const ok = otpVerify(`phone_reset:${cleanPhone}`, inputCode);
    return ok ? { success: true } : { success: false, error: "الكود غير صحيح أو انتهت صلاحيته" };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ── Signup email verification ────────────────────────────────────────────────

export async function saveSignupEmailOtp(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    otpSave(`signup:${email.toLowerCase().trim()}`, code, OTP_TTL_MS);
    return await sendOTPEmail(email, code, "verification");
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function verifySignupEmailOtp(
  email: string,
  inputCode: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const ok = otpVerify(`signup:${email.toLowerCase().trim()}`, inputCode);
    return ok ? { success: true } : { success: false, error: "الكود غير صحيح أو انتهت صلاحيته" };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ── Signup Telegram verification ─────────────────────────────────────────────

/**
 * Send a signup verification OTP via Telegram bot.
 * The telegram username is used as the ID in temp_verifications.
 */
export async function sendSignupTelegramOtp(
  telegramUsername: string
): Promise<{ success: boolean; error?: string; needStart?: boolean }> {
  try {
    const normalizedUsername = (
      telegramUsername.startsWith("@") ? telegramUsername : `@${telegramUsername}`
    ).toLowerCase();
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const result = await sendOTPTelegram(normalizedUsername, code);
    if (!result.success) return result;
    otpSave(`tg:${normalizedUsername}`, code, OTP_TTL_MS);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function verifySignupTelegramOtp(
  telegramUsername: string,
  inputCode: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const normalizedUsername = (
      telegramUsername.startsWith("@") ? telegramUsername : `@${telegramUsername}`
    ).toLowerCase();
    const ok = otpVerify(`tg:${normalizedUsername}`, inputCode);
    return ok ? { success: true } : { success: false, error: "الكود غير صحيح أو انتهت صلاحيته" };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ── Legacy: Signup phone verification (kept for backward compatibility) ───────

export async function saveSignupPhoneOtp(phone: string, code: string): Promise<{ success: boolean; error?: string }> {
  try {
    otpSave(`phone:${phone}`, code, OTP_TTL_MS);
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function verifySignupPhoneOtp(
  phone: string,
  inputCode: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const ok = otpVerify(`phone:${phone}`, inputCode);
    return ok ? { success: true } : { success: false, error: "الكود غير صحيح أو انتهت صلاحيته" };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
