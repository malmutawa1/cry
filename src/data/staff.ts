// Staff portal — operations KPIs & quality-control mock data.
// This is the operational counterpart to the customer app: the same laundry,
// seen from the facility side. All figures are demo data (no backend).

import type { Lang } from '../i18n'

export interface Bi {
  en: string
  ar: string
}
export function bi(v: Bi, lang: Lang): string {
  return v[lang]
}

/** Passcode for the demo staff gate (prototype only). */
export const STAFF_PASSCODE = '2468'

export type Tone = 'accent' | 'green' | 'gold' | 'red'

export interface Kpi {
  id: string
  label: Bi
  value: string
  unit?: Bi
  sub: Bi
  /** percent change vs. the previous period; sign drives the arrow */
  trend: number
  /** whether a positive trend is good (up) or bad (e.g. rewash rate) */
  goodWhenUp: boolean
  tone: Tone
}

// Headline operational KPIs shown at the top of the dashboard.
export const kpis: Kpi[] = [
  {
    id: 'orders',
    label: { en: 'Orders processed', ar: 'الطلبات المعالجة' },
    value: '128',
    sub: { en: 'This week', ar: 'هذا الأسبوع' },
    trend: 12,
    goodWhenUp: true,
    tone: 'accent',
  },
  {
    id: 'ontime',
    label: { en: 'On-time delivery', ar: 'التوصيل في الموعد' },
    value: '96',
    unit: { en: '%', ar: '٪' },
    sub: { en: 'SLA target 95%', ar: 'الهدف ٩٥٪' },
    trend: 2,
    goodWhenUp: true,
    tone: 'green',
  },
  {
    id: 'turnaround',
    label: { en: 'Avg turnaround', ar: 'متوسط الإنجاز' },
    value: '22',
    unit: { en: 'h', ar: 'س' },
    sub: { en: 'Pickup → delivery', ar: 'من الاستلام للتوصيل' },
    trend: -8,
    goodWhenUp: false,
    tone: 'accent',
  },
  {
    id: 'rewash',
    label: { en: 'Rewash rate', ar: 'نسبة إعادة الغسيل' },
    value: '2.4',
    unit: { en: '%', ar: '٪' },
    sub: { en: 'Target under 3%', ar: 'الهدف أقل من ٣٪' },
    trend: -0.6,
    goodWhenUp: false,
    tone: 'gold',
  },
  {
    id: 'members',
    label: { en: 'Active members', ar: 'الأعضاء النشطون' },
    value: '318',
    sub: { en: '+14 this month', ar: '+١٤ هذا الشهر' },
    trend: 4,
    goodWhenUp: true,
    tone: 'green',
  },
  {
    id: 'mrr',
    label: { en: 'Monthly revenue', ar: 'الإيراد الشهري' },
    value: '8,940',
    unit: { en: 'KWD', ar: 'د.ك' },
    sub: { en: 'Recurring', ar: 'متكرر' },
    trend: 6,
    goodWhenUp: true,
    tone: 'accent',
  },
]

export interface Day {
  d: Bi
  kg: number
}

// Weekly throughput (kg of laundry processed per day).
export const throughput: Day[] = [
  { d: { en: 'Sat', ar: 'السبت' }, kg: 620 },
  { d: { en: 'Sun', ar: 'الأحد' }, kg: 540 },
  { d: { en: 'Mon', ar: 'الإثنين' }, kg: 580 },
  { d: { en: 'Tue', ar: 'الثلاثاء' }, kg: 700 },
  { d: { en: 'Wed', ar: 'الأربعاء' }, kg: 660 },
  { d: { en: 'Thu', ar: 'الخميس' }, kg: 480 },
  { d: { en: 'Fri', ar: 'الجمعة' }, kg: 300 },
]

/** Share of daily facility capacity currently in use. */
export const capacityPct = 78

/** Overall QC pass rate (%) and how many items were inspected this week. */
export const qc = { passRate: 97.6, inspected: 842 }

export interface Defect {
  label: Bi
  count: number
}

// Most common quality issues caught by inspectors this week.
export const defects: Defect[] = [
  { label: { en: 'Residual stains', ar: 'بقع متبقية' }, count: 9 },
  { label: { en: 'Pressing / wrinkles', ar: 'كي / تجاعيد' }, count: 6 },
  { label: { en: 'Missing item', ar: 'قطعة مفقودة' }, count: 4 },
  { label: { en: 'Wrong hanger / fold', ar: 'علاقة / طي خاطئ' }, count: 3 },
  { label: { en: 'Fabric damage', ar: 'تلف بالقماش' }, count: 1 },
]

export interface Inspector {
  name: Bi
  checks: number
  passPct: number
}

export const inspectors: Inspector[] = [
  { name: { en: 'Fatima', ar: 'فاطمة' }, checks: 312, passPct: 98.7 },
  { name: { en: 'Yousef', ar: 'يوسف' }, checks: 286, passPct: 97.2 },
  { name: { en: 'Ahmad', ar: 'أحمد' }, checks: 244, passPct: 96.7 },
]

export type QcResult = 'pass' | 'rework' | 'pending'

export interface QcRecord {
  id: string
  kg: number
  inspector: Bi
  result: QcResult
  note: Bi
}

// Historical QC log — seeds the "Recent inspections" list beneath the live
// orders pulled from the customer app.
export const qcSeed: QcRecord[] = [
  {
    id: 'PRS-8842',
    kg: 6.4,
    inspector: { en: 'Fatima', ar: 'فاطمة' },
    result: 'pass',
    note: { en: 'All items pressed & bagged', ar: 'كل القطع مكوية ومعبأة' },
  },
  {
    id: 'PRS-8177',
    kg: 9.1,
    inspector: { en: 'Yousef', ar: 'يوسف' },
    result: 'rework',
    note: { en: 'Collar stain — re-treated', ar: 'بقعة على الياقة — أعيدت المعالجة' },
  },
  {
    id: 'PRS-7431',
    kg: 4.8,
    inspector: { en: 'Ahmad', ar: 'أحمد' },
    result: 'pass',
    note: { en: 'Delivered on hangers', ar: 'سُلّم على علاقات' },
  },
  {
    id: 'PRS-7288',
    kg: 7.2,
    inspector: { en: 'Fatima', ar: 'فاطمة' },
    result: 'pass',
    note: { en: 'Folded set, no issues', ar: 'مجموعة مطوية بدون ملاحظات' },
  },
]

// The per-order quality checklist inspectors run before dispatch.
export const qcChecklist: Bi[] = [
  { en: 'Item count matches order', ar: 'عدد القطع مطابق للطلب' },
  { en: 'No residual stains', ar: 'لا توجد بقع متبقية' },
  { en: 'Pressed & wrinkle-free', ar: 'مكوي وخالٍ من التجاعيد' },
  { en: 'Correct hangers / folding', ar: 'علاقات / طي صحيح' },
  { en: 'Fresh scent & packaging', ar: 'رائحة منعشة وتغليف سليم' },
]
