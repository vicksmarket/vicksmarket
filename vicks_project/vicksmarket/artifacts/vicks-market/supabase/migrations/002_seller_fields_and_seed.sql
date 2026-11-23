-- Vicks Market – Seller denorm fields + seed mock products
-- Run this in the Supabase SQL Editor after 001_initial_schema.sql

-- ══════════════════════════════════════════════
-- Add seller denormalization columns to products
-- (so product cards show seller image / contact without a join)
-- ══════════════════════════════════════════════
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS "sellerImage" text,
  ADD COLUMN IF NOT EXISTS phone         text,
  ADD COLUMN IF NOT EXISTS telegram      text,
  ADD COLUMN IF NOT EXISTS "isOnline"    boolean default false;

-- ══════════════════════════════════════════════
-- Seed: 60 demo products (6 malls × 10 each)
-- sellerId is NULL — these are unowned demo entries
-- readable by everyone (products_select_all policy)
-- ══════════════════════════════════════════════

-- Helper UUIDs for seller appearance (not real auth users — just for display)
-- M1 = المنسي ستور  M2 = بيوتي سنتر سارة  M3 = ياسين للإلكترونيات  M4 = متجر الأمل

INSERT INTO public.products
  (name, price, category, description, image, mall, location, views, likes, comments, rating,
   seller, "sellerImage", phone, telegram, "isOnline", "isOriginal", "isReported", "createdAt")
VALUES

-- ── CARREFOUR ──
('آيفون 15 برو ماكس 256GB تيتانيوم', 55000, 'إلكترونيات', 'كسر زيرو، ضمان Apple، بطارية 100%.',
 'https://images.unsplash.com/photo-1695048133142-1a20484429be?w=600&h=800&fit=crop&q=80',
 'carrefour', 'القاهرة', 120, 680, 92, 5,
 'المنسي ستور', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&q=80',
 '201113694362', 'elmansi_store', true, true, false, now() - interval '1 day'),

('سماعة Sony WH-1000XM5 لاسلكية', 8500, 'إلكترونيات', 'إلغاء ضوضاء رائع، 30 ساعة بطارية.',
 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=800&fit=crop&q=80',
 'carrefour', 'القاهرة', 80, 310, 44, 5,
 'المنسي ستور', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&q=80',
 '201113694362', 'elmansi_store', true, true, false, now() - interval '2 days'),

('طقم سيليكون مطبخ 12 قطعة', 850, 'أدوات منزلية', 'مقاوم للحرارة، لا يخدش التيفال.',
 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=800&fit=crop&q=80',
 'carrefour', 'القاهرة', 40, 120, 15, 4,
 'متجر الأمل', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&q=80',
 '201113694362', 'amal_store', false, true, false, now() - interval '3 days'),

('مكنسة Dyson V15 Detect', 12500, 'أجهزة منزلية', 'أقوى مكنسة لاسلكية، كشف الأتربة.',
 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=800&fit=crop&q=80',
 'carrefour', 'القاهرة', 60, 240, 31, 5,
 'المنسي ستور', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&q=80',
 '201113694362', 'elmansi_store', true, true, false, now() - interval '4 days'),

('ثلاجة Samsung 22 قدم No Frost', 23000, 'أجهزة منزلية', 'تبريد متساوٍ، موفرة للطاقة A+++.',
 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600&h=800&fit=crop&q=80',
 'carrefour', 'الجيزة', 30, 98, 12, 4,
 'متجر الأمل', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&q=80',
 '201113694362', 'amal_store', false, true, false, now() - interval '5 days'),

('مايكروويف توشيبا 30 لتر بالشواية', 3200, 'أجهزة منزلية', 'شواية كريستال، برامج تلقائية 10.',
 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=600&h=800&fit=crop&q=80',
 'carrefour', 'الجيزة', 20, 67, 8, 4,
 'متجر الأمل', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&q=80',
 '201113694362', 'amal_store', false, true, false, now() - interval '6 days'),

('طقم حلل جرانيت كوري 10 قطع', 4200, 'أدوات منزلية', 'أصلي غير قابل للالتصاق، موفر للطاقة.',
 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600&h=800&fit=crop&q=80',
 'carrefour', 'القاهرة', 50, 145, 18, 5,
 'متجر الأمل', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&q=80',
 '201113694362', 'amal_store', false, true, false, now() - interval '7 days'),

('مكواة بخار Rowenta DW9', 2100, 'أجهزة منزلية', 'بخار 200 جرام، قاعدة تيتانيوم.',
 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&h=800&fit=crop&q=80',
 'carrefour', 'القاهرة', 15, 55, 6, 4,
 'المنسي ستور', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&q=80',
 '201113694362', 'elmansi_store', true, true, false, now() - interval '8 days'),

('غسالة LG تحميل أمامي 8 كيلو', 14500, 'أجهزة منزلية', 'محرك DD بضمان 10 سنوات، بخار.',
 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600&h=800&fit=crop&q=80',
 'carrefour', 'الجيزة', 45, 188, 24, 5,
 'متجر الأمل', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&q=80',
 '201113694362', 'amal_store', false, true, false, now() - interval '9 days'),

('بلندر فيليبس 2 لتر بالعصارة', 1850, 'أدوات منزلية', '1200 واط، زجاج بوروسيليكات.',
 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600&h=800&fit=crop&q=80',
 'carrefour', 'القاهرة', 12, 43, 5, 4,
 'متجر الأمل', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&q=80',
 '201113694362', 'amal_store', false, true, false, now() - interval '10 days'),

-- ── MALL OF ARABIA ──
('عطر Dior Sauvage EDP 100ml', 3800, 'عطور', 'عطر رجالي أسطوري برائحة عود وكافور.',
 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&h=800&fit=crop&q=80',
 'arabia', 'القاهرة', 100, 340, 48, 5,
 'بيوتي سنتر سارة', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&q=80',
 '201064782990', null, false, true, false, now() - interval '1 day'),

('حقيبة جلد طبيعي فاخرة يد نسائية', 1850, 'حقائب', 'جلد طبيعي 100%، مقاس متوسط.',
 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=800&fit=crop&q=80',
 'arabia', 'الإسكندرية', 60, 200, 28, 5,
 'بيوتي سنتر سارة', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&q=80',
 '201064782990', null, false, true, false, now() - interval '2 days'),

('بدلة رجالية سليم فيت كحلي', 2900, 'ملابس', 'قماش كستور ممتاز، مناسب للمناسبات.',
 'https://images.unsplash.com/photo-1593032465175-481ac7f401a0?w=600&h=800&fit=crop&q=80',
 'arabia', 'القاهرة', 40, 145, 20, 4,
 'متجر الأمل', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&q=80',
 '201113694362', 'amal_store', false, true, false, now() - interval '3 days'),

('فستان سهرة نسائي كلاسيك', 1600, 'ملابس', 'قماش حرير ساتان، مقاسات S إلى XL.',
 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&h=800&fit=crop&q=80',
 'arabia', 'الإسكندرية', 90, 420, 62, 5,
 'بيوتي سنتر سارة', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&q=80',
 '201064782990', null, false, true, false, now() - interval '4 days'),

('عطر Chanel Coco Mademoiselle 100ml', 4200, 'عطور', 'العطر الأنثوي الأشهر عالمياً.',
 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=600&h=800&fit=crop&q=80',
 'arabia', 'الإسكندرية', 110, 510, 78, 5,
 'بيوتي سنتر سارة', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&q=80',
 '201064782990', null, false, true, false, now() - interval '5 days'),

('حذاء Nike Air Max 270 أصلي', 2400, 'أحذية', 'وحدة هواء خلفية كبيرة، راحة فائقة.',
 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=800&fit=crop&q=80',
 'arabia', 'الجيزة', 70, 280, 35, 4,
 'ياسين للإلكترونيات', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&q=80',
 '201501234567', 'yassin_shop', true, true, false, now() - interval '6 days'),

('نظارة شمسية Ray-Ban Aviator', 1900, 'إكسسوار', 'إطار ذهبي، عدسات خضراء كلاسيكية.',
 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=800&fit=crop&q=80',
 'arabia', 'الإسكندرية', 55, 190, 25, 5,
 'بيوتي سنتر سارة', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&q=80',
 '201064782990', null, false, true, false, now() - interval '7 days'),

('ساعة Fossil ستيل كلاسيكية', 2200, 'ساعات', 'عقارب، ضد الماء، سوار جلد.',
 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=800&fit=crop&q=80',
 'arabia', 'القاهرة', 35, 130, 17, 4,
 'متجر الأمل', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&q=80',
 '201113694362', 'amal_store', false, true, false, now() - interval '8 days'),

('حزام جلد طبيعي رجالي فاخر', 450, 'إكسسوار', 'جلد عجل إيطالي، إبزيم ذهبي.',
 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=800&fit=crop&q=80',
 'arabia', 'القاهرة', 25, 77, 9, 4,
 'متجر الأمل', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&q=80',
 '201113694362', 'amal_store', false, true, false, now() - interval '9 days'),

('محفظة جلد رجالية فاخرة', 680, 'إكسسوار', '15 جيب للبطاقات، جلد إيطالي.',
 'https://images.unsplash.com/photo-1627123424574-724758594785?w=600&h=800&fit=crop&q=80',
 'arabia', 'القاهرة', 30, 95, 12, 4,
 'متجر الأمل', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&q=80',
 '201113694362', 'amal_store', false, true, false, now() - interval '10 days'),

-- ── TITAN MALL ──
('لاب توب Dell Core i7 جيل 12 - SSD 512', 32000, 'كمبيوترات', 'RAM 16GB، شاشة FHD IPS، وزن 1.5 كيلو.',
 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=800&fit=crop&q=80',
 'titan', 'الجيزة', 70, 156, 29, 4,
 'ياسين للإلكترونيات', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&q=80',
 '201501234567', 'yassin_shop', true, true, false, now() - interval '1 day'),

('شاشة Samsung 32 بوصة 4K UHD', 9500, 'شاشات', 'HDR10، 120Hz، AMD FreeSync.',
 'https://images.unsplash.com/photo-1527443224154-c4a573d4e0da?w=600&h=800&fit=crop&q=80',
 'titan', 'الجيزة', 130, 445, 67, 4,
 'ياسين للإلكترونيات', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&q=80',
 '201501234567', 'yassin_shop', true, true, false, now() - interval '2 days'),

('PlayStation 5 Slim مع جهاز تحكم', 28000, 'ألعاب', 'أحدث إصدار، SSD 1TB، ضمان سنة.',
 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=600&h=800&fit=crop&q=80',
 'titan', 'القاهرة', 200, 760, 120, 5,
 'ياسين للإلكترونيات', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&q=80',
 '201501234567', 'yassin_shop', true, true, false, now() - interval '3 days'),

('سماعة Gaming HyperX Cloud Alpha', 2800, 'إلكترونيات', 'صوت محيطي، مايك قابل للإزالة.',
 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=600&h=800&fit=crop&q=80',
 'titan', 'الجيزة', 80, 210, 32, 5,
 'ياسين للإلكترونيات', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&q=80',
 '201501234567', 'yassin_shop', true, true, false, now() - interval '4 days'),

('كيبورد Mechanical RGB Keychron K2', 1900, 'إكسسوار PC', 'سويتشات Brown، خلفية RGB متعددة.',
 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&h=800&fit=crop&q=80',
 'titan', 'الجيزة', 55, 155, 22, 4,
 'ياسين للإلكترونيات', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&q=80',
 '201501234567', 'yassin_shop', true, true, false, now() - interval '5 days'),

('ماوس Logitech G Pro X Superlight', 3200, 'إكسسوار PC', '61 جرام فقط، بطارية 70 ساعة.',
 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=600&h=800&fit=crop&q=80',
 'titan', 'الجيزة', 95, 290, 40, 5,
 'ياسين للإلكترونيات', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&q=80',
 '201501234567', 'yassin_shop', true, true, false, now() - interval '6 days'),

('SSD Samsung 1TB NVMe M.2', 2100, 'تخزين', 'سرعة قراءة 7000 MB/s.',
 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&h=800&fit=crop&q=80',
 'titan', 'الجيزة', 30, 88, 11, 5,
 'ياسين للإلكترونيات', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&q=80',
 '201501234567', 'yassin_shop', true, true, false, now() - interval '7 days'),

('راوتر WiFi 6 TP-Link AX3000', 1600, 'شبكات', 'تغطية 3000 قدم مربع، 8 هوائيات.',
 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&h=800&fit=crop&q=80',
 'titan', 'القاهرة', 40, 112, 15, 4,
 'المنسي ستور', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&q=80',
 '201113694362', 'elmansi_store', true, true, false, now() - interval '8 days'),

('iPad Pro M2 11 بوصة 256GB', 28000, 'تابلت', 'شاشة ProMotion 120Hz، قلم Apple Pencil.',
 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=800&fit=crop&q=80',
 'titan', 'القاهرة', 120, 350, 52, 5,
 'المنسي ستور', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&q=80',
 '201113694362', 'elmansi_store', true, true, false, now() - interval '9 days'),

('كاميرا GoPro Hero 12 Black', 9800, 'كاميرات', '4K 60fps، HyperSmooth 6.0.',
 'https://images.unsplash.com/photo-1509395062183-a63f7b3a418c?w=600&h=800&fit=crop&q=80',
 'titan', 'الجيزة', 65, 180, 27, 5,
 'ياسين للإلكترونيات', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&q=80',
 '201501234567', 'yassin_shop', true, true, false, now() - interval '10 days'),

-- ── CAPITAL MALL ──
('كنبة زاوية مودرن L شيبس فيلفيت', 12500, 'أثاث', 'قماش فيلفيت ناعم، إطار خشب صنوبر.',
 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=800&fit=crop&q=80',
 'capital', 'القاهرة', 35, 98, 12, 4,
 'متجر الأمل', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&q=80',
 '201113694362', 'amal_store', false, true, false, now() - interval '1 day'),

('غرفة نوم كاملة 5 قطع مودرن أبيض', 42000, 'أثاث', 'سرير + دولاب + تسريحة + 2 منضدة.',
 'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=600&h=800&fit=crop&q=80',
 'capital', 'القاهرة', 75, 230, 34, 5,
 'متجر الأمل', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&q=80',
 '201113694362', 'amal_store', false, true, false, now() - interval '2 days'),

('طاولة طعام 6 كراسي خشب زان', 18000, 'أثاث', 'خشب زان طبيعي مع ورنيش لامع.',
 'https://images.unsplash.com/photo-1617103996702-96ff29b1c467?w=600&h=800&fit=crop&q=80',
 'capital', 'القاهرة', 50, 144, 22, 5,
 'المنسي ستور', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&q=80',
 '201113694362', 'elmansi_store', true, true, false, now() - interval '3 days'),

('ستارة بلاك اوت 3D مطرزة 4 قطع', 1800, 'ديكور', 'مقاس 4×2.5م، 10 ألوان متاحة.',
 'https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=600&h=800&fit=crop&q=80',
 'capital', 'الإسكندرية', 20, 67, 8, 3,
 'بيوتي سنتر سارة', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&q=80',
 '201064782990', null, false, true, false, now() - interval '4 days'),

('تابلوه ثلاثي فن تجريدي 3D', 1200, 'ديكور', 'طباعة عالية الدقة، إطار خشب.',
 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600&h=800&fit=crop&q=80',
 'capital', 'القاهرة', 15, 55, 7, 3,
 'متجر الأمل', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&q=80',
 '201113694362', 'amal_store', false, true, false, now() - interval '5 days'),

('ثريا LED مودرن 80cm نوردك', 3500, 'إضاءة', 'LED مدمج 80W، ضوء دافئ أو بارد.',
 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=600&h=800&fit=crop&q=80',
 'capital', 'القاهرة', 40, 110, 14, 4,
 'متجر الأمل', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&q=80',
 '201113694362', 'amal_store', false, true, false, now() - interval '6 days'),

('مطبخ MDF أبيض كامل 10 متر', 65000, 'مطابخ', 'مع جرانيت وبوتاجاز وشفاط.',
 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=800&fit=crop&q=80',
 'capital', 'القاهرة', 100, 320, 48, 5,
 'متجر الأمل', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&q=80',
 '201113694362', 'amal_store', false, true, false, now() - interval '7 days'),

('تسريحة مودرن مع مرايا LED', 4800, 'أثاث', 'خشب MDF أبيض، مرايا LED تعمل باللمس.',
 'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=600&h=800&fit=crop&q=80',
 'capital', 'القاهرة', 25, 78, 10, 4,
 'متجر الأمل', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&q=80',
 '201113694362', 'amal_store', false, true, false, now() - interval '8 days'),

('كنبة سرير مودرن 2في1', 8500, 'أثاث', 'تتحول لسرير 140×200، قماش فيلفيت.',
 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600&h=800&fit=crop&q=80',
 'capital', 'الجيزة', 60, 195, 28, 5,
 'متجر الأمل', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&q=80',
 '201113694362', 'amal_store', false, true, false, now() - interval '9 days'),

('منضدة ليلية ذهبية LED مودرن', 2200, 'أثاث', 'إضاءة LED، درج + باب.',
 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=800&fit=crop&q=80',
 'capital', 'القاهرة', 18, 45, 5, 4,
 'متجر الأمل', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&q=80',
 '201113694362', 'amal_store', false, true, false, now() - interval '10 days'),

-- ── LUXURY MALL ──
('ساعة Rolex Submariner Date أصلية', 450000, 'ساعات', 'ستانلس ستيل، عمق 300م، ضمان Rolex.',
 'https://images.unsplash.com/photo-1523170335258-f7a0a4ffe32c?w=600&h=800&fit=crop&q=80',
 'luxury', 'القاهرة', 300, 1200, 180, 5,
 'بيوتي سنتر سارة', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&q=80',
 '201064782990', null, false, true, false, now() - interval '1 day'),

('عطر Chanel N°5 EDP 100ml أصلي', 6500, 'عطور', 'العطر الأسطوري الأنثوي الأشهر.',
 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=600&h=800&fit=crop&q=80',
 'luxury', 'الإسكندرية', 150, 567, 88, 5,
 'بيوتي سنتر سارة', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&q=80',
 '201064782990', null, false, true, false, now() - interval '2 days'),

('حقيبة Louis Vuitton Neverfull MM أصلية', 95000, 'حقائب', 'قماش Monogram، مع وصولة LV.',
 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=800&fit=crop&q=80',
 'luxury', 'القاهرة', 400, 2100, 340, 5,
 'بيوتي سنتر سارة', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&q=80',
 '201064782990', null, false, true, false, now() - interval '3 days'),

('خاتم ألماس 18 قيراط طوق كامل', 280000, 'مجوهرات', 'ذهب أبيض، ألماسة مركزية 1.5 قيراط.',
 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=600&h=800&fit=crop&q=80',
 'luxury', 'القاهرة', 250, 980, 155, 5,
 'متجر الأمل', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&q=80',
 '201113694362', 'amal_store', false, true, false, now() - interval '4 days'),

('ساعة Audemars Piguet Royal Oak', 820000, 'ساعات', 'أيقونة الساعات الفاخرة، ضمان أصلي.',
 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600&h=800&fit=crop&q=80',
 'luxury', 'القاهرة', 350, 1500, 220, 5,
 'بيوتي سنتر سارة', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&q=80',
 '201064782990', null, false, true, false, now() - interval '5 days'),

('عطر Tom Ford Oud Wood 100ml', 8900, 'عطور', 'عطر عود فاخر يدوم 18 ساعة.',
 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&h=800&fit=crop&q=80',
 'luxury', 'الإسكندرية', 120, 430, 65, 5,
 'بيوتي سنتر سارة', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&q=80',
 '201064782990', null, false, true, false, now() - interval '6 days'),

('حقيبة Hermès Kelly 28 أصلية', 350000, 'حقائب', 'جلد Togo الفرنسي، مع وصولة هيرميس.',
 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=800&fit=crop&q=80',
 'luxury', 'القاهرة', 450, 1800, 280, 5,
 'بيوتي سنتر سارة', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&q=80',
 '201064782990', null, false, true, false, now() - interval '7 days'),

('سلسال ذهب أبيض 18 قيراط مع ألماس', 35000, 'مجوهرات', 'طول 45cm، وزن 8 جرام، شهادة GIA.',
 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=800&fit=crop&q=80',
 'luxury', 'القاهرة', 180, 620, 95, 5,
 'بيوتي سنتر سارة', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&q=80',
 '201064782990', null, false, true, false, now() - interval '8 days'),

('نظارة Cartier Panthere ذهبية', 28000, 'إكسسوار', 'إطار ذهب 18 قيراط مع عدسات عضوية.',
 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=600&h=800&fit=crop&q=80',
 'luxury', 'القاهرة', 90, 340, 52, 5,
 'بيوتي سنتر سارة', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&q=80',
 '201064782990', null, false, true, false, now() - interval '9 days'),

('محفظة Gucci GG Supreme جلد حقيقي', 18500, 'إكسسوار', 'قماش GG Supreme مع تفاصيل جلد.',
 'https://images.unsplash.com/photo-1627123424574-724758594785?w=600&h=800&fit=crop&q=80',
 'luxury', 'القاهرة', 200, 780, 115, 5,
 'متجر الأمل', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&q=80',
 '201113694362', 'amal_store', false, true, false, now() - interval '10 days'),

-- ── USED MALL ──
('آيفون 13 مستعمل - حالة 10/10', 18500, 'مستعمل', 'بطارية 94%، مع الكرتونة والملحقات.',
 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&h=800&fit=crop&q=80',
 'used', 'الجيزة', 110, 420, 65, 4,
 'ياسين للإلكترونيات', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&q=80',
 '201501234567', 'yassin_shop', true, false, false, now() - interval '1 day'),

('لاب توب HP i5 جيل 11 - 8GB SSD', 11000, 'مستعمل', 'شغال 100%، SSD 256، ويندوز أصلي.',
 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&h=800&fit=crop&q=80',
 'used', 'القاهرة', 70, 234, 38, 3,
 'المنسي ستور', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&q=80',
 '201113694362', 'elmansi_store', true, false, false, now() - interval '2 days'),

('PlayStation 5 + 3 ألعاب مستعمل', 28000, 'مستعمل', 'حالة ممتازة + FIFA25 + GTA5 + Spider-Man.',
 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=600&h=800&fit=crop&q=80',
 'used', 'الجيزة', 200, 760, 120, 5,
 'ياسين للإلكترونيات', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&q=80',
 '201501234567', 'yassin_shop', true, false, false, now() - interval '3 days'),

('غسالة LG 7 كيلو مستعملة - شغالة', 6500, 'مستعمل', 'شغالة تمام، تم التجربة والفحص.',
 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600&h=800&fit=crop&q=80',
 'used', 'القاهرة', 35, 110, 19, 3,
 'متجر الأمل', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&q=80',
 '201113694362', 'amal_store', false, false, false, now() - interval '4 days'),

('دراجة هوائية جير 21 سبورت - حالة جيدة', 4200, 'مستعمل', 'إطار ألومنيوم، فرامل ديسك.',
 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=600&h=800&fit=crop&q=80',
 'used', 'الإسكندرية', 25, 78, 9, 4,
 'بيوتي سنتر سارة', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&q=80',
 '201064782990', null, false, false, false, now() - interval '5 days'),

('شاشة LG 24 بوصة مستعملة FullHD', 2800, 'مستعمل', 'بدون خدوش، HDMI + VGA.',
 'https://images.unsplash.com/photo-1527443224154-c4a573d4e0da?w=600&h=800&fit=crop&q=80',
 'used', 'الجيزة', 18, 55, 7, 3,
 'ياسين للإلكترونيات', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&q=80',
 '201501234567', 'yassin_shop', true, false, false, now() - interval '6 days'),

('تابلت Samsung Galaxy Tab A8 مستعمل', 5500, 'مستعمل', '32GB، حالة ممتازة، بالشاحن.',
 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=800&fit=crop&q=80',
 'used', 'الجيزة', 40, 130, 18, 4,
 'ياسين للإلكترونيات', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&q=80',
 '201501234567', 'yassin_shop', true, false, false, now() - interval '7 days'),

('تلفزيون Sony 55 بوصة 4K مستعمل', 12000, 'مستعمل', 'Smart TV، Android، بدون أي مشاكل.',
 'https://images.unsplash.com/photo-1593359677879-a4bb92f4e7ef?w=600&h=800&fit=crop&q=80',
 'used', 'القاهرة', 55, 190, 28, 4,
 'المنسي ستور', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&q=80',
 '201113694362', 'elmansi_store', true, false, false, now() - interval '8 days'),

('آيباد Air 4 64GB WiFi مستعمل', 15000, 'مستعمل', 'بطارية 88%، شاشة سليمة بالكامل.',
 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=800&fit=crop&q=80',
 'used', 'القاهرة', 65, 245, 35, 4,
 'المنسي ستور', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&q=80',
 '201113694362', 'elmansi_store', true, false, false, now() - interval '9 days'),

('كاميرا Canon 700D مع عدسة 18-55mm', 8500, 'مستعمل', '24 ميجابكسل، شاشة قابلة للطي.',
 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&h=800&fit=crop&q=80',
 'used', 'الجيزة', 50, 165, 22, 4,
 'ياسين للإلكترونيات', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&q=80',
 '201501234567', 'yassin_shop', true, false, false, now() - interval '10 days');
