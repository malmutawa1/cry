import { useI18n } from '../i18n'
import { Close } from '../components/Icons'

interface Bi {
  en: string
  ar: string
}
interface Section {
  title: Bi
  paras?: Bi[]
  bullets?: Bi[]
}

const UPDATED: Bi = { en: '18 July 2026', ar: '١٨ يوليو ٢٠٢٦' }

const INTRO: Bi = {
  en: 'These Terms & Conditions ("Terms") govern your use of the Pressd laundry pickup and delivery service in Kuwait. By creating an account or using Pressd, you agree to these Terms. Please read them carefully.',
  ar: 'تحكم هذه الشروط والأحكام («الشروط») استخدامك لخدمة Pressd لاستلام وتوصيل الغسيل في الكويت. بإنشائك حساباً أو استخدامك Pressd فإنك توافق على هذه الشروط. يُرجى قراءتها بعناية.',
}

const SECTIONS: Section[] = [
  {
    title: { en: '1. The service', ar: '١. الخدمة' },
    paras: [
      { en: 'Pressd is a subscription laundry service. We collect your laundry from your address, clean and press it at our facility, and return it within the delivery window for your plan.', ar: 'Pressd خدمة غسيل بالاشتراك. نستلم غسيلك من عنوانك، وننظّفه ونكويه في منشأتنا، ونعيده إليك خلال نافذة التوصيل الخاصة بباقتك.' },
    ],
  },
  {
    title: { en: '2. Accounts & eligibility', ar: '٢. الحسابات والأهلية' },
    bullets: [
      { en: 'You must be 18 or older and provide accurate account information.', ar: 'يجب أن يكون عمرك ١٨ عاماً فأكثر وأن تقدّم معلومات حساب دقيقة.' },
      { en: 'You are responsible for activity on your account and for keeping your login secure.', ar: 'أنت مسؤول عن النشاط في حسابك وعن الحفاظ على أمان بيانات دخولك.' },
    ],
  },
  {
    title: { en: '3. Subscriptions & billing', ar: '٣. الاشتراكات والفوترة' },
    bullets: [
      { en: 'Plans are billed in advance, monthly or annually, at the price shown when you subscribe.', ar: 'تُحصَّل رسوم الباقات مقدماً، شهرياً أو سنوياً، بالسعر المعروض عند الاشتراك.' },
      { en: 'Subscriptions renew automatically until cancelled. You can cancel or change your plan in the app.', ar: 'تتجدّد الاشتراكات تلقائياً حتى إلغائها. يمكنك إلغاء باقتك أو تغييرها داخل التطبيق.' },
      { en: 'Each plan includes a monthly weight allowance; usage beyond it may be billed as extra-capacity blocks.', ar: 'تتضمّن كل باقة حصة وزن شهرية؛ وقد يُحتسب الاستخدام الزائد عنها كوحدات سعة إضافية.' },
    ],
  },
  {
    title: { en: '4. Pickup, delivery & rush service', ar: '٤. الاستلام والتوصيل والخدمة العاجلة' },
    bullets: [
      { en: 'You choose pickup and delivery windows in the app; please make your laundry available during the pickup window.', ar: 'تختار نوافذ الاستلام والتوصيل في التطبيق؛ يُرجى إتاحة غسيلك خلال نافذة الاستلام.' },
      { en: 'Express and Urgent (rush) service carry an additional fee and are subject to daily capacity limits.', ar: 'تحمل خدمة السريع والعاجل رسوماً إضافية وتخضع لحدود السعة اليومية.' },
      { en: 'Delivery times are estimates and may be affected by weather, traffic, or operational factors.', ar: 'أوقات التوصيل تقديرية وقد تتأثّر بالطقس أو المرور أو عوامل تشغيلية.' },
    ],
  },
  {
    title: { en: '5. Garment care, liability & claims', ar: '٥. العناية بالملابس والمسؤولية والمطالبات' },
    bullets: [
      { en: 'We handle garments with care following common care standards. Some items may not be suitable for our process — check care labels.', ar: 'نتعامل مع الملابس بعناية وفق معايير العناية المتعارف عليها. قد لا تكون بعض القطع مناسبة لعمليتنا — راجع بطاقات العناية.' },
      { en: 'Report any issue within 48 hours of delivery so we can inspect and resolve it.', ar: 'أبلغ عن أي مشكلة خلال ٤٨ ساعة من التسليم لنتمكّن من الفحص والمعالجة.' },
      { en: 'Where we are responsible for loss or damage, our liability is limited to repair, re-cleaning, or reasonable compensation as set out in our claims process.', ar: 'عند مسؤوليتنا عن الفقد أو التلف، تقتصر مسؤوليتنا على الإصلاح أو إعادة التنظيف أو تعويض معقول وفق إجراءات المطالبات لدينا.' },
    ],
  },
  {
    title: { en: '6. Cancellations, freezes & refunds', ar: '٦. الإلغاء والتجميد والاسترداد' },
    paras: [
      { en: 'You can cancel or freeze your membership in the app. A refund is available within 3 days of billing only while no laundry has been picked up in the cycle; once any laundry is collected, or after 3 days, the current period is non-refundable.', ar: 'يمكنك إلغاء عضويتك أو تجميدها داخل التطبيق. يتاح الاسترداد خلال ٣ أيام من الفوترة فقط ما لم يُستلَم أي غسيل في الدورة؛ وبمجرد استلام أي غسيل أو بعد مرور ٣ أيام تصبح الفترة الحالية غير قابلة للاسترداد.' },
    ],
  },
  {
    title: { en: '7. Acceptable use', ar: '٧. الاستخدام المقبول' },
    paras: [
      { en: 'You agree not to misuse the service, submit prohibited or hazardous items, or use Pressd for any unlawful purpose.', ar: 'توافق على عدم إساءة استخدام الخدمة، أو تقديم أغراض محظورة أو خطرة، أو استخدام Pressd لأي غرض غير قانوني.' },
    ],
  },
  {
    title: { en: '8. Changes to the service & Terms', ar: '٨. التغييرات على الخدمة والشروط' },
    paras: [
      { en: 'We may update the service and these Terms from time to time. When we do, we will update the "Last updated" date and may ask you to review and accept the new Terms to continue using Pressd.', ar: 'قد نحدّث الخدمة وهذه الشروط من وقت لآخر. وعند ذلك سنحدّث تاريخ «آخر تحديث» وقد نطلب منك مراجعة الشروط الجديدة وقبولها لمتابعة استخدام Pressd.' },
    ],
  },
  {
    title: { en: '9. Governing law', ar: '٩. القانون الحاكم' },
    paras: [
      { en: 'These Terms are governed by the laws of the State of Kuwait, and any disputes are subject to the competent Kuwaiti courts.', ar: 'تخضع هذه الشروط لقوانين دولة الكويت، وتختص المحاكم الكويتية المختصة بأي نزاعات.' },
    ],
  },
  {
    title: { en: '10. Contact us', ar: '١٠. تواصل معنا' },
    paras: [
      { en: 'Questions about these Terms? Contact us at support@pressd.example.', ar: 'أسئلة حول هذه الشروط؟ تواصل معنا عبر support@pressd.example.' },
    ],
  },
]

export default function Terms({ onBack }: { onBack: () => void }) {
  const { t, lang } = useI18n()
  const pick = (b: Bi) => (lang === 'ar' ? b.ar : b.en)

  return (
    <>
      <div className="topbar">
        <button className="round-btn" onClick={onBack} aria-label={t('common.back')}>
          <Close />
        </button>
        <h1>{t('terms.title')}</h1>
        <span style={{ width: 42 }} />
      </div>

      <div className="screen">
        <div className="privacy-updated">{t('privacy.updated', { date: pick(UPDATED) })}</div>
        <p className="privacy-p privacy-intro">{pick(INTRO)}</p>

        {SECTIONS.map((s, i) => (
          <section key={i} className="privacy-section">
            <h2 className="privacy-h">{pick(s.title)}</h2>
            {s.paras?.map((p, j) => (
              <p key={j} className="privacy-p">{pick(p)}</p>
            ))}
            {s.bullets && (
              <ul className="privacy-list">
                {s.bullets.map((b, j) => (
                  <li key={j}>{pick(b)}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
        <div style={{ height: 16 }} />
      </div>
    </>
  )
}
