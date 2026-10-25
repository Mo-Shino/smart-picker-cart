// Store catalog: departments (in optimal picking order), products, and EAN-13 helpers.
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

  // [id, dept, name, unit, price, shelf, type]
  const RAW = [
    ['p01', 'dry', 'أرز مصري 1 كجم', 'كيس', 38, 1],
    ['p02', 'dry', 'مكرونة اسباجيتي 400 جم', 'كيس', 16, 2],
    ['p03', 'dry', 'سكر أبيض 1 كجم', 'كيس', 32, 3],
    ['p04', 'dry', 'شاي أسود 100 فتلة', 'علبة', 55, 4],
    ['p05', 'oils', 'زيت ذرة 800 مل', 'زجاجة', 85, 1],
    ['p06', 'oils', 'زيت عباد الشمس 800 مل', 'زجاجة', 78, 1],
    ['p07', 'oils', 'سمن نباتي 500 جم', 'علبة', 62, 2],
    ['p08', 'canned', 'صلصة طماطم 360 جم', 'برطمان', 22, 1],
    ['p09', 'canned', 'فول مدمس 400 جم', 'علبة', 18, 2],
    ['p10', 'canned', 'تونة قطع 185 جم', 'علبة', 42, 3],
    ['p11', 'drinks', 'عصير برتقال 1 لتر', 'عبوة', 34, 1],
    ['p12', 'drinks', 'عصير مانجو 1 لتر', 'عبوة', 34, 1],
    ['p13', 'drinks', 'مياه معدنية 1.5 لتر', 'زجاجة', 9, 2],
    ['p14', 'drinks', 'مشروب غازي 1 لتر', 'زجاجة', 17, 3],
    ['p15', 'bakery', 'خبز توست أبيض', 'كيس', 28, 1],
    ['p16', 'bakery', 'خبز توست أسمر', 'كيس', 31, 1],
    ['p17', 'bakery', 'كرواسون بالزبدة (6 قطع)', 'علبة', 45, 2],
    ['p18', 'produce', 'موز بلدي', 'كجم', 38, 1, 'weight'],
    ['p19', 'produce', 'تفاح أحمر', 'كجم', 70, 1, 'weight'],
    ['p20', 'produce', 'طماطم طازجة', 'كجم', 22, 2, 'weight'],
    ['p21', 'produce', 'خيار', 'كجم', 18, 2, 'weight'],
    ['p22', 'dairy', 'لبن كامل الدسم 1 لتر', 'عبوة', 36, 1],
    ['p23', 'dairy', 'لبن خالي الدسم 1 لتر', 'عبوة', 36, 1],
    ['p24', 'dairy', 'جبنة فيتا 500 جم', 'علبة', 58, 2],
    ['p25', 'dairy', 'زبادي طبيعي 170 جم', 'علبة', 12, 3],
    ['p26', 'dairy', 'بيض أبيض (12 بيضة)', 'علبة', 78, 4],
    ['p27', 'frozen', 'آيس كريم فانيليا 1 لتر', 'علبة', 95, 1],
    ['p28', 'frozen', 'خضار مشكل مجمد 400 جم', 'كيس', 38, 2],
    ['p29', 'frozen', 'ناجتس دجاج 400 جم', 'علبة', 85, 3]
  ];

  const products = RAW.map((r, i) => {
    const d = DEPTS.find(x => x.id === r[1]);
    const type = r[6] || 'fixed';
    const p = {
      id: r[0], dept: r[1], name: r[2], unit: r[3], price: r[4], shelf: r[5], type,
      aisle: d.aisle, aisleOrder: d.order * 100 + r[5], plu: null, barcode: null
    };
    if (type === 'weight') p.plu = String(i + 1).padStart(5, '0');
    else p.barcode = ean13('6221' + String(10000000 + (i + 1) * 137).padStart(8, '0'));
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

  // Closest alternatives in the same department (similar price first, same type).
  function substitutes(id, limit = 4) {
    const p = byId(id);
    if (!p) return [];
    return products
      .filter(x => x.dept === p.dept && x.id !== p.id && x.type === p.type)
      .sort((a, b) => Math.abs(a.price - p.price) - Math.abs(b.price - p.price))
      .slice(0, limit);
  }

  window.Catalog = { STORE, DEPTS, products, byId, dept, label, parse, substitutes, ean13 };
})();
