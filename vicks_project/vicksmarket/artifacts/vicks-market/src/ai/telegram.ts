/**
 * Telegram bot integration.
 * Firebase has been removed — verification state is stored in-memory only.
 * TODO: Replace with Supabase backend API call when ready.
 */

const verifications: Record<string, { verified: boolean; chatId: number; updatedAt: Date }> = {};

export async function setPhoneVerified(phoneNumber: string, chatId: number) {
  verifications[phoneNumber] = { verified: true, chatId, updatedAt: new Date() };
}

export function isPhoneVerified(phoneNumber: string): boolean {
  return verifications[phoneNumber]?.verified ?? false;
}

/**
 * Saves a phone-based OTP to the `temp_verifications` table in Supabase.
 * Previously used Firebase Firestore — now fully migrated to Supabase.
 */
export async function saveVerificationCode(phoneNumber: string, code: string): Promise<void> {
  const supabase = createClient();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes
  const { error } = await supabase.from("temp_verifications").upsert({
    id: phoneNumber,
    code,
    expiresAt,
    createdAt: new Date().toISOString(),
  });
  if (error) {
    console.error("[telegram] saveVerificationCode error:", error.message);
    throw error;
  }
}

/**
 * Retrieves and validates a verification code for the given phone number.
 */
export async function verifyCode(phoneNumber: string, inputCode: string): Promise<boolean> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("temp_verifications")
    .select("code, expiresAt")
    .eq("id", phoneNumber)
    .maybeSingle();

  if (error || !data) return false;

  const now = Date.now();
  const expires = new Date(data.expiresAt).getTime();
  if (now > expires) return false;

  if (data.code === inputCode) {
    // Clean up after successful verification
    await supabase.from("temp_verifications").delete().eq("id", phoneNumber);
    return true;
  }
  return false;
}
