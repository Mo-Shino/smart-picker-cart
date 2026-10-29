// Store catalog: departments (in optimal picking order), products with product-family groups, and EAN-13 helpers.
(function () {
  const STORE = { name: 'هايبر الواحة', branch: 'فرع المعادي', picker: 'أحمد طارق' };

  // Order = walking route: heavy & dry first, fragile later, chilled & frozen last.
  const DEPTS = [
    { id: 'dry', name: 'بقالة جافة', aisle: 'A1', order: 1, tint: 'lav' },
    { id: 'oils', name: 'زيوت وسمن', aisle: 'A2', order: 2, tint: 'sky' },
    { id: 'canned', name: 'معلبات وصلصات', aisle: 'B1', order: 3, tint: 'sand' },
    { id: 'drinks', name: 'مشروبات', aisle: 'B2', order: 4, tint: 'mint' },
    { id: 'bakery', name: 'مخبوزات', aisle: 'C1', order: 5, tint: 'rose' },
    { id: 'produce', name: 'خضار وفواكه', aisle: 'C2', order: 6, tint: 'peach' },
    { id: 'dairy', name: 'ألبان وأجبان', aisle: 'D1', order: 7, tint: 'lav' },
    { id: 'frozen', name: 'مجمدات', aisle: 'D2', order: 8, tint: 'mint' }
  ];

  function ean13(base12) {
    let s = 0;
    for (let i = 0; i < 12; i++) s += +base12[i] * (i % 2 ? 3 : 1);
    return base12 + ((10 - (s % 10)) % 10);
  }

  // [id, dept, group, name, unit, price, shelf, type]
  // Keep p01..p29 IDs stable for active orders, and include same-group alternatives for realistic substitutions.
  const RAW = [
    // Dry grocery — Rice (group: 'rice')
    ['p01', 'dry', 'rice', 'أرز مصري الضحى 1 كجم', 'كيس', 38, 1],
    ['p30', 'dry', 'rice', 'أرز مصري الساعة 1 كجم', 'كيس', 36, 1],
    ['p31', 'dry', 'rice', 'أرز مصري عريض الحبة 1 كجم', 'كيس', 35, 1],
    ['p32', 'dry', 'rice', 'أرز بسمتي ذهبي 1 كجم', 'كيس', 65, 1],

    // Dry grocery — Pasta (group: 'pasta')
    ['p02', 'dry', 'pasta', 'مكرونة اسباجيتي الملكة 400 جم', 'كيس', 16, 2],
    ['p33', 'dry', 'pasta', 'مكرونة اسباجيتي الضحى 400 جم', 'كيس', 22, 2],
    ['p34', 'dry', 'pasta', 'مكرونة قلم الملكة 400 جم', 'كيس', 16, 2],

    // Dry grocery — Sugar (group: 'sugar')
    ['p03', 'dry', 'sugar', 'سكر أبيض الضحى 1 كجم', 'كيس', 32, 3],
    ['p35', 'dry', 'sugar', 'سكر أبيض الأسرة 1 كجم', 'كيس', 30, 3],
    ['p36', 'dry', 'sugar', 'سكر بني طبيعي 500 جم', 'كيس', 35, 3],

    // Dry grocery — Tea (group: 'tea')
    ['p04', 'dry', 'tea', 'شاي العروسة 100 فتلة', 'علبة', 55, 4],
    ['p37', 'dry', 'tea', 'شاي ليبتون العلامة الصفراء 100 فتلة', 'علبة', 62, 4],
    ['p38', 'dry', 'tea', 'شاي أحمد تي إيرل جراي 100 فتلة', 'علبة', 68, 4],

    // Oils & Ghee — Cooking Oil (group: 'oil')
    ['p05', 'oils', 'oil', 'زيت ذرة عافية 800 مل', 'زجاجة', 85, 1],
    ['p06', 'oils', 'oil', 'زيت عباد الشمس سلايت 800 مل', 'زجاجة', 78, 1],
    ['p39', 'oils', 'oil', 'زيت ذرة كريستال 800 مل', 'زجاجة', 88, 1],

    // Oils & Ghee — Ghee & Butter (group: 'ghee')
    ['p07', 'oils', 'ghee', 'سمن نباتي روابي 500 جم', 'علبة', 62, 2],
    ['p40', 'oils', 'ghee', 'سمن نباتي جنة 500 جم', 'علبة', 64, 2],
    ['p41', 'oils', 'ghee', 'زبدة طبيعي فيرن 500 جم', 'علبة', 95, 2],

    // Canned — Tomato Sauce (group: 'sauce')
    ['p08', 'canned', 'sauce', 'صلصة طماطم هاينز 360 جم', 'برطمان', 22, 1],
    ['p42', 'canned', 'sauce', 'صلصة طماطم قها 360 جم', 'برطمان', 19, 1],
    ['p43', 'canned', 'sauce', 'صلصة طماطم هارفست 360 جم', 'برطمان', 20, 1],

    // Canned — Foul (group: 'foul')
    ['p09', 'canned', 'foul', 'فول مدمس هارفست 400 جم', 'علبة', 18, 2],
    ['p44', 'canned', 'foul', 'فول مدمس أمريكانا 400 جم', 'علبة', 20, 2],
    ['p45', 'canned', 'foul', 'فول مدمس بالخلطة 400 جم', 'علبة', 21, 2],

    // Canned — Tuna (group: 'tuna')
    ['p10', 'canned', 'tuna', 'تونة قطع صن شاين 185 جم', 'علبة', 42, 3],
    ['p46', 'canned', 'tuna', 'تونة قطعة واحدة أمريكانا 185 جم', 'علبة', 46, 3],
    ['p47', 'canned', 'tuna', 'تونة دايت صن شاين 185 جم', 'علبة', 44, 3],

    // Drinks — Juice (group: 'juice')
    ['p11', 'drinks', 'juice', 'عصير برتقال جهينة 1 لتر', 'عبوة', 34, 1],
    ['p12', 'drinks', 'juice', 'عصير مانجو جهينة 1 لتر', 'عبوة', 34, 1],
    ['p48', 'drinks', 'juice', 'عصير برتقال بيتي 1 لتر', 'عبوة', 32, 1],
    ['p49', 'drinks', 'juice', 'عصير تفاح جهينة 1 لتر', 'عبوة', 34, 1],

    // Drinks — Water (group: 'water')
    ['p13', 'drinks', 'water', 'مياه معدنية نستله 1.5 لتر', 'زجاجة', 9, 2],
    ['p50', 'drinks', 'water', 'مياه معدنية دساني 1.5 لتر', 'زجاجة', 9, 2],
    ['p51', 'drinks', 'water', 'مياه معدنية حياة 1.5 لتر', 'زجاجة', 8, 2],

    // Drinks — Soda (group: 'soda')
    ['p14', 'drinks', 'soda', 'مشروب غازي كولا 1 لتر', 'زجاجة', 17, 3],
    ['p52', 'drinks', 'soda', 'مشروب غازي كولا زيرو 1 لتر', 'زجاجة', 17, 3],
    ['p53', 'drinks', 'soda', 'مشروب غازي ليمون ونعناع 1 لتر', 'زجاجة', 17, 3],

    // Bakery — Toast (group: 'toast')
    ['p15', 'bakery', 'toast', 'خبز توست أبيض ريتش بيك', 'كيس', 28, 1],
    ['p16', 'bakery', 'toast', 'خبز توست أسمر ريتش بيك', 'كيس', 31, 1],
    ['p54', 'bakery', 'toast', 'خبز توست بالحليب والشوفان', 'كيس', 33, 1],

    // Bakery — Croissant (group: 'croissant')
    ['p17', 'bakery', 'croissant', 'كرواسون بالزبدة (6 قطع)', 'علبة', 45, 2],
    ['p55', 'bakery', 'croissant', 'كرواسون بالجبنة الرومي (6 قطع)', 'علبة', 48, 2],
    ['p56', 'bakery', 'croissant', 'باتيه بالجبنة الفيتا (6 قطع)', 'علبة', 44, 2],

    // Produce — Banana & Fruits (group: 'banana', 'apple')
    ['p18', 'produce', 'banana', 'موز بلدي طازج', 'كجم', 38, 1, 'weight'],
    ['p57', 'produce', 'banana', 'موز مستورد فاخر', 'كجم', 52, 1, 'weight'],
    ['p19', 'produce', 'apple', 'تفاح أحمر مستورد', 'كجم', 70, 1, 'weight'],
    ['p58', 'produce', 'apple', 'تفاح أصفر سكري', 'كجم', 65, 1, 'weight'],

    // Produce — Vegetables (group: 'tomato', 'cucumber')
    ['p20', 'produce', 'tomato', 'طماطم بلدي طازجة', 'كجم', 22, 2, 'weight'],
    ['p59', 'produce', 'tomato', 'طماطم شيري طازجة', 'كجم', 28, 2, 'weight'],
    ['p21', 'produce', 'cucumber', 'خيار بلدي طازج', 'كجم', 18, 2, 'weight'],
    ['p60', 'produce', 'cucumber', 'خيار صوب ممتاز', 'كجم', 20, 2, 'weight'],

    // Dairy — Milk (group: 'milk')
    ['p22', 'dairy', 'milk', 'لبن كامل الدسم جهينة 1 لتر', 'عبوة', 36, 1],
    ['p23', 'dairy', 'milk', 'لبن خالي الدسم جهينة 1 لتر', 'عبوة', 36, 1],
    ['p61', 'dairy', 'milk', 'لبن كامل الدسم المراعي 1 لتر', 'عبوة', 38, 1],
    ['p62', 'dairy', 'milk', 'لبن نصف دسم المراعي 1 لتر', 'عبوة', 37, 1],

    // Dairy — Cheese (group: 'cheese')
    ['p24', 'dairy', 'cheese', 'جبنة فيتا عبور لاند 500 جم', 'علبة', 58, 2],
    ['p63', 'dairy', 'cheese', 'جبنة فيتا دومتي بلس 500 جم', 'علبة', 56, 2],
    ['p64', 'dairy', 'cheese', 'جبنة إسطنبولي عبور لاند 500 جم', 'علبة', 59, 2],

    // Dairy — Yogurt (group: 'yogurt')
    ['p25', 'dairy', 'yogurt', 'زبادي طبيعي المراعي 170 جم', 'علبة', 12, 3],
    ['p65', 'dairy', 'yogurt', 'زبادي طبيعي جهينة 170 جم', 'علبة', 11, 3],
    ['p66', 'dairy', 'yogurt', 'زبادي لايت خالي الدسم 170 جم', 'علبة', 12, 3],

    // Dairy — Eggs (group: 'eggs')
    ['p26', 'dairy', 'eggs', 'بيض أبيض مزارع (12 بيضة)', 'علبة', 78, 4],
    ['p67', 'dairy', 'eggs', 'بيض أحمر مزارع (12 بيضة)', 'علبة', 80, 4],
    ['p68', 'dairy', 'eggs', 'بيض بلدي أورجانيك (12 بيضة)', 'علبة', 85, 4],

    // Frozen — Ice Cream (group: 'icecream')
    ['p27', 'frozen', 'icecream', 'آيس كريم فانيليا 1 لتر', 'علبة', 95, 1],
    ['p69', 'frozen', 'icecream', 'آيس كريم شوكولاتة 1 لتر', 'علبة', 95, 1],
    ['p70', 'frozen', 'icecream', 'آيس كريم فراولة ومانجو 1 لتر', 'علبة', 95, 1],

    // Frozen — Vegetables (group: 'frozen_veg')
    ['p28', 'frozen', 'frozen_veg', 'خضار مشكل مجمد بسمة 400 جم', 'كيس', 38, 2],
    ['p71', 'frozen', 'frozen_veg', 'بسلة بالجزر مجمدة بسمة 400 جم', 'كيس', 36, 2],
    ['p72', 'frozen', 'frozen_veg', 'خضار مشكل مجمد مونتانا 400 جم', 'كيس', 40, 2],

    // Frozen — Chicken (group: 'frozen_chicken')
    ['p29', 'frozen', 'frozen_chicken', 'ناجتس دجاج أطياب 400 جم', 'علبة', 85, 3],
    ['p73', 'frozen', 'frozen_chicken', 'ناجتس دجاج كوكي 400 جم', 'علبة', 82, 3],
    ['p74', 'frozen', 'frozen_chicken', 'بانيه دجاج مقرمش أطياب 400 جم', 'علبة', 92, 3]
  ];

  const products = RAW.map((r, i) => {
    const d = DEPTS.find(x => x.id === r[1]);
    const type = r[7] || 'fixed';
    const numId = parseInt(r[0].slice(1), 10) || (i + 1);
    const p = {
      id: r[0], dept: r[1], group: r[2], name: r[3], unit: r[4], price: r[5], shelf: r[6], type,
      aisle: d.aisle, aisleOrder: d.order * 100 + r[6], plu: null, barcode: null
    };
    if (type === 'weight') p.plu = String(numId).padStart(5, '0');
    else p.barcode = ean13('6221' + String(10000000 + numId * 137).padStart(8, '0'));
    return p;
  });

  const byId = id => products.find(p => p.id === id);
  const dept = id => DEPTS.find(d => d.id === id);

  // Weighted label: 2 + PLU(5) + grams(5) + 0 + check  (EAN-13 variable weight)
  function label(p, kg) {
    const grams = String(Math.round(kg * 1000)).padStart(5, '0');
    return ean13('2' + p.plu + grams + '0');
  }

  // Returns { product, kg|null } for a scanned code, or null when unknown.
  function parse(code) {
    code = String(code || '').trim();
    if (/^2\d{12}$/.test(code)) {
      const plu = code.slice(1, 6);
      const product = products.find(p => p.plu === plu);
      if (product) return { product, kg: parseInt(code.slice(6, 11), 10) / 1000 };
    }
    const product = products.find(p => p.barcode === code);
    return product ? { product, kg: null } : null;
  }

  // Closest alternatives strictly from the SAME product family (`group`), sorted by closest price.
  function substitutes(id, limit = 4) {
    const p = byId(id);
    if (!p) return [];
    const sameGroup = products
      .filter(x => x.group === p.group && x.id !== p.id)
      .sort((a, b) => Math.abs(a.price - p.price) - Math.abs(b.price - p.price));
    if (sameGroup.length) return sameGroup.slice(0, limit);
    return products
      .filter(x => x.dept === p.dept && x.id !== p.id && x.type === p.type)
      .sort((a, b) => Math.abs(a.price - p.price) - Math.abs(b.price - p.price))
      .slice(0, limit);
  }

  window.Catalog = { STORE, DEPTS, products, byId, dept, label, parse, substitutes, ean13 };
})();
