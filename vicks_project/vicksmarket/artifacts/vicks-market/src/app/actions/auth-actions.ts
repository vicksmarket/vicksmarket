
'use server';

import { ReplitConnectors } from '@replit/connectors-sdk';
import nodemailer from 'nodemailer';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

export async function sendOTPTelegram(username: string, code: string): Promise<{ success: boolean; error?: string; needStart?: boolean }> {
  if (!TELEGRAM_BOT_TOKEN) return { success: false, error: 'Telegram not configured' };
  const chatId = username.startsWith('@') ? username : `@${username}`;
  try {
    const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: `🔐 *Vicks Market*\n\nكود التحقق الخاص بك:\n\`${code}\`\n\nصالح لمدة 10 دقائق فقط.`,
        parse_mode: 'Markdown',
      }),
    });
    const data = await res.json();
    if (!data.ok) {
      if (data.error_code === 400) return { success: false, needStart: true, error: 'يجب أن تبدأ محادثة مع البوت أولاً' };
      return { success: false, error: data.description };
    }
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

/**
 * @fileOverview Server Actions للتحقق عبر البريد — مدعوم بـ Resend عبر Replit Connectors.
 */

async function sendViaGmail(to: string, subject: string, html: string): Promise<boolean> {
  const user = process.env.GMAIL_USER || 'vicksmarket@gmail.com';
  const pass = process.env.GMAIL_PASS;
  if (!pass) return false;
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
    await transporter.sendMail({ from: `"Vicks Market" <${user}>`, to, subject, html });
    return true;
  } catch (e: any) {
    console.error('[Gmail SMTP error]', e.message);
    return false;
  }
}

export async function sendOTPEmail(email: string, code: string, type: 'verification' | 'reset') {
  const subject = type === 'verification'
    ? 'كود التحقق الخاص بحسابك في فيكس ماركت'
    : 'كود استعادة كلمة المرور - فيكس ماركت';

  const title = type === 'verification' ? 'مرحباً بك في Vicks Market' : 'استعادة الوصول لحسابك';
  const message = type === 'verification'
    ? 'شكراً لتسجيلك معنا. كود التحقق الخاص بك هو:'
    : 'لقد طلبت إعادة تعيين كلمة المرور. كود التحقق الخاص بك هو:';

  const html = `
    <div style="font-family:Arial,sans-serif;text-align:center;direction:rtl;padding:40px;background:#f8f9fa;">
      <div style="max-width:500px;margin:0 auto;background:#fff;padding:30px;border-radius:40px;border-bottom:8px solid #ff6600;box-shadow:0 10px 30px rgba(0,0,0,0.05);">
        <h2 style="color:#ff6600;margin-bottom:20px;font-weight:900;">${title}</h2>
        <p style="color:#666;font-size:16px;font-weight:bold;">${message}</p>
        <div style="background:#fff5eb;padding:20px;font-size:36px;font-weight:900;letter-spacing:10px;color:#ff6600;display:inline-block;margin:25px 0;border-radius:25px;border:3px dashed #ff6600;">
          ${code}
        </div>
        <p style="color:#999;font-size:11px;margin-top:25px;line-height:1.6;">هذا الكود صالح لمدة 10 دقائق فقط. لا تشارك هذا الكود مع أي أحد.</p>
        <hr style="border:0;border-top:1px solid #eee;margin:30px 0;" />
        <p style="color:#ccc;font-size:10px;font-weight:900;letter-spacing:2px;">VICKS MARKET</p>
      </div>
    </div>`;

  // 1. Try Gmail SMTP (works for ALL emails when GMAIL_PASS is set)
  const gmailOk = await sendViaGmail(email, subject, html);
  if (gmailOk) return { success: true };

  // 2. Fallback: Resend via ReplitConnectors (test mode: vicksmarket@gmail.com only)
  try {
    const connectors = new ReplitConnectors();
    const res = await connectors.proxy('resend', '/emails', {
      method: 'POST',
      body: JSON.stringify({
        from: 'Vicks Market <onboarding@resend.dev>',
        to: [email],
        subject,
        html,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error('[Resend error]', err);
      return { success: false, error: 'فشل إرسال الكود. تأكد من صحة البريد الإلكتروني أو تواصل مع الدعم.' };
    }
    return { success: true };
  } catch (error: any) {
    console.error('[Resend exception]', error);
    return { success: false, error: 'تعذّر الاتصال بخدمة البريد — حاول لاحقاً.' };
  }
}

// إرسال كود عبر الواتساب باستخدام UltraMsg
export async function sendWhatsAppOTP(phone: string, code: string) {
  const instanceId = process.env.ULTRAMSG_INSTANCE_ID || "175694";
  const token = process.env.ULTRAMSG_TOKEN;

  if (!token) {
    console.error("WhatsApp Token not configured in .env");
    return { success: false, error: "WhatsApp system not configured." };
  }

  // تنظيف الرقم ليكون بالتنسيق الدولي الصرف
  const cleanPhone = phone.replace(/\D/g, '');
  
  const url = `https://api.ultramsg.com/${instanceId}/messages/chat`;
  const bodyMessage = `*V Fix Market 🔧*\n\nأهلاً بك يا ملك! كود التحقق الخاص بك هو:\n\n*${code}*\n\nاستخدمه الآن لتفعيل حساب التاجر الموثق. هذا الكود صالح لمدة 10 دقائق فقط.`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        token: token,
        to: cleanPhone,
        body: bodyMessage,
        priority: '1'
      })
    });

    const data = await response.json();
    return { success: !!data.sent || data.sent === "true" };
  } catch (error: any) {
    console.error("Error sending WhatsApp:", error);
    return { success: false, error: error.message };
  }
}
