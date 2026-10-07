"use client";

import { API } from "@/Components/config";
import { ta, adminDateTimeFormat, adminNumberFormat } from "@/Components/Admin/i18n/adminText";
import TariffManager, { TariffTexts } from "@/Components/Insurance/Tariff/TariffManager";

const nf = adminNumberFormat();
const df = adminDateTimeFormat({ year: "numeric", month: "short", day: "numeric" });

// «تعرفه‌ها» (2026-10): every insurer's coverage rules, read into the
// booking quote (backend Lib/insuranceTariffs.ts). A tab of the insurance
// hub, not a menu item of its own.
const texts = (): TariffTexts => ({
  title: ta("تعرفه‌های بیمه"),
  newTariff: ta("تعرفه‌ی جدید"),
  editTariff: ta("ویرایش تعرفه"),
  insurer: ta("بیمه"),
  plan: ta("طرح بیمه"),
  allPlans: ta("همه‌ی طرح‌ها"),
  ruleTitle: ta("عنوان تعرفه"),
  visitKind: ta("نوع ویزیت"),
  visitKinds: { any: ta("همه‌ی ویزیت‌ها"), inPerson: ta("حضوری"), online: ta("آنلاین (متنی، تلفنی، تصویری)") },
  level: ta("سطح پزشک"),
  levels: { any: ta("همه‌ی سطح‌ها"), general: ta("پزشک عمومی"), specialist: ta("متخصص"), subspecialist: ta("فوق تخصص") },
  speciality: ta("تخصص (اختیاری)"),
  service: ta("خدمت (اختیاری)"),
  servicePackage: ta("بسته‌ی خدمت (اختیاری)"),
  catalogHint: ta("با نام خدمت یا بسته جست‌وجو کنید؛ قاعده فقط برای همان خدمت یا بسته است"),
  method: ta("روش پرداخت بیمه"),
  methods: { percent: ta("درصدی از مبلغ ویزیت"), govTariff: ta("درصدی از تعرفه‌ی مصوب دولتی"), fixed: ta("مبلغ ثابت") },
  percent: ta("درصد پوشش"),
  amount: ta("مبلغ ثابت (تومان)"),
  govTariff: ta("تعرفه‌ی مصوب (تومان)"),
  ceiling: ta("سقف هر ویزیت (تومان)"),
  copay: ta("فرانشیز ثابت بیمار (تومان)"),
  limitPeriod: ta("سقف دوره‌ای"),
  limitPeriods: { none: ta("ندارد"), month: ta("ماهانه"), year: ta("سالانه") },
  limitCount: ta("تعداد ویزیت در دوره"),
  limitAmount: ta("سقف مبلغ در دوره (تومان)"),
  validFrom: ta("شروع اعتبار"),
  validTo: ta("پایان اعتبار"),
  active: ta("فعال"),
  note: ta("یادداشت"),
  pays: ta("سهم بیمه"),
  appliesTo: ta("برای"),
  validity: ta("اعتبار"),
  status: ta("وضعیت"),
  actions: ta("عملیات"),
  edit: ta("ویرایش"),
  remove: ta("حذف"),
  always: ta("همیشه"),
  noLimit: ta("بدون سقف دوره‌ای"),
  hintPercent: ta("بیمه‌ی پایه این درصد را از مبلغ ویزیت (یا از تعرفه‌ی مصوب) می‌دهد؛ بیمه‌ی تکمیلی این درصد را از آنچه بیمه‌ی پایه باقی گذاشته"),
  hintGovTariff: ta("تعرفه‌ی مصوب سال برای همین ویزیت و سطح پزشک (مثلاً تعرفه‌ی ویزیت متخصص)"),
  hintCeiling: ta("بیشترین مبلغی که بیمه برای یک ویزیت می‌دهد؛ خالی یعنی بدون سقف"),
  hintCopay: ta("مبلغی که بیمار همیشه خودش می‌دهد، حتی با پوشش کامل"),
  hintLimit: ta("در هر ماه یا سال شمسی برای هر بیمه‌شده شمرده می‌شود"),
  intro: ta("سهم بیمه روی صفحه‌ی رزرو از همین قاعده‌ها برآورد می‌شود: اول بیمه‌ی پایه، بعد بیمه‌ی تکمیلی روی باقی‌مانده. دقیق‌ترین قاعده‌ی معتبر (طرح، تخصص، سطح پزشک، نوع ویزیت) برنده است."),
  payPercent: (p) => ta("${1}٪ مبلغ ویزیت", [p]),
  payGov: (p, t) => ta("${1}٪ تعرفه‌ی ${2} تومان", [p, t]),
  payFixed: (a) => ta("${1} تومان ثابت", [a]),
  limitText: (period, count, amount) => ta("${1}: ${2} ویزیت، ${3} تومان", [period, count, amount]),
  range: (from, to) => ta("${1} تا ${2}", [from, to]),
  errPercent: ta("درصد پوشش را وارد کنید"),
  errFixed: ta("مبلغ ثابت پرداخت بیمه را وارد کنید"),
  errGov: ta("تعرفه‌ی مصوب و درصد سهم بیمه از آن را وارد کنید"),
  errDates: ta("پایان اعتبار تعرفه باید بعد از شروع آن باشد"),
  errLimit: ta("برای سقف ماهانه یا سالانه، تعداد ویزیت یا مبلغ آن را وارد کنید"),
  errInsurer: ta("بیمه را انتخاب کنید"),
});

const AdminInsuranceTariffsTab = () => (
  <TariffManager
    admin
    api={`${API}/admin/insurance-tariffs`}
    text={texts()}
    money={(n) => nf.format(n)}
    date={(d) => df.format(new Date(d))}
  />
);

export default AdminInsuranceTariffsTab;
