import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

export type Lang = 'en' | 'ar'

type Dict = Record<string, string>

const en: Dict = {
  brand: 'Pressd',

  'nav.home': 'Home',
  'nav.plans': 'Plans',
  'nav.pickup': 'Pickup',
  'nav.account': 'Account',

  'home.greeting': 'Hello, Abdullah',
  'home.subtitle': 'Your laundry, handled.',
  'home.schedule': 'Schedule a pickup',
  'home.plan.active': '{name} membership',
  'home.plan.allowance': '{used} of {cap} kg used this month',
  'home.plan.none.title': 'No active membership',
  'home.plan.none.sub': 'Pick a monthly plan and stop counting items.',
  'home.plan.none.cta': 'Choose a plan',
  'home.how': 'How it works',
  'home.step1.t': 'Book a pickup window',
  'home.step1.s': 'Choose a time that suits you in the app.',
  'home.step2.t': 'We collect at your door',
  'home.step2.s': 'A driver picks up your laundry in a Pressd bag.',
  'home.step3.t': 'Washed, pressed & returned',
  'home.step3.s': 'Delivered back on hangers within your window.',

  'plans.title': 'Membership',
  'plans.heroTitle': 'One flat price. Every load.',
  'plans.heroSub': 'No per-item math — a monthly allowance, picked up and delivered free.',
  'plans.free': 'Free pickup & delivery on every plan. Freeze anytime while you travel.',
  'plans.popular': 'MOST POPULAR',
  'plans.cap': 'Up to {kg} kg / month',
  'plans.per': 'KWD / month',
  'plans.perYear': 'KWD / year',
  'plans.subscribe': 'Subscribe to {name}',
  'plans.select': 'Select a plan',
  'plans.cancel': '{price}.000 KWD / month · cancel anytime',
  'plans.cancelYear': '{price}.000 KWD / year · cancel anytime',
  'billing.monthly': 'Monthly',
  'billing.annual': 'Annual',
  'billing.save': 'Save {pct}%',
  'plans.annualNote': '2 months free · {perMonth} KWD/mo billed yearly',

  'pickup.title': 'Schedule Pickup',
  'pickup.address': 'Address',
  'pickup.pickup': 'Pick-up',
  'pickup.delivery': 'Delivery',
  'pickup.phone': 'Contact phone number',
  'pickup.hangers': 'Hangers',
  'pickup.hangers.sub': 'Deliver on hangers, disable for folded items',
  'pickup.free': 'Free',
  'pickup.note': 'Add Note',
  'pickup.note.sub': 'The laundry may contact you for details',
  'pickup.info': 'Weighed against your monthly allowance at pickup.',
  'pickup.confirm': 'Confirm pickup',
  'pickup.none.title': 'Choose a membership first',
  'pickup.none.sub': 'Pickups are covered by your monthly plan.',
  'pickup.none.cta': 'See plans',

  'sheet.pickup': 'Select pick-up time',
  'sheet.delivery': 'Select delivery time',
  'sheet.address': 'Delivery address',
  'sheet.phone': 'Contact phone number',
  'sheet.note': 'Add a note',
  'sheet.note.ph': 'e.g. Ring the bell twice, leave with the guard…',
  'common.save': 'Save',

  'success.title': 'Pickup confirmed',
  'success.head': "You're all set!",
  'success.body': "Your driver will collect your laundry during the pick-up window. We'll notify you at each step.",
  'success.order': 'Order {id}',
  'success.pickup': 'Pick-up',
  'success.delivery': 'Delivery',
  'success.plan': 'Plan',
  'success.home': 'Back to home',

  'account.title': 'Account',
  'account.name': 'Abdullah',
  'account.renews': 'Renews 1 Aug · {price}.000 KWD / month',
  'account.renewsYear': 'Renews next year · {price}.000 KWD / year',
  'account.used': '{kg} kg used',
  'account.allow': '{kg} kg allowance',
  'account.none.title': 'No active plan',
  'account.none.sub': 'Subscribe to a monthly membership and stop counting items.',
  'account.none.cta': 'See membership plans',
  'account.orders': 'Order history',
  'account.addresses': 'Saved addresses',
  'account.payment': 'Payment methods',
  'account.freeze': 'Freeze subscription',
  'account.personal': 'Personal details',
  'account.refer': 'Refer a friend — get 5 KWD',
  'account.language': 'Language',
  'account.lang.value': 'English',
  'account.logout': 'Log out',

  'auth.login.title': 'Welcome back',
  'auth.login.sub': 'Log in to manage your laundry membership.',
  'auth.signup.title': 'Create your account',
  'auth.signup.sub': 'Join Pressd and put laundry on autopilot.',
  'auth.name': 'Full name',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.login.cta': 'Log in',
  'auth.signup.cta': 'Create account',
  'auth.apple': 'Continue with Apple',
  'auth.or': 'or',
  'auth.toSignup': "Don't have an account? Sign up",
  'auth.toLogin': 'Already have an account? Log in',
  'auth.terms': 'By continuing you agree to our Terms & Privacy Policy.',

  'pay.title': 'Payment',
  'pay.sheet': 'Pay With',
  'pay.applepay': 'Apple Pay',
  'pay.knet': 'KNET',
  'pay.card': '{brand} ·· {last4}',
  'pay.add': 'Add New Card',
  'pay.add.sub': 'International or Credit Cards',
  'pay.card.number': 'Card number',
  'pay.card.exp': 'MM / YY',
  'pay.card.cvv': 'CVV',
  'pay.card.name': 'Name on card',
  'pay.card.save': 'Save card',
}

const ar: Dict = {
  brand: 'Pressd',

  'nav.home': 'الرئيسية',
  'nav.plans': 'الباقات',
  'nav.pickup': 'الاستلام',
  'nav.account': 'حسابي',

  'home.greeting': 'مرحباً، عبدالله',
  'home.subtitle': 'غسيلك، علينا.',
  'home.schedule': 'احجز موعد استلام',
  'home.plan.active': 'عضوية {name}',
  'home.plan.allowance': 'استُخدم {used} من {cap} كجم هذا الشهر',
  'home.plan.none.title': 'لا توجد عضوية نشطة',
  'home.plan.none.sub': 'اختر باقة شهرية وتوقّف عن حساب القطع.',
  'home.plan.none.cta': 'اختر باقة',
  'home.how': 'كيف تعمل',
  'home.step1.t': 'احجز موعد الاستلام',
  'home.step1.s': 'اختر الوقت المناسب لك من التطبيق.',
  'home.step2.t': 'نستلم من باب منزلك',
  'home.step2.s': 'يستلم السائق غسيلك في كيس Pressd.',
  'home.step3.t': 'نغسل ونكوي ونعيد',
  'home.step3.s': 'يُعاد إليك على علاقات ضمن الموعد المحدد.',

  'plans.title': 'العضوية',
  'plans.heroTitle': 'سعر ثابت. لكل غسلة.',
  'plans.heroSub': 'بدون حساب لكل قطعة — كمية شهرية، استلام وتوصيل مجاني.',
  'plans.free': 'استلام وتوصيل مجاني لكل الباقات. أوقف اشتراكك مؤقتاً عند السفر.',
  'plans.popular': 'الأكثر طلباً',
  'plans.cap': 'حتى {kg} كجم شهرياً',
  'plans.per': 'د.ك / شهرياً',
  'plans.perYear': 'د.ك / سنوياً',
  'plans.subscribe': 'اشترك في {name}',
  'plans.select': 'اختر باقة',
  'plans.cancel': '{price}٫٠٠٠ د.ك شهرياً · إلغاء في أي وقت',
  'plans.cancelYear': '{price}٫٠٠٠ د.ك سنوياً · إلغاء في أي وقت',
  'billing.monthly': 'شهري',
  'billing.annual': 'سنوي',
  'billing.save': 'وفّر {pct}٪',
  'plans.annualNote': 'شهران مجاناً · {perMonth} د.ك شهرياً تُدفع سنوياً',

  'pickup.title': 'حجز الاستلام',
  'pickup.address': 'العنوان',
  'pickup.pickup': 'الاستلام',
  'pickup.delivery': 'التوصيل',
  'pickup.phone': 'رقم الهاتف',
  'pickup.hangers': 'علاقات',
  'pickup.hangers.sub': 'التوصيل على علاقات، أوقفه للملابس المطوية',
  'pickup.free': 'مجاني',
  'pickup.note': 'إضافة ملاحظة',
  'pickup.note.sub': 'قد نتواصل معك للتفاصيل',
  'pickup.info': 'يُحتسب الوزن من كميتك الشهرية عند الاستلام.',
  'pickup.confirm': 'تأكيد الاستلام',
  'pickup.none.title': 'اختر باقة أولاً',
  'pickup.none.sub': 'الاستلام مشمول ضمن باقتك الشهرية.',
  'pickup.none.cta': 'عرض الباقات',

  'sheet.pickup': 'اختر وقت الاستلام',
  'sheet.delivery': 'اختر وقت التوصيل',
  'sheet.address': 'عنوان التوصيل',
  'sheet.phone': 'رقم الهاتف',
  'sheet.note': 'أضف ملاحظة',
  'sheet.note.ph': 'مثال: اقرع الجرس مرتين، اتركه مع الحارس…',
  'common.save': 'حفظ',

  'success.title': 'تم تأكيد الاستلام',
  'success.head': 'كل شيء جاهز!',
  'success.body': 'سيستلم السائق غسيلك خلال موعد الاستلام. سنبلغك في كل خطوة.',
  'success.order': 'الطلب {id}',
  'success.pickup': 'الاستلام',
  'success.delivery': 'التوصيل',
  'success.plan': 'الباقة',
  'success.home': 'العودة للرئيسية',

  'account.title': 'حسابي',
  'account.name': 'عبدالله',
  'account.renews': 'تتجدد ١ أغسطس · {price}٫٠٠٠ د.ك شهرياً',
  'account.renewsYear': 'تتجدد العام القادم · {price}٫٠٠٠ د.ك سنوياً',
  'account.used': 'استُخدم {kg} كجم',
  'account.allow': 'المتاح {kg} كجم',
  'account.none.title': 'لا توجد باقة نشطة',
  'account.none.sub': 'اشترك في عضوية شهرية وتوقّف عن حساب القطع.',
  'account.none.cta': 'عرض الباقات',
  'account.orders': 'سجل الطلبات',
  'account.addresses': 'العناوين المحفوظة',
  'account.payment': 'طرق الدفع',
  'account.freeze': 'إيقاف الاشتراك مؤقتاً',
  'account.personal': 'البيانات الشخصية',
  'account.refer': 'ادعُ صديقاً — احصل على ٥ د.ك',
  'account.language': 'اللغة',
  'account.lang.value': 'العربية',
  'account.logout': 'تسجيل الخروج',

  'auth.login.title': 'مرحباً بعودتك',
  'auth.login.sub': 'سجّل الدخول لإدارة عضوية الغسيل.',
  'auth.signup.title': 'أنشئ حسابك',
  'auth.signup.sub': 'انضم إلى Pressd واجعل الغسيل تلقائياً.',
  'auth.name': 'الاسم الكامل',
  'auth.email': 'البريد الإلكتروني',
  'auth.password': 'كلمة المرور',
  'auth.login.cta': 'تسجيل الدخول',
  'auth.signup.cta': 'إنشاء حساب',
  'auth.apple': 'المتابعة عبر Apple',
  'auth.or': 'أو',
  'auth.toSignup': 'ليس لديك حساب؟ سجّل الآن',
  'auth.toLogin': 'لديك حساب بالفعل؟ سجّل الدخول',
  'auth.terms': 'بالمتابعة فإنك توافق على الشروط وسياسة الخصوصية.',

  'pay.title': 'الدفع',
  'pay.sheet': 'ادفع بواسطة',
  'pay.applepay': 'Apple Pay',
  'pay.knet': 'كي نت',
  'pay.card': '{brand} ·· {last4}',
  'pay.add': 'إضافة بطاقة جديدة',
  'pay.add.sub': 'بطاقات دولية أو ائتمانية',
  'pay.card.number': 'رقم البطاقة',
  'pay.card.exp': 'شهر / سنة',
  'pay.card.cvv': 'الرمز',
  'pay.card.name': 'الاسم على البطاقة',
  'pay.card.save': 'حفظ البطاقة',
}

const dicts: Record<Lang, Dict> = { en, ar }

interface I18n {
  lang: Lang
  dir: 'ltr' | 'rtl'
  setLang: (l: Lang) => void
  toggle: () => void
  t: (key: string, vars?: Record<string, string | number>) => string
}

const Ctx = createContext<I18n | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en')

  const value = useMemo<I18n>(() => {
    const dir = lang === 'ar' ? 'rtl' : 'ltr'
    const t = (key: string, vars?: Record<string, string | number>) => {
      let s = dicts[lang][key] ?? dicts.en[key] ?? key
      if (vars) {
        for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v))
      }
      return s
    }
    return { lang, dir, setLang, toggle: () => setLang(lang === 'en' ? 'ar' : 'en'), t }
  }, [lang])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useI18n() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
