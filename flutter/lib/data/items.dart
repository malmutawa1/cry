import '../models.dart';

/// Item categories with size multipliers + internal kg/cost. Mirrors data/items.ts.
const itemCategories = <ItemCategory>[
  ItemCategory('regular', 'Regular item', 'قطعة عادية', 1, 0.30, 0.12,
      'Shirts, t-shirts, dishdasha, trousers, underwear, ghutra, light abaya'),
  ItemCategory('large', 'Large item', 'قطعة كبيرة', 3, 1.2, 0.45,
      'Suits, jackets, bisht, bed sheets, blankets, winter coats, heavy items'),
  ItemCategory('xl', 'Extra-large item', 'قطعة كبيرة جداً', 6, 2.2, 0.9,
      'Heavy curtains and other bulky non-bedding items'),
];

const addOns = <AddOn>[
  AddOn('duvet', 'Duvet', 'لحاف', 2.5),
  AddOn('comforter', 'Comforter', 'مفرش سرير', 3),
  AddOn('large-bedding', 'Large bedding set', 'طقم مفروشات كبير', 4),
];

/// Fee charged per weighted item beyond the plan allowance (KWD).
const overagePerItem = 0.25;
