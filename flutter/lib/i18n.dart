import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';

/// Lightweight bilingual (EN/AR) localization + RTL. Flutter port of i18n.tsx
/// (customer-app subset).
class LocaleState extends ChangeNotifier {
  String _lang = 'en';
  String get lang => _lang;
  bool get isAr => _lang == 'ar';
  TextDirection get dir => _lang == 'ar' ? TextDirection.rtl : TextDirection.ltr;

  void toggle() {
    _lang = _lang == 'en' ? 'ar' : 'en';
    notifyListeners();
  }

  void set(String l) {
    _lang = l;
    notifyListeners();
  }

  String t(String key, [Map<String, Object>? args]) {
    var s = (_lang == 'ar' ? _ar[key] : _en[key]) ?? _en[key] ?? key;
    if (args != null) {
      args.forEach((k, v) => s = s.replaceAll('{$k}', '$v'));
    }
    return s;
  }
}

const _en = <String, String>{
  'brand': 'Pressd',
  'nav.home': 'Home',
  'nav.plans': 'Plans',
  'nav.pickup': 'Pickup',
  'nav.track': 'Track',
  'nav.account': 'Account',

  'welcome.tagline': 'Your laundry, handled.',
  'welcome.start': 'Get started',

  'auth.title': 'Welcome to Pressd',
  'auth.createTitle': 'Create your account',
  'auth.sub': 'Manage your laundry subscription.',
  'auth.name': 'Full name',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.signIn': 'Sign in',
  'auth.create': 'Create account',
  'auth.noAccount': "Don't have an account? Sign up",
  'auth.haveAccount': 'Already have an account? Sign in',
  'auth.apple': 'Continue with Apple',
  'auth.or': 'or',

  'home.track.title': 'Track your order',
  'home.track.cta': 'LIVE',
  'home.rewards.title': 'Pressd Rewards',
  'home.rewards.pts': '{n} pts',

  'track.title': 'Track order',
  'track.none.title': 'No active order',
  'track.none.sub': 'Schedule a pickup and follow it here in real time.',
  'track.none.cta': 'Schedule a pickup',
  'track.live': 'LIVE',
  'track.eta': 'Estimated {label}',
  'track.driver': 'Your driver',
  'track.delivered': 'Delivered — thank you!',
  'st.0': 'Order received',
  'st.1': 'Picked up',
  'st.2': 'Washing',
  'st.3': 'Pressing',
  'st.4': 'Out for delivery',
  'st.5': 'Delivered',

  'rewards.title': 'Rewards',
  'rewards.points': 'points',
  'rewards.ways': 'Ways to earn',
  'rewards.redeem': 'Redeem rewards',
  'rewards.earn.pickup': 'Complete a pickup',
  'rewards.earn.refer': 'Refer a friend',
  'rewards.earn.annual': 'Subscribe annually',
  'rewards.r.items': 'Free 10 extra items',
  'rewards.r.credit': '5 KWD account credit',
  'rewards.r.month': 'One free month',
  'rewards.need': 'Need {n} more',
  'rewards.redeemed': 'Redeemed ✓',
  'rewards.pts': 'pts',

  'home.hello': 'Hello, {name}',
  'home.subtitle': 'Your laundry, handled.',
  'home.plan.active': '{name} membership',
  'home.plan.allowance': '{used} of {cap} items used this month',
  'home.plan.remain': '{n} items left this month',
  'home.plan.none.title': 'No active membership',
  'home.plan.none.sub': 'Pick a monthly plan and stop counting items.',
  'home.plan.none.cta': 'Choose a plan',
  'home.schedule': 'Schedule a pickup',
  'count.title': 'How items are counted',
  'count.bedding': 'Bedding',
  'count.beddingEg': 'Duvets, comforters, large bedding',
  'count.addon': 'Paid add-on',

  'plans.title': 'Membership',
  'plans.heroTitle': 'One flat price. Every load.',
  'plans.heroSub': 'A monthly item allowance — picked up and delivered free.',
  'plans.popular': 'MOST POPULAR',
  'plans.cap': 'Up to {n} items / month',
  'plans.per': 'KWD / month',
  'plans.subscribe': 'Subscribe to {name}',
  'plans.current': 'This is your current plan',
  'plans.subscribed': 'Subscribed to {name}',

  'pickup.title': 'Schedule Pickup',
  'pickup.address': 'Address',
  'pickup.pickup': 'Pick-up',
  'pickup.delivery': 'Delivery',
  'pickup.confirm': 'Confirm pickup',
  'pickup.none.title': 'No active plan',
  'pickup.none.sub': 'Subscribe to a membership to schedule a pickup.',
  'pickup.none.cta': 'See plans',
  'pickup.collected': "We've collected {n} garments ✓",
  'pickup.done': 'Done',

  'garment.card.title': 'What are you sending?',
  'garment.card.empty': "Add the garments you're handing over",
  'garment.card.summary': '{units} garments · {pieces} pieces',
  'garment.card.add': 'Add',
  'garment.card.edit': 'Edit',
  'garment.card.required': 'Add your items to continue',
  'garment.pick.title': 'What are you sending?',
  'garment.pick.hint': "Add each garment you're handing over — we count it live.",
  'garment.search': 'Search garments…',
  'garment.pieces': '{n} pieces',
  'garment.piece1': '1 piece',
  'garment.addon': 'Add-on',
  'garment.totalPieces': 'total pieces',
  'garment.units': '{n} garments',
  'garment.doneBtn': 'Done',
  'garment.review.title': 'Review your items',
  'garment.review.checkout': 'Proceed to checkout',

  'account.title': 'Account',
  'account.used': '{n} items used',
  'account.allow': '{n} items allowance',
  'account.language': 'Language',
  'account.none.title': 'No active plan',
  'account.signout': 'Sign out',
};

const _ar = <String, String>{
  'brand': 'Pressd',
  'nav.home': 'الرئيسية',
  'nav.plans': 'الباقات',
  'nav.pickup': 'الاستلام',
  'nav.track': 'التتبع',
  'nav.account': 'حسابي',

  'welcome.tagline': 'غسيلك، علينا.',
  'welcome.start': 'ابدأ',

  'auth.title': 'مرحباً بك في Pressd',
  'auth.createTitle': 'أنشئ حسابك',
  'auth.sub': 'أدر اشتراك غسيلك.',
  'auth.name': 'الاسم الكامل',
  'auth.email': 'البريد الإلكتروني',
  'auth.password': 'كلمة المرور',
  'auth.signIn': 'تسجيل الدخول',
  'auth.create': 'إنشاء حساب',
  'auth.noAccount': 'ليس لديك حساب؟ سجّل',
  'auth.haveAccount': 'لديك حساب؟ سجّل الدخول',
  'auth.apple': 'المتابعة عبر Apple',
  'auth.or': 'أو',

  'home.track.title': 'تتبّع طلبك',
  'home.track.cta': 'مباشر',
  'home.rewards.title': 'مكافآت Pressd',
  'home.rewards.pts': '{n} نقطة',

  'track.title': 'تتبّع الطلب',
  'track.none.title': 'لا يوجد طلب نشط',
  'track.none.sub': 'احجز استلاماً وتابعه هنا مباشرةً.',
  'track.none.cta': 'احجز موعد استلام',
  'track.live': 'مباشر',
  'track.eta': 'الوصول المتوقع {label}',
  'track.driver': 'السائق',
  'track.delivered': 'تم التوصيل — شكراً لك!',
  'st.0': 'تم استلام الطلب',
  'st.1': 'تم الاستلام',
  'st.2': 'الغسيل',
  'st.3': 'الكي',
  'st.4': 'في الطريق للتوصيل',
  'st.5': 'تم التوصيل',

  'rewards.title': 'المكافآت',
  'rewards.points': 'نقطة',
  'rewards.ways': 'طرق الكسب',
  'rewards.redeem': 'استبدال المكافآت',
  'rewards.earn.pickup': 'أكمل عملية استلام',
  'rewards.earn.refer': 'ادعُ صديقاً',
  'rewards.earn.annual': 'اشترك سنوياً',
  'rewards.r.items': '10 قطع إضافية مجاناً',
  'rewards.r.credit': 'رصيد 5 د.ك',
  'rewards.r.month': 'شهر مجاني',
  'rewards.need': 'تحتاج {n} أكثر',
  'rewards.redeemed': 'تم الاستبدال ✓',
  'rewards.pts': 'نقطة',

  'home.hello': 'مرحباً، {name}',
  'home.subtitle': 'غسيلك، علينا.',
  'home.plan.active': 'عضوية {name}',
  'home.plan.allowance': 'استُخدم {used} من {cap} قطعة هذا الشهر',
  'home.plan.remain': 'يتبقى {n} قطعة هذا الشهر',
  'home.plan.none.title': 'لا توجد عضوية نشطة',
  'home.plan.none.sub': 'اختر باقة شهرية وتوقّف عن حساب القطع.',
  'home.plan.none.cta': 'اختر باقة',
  'home.schedule': 'احجز موعد استلام',
  'count.title': 'كيف تُحتسب القطع',
  'count.bedding': 'المفروشات',
  'count.beddingEg': 'لحف، مفارش، مفروشات كبيرة',
  'count.addon': 'إضافة مدفوعة',

  'plans.title': 'العضوية',
  'plans.heroTitle': 'سعر ثابت. لكل غسلة.',
  'plans.heroSub': 'كمية قطع شهرية — استلام وتوصيل مجاني.',
  'plans.popular': 'الأكثر طلباً',
  'plans.cap': 'حتى {n} قطعة شهرياً',
  'plans.per': 'د.ك / شهرياً',
  'plans.subscribe': 'اشترك في {name}',
  'plans.current': 'باقتك الحالية',
  'plans.subscribed': 'تم الاشتراك في {name}',

  'pickup.title': 'حجز الاستلام',
  'pickup.address': 'العنوان',
  'pickup.pickup': 'الاستلام',
  'pickup.delivery': 'التوصيل',
  'pickup.confirm': 'تأكيد الاستلام',
  'pickup.none.title': 'لا توجد باقة نشطة',
  'pickup.none.sub': 'اشترك في عضوية لحجز الاستلام.',
  'pickup.none.cta': 'عرض الباقات',
  'pickup.collected': 'تم استلام {n} قطعة ✓',
  'pickup.done': 'تم',

  'garment.card.title': 'ماذا سترسل؟',
  'garment.card.empty': 'أضِف القطع التي ستسلّمها',
  'garment.card.summary': '{units} قطعة · {pieces} إجمالي',
  'garment.card.add': 'إضافة',
  'garment.card.edit': 'تعديل',
  'garment.card.required': 'أضِف قطعك للمتابعة',
  'garment.pick.title': 'ماذا سترسل؟',
  'garment.pick.hint': 'أضِف كل قطعة ستسلّمها — نحسبها لك مباشرة.',
  'garment.search': 'ابحث عن قطعة…',
  'garment.pieces': '{n} قطع',
  'garment.piece1': 'قطعة واحدة',
  'garment.addon': 'إضافة',
  'garment.totalPieces': 'إجمالي القطع',
  'garment.units': '{n} قطعة',
  'garment.doneBtn': 'تم',
  'garment.review.title': 'مراجعة قطعك',
  'garment.review.checkout': 'المتابعة إلى الدفع',

  'account.title': 'حسابي',
  'account.used': 'استُخدم {n} قطعة',
  'account.allow': 'المتاح {n} قطعة',
  'account.language': 'اللغة',
  'account.none.title': 'لا توجد باقة نشطة',
  'account.signout': 'تسجيل الخروج',
};
