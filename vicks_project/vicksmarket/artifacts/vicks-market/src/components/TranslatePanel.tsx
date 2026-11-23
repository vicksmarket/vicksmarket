"use client";

import React, { useState, useRef, useEffect } from "react";
import { Languages, ArrowLeftRight, X, Search, RefreshCcw, ChevronDown } from "lucide-react";
import { useTranslate } from "./TranslateContext";
import { cn } from "@/lib/utils";

/* ─── Language list ─────────────────────────────────────────────────────── */
const LANGS = [
  { code: "ar",    flag: "🇸🇦", native: "العربية",    label: "عربي" },
  { code: "en",    flag: "🇺🇸", native: "English",     label: "إنجليزي" },
  { code: "fr",    flag: "🇫🇷", native: "Français",    label: "فرنسي" },
  { code: "es",    flag: "🇪🇸", native: "Español",     label: "إسباني" },
  { code: "de",    flag: "🇩🇪", native: "Deutsch",     label: "ألماني" },
  { code: "it",    flag: "🇮🇹", native: "Italiano",    label: "إيطالي" },
  { code: "pt",    flag: "🇧🇷", native: "Português",   label: "برتغالي" },
  { code: "ru",    flag: "🇷🇺", native: "Русский",     label: "روسي" },
  { code: "zh-CN", flag: "🇨🇳", native: "中文",         label: "صيني" },
  { code: "ja",    flag: "🇯🇵", native: "日本語",       label: "ياباني" },
  { code: "ko",    flag: "🇰🇷", native: "한국어",        label: "كوري" },
  { code: "tr",    flag: "🇹🇷", native: "Türkçe",      label: "تركي" },
  { code: "hi",    flag: "🇮🇳", native: "हिन्दी",       label: "هندي" },
  { code: "bn",    flag: "🇧🇩", native: "বাংলা",        label: "بنغالي" },
  { code: "ur",    flag: "🇵🇰", native: "اردو",         label: "أردو" },
  { code: "fa",    flag: "🇮🇷", native: "فارسی",        label: "فارسي" },
  { code: "id",    flag: "🇮🇩", native: "Indonesia",   label: "إندونيسي" },
  { code: "ms",    flag: "🇲🇾", native: "Melayu",      label: "ملايوي" },
  { code: "th",    flag: "🇹🇭", native: "ภาษาไทย",      label: "تايلاندي" },
  { code: "vi",    flag: "🇻🇳", native: "Tiếng Việt", label: "فيتنامي" },
  { code: "nl",    flag: "🇳🇱", native: "Nederlands",  label: "هولندي" },
  { code: "pl",    flag: "🇵🇱", native: "Polski",      label: "بولندي" },
  { code: "uk",    flag: "🇺🇦", native: "Українська",  label: "أوكراني" },
  { code: "sv",    flag: "🇸🇪", native: "Svenska",     label: "سويدي" },
  { code: "da",    flag: "🇩🇰", native: "Dansk",       label: "دنماركي" },
  { code: "fi",    flag: "🇫🇮", native: "Suomi",       label: "فنلندي" },
  { code: "el",    flag: "🇬🇷", native: "Ελληνικά",    label: "يوناني" },
  { code: "cs",    flag: "🇨🇿", native: "Čeština",     label: "تشيكي" },
  { code: "ro",    flag: "🇷🇴", native: "Română",      label: "روماني" },
  { code: "hu",    flag: "🇭🇺", native: "Magyar",      label: "هنغاري" },
  { code: "he",    flag: "🇮🇱", native: "עברית",       label: "عبري" },
  { code: "sk",    flag: "🇸🇰", native: "Slovenčina",  label: "سلوفاكي" },
  { code: "bg",    flag: "🇧🇬", native: "Български",   label: "بلغاري" },
  { code: "hr",    flag: "🇭🇷", native: "Hrvatski",    label: "كرواتي" },
  { code: "sr",    flag: "🇷🇸", native: "Српски",      label: "صربي" },
  { code: "ka",    flag: "🇬🇪", native: "ქართული",     label: "جورجي" },
  { code: "hy",    flag: "🇦🇲", native: "Հայերեն",     label: "أرميني" },
  { code: "az",    flag: "🇦🇿", native: "Azərbaycan",  label: "أذربيجاني" },
  { code: "kk",    flag: "🇰🇿", native: "Қазақ",       label: "كازاخي" },
  { code: "uz",    flag: "🇺🇿", native: "O'zbek",      label: "أوزبكي" },
  { code: "sw",    flag: "🇰🇪", native: "Kiswahili",   label: "سواحيلي" },
  { code: "am",    flag: "🇪🇹", native: "አማርኛ",        label: "أمهري" },
  { code: "ha",    flag: "🇳🇬", native: "Hausa",       label: "هوسا" },
  { code: "yo",    flag: "🇳🇬", native: "Yorùbá",      label: "يوروبا" },
  { code: "tl",    flag: "🇵🇭", native: "Filipino",    label: "فلبيني" },
  { code: "mn",    flag: "🇲🇳", native: "Монгол",      label: "منغولي" },
  { code: "my",    flag: "🇲🇲", native: "မြန်မာ",       label: "بورمي" },
  { code: "ne",    flag: "🇳🇵", native: "नेपाली",       label: "نيبالي" },
  { code: "pa",    flag: "🇮🇳", native: "ਪੰਜਾਬੀ",       label: "بنجابي" },
  { code: "ta",    flag: "🇮🇳", native: "தமிழ்",         label: "تاميلي" },
  { code: "te",    flag: "🇮🇳", native: "తెలుగు",        label: "تيلوغو" },
  { code: "af",    flag: "🇿🇦", native: "Afrikaans",   label: "أفريكاني" },
  { code: "sq",    flag: "🇦🇱", native: "Shqip",       label: "ألباني" },
  { code: "is",    flag: "🇮🇸", native: "Íslenska",    label: "أيسلندي" },
  { code: "mt",    flag: "🇲🇹", native: "Malti",       label: "مالطي" },
  { code: "eo",    flag: "🌍",   native: "Esperanto",   label: "إسبرانتو" },
];

/* ─── Google Translate helpers ─────────────────────────────────────────── */
function purgeGT() {
  ["#goog-te-ft", ".goog-te-banner-frame", ".skiptranslate",
   ".goog-te-ftab-float", ".goog-te-menu-frame", ".goog-te-balloon-frame",
   ".goog-te-gadget", "body > iframe"].forEach((sel) =>
    document.querySelectorAll(sel).forEach((el) => {
      try { el.parentNode?.removeChild(el); } catch (_) {}
    })
  );
  document.body.style.top = "0";
  document.body.style.marginTop = "0";
}

function loadGT(): Promise<void> {
  return new Promise((resolve) => {
    if ((window as any).google?.translate?.TranslateElement) { resolve(); return; }
    if (document.getElementById("gt-script")) {
      const poll = setInterval(() => {
        if ((window as any).google?.translate?.TranslateElement) { clearInterval(poll); resolve(); }
      }, 100);
      setTimeout(() => { clearInterval(poll); resolve(); }, 4000);
      return;
    }
    (window as any).googleTranslateElementInit = () => {
      if (!document.getElementById("google_translate_element")) {
        const div = document.createElement("div");
        div.id = "google_translate_element";
        div.style.display = "none";
        document.body.appendChild(div);
      }
      new (window as any).google.translate.TranslateElement(
        { pageLanguage: "ar", autoDisplay: false, includedLanguages: "" },
        "google_translate_element"
      );
      resolve();
    };
    const s = document.createElement("script");
    s.id = "gt-script";
    s.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    s.async = true;
    document.head.appendChild(s);
  });
}

async function applyTranslate(from: string, to: string) {
  const val = `/${from}/${to}`;
  document.cookie = `googtrans=${val}; path=/`;
  document.cookie = `googtrans=${val}; path=/; domain=${window.location.hostname}`;
  await loadGT();
  await new Promise((r) => setTimeout(r, 700));
  const sel = document.querySelector<HTMLSelectElement>(".goog-te-combo");
  if (sel) { sel.value = to; sel.dispatchEvent(new Event("change")); }
  else { window.location.reload(); return; }
  purgeGT();
  const iv = setInterval(purgeGT, 200);
  setTimeout(() => clearInterval(iv), 3000);
}

export function quickToggleAREN() {
  const m = document.cookie.match(/googtrans=\/\w+\/(\w+)/);
  const cur = m?.[1] ?? "ar";
  if (cur === "en") {
    document.cookie = "googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    document.cookie = `googtrans=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
    window.location.reload();
  } else {
    applyTranslate("ar", "en");
  }
}

/* ─── Inline language grid ─────────────────────────────────────────────── */
function LangGrid({
  value,
  exclude,
  onSelect,
}: {
  value: string;
  exclude?: string;
  onSelect: (code: string) => void;
}) {
  const [search, setSearch] = useState("");

  const list = LANGS.filter(
    (l) =>
      l.code !== exclude &&
      (l.label.includes(search) ||
        l.native.toLowerCase().includes(search.toLowerCase()) ||
        l.code.includes(search))
  );

  return (
    <div className="bg-white dark:bg-[#1A2332] border-t border-slate-100 dark:border-slate-700">
      {/* Search */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <input
          autoFocus
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث عن لغة..."
          className="flex-1 text-xs bg-transparent outline-none text-slate-800 dark:text-white placeholder:text-slate-400"
          dir="rtl"
        />
        {search && (
          <button onClick={() => setSearch("")}>
            <X className="w-3 h-3 text-slate-400" />
          </button>
        )}
      </div>

      {/* Grid of flags */}
      <div className="max-h-52 overflow-y-auto py-2 px-2">
        <div className="grid grid-cols-4 gap-1.5">
          {list.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => onSelect(l.code)}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-xl transition-all",
                value === l.code
                  ? "bg-orange-500 text-white"
                  : "bg-slate-50 dark:bg-slate-800 active:bg-orange-50 dark:active:bg-slate-700"
              )}
            >
              <span className="text-xl leading-none">{l.flag}</span>
              <span className={cn("text-[9px] font-bold leading-tight text-center",
                value === l.code ? "text-white" : "text-slate-700 dark:text-slate-200"
              )}>{l.label}</span>
            </button>
          ))}
          {list.length === 0 && (
            <p className="col-span-4 text-center text-xs text-slate-400 py-4">لا توجد نتائج</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main TranslatePanel ───────────────────────────────────────────────── */
export function TranslatePanel() {
  const { showTranslate, setShowTranslate } = useTranslate();
  const [from, setFrom] = useState("ar");
  const [to,   setTo]   = useState("en");
  const [picker, setPicker] = useState<null | "from" | "to">(null);
  const [loading, setLoading] = useState(false);

  // Close picker when panel is hidden
  useEffect(() => { if (!showTranslate) setPicker(null); }, [showTranslate]);

  const fromLang = LANGS.find((l) => l.code === from)!;
  const toLang   = LANGS.find((l) => l.code === to)!;

  const handleTranslate = async () => {
    setLoading(true);
    setShowTranslate(false);
    await applyTranslate(from, to);
    setLoading(false);
  };

  const handleReset = () => {
    document.cookie = "googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    document.cookie = `googtrans=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
    window.location.reload();
  };

  if (!showTranslate) return null;

  return (
    <div className="bg-white dark:bg-[#1A2332] border-b border-slate-100 dark:border-slate-700 shadow-sm">
      {/* Row: FROM — swap — TO — ترجم — ✕ */}
      <div className="flex items-center gap-2 px-3 py-2.5" dir="rtl">

        {/* FROM box */}
        <button
          type="button"
          onClick={() => setPicker(picker === "from" ? null : "from")}
          className={cn(
            "flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all",
            picker === "from"
              ? "border-orange-400 bg-orange-50 dark:bg-orange-500/10"
              : "border-transparent bg-slate-100 dark:bg-slate-700"
          )}
        >
          <span className="text-lg leading-none">{fromLang.flag}</span>
          <div className="flex-1 text-right min-w-0">
            <p className="text-[9px] text-slate-400 leading-none">من</p>
            <p className="text-xs font-black text-slate-800 dark:text-white truncate">{fromLang.native}</p>
          </div>
          <ChevronDown className={cn("w-3 h-3 text-slate-400 shrink-0 transition-transform", picker === "from" ? "rotate-180" : "")} />
        </button>

        {/* Swap */}
        <button
          type="button"
          onClick={() => { setFrom(to); setTo(from); setPicker(null); }}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-orange-50 dark:bg-slate-700 active:scale-90 transition-transform shrink-0"
        >
          <ArrowLeftRight className="w-3.5 h-3.5 text-orange-500" />
        </button>

        {/* TO box */}
        <button
          type="button"
          onClick={() => setPicker(picker === "to" ? null : "to")}
          className={cn(
            "flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all",
            picker === "to"
              ? "border-orange-400 bg-orange-50 dark:bg-orange-500/10"
              : "border-transparent bg-slate-100 dark:bg-slate-700"
          )}
        >
          <span className="text-lg leading-none">{toLang.flag}</span>
          <div className="flex-1 text-right min-w-0">
            <p className="text-[9px] text-slate-400 leading-none">إلى</p>
            <p className="text-xs font-black text-slate-800 dark:text-white truncate">{toLang.native}</p>
          </div>
          <ChevronDown className={cn("w-3 h-3 text-slate-400 shrink-0 transition-transform", picker === "to" ? "rotate-180" : "")} />
        </button>

        {/* Translate */}
        <button
          type="button"
          onClick={handleTranslate}
          disabled={loading}
          className="flex items-center gap-1 px-3 py-2 bg-orange-500 active:bg-orange-600 text-white text-[11px] font-black rounded-xl transition-colors disabled:opacity-60 shrink-0"
        >
          <Languages className="w-3 h-3" />
          {loading ? "..." : "ترجم"}
        </button>

        {/* Reset */}
        <button
          type="button"
          onClick={handleReset}
          title="إعادة العربية"
          className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 shrink-0"
        >
          <RefreshCcw className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {/* Close */}
        <button
          type="button"
          onClick={() => setShowTranslate(false)}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 shrink-0"
        >
          <X className="w-3.5 h-3.5 text-slate-500" />
        </button>
      </div>

      {/* Inline language grid — shows directly below the bar */}
      {picker === "from" && (
        <LangGrid
          value={from}
          exclude={to}
          onSelect={(code) => { setFrom(code); setPicker(null); }}
        />
      )}
      {picker === "to" && (
        <LangGrid
          value={to}
          exclude={from}
          onSelect={(code) => { setTo(code); setPicker(null); }}
        />
      )}
    </div>
  );
}
