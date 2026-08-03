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
  'nav.account': 'Account',

  'welcome.tagline': 'Your laundry, handled.',
  'welcome.start': 'Get started',

  'auth.title': 'Welcome to Pressd',
  'auth.sub': 'Sign in to manage your laundry subscription.',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.signIn': 'Sign in',
  'auth.apple': 'Continue with Apple',
  'auth.or': 'or',

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
  'nav.account': 'حسابي',

  'welcome.tagline': 'غسيلك، علينا.',
  'welcome.start': 'ابدأ',

  'auth.title': 'مرحباً بك في Pressd',
  'auth.sub': 'سجّل الدخول لإدارة اشتراك غسيلك.',
  'auth.email': 'البريد الإلكتروني',
  'auth.password': 'كلمة المرور',
  'auth.signIn': 'تسجيل الدخول',
  'auth.apple': 'المتابعة عبر Apple',
  'auth.or': 'أو',

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
