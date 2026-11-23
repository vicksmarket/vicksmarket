/**
 * Setup constants — migration metadata and bootstrap SQL.
 * NOT a "use server" file; safe to import from both client and server.
 */

export const MIGRATIONS = [
  {
    file: "001_initial_schema.sql",
    title: "المخطط الأساسي",
    description: "الجداول الرئيسية (users, products, stories, comments, conversations, config …) + سياسات RLS",
    keyTables: ["users", "products", "stories", "comments", "conversations", "messages", "config"],
    keyColumns: [] as { table: string; column: string }[],
  },
  {
    file: "002_seller_fields_and_seed.sql",
    title: "حقول التاجر + بيانات تجريبية",
    description: "إضافة sellerImage/phone/telegram/isOnline للمنتجات + 60 منتج تجريبي",
    keyTables: [] as string[],
    keyColumns: [{ table: "products", column: "sellerImage" }],
  },
  {
    file: "003_chat_tables.sql",
    title: "جداول الدردشة",
    description: "owner_chats, owner_chat_messages + سياسات RLS للمحادثات",
    keyTables: ["owner_chats", "owner_chat_messages"],
    keyColumns: [] as { table: string; column: string }[],
  },
  {
    file: "003_dashboard_fields.sql",
    title: "حقول لوحة التحكم",
    description: "إضافة status للمنتجات + فهرس سريع للاستعلامات",
    keyTables: [] as string[],
    keyColumns: [{ table: "products", column: "status" }],
  },
  {
    file: "004_signup_email_otp.sql",
    title: "OTP التسجيل بالبريد",
    description: "جدول temp_verifications_email للتحقق أثناء التسجيل",
    keyTables: ["temp_verifications_email"],
    keyColumns: [] as { table: string; column: string }[],
  },
  {
    file: "005_reset_tokens.sql",
    title: "رموز إعادة تعيين كلمة السر",
    description: "جدول temp_reset_tokens لرموز إعادة تعيين كلمة المرور قصيرة الأمد",
    keyTables: ["temp_reset_tokens"],
    keyColumns: [] as { table: string; column: string }[],
  },
  {
    file: "006_allow_guest_comments.sql",
    title: "تعليقات الزوار",
    description: "السماح للزوار غير المسجلين بنشر التعليقات (تعديل سياسة RLS)",
    keyTables: [] as string[],
    keyColumns: [] as { table: string; column: string }[],
  },
  {
    file: "007_product_images_storage.sql",
    title: "مساحة تخزين صور المنتجات + عدة صور",
    description: "إنشاء bucket عام product-images في Supabase Storage مع سياسات RLS، وإضافة عمود images[] لجدول products لحفظ جميع صور المنتج",
    keyTables: [] as string[],
    keyColumns: [{ table: "products", column: "images" }],
  },
] as const;

export type MigrationDef = (typeof MIGRATIONS)[number];

export interface MigrationStatus {
  file: string;
  applied: boolean;
  missingTables: string[];
  missingColumns: { table: string; column: string }[];
  error?: string;
}

export interface RunResult {
  success: boolean;
  executed: number;
  errors: { statement: string; error: string }[];
  noExecSqlFunction?: boolean;
}

/** Bootstrap SQL — run once in Supabase SQL Editor to enable in-app migrations. */
export const BOOTSTRAP_SQL = `-- Run this ONCE in the Supabase SQL Editor to enable one-click migrations.
-- After running this, all future migrations can be applied from the app.

create or replace function public.exec_sql(sql text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  execute sql;
end;
$$;

-- Restrict to service_role only (bypasses RLS — no public access)
revoke all on function public.exec_sql(text) from public, anon, authenticated;
grant execute on function public.exec_sql(text) to service_role;`;
