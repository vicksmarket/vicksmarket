import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ViolationChecker } from "@/components/ViolationChecker";
import { FirebaseErrorListener } from "@/components/FirebaseErrorListener";
import { VicksAdminReturnButton } from "@/components/VicksAdminReturnButton";
import { ClientLayoutWrapper } from "@/components/ClientLayoutWrapper";
import { PwaInstallBanner } from "@/components/PwaInstallBanner";

export const metadata = {
  title: 'vicksmarket',
  description: 'سوقك المفضل لبيع وشراء المنتجات بضمان فيكس',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap" rel="stylesheet" />

        {/* Favicon & app icons */}
        <link rel="icon" type="image/png" href="/app-logo.png" />
        <link rel="apple-touch-icon" href="/app-logo.png" />
        <link rel="shortcut icon" href="/app-logo.png" />

        <meta name="theme-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="vicksmarket" />
        <link rel="manifest" href="/manifest.json" />

        {/* Google Translate UI elements are always hidden — script loaded on-demand from TranslatePanel */}
        <style dangerouslySetInnerHTML={{ __html: `
          .goog-te-banner-frame, .skiptranslate, #goog-te-ft,
          .goog-te-ftab-float, .goog-te-menu-frame, .goog-te-balloon-frame,
          .goog-te-spinner, .goog-te-gadget-simple, iframe.skiptranslate,
          div#goog-gt-tt, .goog-te-gadget, body > .skiptranslate,
          .VIpgJd-ZVi9od-aZ2wEe-wOHMyf, .VIpgJd-ZVi9od-l4eHX-hSRGPd {
            display: none !important;
            height: 0 !important;
            max-height: 0 !important;
            visibility: hidden !important;
            pointer-events: none !important;
          }
          body { top: 0 !important; margin-top: 0 !important; }
          html { margin-top: 0 !important; }
        ` }} />
      </head>
      <body className="font-cairo antialiased bg-[#F8F9FA] min-h-screen no-scrollbar">
        <ClientLayoutWrapper>
          <PwaInstallBanner />
          <FirebaseErrorListener />
          <ViolationChecker />
          {children}
          <VicksAdminReturnButton />
          <Toaster />
        </ClientLayoutWrapper>
      </body>
    </html>
  );
}
