
# 🚀 دليل النشر والتشغيل النهائي - فيكس ماركت (Vicks Market)

الموقع الآن مكتمل برمجياً (Production Ready). اتبع الخطوات التالية بدقة لإطلاق الموقع:

## 1️⃣ إعداد قاعدة البيانات (Firebase)
*   أنشئ مشروعاً في [Firebase Console](https://console.firebase.google.com/).
*   **Authentication:** فعل تسجيل الدخول بـ (البريد، جوجل، فيسبوك).
*   **Firestore:** أنشئ قاعدة البيانات في وضع الإنتاج (Production).
*   انسخ إعدادات الـ Web App وضعها في ملف `.env`.

## 2️⃣ كيفية الحصول على مفاتيح التشغيل (Access Tokens)

### 🟢 مفتاح الواتساب (UltraMsg)
1. سجل في [UltraMsg.com](https://ultramsg.com/).
2. اربط رقمك عبر الـ QR Code.
3. انسخ الـ **Token** والـ **Instance ID** وضعهما في `.env`.

### 🔵 مفتاح التليجرام (Telegram Bot)
1. ابحث عن `@BotFather` في تليجرام.
2. أرسل `/newbot` واتبع التعليمات.
3. انسخ الـ **API Token** وضعه في خانة `TELEGRAM_BOT_TOKEN`.

### 📧 باسوورد إرسال الإيميلات (Gmail App Password)
1. ادخل [إعدادات أمان جوجل](https://myaccount.google.com/security).
2. فعل "التحقق بخطوتين".
3. ادخل على "App Passwords" وأنشئ باسوورد جديد للموقع.
4. انسخ الكود (16 حرف) وضعه في `GMAIL_PASS`.

## 3️⃣ التشغيل المحلي (Development)
```bash
npm install        # تثبيت المكتبات
npm run dev        # تشغيل الموقع للتجربة
```

## 4️⃣ النشر العالمي (Deployment)
*   الموقع جاهز للنشر على **Vercel** أو **Firebase App Hosting**.
*   تأكد من إضافة جميع متغيرات البيئة (Environment Variables) في إعدادات المنصة.

**تم التطوير بكل فخر بواسطة إدارة MOM - فيكس ماركت 2024**
