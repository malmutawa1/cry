// Full garment catalogue — how many allowance "pieces" each item counts as.
// Mirrors the Pressd item-counting guide (Kuwait). Everyday clothes count as
// one piece; larger / heavier items count as more. Bedding add-ons in the last
// group are billed separately and never counted against the monthly allowance.
//
// Used by the customer's pickup declaration ("what are you sending?") and the
// read-only counting guide. Piece counts stay data-driven so they're easy to
// tune.

export interface Garment {
  id: string
  name: string
  nameAr: string
  /** Allowance pieces this garment counts as. 0 for separate add-ons. */
  pieces: number
  /** True for items billed separately (not counted vs the allowance). */
  addon?: boolean
}

export interface GarmentGroup {
  id: string
  name: string
  nameAr: string
  items: Garment[]
}

function mk(group: string, rows: [string, string, number][]): Garment[] {
  return rows.map(([name, nameAr, pieces], i) => ({ id: `${group}-${i + 1}`, name, nameAr, pieces }))
}

export const garmentGroups: GarmentGroup[] = [
  {
    id: 'mens',
    name: "Men's & Traditional",
    nameAr: 'رجالي وتراثي',
    items: mk('mens', [
      ['Dishdasha (summer)', 'دشداشة صيفية', 1],
      ['Dishdasha (winter / heavy)', 'دشداشة شتوية / ثقيلة', 2],
      ['Dishdasha (embroidered collar)', 'دشداشة بياقة مطرزة', 2],
      ['Dishdasha (Eid / occasions)', 'دشداشة العيد / المناسبات', 2],
      ['Ghutra', 'غترة', 1],
      ['Shemagh', 'شماغ', 1],
      ['Taqiyah (cap)', 'طاقية', 1],
      ['Egal (agal)', 'عقال', 1],
      ['Bisht', 'بشت', 3],
      ['Bisht (embroidered / luxury)', 'بشت مطرز / فاخر', 5],
      ['Farwa (winter cloak)', 'فروة', 5],
      ['Sidairi (waistcoat)', 'صديري', 2],
      ['Ihram garment', 'ملابس الإحرام', 2],
      ['Formal shirt', 'قميص رسمي', 1],
      ['Long-sleeve shirt', 'قميص بأكمام طويلة', 1],
      ['Short-sleeve shirt', 'قميص بأكمام قصيرة', 1],
      ['Formal trousers', 'بنطلون رسمي', 1],
      ['Linen trousers', 'بنطلون كتان', 1],
      ['Linen shirt', 'قميص كتان', 1],
      ['Linen dishdasha', 'دشداشة كتان', 1],
      ['Undershirt (fanila)', 'فنيلة داخلية', 1],
      ['Underwear', 'ملابس داخلية', 1],
      ['Wizar (house wrap)', 'وزار', 1],
      ["Pyjamas (men's)", 'بيجامة رجالية', 2],
      ['Robe / bathrobe', 'روب / برنس', 3],
    ]),
  },
  {
    id: 'womens',
    name: "Women's Wear",
    nameAr: 'نسائي',
    items: mk('womens', [
      ['Abaya (Kuwaiti)', 'عباية كويتية', 3],
      ['Abaya (embroidered / luxury)', 'عباية مطرزة / فاخرة', 5],
      ['Deebaj', 'ديباج', 8],
      ['Daraa (Kuwaiti traditional dress)', 'دراعة كويتية', 3],
      ['Daraa (zari embroidered)', 'دراعة مطرزة بالزري', 4],
      ['Thob Al-Nashal (traditional)', 'ثوب النشل', 4],
      ['Thob Al-Makhwar (traditional)', 'ثوب المخور', 4],
      ["Bisht (women's)", 'بشت نسائي', 3],
      ['Jalabiya', 'جلابية', 2],
      ['Jalabiya (embroidered)', 'جلابية مطرزة', 3],
      ['Jalabiya (Eid / occasions)', 'جلابية العيد / المناسبات', 3],
      ['Kaftan', 'قفطان', 2],
      ['Bukhnaq (traditional)', 'بخنق', 1],
      ['Milfa (head cover)', 'ملفع', 1],
      ['Boshiya (face veil)', 'بوشية', 1],
      ['Dress (regular)', 'فستان عادي', 2],
      ['Dress (evening / embroidered)', 'فستان سهرة / مطرز', 4],
      ['Dress (wedding)', 'فستان زفاف', 8],
      ['Maxi dress', 'فستان ماكسي', 3],
      ["Women's suit (tailleur)", 'تايير نسائي', 3],
      ['Shayla / scarf', 'شيلة', 1],
      ['Hijab / wrap', 'حجاب', 1],
      ['Skirt', 'تنورة', 1],
      ['Long skirt', 'تنورة طويلة', 2],
      ['Blouse', 'بلوزة', 1],
      ["Women's shirt", 'قميص نسائي', 1],
      ['Cardigan', 'كارديجان', 2],
      ["Women's trousers", 'بنطلون نسائي', 1],
      ["Leggings / women's jeans", 'ليقنز / جينز نسائي', 2],
      ['Jumpsuit / overall', 'أفرول', 3],
      ['Tunic', 'تونيك', 2],
      ["Women's blazer", 'بليزر نسائي', 3],
      ["Women's coat", 'معطف نسائي', 3],
      ['Shawl / scarf (esharb)', 'إيشارب', 1],
      ["Pyjamas (women's)", 'بيجامة نسائية', 2],
      ['Nightgown', 'قميص نوم', 1],
      ['Light summer abaya', 'عباية صيفية خفيفة', 2],
    ]),
  },
  {
    id: 'everyday',
    name: 'Everyday Clothing',
    nameAr: 'ملابس يومية',
    items: mk('everyday', [
      ['Shirt / t-shirt', 'قميص / تيشيرت', 1],
      ['Polo shirt', 'بولو', 1],
      ['Long-sleeve shirt', 'قميص بأكمام طويلة', 1],
      ['Trousers', 'بنطلون', 1],
      ['Jeans', 'جينز', 2],
      ['Chinos / cotton trousers', 'بنطلون قطني', 1],
      ['Pullover / sweater', 'بلوفر / سترة', 4],
      ['Hoodie / sweatshirt', 'هودي', 3],
      ['Jacket', 'جاكيت', 5],
      ['Formal suit (full)', 'بدلة رسمية كاملة', 3],
      ['Military uniform', 'زي عسكري', 3],
      ['Winter coat', 'معطف شتوي', 3],
      ['Denim jacket', 'جاكيت جينز', 3],
      ['Leather jacket', 'جاكيت جلد', 5],
      ['Blazer', 'بليزر', 3],
      ['Vest / gilet', 'صديري / جيليه', 2],
      ['Shorts', 'شورت', 1],
      ['Bermuda shorts', 'شورت برمودا', 1],
    ]),
  },
  {
    id: 'sport',
    name: 'Sportswear & Accessories',
    nameAr: 'رياضي وإكسسوارات',
    items: mk('sport', [
      ['Tracksuit jacket', 'جاكيت رياضي', 2],
      ['Track pants', 'بنطلون رياضي', 1],
      ['Full tracksuit', 'بدلة رياضية كاملة', 3],
      ['Swimwear', 'ملابس سباحة', 1],
      ['Sports shirt / jersey', 'قميص رياضي', 1],
      ['Sports leggings', 'ليقنز رياضي', 1],
      ['Necktie', 'ربطة عنق', 1],
      ['Scarf / kufiya', 'كوفية', 1],
      ['Gloves', 'قفازات', 1],
      ['Socks (pair)', 'جوارب (زوج)', 1],
      ['Cap / hat', 'قبعة', 1],
      ['Fabric belt', 'حزام قماش', 1],
    ]),
  },
  {
    id: 'children',
    name: "Children's Clothing",
    nameAr: 'ملابس أطفال',
    items: mk('children', [
      ["Children's clothing (small item)", 'ملابس أطفال (قطعة صغيرة)', 1],
      ["Child's dishdasha", 'دشداشة أطفال', 1],
      ["Child's dress", 'فستان أطفال', 1],
      ["Child's dress (occasion)", 'فستان أطفال (مناسبة)', 2],
      ["Child's jacket", 'جاكيت أطفال', 2],
      ["Child's pullover", 'بلوفر أطفال', 2],
      ["Child's trousers", 'بنطلون أطفال', 1],
      ["Child's t-shirt", 'تيشيرت أطفال', 1],
      ["Child's pyjamas", 'بيجامة أطفال', 1],
      ["Child's blanket", 'بطانية أطفال', 2],
      ['Newborn clothing', 'ملابس مواليد', 1],
      ['Newborn set (full)', 'طقم مواليد كامل', 2],
      ['Swaddle / baby wrap', 'قماط', 1],
      ['Baby bib', 'مريلة أطفال', 1],
      ['School uniform (piece)', 'زي مدرسي (قطعة)', 1],
    ]),
  },
  {
    id: 'bedding',
    name: 'Bedding & Home Items',
    nameAr: 'مفروشات ومنزلية',
    items: mk('bedding', [
      ['Bed sheet', 'شرشف', 3],
      ['Bed sheet (large / king)', 'شرشف كبير / كنق', 4],
      ['Pillowcase', 'كيس مخدة', 1],
      ['Pillow (full)', 'مخدة كاملة', 2],
      ['Large pillow / bolster', 'مخدة كبيرة / مسند', 3],
      ['Blanket (single)', 'بطانية مفردة', 3],
      ['Blanket (double / large)', 'بطانية مزدوجة / كبيرة', 5],
      ['Shozat (heavy bedding set)', 'شوذة (طقم ثقيل)', 8],
      ['Towel (small)', 'منشفة صغيرة', 1],
      ['Towel (large / bath)', 'منشفة كبيرة / حمام', 2],
      ['Hand towel', 'منشفة يد', 1],
      ['Curtains (light)', 'ستائر خفيفة', 3],
      ['Curtains (heavy)', 'ستائر ثقيلة', 6],
      ['Tablecloth', 'مفرش طاولة', 2],
      ['Tablecloth (large)', 'مفرش طاولة كبير', 3],
      ['Sofa / couch cover', 'غطاء كنبة', 4],
      ['Decorative cushion cover', 'غطاء وسادة زينة', 1],
      ['Napkin / placemat', 'منديل قماش / مفرش فردي', 1],
      ['Quilted bed cover', 'مفرش سرير مبطّن', 5],
      ['Light coverlet / throw', 'غطاء خفيف', 4],
      ['Prayer rug', 'سجادة صلاة', 2],
      ['Floor seating (jalsa) cover', 'غطاء جلسة أرضية', 4],
      ['Floor cushion', 'مسند أرضي', 2],
      ['Low table cover', 'غطاء طاولة منخفضة', 2],
    ]),
  },
  {
    id: 'linen',
    name: 'Linen (Bed, Bath & Table)',
    nameAr: 'بياضات (سرير وحمام وطاولة)',
    items: mk('linen', [
      ['Bed linen set (single)', 'طقم مفارش مفرد', 4],
      ['Bed linen set (double / king)', 'طقم مفارش مزدوج / كنق', 6],
      ['Fitted sheet', 'شرشف بمطاط', 3],
      ['Flat sheet', 'شرشف مسطح', 3],
      ['Duvet cover', 'غطاء لحاف', 4],
      ['Pillowcase', 'كيس مخدة', 1],
      ['Bolster case', 'كيس مسند', 2],
      ['Bath towel', 'منشفة حمام', 2],
      ['Hand towel', 'منشفة يد', 1],
      ['Face towel', 'منشفة وجه', 1],
      ['Beach towel', 'منشفة بحر', 2],
      ['Bath mat', 'سجادة حمام', 2],
      ['Tablecloth (small)', 'مفرش طاولة صغير', 2],
      ['Tablecloth (large)', 'مفرش طاولة كبير', 3],
      ['Table runner', 'مفرش وسط الطاولة', 1],
      ['Cloth napkin', 'منديل قماش', 1],
      ['Placemat (fabric)', 'مفرش فردي قماش', 1],
      ['Kitchen towel', 'منشفة مطبخ', 1],
      ['Apron', 'مريلة مطبخ', 1],
    ]),
  },
  {
    id: 'delicates',
    name: 'Delicates & Special Care',
    nameAr: 'قطع حساسة وعناية خاصة',
    items: mk('delicates', [
      ['Silk item', 'قطعة حرير', 2],
      ['Hand-embroidered item', 'قطعة مطرزة يدوياً', 3],
      ['Beaded / sequined item', 'قطعة مطرزة بالخرز / الترتر', 4],
      ['Chiffon / lace', 'شيفون / دانتيل', 2],
      ['Cashmere / fine wool', 'كشمير / صوف ناعم', 3],
      ['Leather / suede item', 'قطعة جلد / شمواه', 5],
      ['Fur item', 'قطعة فرو', 6],
      ['Velvet item', 'قطعة مخمل', 3],
      ['Silk necktie', 'ربطة عنق حرير', 1],
    ]),
  },
  {
    id: 'addons',
    name: 'Charged Separately (Add-Ons)',
    nameAr: 'تُحتسب بشكل منفصل (إضافات)',
    items: [
      ['Duvet / comforter (single)', 'لحاف / مفرش (مفرد)'],
      ['Duvet / comforter (large / king)', 'لحاف / مفرش (كبير / كنق)'],
      ['Very heavy bedding', 'مفروشات ثقيلة جداً'],
      ['Small rug', 'سجادة صغيرة'],
      ['Large rug', 'سجادة كبيرة'],
    ].map(([name, nameAr], i) => ({ id: `addons-${i + 1}`, name, nameAr, pieces: 0, addon: true })),
  },
]

export const allGarments: Garment[] = garmentGroups.flatMap((g) => g.items)

const BY_ID = new Map(allGarments.map((g) => [g.id, g]))
export function garmentById(id: string): Garment | undefined {
  return BY_ID.get(id)
}

export function garmentName(g: Garment, lang: string): string {
  return lang === 'ar' ? g.nameAr : g.name
}
export function groupName(g: GarmentGroup, lang: string): string {
  return lang === 'ar' ? g.nameAr : g.name
}

/** A representative emoji for a garment, but ONLY when one genuinely fits.
 *  Traditional/ambiguous items (dishdasha, abaya, rugs, belts, baby items…)
 *  return '' so callers fall back to the neutral group icon instead of a
 *  mismatched picture. Order matters — specific matches win over generic. */
export function garmentEmoji(g: Garment): string {
  const n = g.name.toLowerCase()
  const has = (...w: string[]) => w.some((x) => n.includes(x))
  // Home, bath & bedding
  if (has('duvet', 'comforter', 'bedding', 'bed sheet', 'bed linen', 'fitted sheet', 'flat sheet', 'sheet', 'blanket', 'pillow', 'bolster', 'shozat', 'coverlet', 'quilt', 'bed cover')) return '🛏️'
  if (has('towel', 'bath mat', 'bath')) return '🛁'
  if (has('curtain')) return '🪟'
  if (has('sofa', 'couch', 'cushion')) return '🛋️'
  if (has('tablecloth', 'napkin', 'placemat', 'runner', 'kitchen')) return '🍽️'
  // Accessories with a clear emoji
  if (has('necktie')) return '👔'
  if (has('scarf', 'shawl', 'shemagh', 'ghutra', 'shayla', 'kufiya', 'esharb')) return '🧣'
  if (has('sock')) return '🧦'
  if (has('glove')) return '🧤'
  if (has('swim')) return '🩱'
  if (has('underwear')) return '🩲'
  // Western clothing with a clear emoji
  if (has('dress', 'maxi', 'gown')) return '👗'
  if (has('shorts', 'bermuda')) return '🩳'
  if (has('trousers', 'jeans', 'chinos', 'pants', 'leggings')) return '👖'
  if (has('jacket', 'blazer', 'coat', 'cardigan', 'hoodie', 'pullover', 'sweater', 'suit', 'tracksuit', 'vest', 'gilet')) return '🧥'
  if (has('shirt', 't-shirt', 'polo', 'blouse')) return '👕'
  // No confident match — let the caller use the group icon.
  return ''
}

const GROUP_EMOJI: Record<string, string> = {
  mens: '👳', womens: '🧕', everyday: '👕', sport: '🏃', children: '🧒',
  bedding: '🛏️', linen: '🧺', delicates: '✨', addons: '📦',
}
export function groupEmoji(g: GarmentGroup): string {
  return GROUP_EMOJI[g.id] ?? '👕'
}

/** A selection is { [garmentId]: quantity }. */
export type GarmentSelection = Record<string, number>

/** Weighted allowance pieces for a selection (add-ons excluded). */
export function selectionPieces(sel: GarmentSelection): number {
  let total = 0
  for (const [id, qty] of Object.entries(sel)) {
    const g = BY_ID.get(id)
    if (g && !g.addon) total += (qty || 0) * g.pieces
  }
  return total
}

/** Physical garment count (all rows, add-ons included). */
export function selectionUnits(sel: GarmentSelection): number {
  return Object.values(sel).reduce((s, n) => s + (n || 0), 0)
}

/** Count of add-on units in a selection. */
export function selectionAddons(sel: GarmentSelection): number {
  let total = 0
  for (const [id, qty] of Object.entries(sel)) {
    const g = BY_ID.get(id)
    if (g && g.addon) total += qty || 0
  }
  return total
}
