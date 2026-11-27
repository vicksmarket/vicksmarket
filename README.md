## Hi there 👋

<!--
**vicksmarket/vicksmarket** is a ✨ _special_ ✨ repository because its `README.md` (this file) appears on your GitHub profile.

Here are some ideas to get you started:

- 🔭 I’m currently working on ...
- 🌱 I’m currently learning ...
- 👯 I’m looking to collaborate on ...
- 🤔 I’m looking for help with ...
- 💬 Ask me about ...
- 📫 How to reach me: ...
- 😄 Pronouns: ...
- ⚡ Fun fact: ...
-->
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>VICKS MARKET | فيكس ماركت</title>
<script src="https://cdn.tailwindcss.com"></script>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&family=Inter:wght@500;600;700;800;900&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
<script>
tailwind.config = {
  darkMode: 'class',
  theme: { extend: {
    fontFamily: { sans: ['Cairo', 'Inter', 'sans-serif'] },
    colors: {
      vicks: { orange: '#FF6B00', orangeHover: '#E55A00' },
    }
  }}
};
</script>
<style>
* { font-family: 'Cairo', sans-serif; }
body { background: #F8F9FA; }
.dark body { background: #0F172A; color: #F1F5F9; }
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
.story-ring { background: linear-gradient(135deg, #F97316, #F59E0B, #16A34A); padding: 3px; border-radius: 9999px; }
.story-inner { border: 2px solid #fff; border-radius: 9999px; overflow: hidden; }
.dark .story-inner { border-color: #1E293B; }
@keyframes popIn { from { opacity: 0; transform: translateY(10px) scale(.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
.animate-pop-in { animation: popIn .25s ease; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.fade-in { animation: fadeIn .3s ease; }
body.view-mode { padding-bottom: 0; overflow-x: hidden; }
body.view-mode > #app-root > header,
body.view-mode > #app-root > section[data-main-view] { display: none; }
</style>
</head>
<body class="text-slate-900 antialiased pb-24">
<div id="app-root" class="min-h-screen max-w-5xl mx-auto bg-white dark:bg-slate-900 shadow-sm border-x border-slate-100 dark:border-slate-800">

  <!-- HEADER -->
  <header data-main-view class="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-100 dark:border-slate-800 px-3 sm:px-5 py-2">
    <div class="flex items-center justify-between gap-2">
      <button onclick="resetFilters()" class="flex items-center gap-2.5">
        <div class="w-11 h-11 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm">
          <svg viewBox="0 0 64 64" class="w-8 h-8" fill="none">
            <path d="M23 19V14.5C23 10.4 26.4 7 30.5 7H33.5C37.6 7 41 10.4 41 14.5V19" stroke="#15803D" stroke-width="3.8" stroke-linecap="round"/>
            <path d="M13.5 20.5C13.5 18.8 14.8 17.5 16.5 17.5H47.5C49.2 17.5 50.5 18.8 50.5 20.5L53 52C53.1 53.9 51.7 55.5 49.8 55.5H14.2C12.3 55.5 10.9 53.9 11 52L13.5 20.5Z" fill="#F97316"/>
            <path d="M20 34.5C22.8 41.2 29.8 44.2 37.5 41.6C40.6 40.5 43.1 38.6 44.8 36.2" stroke="#15803D" stroke-width="4.2" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="leading-none flex items-baseline gap-1.5" dir="ltr">
          <span class="font-black text-lg text-slate-900 dark:text-white">VICKS</span>
          <span class="font-extrabold text-sm text-orange-500">MARKET</span>
        </div>
      </button>
      <div class="flex items-center gap-2.5">
        <button onclick="toggleSearchBar()" class="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-300 flex items-center justify-center" aria-label="بحث">
          <i class="fa-solid fa-magnifying-glass text-[15px]"></i>
        </button>
        <button onclick="toggleDark()" class="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-300 flex items-center justify-center" aria-label="الوضع الليلي">
          <i id="theme-icon" class="fa-regular fa-moon text-[15px]"></i>
        </button>
        <button onclick="openDashboard()" class="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-300 flex items-center justify-center" aria-label="حسابي">
          <i class="fa-regular fa-user text-[15px]"></i>
        </button>
      </div>
    </div>

    <div id="search-bar" class="hidden mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 animate-pop-in">
      <div class="flex items-center gap-2">
        <div class="relative flex-1">
          <input id="search-input" type="text" oninput="handleSearch(this.value)" placeholder="ابحث عن منتج..." class="w-full h-10 pr-9 pl-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-orange-500" />
          <i class="fa-solid fa-magnifying-glass text-slate-400 text-xs absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"></i>
          <button id="clear-search" onclick="clearSearch()" class="hidden w-5 h-5 rounded-full bg-slate-300 text-white text-[10px] items-center justify-center absolute left-2.5 top-1/2 -translate-y-1/2">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <button onclick="document.getElementById('gallery-input').click()" class="w-10 h-10 rounded-full bg-orange-50 text-orange-600 border border-orange-200 flex items-center justify-center" title="رفع صورة">
          <i class="fa-solid fa-plus text-sm"></i>
        </button>
        <button onclick="document.getElementById('camera-input').click()" class="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center" title="الكاميرا">
          <i class="fa-solid fa-camera text-sm"></i>
        </button>
      </div>
      <input type="file" id="gallery-input" accept="image/*" class="hidden" onchange="handleImageSearch(event)" />
      <input type="file" id="camera-input" accept="image/*" capture="environment" class="hidden" onchange="handleImageSearch(event)" />
      <div id="visual-preview" class="hidden mt-2 p-2 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-between gap-2">
        <div class="flex items-center gap-2 min-w-0">
          <img id="visual-thumb" src="" class="w-10 h-10 rounded-xl object-cover border border-orange-300" />
          <div class="min-w-0">
            <p id="visual-status" class="text-xs font-black text-slate-800 dark:text-slate-100">جاري المطابقة...</p>
            <p class="text-[11px] font-bold text-orange-600">البحث البصري</p>
          </div>
        </div>
        <button onclick="clearVisual()" class="px-2.5 py-1 rounded-full bg-white text-slate-600 text-[11px] font-extrabold border border-slate-200">إلغاء ×</button>
      </div>
    </div>

    <div id="active-filter" class="hidden mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
      <div class="flex items-center gap-1.5 font-bold text-slate-600">
        <i class="fa-solid fa-filter text-orange-500"></i>
        <span id="active-filter-text">فلتر</span>
      </div>
      <button onclick="resetFilters()" class="px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 font-extrabold">إظهار الكل ×</button>
    </div>
  </header>

  <section data-main-view aria-label="التصنيفات" class="px-3 sm:px-5 pt-3 pb-2 border-b border-slate-100 dark:border-slate-800">
    <div id="categories" class="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1"></div>
  </section>

  <section data-main-view aria-label="قصص البائعين" class="px-3 sm:px-5 pt-3.5 pb-3 border-b border-slate-100 dark:border-slate-800">
    <div id="stories" class="flex items-start gap-4 overflow-x-auto no-scrollbar py-1"></div>
  </section>

  <main data-main-view id="storefronts" class="divide-y divide-slate-100 dark:divide-slate-800"></main>

  <!-- AUTH -->
  <section id="auth-view" class="hidden min-h-dvh bg-slate-50 dark:bg-slate-950">
    <header class="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-5 py-3">
      <div class="max-w-4xl mx-auto flex items-center justify-between">
        <button onclick="closeAuth()" class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white">
            <i class="fa-solid fa-bag-shopping"></i>
          </div>
          <div dir="ltr" class="flex items-baseline gap-1">
            <span class="font-black text-lg text-slate-900 dark:text-white">VICKS</span>
            <span class="font-black text-sm text-orange-500">MARKET</span>
          </div>
        </button>
        <button onclick="closeAuth()" class="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold">
          <i class="fa-solid fa-arrow-right ml-1"></i> العودة
        </button>
      </div>
    </header>

    <div class="flex items-center justify-center p-4 min-h-[calc(100vh-70px)]">
      <div class="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">

        <div id="auth-signin" class="auth-panel">
          <h1 class="text-2xl font-black mb-1">تسجيل الدخول</h1>
          <p class="text-sm text-slate-500 mb-5">ادخل بياناتك للوصول لحسابك</p>
          <form onsubmit="handleSignin(event)" class="space-y-3">
            <div>
              <label class="block text-xs font-bold mb-1">البريد الإلكتروني</label>
              <input type="email" id="signin-email" required class="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold focus:outline-none focus:border-orange-500" placeholder="name@example.com" />
            </div>
            <div>
              <label class="block text-xs font-bold mb-1">كلمة المرور</label>
              <input type="password" id="signin-pass" required class="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold focus:outline-none focus:border-orange-500" placeholder="••••••••" />
            </div>
            <button type="button" onclick="switchAuth('forgot')" class="text-xs text-orange-500 font-bold">نسيت كلمة المرور؟</button>
            <button type="submit" class="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm">تسجيل الدخول</button>
          </form>
          <div class="my-5 flex items-center gap-3 text-xs text-slate-400">
            <div class="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
            <span>أو</span>
            <div class="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <button onclick="socialLogin('Google')" class="py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800">
              <i class="fa-brands fa-google text-red-500"></i> Google
            </button>
            <button onclick="socialLogin('Apple')" class="py-2.5 rounded-xl bg-black text-white font-bold text-xs flex items-center justify-center gap-2">
              <i class="fa-brands fa-apple"></i> Apple
            </button>
          </div>
          <p class="text-center text-xs text-slate-500 mt-4">ليس لديك حساب؟ <button onclick="switchAuth('signup')" class="text-orange-500 font-bold">إنشاء حساب</button></p>
        </div>

        <div id="auth-signup" class="auth-panel hidden">
          <h1 class="text-2xl font-black mb-1">إنشاء حساب</h1>
          <p class="text-sm text-slate-500 mb-5">أنشئ حسابك لبدء إدارة متجرك</p>
          <form onsubmit="handleSignup(event)" class="space-y-3">
            <div>
              <label class="block text-xs font-bold mb-1">اسم المتجر</label>
              <input type="text" id="signup-store" required class="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold focus:outline-none focus:border-orange-500" placeholder="متجر الأمل" />
            </div>
            <div>
              <label class="block text-xs font-bold mb-1">البريد الإلكتروني</label>
              <input type="email" id="signup-email" required class="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold focus:outline-none focus:border-orange-500" placeholder="name@example.com" />
            </div>
            <div>
              <label class="block text-xs font-bold mb-1">رقم الهاتف</label>
              <input type="tel" id="signup-phone" required dir="ltr" class="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold focus:outline-none focus:border-orange-500" placeholder="+20 1012345678" />
            </div>
            <div>
              <label class="block text-xs font-bold mb-1">كلمة المرور</label>
              <input type="password" id="signup-pass" required oninput="updateStrength(this.value)" class="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold focus:outline-none focus:border-orange-500" placeholder="8 أحرف على الأقل" />
              <div class="flex gap-1 mt-1.5">
                <div id="str1" class="flex-1 h-1 rounded-full bg-slate-200"></div>
                <div id="str2" class="flex-1 h-1 rounded-full bg-slate-200"></div>
                <div id="str3" class="flex-1 h-1 rounded-full bg-slate-200"></div>
                <div id="str4" class="flex-1 h-1 rounded-full bg-slate-200"></div>
              </div>
              <p id="str-text" class="text-[10px] text-slate-400 mt-1">لم تُدخل بعد</p>
            </div>
            <div class="p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" id="captcha-check" onchange="verifyCaptcha(this.checked)" class="w-5 h-5 accent-orange-500" />
                <span class="text-sm font-bold">أنا لست روبوت</span>
              </label>
              <div class="text-green-600 text-xs font-bold flex flex-col items-center">
                <i class="fa-solid fa-shield-halved text-lg"></i>
                <span>VICKS</span>
              </div>
            </div>
            <button type="submit" class="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm">إنشاء الحساب</button>
          </form>
          <p class="text-center text-xs text-slate-500 mt-4">لديك حساب؟ <button onclick="switchAuth('signin')" class="text-orange-500 font-bold">تسجيل الدخول</button></p>
        </div>

        <div id="auth-forgot" class="auth-panel hidden">
          <h1 class="text-2xl font-black mb-1">استعادة كلمة المرور</h1>
          <p class="text-sm text-slate-500 mb-5">أدخل بريدك لإرسال رمز التحقق</p>
          <form onsubmit="handleForgot(event)" class="space-y-3">
            <div>
              <label class="block text-xs font-bold mb-1">البريد الإلكتروني</label>
              <input type="email" id="forgot-email" required class="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold focus:outline-none focus:border-orange-500" placeholder="name@example.com" />
            </div>
            <button type="submit" class="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm">إرسال رمز التحقق</button>
          </form>
          <p class="text-center text-xs text-slate-500 mt-4"><button onclick="switchAuth('signin')" class="text-orange-500 font-bold">← العودة لتسجيل الدخول</button></p>
        </div>

      </div>
    </div>
  </section>

  <!-- DASHBOARD -->
  <section id="dashboard-view" class="hidden min-h-dvh bg-slate-50 dark:bg-slate-950">
    <header class="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-2">
      <div class="max-w-5xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-2">
          <button onclick="closeDashboard()" class="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <i class="fa-solid fa-arrow-right text-xs"></i>
          </button>
          <div>
            <div dir="ltr" class="flex items-baseline gap-1">
              <span class="font-black text-base text-slate-900 dark:text-white">VICKS</span>
              <span class="font-black text-sm text-orange-500">MARKET</span>
            </div>
            <p id="db-store-name" class="text-[10px] font-bold text-slate-500">متجري</p>
          </div>
        </div>
        <button onclick="document.getElementById('drawer').classList.toggle('translate-x-full')" class="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <i class="fa-solid fa-bars"></i>
        </button>
      </div>
    </header>

    <div id="drawer" class="fixed top-0 right-0 h-full w-72 bg-white dark:bg-slate-900 z-50 translate-x-full transition-transform shadow-2xl p-5 overflow-y-auto">
      <div class="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
        <span class="font-black">القائمة</span>
        <button onclick="document.getElementById('drawer').classList.add('translate-x-full')" class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <nav class="space-y-1">
        <button onclick="switchTab('overview');closeDrawer()" class="w-full py-2.5 px-4 rounded-xl text-sm font-bold text-right hover:bg-orange-50 hover:text-orange-500 flex items-center gap-3"><i class="fa-solid fa-house w-5 text-center"></i> الرئيسية</button>
        <button onclick="switchTab('products');closeDrawer()" class="w-full py-2.5 px-4 rounded-xl text-sm font-bold text-right hover:bg-orange-50 flex items-center gap-3"><i class="fa-solid fa-box w-5 text-center text-emerald-500"></i> المنتجات</button>
        <button onclick="switchTab('notifications');closeDrawer()" class="w-full py-2.5 px-4 rounded-xl text-sm font-bold text-right hover:bg-orange-50 flex items-center gap-3"><i class="fa-solid fa-bell w-5 text-center text-blue-500"></i> الإشعارات</button>
        <button onclick="switchTab('complaints');closeDrawer()" class="w-full py-2.5 px-4 rounded-xl text-sm font-bold text-right hover:bg-orange-50 flex items-center gap-3"><i class="fa-solid fa-circle-exclamation w-5 text-center text-rose-500"></i> الشكاوى</button>
        <button onclick="switchTab('profile');closeDrawer()" class="w-full py-2.5 px-4 rounded-xl text-sm font-bold text-right hover:bg-orange-50 flex items-center gap-3"><i class="fa-solid fa-id-card w-5 text-center text-orange-500"></i> البيانات</button>
        <button onclick="toggleDark()" class="w-full py-2.5 px-4 rounded-xl text-sm font-bold text-right hover:bg-orange-50 flex items-center gap-3"><i class="fa-solid fa-circle-half-stroke w-5 text-center text-indigo-500"></i> الوضع الليلي</button>
      </nav>
      <div class="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <label class="w-full py-2.5 rounded-xl bg-orange-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer">
          <i class="fa-solid fa-camera"></i> تغيير الصورة
          <input type="file" accept="image/*" onchange="handleAvatar(event)" class="hidden" />
        </label>
        <button onclick="openEditProfile()" class="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs flex items-center justify-center gap-2"><i class="fa-solid fa-pen"></i> تعديل البيانات</button>
        <button onclick="openVip()" class="w-full py-2.5 rounded-xl bg-gradient-to-l from-amber-500 to-yellow-400 text-black font-black text-xs"><i class="fa-solid fa-crown"></i> VIP</button>
        <button onclick="logout()" class="w-full py-2.5 rounded-xl bg-red-50 text-red-600 font-bold text-xs flex items-center justify-center gap-2"><i class="fa-solid fa-arrow-right-from-bracket"></i> تسجيل الخروج</button>
      </div>
    </div>

    <div class="max-w-5xl mx-auto px-3 sm:px-4 py-3 space-y-3">
      <div class="hidden md:flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <button onclick="switchTab('overview')" data-tab="overview" class="tab-pill px-4 py-2 rounded-xl text-sm font-bold bg-orange-500 text-white">الرئيسية</button>
        <button onclick="switchTab('products')" data-tab="products" class="tab-pill px-4 py-2 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300">المنتجات</button>
        <button onclick="switchTab('notifications')" data-tab="notifications" class="tab-pill px-4 py-2 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300">الإشعارات</button>
        <button onclick="switchTab('complaints')" data-tab="complaints" class="tab-pill px-4 py-2 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300">الشكاوى</button>
        <button onclick="switchTab('profile')" data-tab="profile" class="tab-pill px-4 py-2 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300">البيانات</button>
      </div>

      <section id="tab-overview" class="tab-section space-y-3">
        <div class="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-200 dark:border-slate-800">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-bold text-slate-500">النقاط</span>
            <div class="flex items-center gap-2">
              <span id="db-points" class="text-base font-black text-orange-500">120</span>
              <button onclick="addPoints(50)" class="w-6 h-6 rounded-full bg-orange-500 text-white text-xs">+</button>
            </div>
          </div>
          <div class="text-center">
            <img id="db-avatar" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200" class="w-28 h-28 rounded-full object-cover mx-auto shadow-md" />
            <h2 id="db-name" class="text-xl font-black mt-2">متجر فيكس</h2>
            <p id="db-id" class="text-xs font-bold text-slate-500 mt-1" dir="ltr">ID: 6655001122</p>
            <p id="db-phone" class="text-xs font-semibold text-slate-500" dir="ltr">+201012345678</p>
            <p id="db-email" class="text-xs font-semibold text-slate-500" dir="ltr">test@vicks.com</p>
            <p id="db-bio" class="mt-2 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-2xl">وصلتنا دفعة جديدة — تغليف هدايا مجاني.</p>
          </div>
          <div class="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
            <div><div id="stat-products" class="text-lg font-black">6</div><div class="text-[10px] font-bold text-slate-500">منتجات</div></div>
            <div><div class="text-lg font-black">175</div><div class="text-[10px] font-bold text-slate-500">إعجابات</div></div>
            <div><div id="stat-stories" class="text-lg font-black text-emerald-500">4</div><div class="text-[10px] font-bold text-slate-500">ستوري</div></div>
            <div><div class="text-lg font-black text-rose-500">2</div><div class="text-[10px] font-bold text-slate-500">شكاوى</div></div>
          </div>
        </div>

        <div class="bg-white dark:bg-slate-900 rounded-3xl p-3 shadow-sm border border-slate-200 dark:border-slate-800">
          <h3 class="text-sm font-black mb-2">الستوري</h3>
          <div id="db-stories" class="flex gap-3 overflow-x-auto no-scrollbar py-1"></div>
        </div>

        <div class="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border border-slate-200 dark:border-slate-800">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-black">المنتجات</h3>
            <div class="flex gap-1">
              <button onclick="openProductModal()" class="px-3 py-1.5 rounded-full bg-orange-500 text-white text-xs font-bold"><i class="fa-solid fa-plus"></i> إضافة</button>
            </div>
          </div>
          <div id="db-products" class="grid grid-cols-2 gap-2"></div>
        </div>
      </section>

      <section id="tab-products" class="tab-section hidden space-y-3">
        <div class="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border border-slate-200 dark:border-slate-800">
          <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h2 class="text-lg font-black">إدارة المنتجات</h2>
            <button onclick="openProductModal()" class="px-4 py-2 rounded-full bg-orange-500 text-white font-bold text-xs"><i class="fa-solid fa-plus"></i> إضافة منتج</button>
          </div>
          <div class="relative mb-3">
            <input type="text" id="product-search" oninput="renderProducts()" placeholder="ابحث..." class="w-full px-4 py-2.5 pr-10 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold border border-slate-200 dark:border-slate-700" />
            <i class="fa-solid fa-magnifying-glass absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
          </div>
          <div class="flex gap-1.5 overflow-x-auto no-scrollbar mb-3">
            <button onclick="setProductFilter('all')" data-pcat="all" class="pcat-btn px-3 py-1.5 rounded-full text-xs font-extrabold bg-orange-500 text-white">الكل</button>
            <button onclick="setProductFilter('electronics')" data-pcat="electronics" class="pcat-btn px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800">إلكترونيات</button>
            <button onclick="setProductFilter('fashion')" data-pcat="fashion" class="pcat-btn px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800">أزياء</button>
            <button onclick="setProductFilter('perfume')" data-pcat="perfume" class="pcat-btn px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800">عطور</button>
            <button onclick="setProductFilter('home')" data-pcat="home" class="pcat-btn px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800">منزل</button>
          </div>
          <div id="all-products" class="grid grid-cols-2 gap-2"></div>
        </div>
      </section>

      <section id="tab-notifications" class="tab-section hidden space-y-3">
        <div class="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border border-slate-200 dark:border-slate-800">
          <h2 class="text-lg font-black mb-3">الإشعارات</h2>
          <div id="notifications-list" class="space-y-2"></div>
        </div>
      </section>

      <section id="tab-complaints" class="tab-section hidden space-y-3 pb-24">
        <div class="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border border-slate-200 dark:border-slate-800">
          <h2 class="text-lg font-black mb-1">شكاوى التجار — شات مع الإدارة</h2>
          <p class="text-xs text-slate-500">محادثة مباشرة مع أدمن الموقع</p>
        </div>
        <div id="complaints-list" class="space-y-2"></div>
        <div class="fixed bottom-0 inset-x-0 z-40 p-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-t border-slate-200 dark:border-slate-800">
          <div class="max-w-4xl mx-auto">
            <div id="attachment-bar" class="hidden mb-2 px-3 py-2 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-between text-xs">
              <span id="attachment-label" class="font-bold truncate"></span>
              <button onclick="clearAttachment()" class="text-rose-600"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <form onsubmit="sendMessage(event)" class="flex items-center gap-1.5">
              <label class="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center cursor-pointer">
                <i class="fa-regular fa-image text-xs"></i>
                <input type="file" accept="image/*" onchange="handleAttachment(event, 'image')" class="hidden" />
              </label>
              <label class="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center cursor-pointer">
                <i class="fa-solid fa-video text-xs"></i>
                <input type="file" accept="video/*" onchange="handleAttachment(event, 'video')" class="hidden" />
              </label>
              <button type="button" id="record-btn" onclick="toggleRecording()" class="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <i class="fa-solid fa-microphone text-xs"></i>
              </button>
              <input type="text" id="message-input" placeholder="اكتب رسالتك..." class="flex-1 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold border border-slate-200 dark:border-slate-700" />
              <button type="submit" class="w-9 h-9 rounded-full bg-orange-500 text-white flex items-center justify-center"><i class="fa-solid fa-paper-plane text-xs"></i></button>
            </form>
          </div>
        </div>
      </section>

      <section id="tab-profile" class="tab-section hidden space-y-3">
        <div class="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-200 dark:border-slate-800">
          <h2 class="text-lg font-black mb-3">البيانات الشخصية</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div class="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl"><div class="text-slate-500 font-bold mb-1">اسم المتجر</div><div id="p-name" class="font-black">—</div></div>
            <div class="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl"><div class="text-slate-500 font-bold mb-1">ID</div><div id="p-id" class="font-black" dir="ltr">—</div></div>
            <div class="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl"><div class="text-slate-500 font-bold mb-1">البريد</div><div id="p-email" class="font-black" dir="ltr">—</div></div>
            <div class="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl"><div class="text-slate-500 font-bold mb-1">الهاتف</div><div id="p-phone" class="font-black" dir="ltr">—</div></div>
            <div class="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl sm:col-span-2"><div class="text-slate-500 font-bold mb-1">النبذة</div><div id="p-bio" class="font-bold">—</div></div>
          </div>
          <button onclick="openEditProfile()" class="w-full mt-3 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-xs"><i class="fa-solid fa-pen"></i> تعديل</button>
        </div>
      </section>
    </div>
  </section>

  <!-- MODALS -->
  <div id="product-modal" class="hidden fixed inset-0 z-[60] bg-black/60 items-center justify-center p-4">
    <div class="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-5 animate-pop-in">
      <div class="flex justify-between mb-3"><h3 class="font-black">إضافة منتج</h3><button onclick="closeModal('product-modal')" class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800"><i class="fa-solid fa-xmark"></i></button></div>
      <form onsubmit="saveProduct(event)" class="space-y-2.5 text-xs">
        <input id="pm-title" required placeholder="اسم المنتج" class="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold" />
        <input id="pm-price" required type="number" placeholder="السعر" class="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold" />
        <input id="pm-oldprice" type="number" placeholder="السعر قبل الخصم (اختياري)" class="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold" />
        <select id="pm-category" class="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold">
          <option value="electronics">إلكترونيات</option>
          <option value="fashion">أزياء</option>
          <option value="perfume">عطور</option>
          <option value="home">منزل</option>
        </select>
        <input id="pm-image" type="url" placeholder="رابط الصورة" class="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold" dir="ltr" />
        <label class="flex items-center gap-2 px-3 py-2 rounded-xl bg-orange-50 text-orange-600 font-bold"><input id="pm-offer" type="checkbox" class="w-4 h-4 accent-orange-500" /> عرض 🔥</label>
        <button type="submit" class="w-full py-2.5 rounded-xl bg-orange-500 text-white font-extrabold">حفظ</button>
      </form>
    </div>
  </div>

  <div id="edit-modal" class="hidden fixed inset-0 z-[60] bg-black/60 items-center justify-center p-4">
    <div class="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-5 animate-pop-in">
      <div class="flex justify-between mb-3"><h3 class="font-black">تعديل البيانات</h3><button onclick="closeModal('edit-modal')" class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800"><i class="fa-solid fa-xmark"></i></button></div>
      <form onsubmit="saveProfile(event)" class="space-y-2.5 text-xs">
        <input id="em-name" required placeholder="اسم المتجر" class="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold" />
        <input id="em-email" type="email" required placeholder="البريد" class="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold" dir="ltr" />
        <input id="em-phone" type="tel" required placeholder="الهاتف" class="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold" dir="ltr" />
        <textarea id="em-bio" rows="3" placeholder="نبذة" class="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"></textarea>
        <button type="submit" class="w-full py-2.5 rounded-xl bg-orange-500 text-white font-extrabold">حفظ</button>
      </form>
    </div>
  </div>

  <div id="vip-modal" class="hidden fixed inset-0 z-[60] bg-black/60 items-center justify-center p-4">
    <div class="bg-gradient-to-br from-amber-500 to-yellow-400 rounded-3xl max-w-md w-full p-6 text-center animate-pop-in">
      <i class="fa-solid fa-crown text-5xl mb-3"></i>
      <h3 class="text-2xl font-black mb-2">عضوية VIP</h3>
      <p class="text-sm font-bold mb-3">مزايا حصرية لتجارك المميزين</p>
      <ul class="bg-white/30 rounded-2xl p-4 text-right text-xs font-bold space-y-1 mb-3">
        <li>✓ ظهور مميز في البحث</li><li>✓ عمولة أقل</li><li>✓ دعم 24/7</li><li>✓ تحليلات متقدمة</li>
      </ul>
      <button onclick="closeModal('vip-modal')" class="w-full py-2.5 rounded-xl bg-black text-amber-400 font-black">اشترك — 99 ج.م/شهر</button>
    </div>
  </div>

  <button onclick="openAuth()" class="fixed bottom-5 left-5 z-30 w-14 h-14 rounded-full bg-orange-500 text-white shadow-xl flex items-center justify-center">
    <i class="fa-solid fa-headset text-xl"></i>
  </button>

</div>

<script>
// STATE
const state = {
  dark: false,
  search: '',
  category: 'all',
  productFilter: 'all',
  currentTab: 'overview',
  merchant: { name: 'متجر فيكس', id: '6655001122', email: 'test@vicks.com', phone: '+201012345678', bio: 'وصلتنا دفعة جديدة — تغليف هدايا مجاني.', points: 120, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200' },
  products: [
    { id: 1, title: 'آيفون 15 برو', price: 52000, oldPrice: 58000, category: 'electronics', offer: true, image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400' },
    { id: 2, title: 'AirPods Pro', price: 8500, oldPrice: 9500, category: 'electronics', offer: true, image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400' },
    { id: 3, title: 'عطر Bleu de Chanel', price: 3200, oldPrice: 0, category: 'perfume', offer: false, image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400' },
    { id: 4, title: 'Apple Watch Ultra', price: 18000, oldPrice: 19500, category: 'electronics', offer: true, image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=400' },
    { id: 5, title: 'تيشيرت قطن', price: 350, oldPrice: 0, category: 'fashion', offer: false, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400' },
    { id: 6, title: 'خلاط 1500W', price: 1800, oldPrice: 2200, category: 'home', offer: true, image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=400' }
  ],
  stories: [
    { id: 1, name: 'عروض', image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=200' },
    { id: 2, name: 'جديد', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200' },
    { id: 3, name: 'خصومات', image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=200' },
    { id: 4, name: 'هدايا', image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=200' }
  ],
  categories: [
    { id: 'all', label: 'الكل', icon: 'fa-border-all' },
    { id: 'electronics', label: 'إلكترونيات', icon: 'fa-laptop' },
    { id: 'fashion', label: 'أزياء', icon: 'fa-shirt' },
    { id: 'perfume', label: 'عطور', icon: 'fa-spray-can' },
    { id: 'home', label: 'منزل', icon: 'fa-couch' },
    { id: 'offers', label: 'عروض', icon: 'fa-fire' }
  ],
  notifications: [
    { id: 1, type: 'whatsapp', title: 'رسالة واتساب', body: 'استفسار عن آيفون 15', time: 'منذ 5 دقائق' },
    { id: 2, type: 'notification', title: 'طلب جديد', body: 'طلب #12345', time: 'منذ 20 دقيقة' },
    { id: 3, type: 'notification', title: 'تقييم جديد', body: 'عميل قيّم بـ 5 نجوم ⭐', time: 'منذ ساعة' }
  ],
  complaints: [
    { id: 1, from: 'admin', text: 'أهلاً بك، كيف نساعدك؟', time: '10:00' },
    { id: 2, from: 'merchant', text: 'مشكلة في ظهور المنتجات', time: '10:05' }
  ],
  attachment: null,
  recording: false,
  mediaRecorder: null,
  audioChunks: []
};

// PERSISTENCE
function saveState() {
  try {
    localStorage.setItem('vk-products', JSON.stringify(state.products));
    localStorage.setItem('vk-merchant', JSON.stringify(state.merchant));
    localStorage.setItem('vk-complaints', JSON.stringify(state.complaints));
  } catch (e) {
    console.warn('Save failed (storage full?)', e);
  }
}

function loadState() {
  try {
    const p = localStorage.getItem('vk-products');
    if (p) { const parsed = JSON.parse(p); if (Array.isArray(parsed)) state.products = parsed; }
    const m = localStorage.getItem('vk-merchant');
    if (m) Object.assign(state.merchant, JSON.parse(m));
    const c = localStorage.getItem('vk-complaints');
    if (c) { const parsed = JSON.parse(c); if (Array.isArray(parsed) && parsed.length) state.complaints = parsed; }
  } catch (e) {
    console.warn('Load failed', e);
  }
}

// HELPERS
function esc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

function toast(msg, type = 'info') {
  const colors = { success: 'bg-emerald-500', error: 'bg-rose-500', info: 'bg-slate-800' };
  const el = document.createElement('div');
  el.className = `fixed top-4 left-1/2 -translate-x-1/2 z-[200] px-4 py-2 rounded-full text-white text-xs font-bold shadow-lg ${colors[type] || colors.info} animate-pop-in`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => { el.style.transition = 'opacity .3s'; el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 1800);
}

function openModal(id) { const el = document.getElementById(id); el.classList.remove('hidden'); el.classList.add('flex'); }
function closeModal(id) { const el = document.getElementById(id); el.classList.add('hidden'); el.classList.remove('flex'); }

// DARK MODE
function toggleDark() {
  state.dark = !state.dark;
  document.documentElement.classList.toggle('dark', state.dark);
  document.getElementById('theme-icon').className = state.dark ? 'fa-regular fa-sun text-[15px]' : 'fa-regular fa-moon text-[15px]';
  localStorage.setItem('vk-dark', state.dark ? '1' : '0');
}

// SEARCH
function toggleSearchBar() {
  const b = document.getElementById('search-bar');
  b.classList.toggle('hidden');
  if (!b.classList.contains('hidden')) setTimeout(() => document.getElementById('search-input').focus(), 100);
}

function handleSearch(v) {
  state.search = v.trim();
  document.getElementById('clear-search').classList.toggle('hidden', !v);
  document.getElementById('clear-search').classList.toggle('flex', !!v);
  renderStorefronts();
}

function clearSearch() {
  document.getElementById('search-input').value = '';
  state.search = '';
  document.getElementById('clear-search').classList.add('hidden');
  document.getElementById('clear-search').classList.remove('flex');
  renderStorefronts();
}

function handleImageSearch(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    document.getElementById('visual-thumb').src = ev.target.result;
    document.getElementById('visual-preview').classList.remove('hidden');
    document.getElementById('visual-status').textContent = 'جاري التحليل...';
    setTimeout(() => {
      document.getElementById('visual-status').textContent = 'تم التحليل — عرض المنتجات المقترحة ✓';
      state.search = '';
      state.category = 'all';
      renderCategories();
      renderStorefronts();
    }, 1200);
  };
  reader.readAsDataURL(file);
  e.target.value = ''; // fix: allow re-uploading same image
}

function clearVisual() {
  document.getElementById('visual-preview').classList.add('hidden');
  state.search = '';
  renderStorefronts();
}

function resetFilters() {
  state.search = '';
  state.category = 'all';
  document.getElementById('search-input').value = '';
  document.getElementById('active-filter').classList.add('hidden');
  renderCategories();
  renderStorefronts();
}

// CATEGORIES
function renderCategories() {
  const c = document.getElementById('categories');
  c.innerHTML = state.categories.map(cat => `
    <button onclick="selectCategory('${cat.id}')" class="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-extrabold whitespace-nowrap shrink-0 ${state.category === cat.id ? 'bg-orange-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}">
      <i class="fa-solid ${cat.icon} text-[11px]"></i><span>${cat.label}</span>
    </button>`).join('');

  const bar = document.getElementById('active-filter');
  const txt = document.getElementById('active-filter-text');
  if (state.category !== 'all' || state.search) {
    const cat = state.categories.find(c => c.id === state.category);
    txt.textContent = state.search ? `بحث: ${state.search}` : (cat?.label || '');
    bar.classList.remove('hidden');
  } else {
    bar.classList.add('hidden');
  }
}

function selectCategory(id) { state.category = id; renderCategories(); renderStorefronts(); }

// STORIES
function renderStories() {
  const c = document.getElementById('stories');
  c.innerHTML = state.stories.map(s => `
    <div class="flex flex-col items-center gap-1.5 shrink-0">
      <div class="story-ring w-16 h-16 sm:w-20 sm:h-20">
        <div class="story-inner w-full h-full bg-white dark:bg-slate-900">
          <img src="${esc(s.image)}" class="w-full h-full object-cover" />
        </div>
      </div>
      <span class="text-[11px] font-extrabold truncate max-w-[70px]">${esc(s.name)}</span>
    </div>`).join('');
}

// STOREFRONTS
function renderStorefronts() {
  const c = document.getElementById('storefronts');
  let products = [...state.products];
  const q = state.search.toLowerCase();
  if (q) products = products.filter(p => p.title.toLowerCase().includes(q));
  if (state.category === 'offers') products = products.filter(p => p.offer);
  else if (state.category !== 'all') products = products.filter(p => p.category === state.category);
  if (!products.length) {
    c.innerHTML = '<div class="text-center py-16"><i class="fa-solid fa-search text-5xl text-slate-300 mb-3"></i><p class="font-bold text-slate-500">لا توجد منتجات</p></div>';
    return;
  }
  c.innerHTML = `<section class="p-4">
    <h2 class="text-base font-black mb-3"><span class="inline-block w-1.5 h-5 bg-orange-500 rounded-full ml-1"></span> المنتجات (${products.length})</h2>
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">${products.map(productCard).join('')}</div>
  </section>`;
}

function productCard(p) {
  return `<div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition">
    <div class="relative aspect-square bg-slate-100 dark:bg-slate-800">
      <img src="${esc(p.image)}" class="w-full h-full object-cover" onerror="this.src='https://placehold.co/400?text=No+Image'" />
      ${p.offer ? '<span class="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black">خصم 🔥</span>' : ''}
    </div>
    <div class="p-2">
      <h3 class="text-[11px] font-extrabold line-clamp-1">${esc(p.title)}</h3>
      <div class="flex items-baseline gap-1 mt-1">
        <span class="text-sm font-black text-orange-500">${p.price} ج.م</span>
        ${p.oldPrice ? `<span class="text-[10px] text-slate-400 line-through">${p.oldPrice}</span>` : ''}
      </div>
    </div>
  </div>`;
}

// AUTH — fix: track dashboard state to restore on close
let dashboardWasOpen = false;

function openAuth() {
  dashboardWasOpen = !document.getElementById('dashboard-view').classList.contains('hidden');
  document.querySelectorAll('#app-root > [data-main-view]').forEach(el => el.style.display = 'none');
  document.getElementById('dashboard-view').classList.add('hidden');
  document.getElementById('auth-view').classList.remove('hidden');
  switchAuth('signin');
}

function closeAuth() {
  document.getElementById('auth-view').classList.add('hidden');
  if (dashboardWasOpen) {
    document.getElementById('dashboard-view').classList.remove('hidden');
    document.querySelectorAll('#app-root > [data-main-view]').forEach(el => el.style.display = 'none');
  } else {
    document.querySelectorAll('#app-root > [data-main-view]').forEach(el => el.style.display = '');
  }
  dashboardWasOpen = false;
}

function switchAuth(mode) {
  ['signin', 'signup', 'forgot'].forEach(m => {
    document.getElementById('auth-' + m).classList.toggle('hidden', m !== mode);
  });
}

function handleSignin(e) {
  e.preventDefault();
  const email = document.getElementById('signin-email').value;
  const pass = document.getElementById('signin-pass').value;
  if (!email.includes('@') || pass.length < 6) return alert('تحقق من البيانات');
  toast('تم تسجيل الدخول ✓', 'success');
  setTimeout(() => { closeAuth(); openDashboard(); }, 500);
}

function handleSignup(e) {
  e.preventDefault();
  if (!document.getElementById('captcha-check').checked) return alert('أكمل التحقق الأمني');
  const pass = document.getElementById('signup-pass').value;
  if (pass.length < 8) return alert('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
  toast('تم إنشاء الحساب ✓', 'success');
  setTimeout(() => { closeAuth(); openDashboard(); }, 500);
}

function handleForgot(e) {
  e.preventDefault();
  toast('تم إرسال الرمز ✓', 'success');
  setTimeout(() => switchAuth('signin'), 1000);
}

function socialLogin(p) {
  toast(`جاري التحقق عبر ${p}...`, 'info');
  setTimeout(() => { toast(`تم الدخول عبر ${p} ✓`, 'success'); closeAuth(); openDashboard(); }, 1200);
}

function updateStrength(v) {
  let s = 0;
  if (v.length >= 8) s++;
  if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++;
  if (/\d/.test(v)) s++;
  if (/[^A-Za-z0-9]/.test(v)) s++;
  const colors = ['#E5E7EB', '#DC2626', '#F59E0B', '#22C55E', '#15803D'];
  const labels = ['لم تُدخل بعد', 'ضعيفة', 'متوسطة', 'جيدة', 'قوية'];
  for (let i = 1; i <= 4; i++) document.getElementById('str' + i).style.background = i <= s ? colors[s] : '#E5E7EB';
  document.getElementById('str-text').textContent = v ? labels[s] : labels[0];
}

function verifyCaptcha(checked) { if (checked) toast('تم التحقق ✓', 'success'); }

// DASHBOARD
function openDashboard() {
  document.getElementById('dashboard-view').classList.remove('hidden');
  document.querySelectorAll('#app-root > [data-main-view]').forEach(el => el.style.display = 'none');
  renderDashboard();
}

function closeDashboard() {
  document.getElementById('dashboard-view').classList.add('hidden');
  document.querySelectorAll('#app-root > [data-main-view]').forEach(el => el.style.display = '');
}

function closeDrawer() { document.getElementById('drawer').classList.add('translate-x-full'); }

function renderDashboard() {
  const m = state.merchant;
  document.getElementById('db-store-name').textContent = m.name;
  document.getElementById('db-avatar').src = m.avatar;
  document.getElementById('db-name').textContent = m.name;
  document.getElementById('db-id').textContent = 'ID: ' + m.id;
  document.getElementById('db-phone').textContent = m.phone;
  document.getElementById('db-email').textContent = m.email;
  document.getElementById('db-bio').textContent = m.bio;
  document.getElementById('db-points').textContent = m.points;
  document.getElementById('stat-products').textContent = state.products.length;
  document.getElementById('stat-stories').textContent = state.stories.length;

  document.getElementById('db-stories').innerHTML = state.stories.map(s => `
    <div class="flex flex-col items-center gap-1 shrink-0">
      <div class="story-ring w-16 h-16"><div class="story-inner w-full h-full bg-white dark:bg-slate-900"><img src="${esc(s.image)}" class="w-full h-full object-cover" /></div>
