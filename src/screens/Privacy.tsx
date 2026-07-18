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

// Privacy policy content for the Pressd laundry service. Kept in the component
// (not i18n) since it is long-form, self-contained copy in both languages.
const UPDATED: Bi = { en: '18 July 2026', ar: '١٨ يوليو ٢٠٢٦' }

const INTRO: Bi = {
  en: 'Pressd ("we", "us", or "our") operates the Pressd laundry pickup and delivery service in Kuwait. This Privacy Policy explains what personal information we collect, how we use and protect it, and the choices you have. By using Pressd, you agree to the practices described here.',
  ar: 'تُشغّل Pressd («نحن» أو «لنا») خدمة استلام وتوصيل الغسيل في الكويت. توضّح سياسة الخصوصية هذه المعلومات الشخصية التي نجمعها، وكيف نستخدمها ونحميها، والخيارات المتاحة لك. باستخدامك Pressd فإنك توافق على الممارسات الموضّحة هنا.',
}

const SECTIONS: Section[] = [
  {
    title: { en: '1. Information we collect', ar: '١. المعلومات التي نجمعها' },
    bullets: [
      { en: 'Account details: your name, email address, phone number, delivery address, and the gender you choose at sign-up.', ar: 'بيانات الحساب: اسمك وبريدك الإلكتروني ورقم هاتفك وعنوان التوصيل والجنس الذي تختاره عند التسجيل.' },
      { en: 'Order information: pickup and delivery times, laundry preferences (such as hangers and notes), weight used against your plan, and order history.', ar: 'معلومات الطلب: مواعيد الاستلام والتوصيل، وتفضيلات الغسيل (مثل العلاقات والملاحظات)، والوزن المستخدم من باقتك، وسجل الطلبات.' },
      { en: 'Payment information: the payment method you choose (Apple Pay, KNET, or a card). Card payments are handled by our payment providers; we do not store your full card number.', ar: 'معلومات الدفع: طريقة الدفع التي تختارها (Apple Pay أو KNET أو بطاقة). تُعالَج مدفوعات البطاقات عبر مزوّدي الدفع لدينا، ولا نحتفظ برقم بطاقتك كاملاً.' },
      { en: 'Usage and device data: app interactions, language and appearance preferences, and basic device information used to keep the app working and secure.', ar: 'بيانات الاستخدام والجهاز: تفاعلاتك مع التطبيق، وتفضيلات اللغة والمظهر، ومعلومات أساسية عن الجهاز تُستخدم للحفاظ على عمل التطبيق وأمانه.' },
    ],
  },
  {
    title: { en: '2. How we use your information', ar: '٢. كيف نستخدم معلوماتك' },
    bullets: [
      { en: 'To provide the service: schedule pickups and deliveries, process your subscription, and keep you updated on your orders.', ar: 'لتقديم الخدمة: جدولة الاستلام والتوصيل، ومعالجة اشتراكك، وإبقائك على اطلاع بطلباتك.' },
      { en: 'To personalize your experience, including your preferred language and plan.', ar: 'لتخصيص تجربتك، بما في ذلك لغتك وباقتك المفضّلة.' },
      { en: 'To communicate with you: order updates, service notices, and — where you allow it — offers and promotions.', ar: 'للتواصل معك: تحديثات الطلبات، وإشعارات الخدمة، والعروض والترويجات عند موافقتك.' },
      { en: 'To improve, secure, and troubleshoot the service.', ar: 'لتحسين الخدمة وتأمينها ومعالجة المشكلات.' },
      { en: 'To meet legal, tax, and regulatory obligations.', ar: 'للوفاء بالالتزامات القانونية والضريبية والتنظيمية.' },
    ],
  },
  {
    title: { en: '3. Payments', ar: '٣. المدفوعات' },
    paras: [
      { en: 'Payments are processed by third-party providers (such as Apple Pay, KNET, and card networks). We receive confirmation of payment and a masked reference — for example, the last four digits of a card — but we do not collect or store your full card details.', ar: 'تُعالَج المدفوعات عبر مزوّدين خارجيين (مثل Apple Pay وKNET وشبكات البطاقات). نستلم تأكيد الدفع ومرجعاً مُخفىً — مثل آخر أربعة أرقام من البطاقة — لكننا لا نجمع أو نخزّن تفاصيل بطاقتك كاملة.' },
    ],
  },
  {
    title: { en: '4. Sharing your information', ar: '٤. مشاركة معلوماتك' },
    paras: [{ en: 'We share personal information only as needed to run the service:', ar: 'نشارك المعلومات الشخصية فقط بالقدر اللازم لتشغيل الخدمة:' }],
    bullets: [
      { en: 'Delivery drivers and facility staff, to collect, process, and return your laundry.', ar: 'سائقو التوصيل وموظفو المنشأة، لاستلام غسيلك ومعالجته وإعادته.' },
      { en: 'Service providers (payment processing, hosting, analytics, customer support) acting on our behalf under confidentiality obligations.', ar: 'مزوّدو الخدمات (معالجة الدفع، الاستضافة، التحليلات، دعم العملاء) الذين يعملون نيابةً عنا وفق التزامات سرّية.' },
      { en: 'Authorities or other parties when required by law, or to protect our rights, our users, and safety.', ar: 'الجهات الرسمية أو أطراف أخرى عند اقتضاء القانون، أو لحماية حقوقنا ومستخدمينا والسلامة.' },
    ],
  },
  {
    title: { en: '5. Data retention', ar: '٥. الاحتفاظ بالبيانات' },
    paras: [
      { en: 'We keep your information for as long as your account is active and as needed to provide the service, then for any period required to meet legal, accounting, or reporting obligations. You can ask us to delete your account at any time.', ar: 'نحتفظ بمعلوماتك طالما كان حسابك نشطاً وبالقدر اللازم لتقديم الخدمة، ثم للمدة المطلوبة للوفاء بالالتزامات القانونية أو المحاسبية أو التنظيمية. يمكنك طلب حذف حسابك في أي وقت.' },
    ],
  },
  {
    title: { en: '6. Your rights and choices', ar: '٦. حقوقك وخياراتك' },
    paras: [{ en: 'Depending on applicable law, you may:', ar: 'وفقاً للقوانين المعمول بها، يمكنك:' }],
    bullets: [
      { en: 'Access the personal information we hold about you.', ar: 'الوصول إلى المعلومات الشخصية التي نحتفظ بها عنك.' },
      { en: 'Correct or update inaccurate information — you can edit most details in the app.', ar: 'تصحيح أو تحديث المعلومات غير الدقيقة — يمكنك تعديل معظم البيانات داخل التطبيق.' },
      { en: 'Request deletion of your account and associated data.', ar: 'طلب حذف حسابك والبيانات المرتبطة به.' },
      { en: 'Opt out of marketing messages at any time.', ar: 'إلغاء الاشتراك في الرسائل التسويقية في أي وقت.' },
    ],
  },
  {
    title: { en: '7. Security', ar: '٧. الأمان' },
    paras: [
      { en: 'We use administrative, technical, and organizational measures to protect your information. No method of transmission or storage is completely secure, but we work to safeguard your data and limit access to those who need it.', ar: 'نستخدم تدابير إدارية وتقنية وتنظيمية لحماية معلوماتك. لا توجد وسيلة نقل أو تخزين آمنة تماماً، لكننا نعمل على حماية بياناتك وقصر الوصول على من يحتاجه.' },
    ],
  },
  {
    title: { en: '8. Children’s privacy', ar: '٨. خصوصية الأطفال' },
    paras: [
      { en: 'Pressd is intended for users aged 18 and older. We do not knowingly collect personal information from children. If you believe a child has provided us information, contact us and we will delete it.', ar: 'Pressd مخصّص للمستخدمين من عمر ١٨ عاماً فأكثر. لا نجمع عن قصد معلومات شخصية من الأطفال. إذا كنت تعتقد أن طفلاً زوّدنا بمعلومات، تواصل معنا وسنقوم بحذفها.' },
    ],
  },
  {
    title: { en: '9. Where your data is processed', ar: '٩. أين تُعالَج بياناتك' },
    paras: [
      { en: 'Pressd operates in Kuwait. Some service providers may process data outside Kuwait; where they do, we take steps to ensure your information remains protected in line with this policy and applicable law.', ar: 'تعمل Pressd في الكويت. قد يعالج بعض مزوّدي الخدمة البيانات خارج الكويت؛ وعند حدوث ذلك نتخذ خطوات لضمان بقاء معلوماتك محمية بما يتوافق مع هذه السياسة والقوانين المعمول بها.' },
    ],
  },
  {
    title: { en: '10. Changes to this policy', ar: '١٠. تغييرات على هذه السياسة' },
    paras: [
      { en: 'We may update this Privacy Policy from time to time. We will post the updated version here and change the “Last updated” date above. Significant changes may be communicated in the app.', ar: 'قد نحدّث سياسة الخصوصية هذه من وقت لآخر. سننشر النسخة المحدّثة هنا ونغيّر تاريخ «آخر تحديث» بالأعلى. وقد يتم إبلاغك بالتغييرات الجوهرية داخل التطبيق.' },
    ],
  },
  {
    title: { en: '11. Contact us', ar: '١١. تواصل معنا' },
    paras: [
      { en: 'Questions or requests about your privacy? Contact us at privacy@pressd.example.', ar: 'أسئلة أو طلبات بخصوص خصوصيتك؟ تواصل معنا عبر privacy@pressd.example.' },
    ],
  },
]

export default function Privacy({ onBack }: { onBack: () => void }) {
  const { t, lang } = useI18n()
  const pick = (b: Bi) => (lang === 'ar' ? b.ar : b.en)

  return (
    <>
      <div className="topbar">
        <button className="round-btn" onClick={onBack} aria-label={t('common.back')}>
          <Close />
        </button>
        <h1>{t('privacy.title')}</h1>
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
