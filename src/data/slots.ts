import type { Lang } from '../i18n'

export interface Slot {
  id: string
  day: { en: string; ar: string }
  time: { en: string; ar: string }
}

export const pickupSlots: Slot[] = [
  { id: 'p1', day: { en: 'Today', ar: 'اليوم' }, time: { en: '6 PM – 8 PM', ar: '٦ م – ٨ م' } },
  { id: 'p2', day: { en: 'Tomorrow', ar: 'غداً' }, time: { en: '8 AM – 10 AM', ar: '٨ ص – ١٠ ص' } },
  { id: 'p3', day: { en: 'Tomorrow', ar: 'غداً' }, time: { en: '10 AM – 12 PM', ar: '١٠ ص – ١٢ م' } },
  { id: 'p4', day: { en: 'Tomorrow', ar: 'غداً' }, time: { en: '4 PM – 6 PM', ar: '٤ م – ٦ م' } },
]

export const deliverySlots: Slot[] = [
  { id: 'd1', day: { en: 'Tomorrow', ar: 'غداً' }, time: { en: '10 AM – 10 PM', ar: '١٠ ص – ١٠ م' } },
  { id: 'd2', day: { en: 'Sun, 13 Jul', ar: 'الأحد ١٣ يوليو' }, time: { en: '10 AM – 10 PM', ar: '١٠ ص – ١٠ م' } },
  { id: 'd3', day: { en: 'Mon, 14 Jul', ar: 'الاثنين ١٤ يوليو' }, time: { en: '10 AM – 10 PM', ar: '١٠ ص – ١٠ م' } },
  { id: 'd4', day: { en: 'Tue, 15 Jul', ar: 'الثلاثاء ١٥ يوليو' }, time: { en: '8 AM – 12 PM', ar: '٨ ص – ١٢ م' } },
  { id: 'd5', day: { en: 'Tue, 15 Jul', ar: 'الثلاثاء ١٥ يوليو' }, time: { en: '4 PM – 8 PM', ar: '٤ م – ٨ م' } },
]

export function slotLabel(s: Slot, lang: Lang): string {
  return `${s.day[lang]}, ${s.time[lang]}`
}

export const defaultPickup = pickupSlots[0]
export const defaultDelivery = deliverySlots[0]
