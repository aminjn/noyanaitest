import { ta } from "@/Components/Admin/i18n/adminText";
import { AnyKind, Extract, FieldType, ImportStatus, PartnerDestination, ReportRecord, Transform } from "./types";

// Persian admin texts of the bulk provider import (translated by ta(),
// Components/Admin/i18n/dict/*.json). Getters: ta() at module level would
// run before the dictionary loads.

const kindLabels: Record<AnyKind, () => string> = {
  doctor: () => ta("پزشکان"),
  office: () => ta("مطب‌ها"),
  clinic: () => ta("کلینیک‌ها"),
  hospital: () => ta("بیمارستان‌ها"),
  pharmacy: () => ta("داروخانه‌ها"),
  lab: () => ta("آزمایشگاه‌ها و پاراکلینیک‌ها"),
  insurer: () => ta("بیمه‌ها"),
  hours: () => ta("ساعت‌های کاری"),
  visitType: () => ta("نوع‌های ویزیت و قیمت"),
  labTest: () => ta("آزمایش‌ها و قیمت"),
};
export const kindLabel = (kind: string) => kindLabels[kind as AnyKind]?.() || kind;

const fieldLabels: Record<string, () => string> = {
  externalId: () => ta("شناسه‌ی رکورد در منبع (externalId)"),
  firstName: () => ta("نام"),
  lastName: () => ta("نام خانوادگی"),
  fullName: () => ta("نام کامل"),
  medicalCode: () => ta("شماره نظام پزشکی"),
  medicalTitle: () => ta("رشته‌ی نظام (پزشکی، دندانپزشکی، ...)"),
  gender: () => ta("جنسیت"),
  mainSpeciality: () => ta("تخصص اصلی"),
  specialities: () => ta("تخصص‌ها"),
  bio: () => ta("معرفی"),
  education: () => ta("تحصیلات و سوابق"),
  photo: () => ta("عکس (نشانی اینترنتی)"),
  website: () => ta("وب‌سایت"),
  phone: () => ta("تلفن عمومی"),
  privatePhones: () => ta("تلفن‌های خصوصی (در سایت نمایش داده نمی‌شود)"),
  insurances: () => ta("بیمه‌های طرف قرارداد"),
  services: () => ta("خدمات"),
  diseases: () => ta("بیماری‌هایی که درمان می‌کند"),
  instagram: () => ta("اینستاگرام"),
  officeHours: () => ta("ساعت کاری (متن)"),
  memberships: () => ta("عضویت در مراکز (شناسه‌ی مرکز)"),
  address: () => ta("نشانی"),
  lat: () => ta("عرض جغرافیایی"),
  lng: () => ta("طول جغرافیایی"),
  point: () => ta("مختصات «عرض,طول»"),
  province: () => ta("استان"),
  city: () => ta("شهر"),
  slug: () => ta("نامک (slug)"),
  active: () => ta("نمایش در سایت"),
  doctor: () => ta("شناسه‌ی پزشک"),
  name: () => ta("نام"),
  addressDetail: () => ta("جزئیات نشانی (طبقه، واحد)"),
  centre: () => ta("شناسه‌ی مرکز (کلینیک یا بیمارستان)"),
  day: () => ta("روز هفته"),
  from: () => ta("ساعت شروع"),
  to: () => ta("ساعت پایان"),
  range: () => ta("بازه‌ی ساعت (مثل 09:00-13:00)"),
  slotMinutes: () => ta("مدت هر نوبت (دقیقه)"),
  visitTypes: () => ta("نوع‌های ویزیت"),
  type: () => ta("نوع ویزیت"),
  price: () => ta("قیمت (تومان)"),
  duration: () => ta("مدت (دقیقه)"),
  readyTime: () => ta("زمان آماده شدن جواب"),
  sampling: () => ta("نمونه‌گیری"),
  summary: () => ta("معرفی کوتاه"),
  category: () => ta("دسته"),
  email: () => ta("ایمیل"),
  logo: () => ta("لوگو (نشانی اینترنتی)"),
  roundTheClock: () => ta("شبانه‌روزی"),
  licenseNumber: () => ta("شماره پروانه"),
  personnelCount: () => ta("تعداد پرسنل"),
  beds: () => ta("تعداد تخت"),
  onlineResults: () => ta("جواب آنلاین"),
  basic: () => ta("بیمه‌ی پایه"),
  coverages: () => ta("پوشش‌ها"),
  advantages: () => ta("مزایا"),
  offices: () => ta("مطب‌ها"),
  hours: () => ta("ساعت‌های کاری"),
  visitTypesList: () => ta("نوع‌های ویزیت و قیمت"),
  tests: () => ta("آزمایش‌ها و قیمت"),
};
export const fieldLabel = (key?: string) => {
  if (!key) return "";
  const [field, locale] = key.split("@");
  const base = fieldLabels[field]?.() || field;
  return locale ? `${base} (${locale})` : base;
};

const typeLabels: Record<FieldType, () => string> = {
  id: () => ta("شناسه"),
  ref: () => ta("شناسه"),
  string: () => ta("متن"),
  i18n: () => ta("متن چندزبانه"),
  text: () => ta("متن بلند"),
  number: () => ta("عدد"),
  price: () => ta("مبلغ (تومان)"),
  boolean: () => ta("بله / خیر"),
  enum: () => ta("یکی از گزینه‌ها"),
  list: () => ta("فهرست"),
  refList: () => ta("فهرست شناسه"),
  url: () => ta("نشانی اینترنتی"),
  phone: () => ta("تلفن"),
  phoneList: () => ta("فهرست تلفن"),
  lat: () => ta("عدد اعشاری"),
  lng: () => ta("عدد اعشاری"),
  point: () => ta("مختصات"),
  day: () => ta("روز"),
  time: () => ta("ساعت"),
  timeRange: () => ta("بازه‌ی ساعت"),
};
export const typeLabel = (t: FieldType) => typeLabels[t]?.() || t;

const transformLabels: Record<Transform, () => string> = {
  trim: () => ta("حذف فاصله‌های اضافه"),
  digits: () => ta("ارقام فارسی و عربی به لاتین"),
  phone: () => ta("شماره تلفن به شکل ۹۸..."),
  rialToToman: () => ta("ریال به تومان (تقسیم بر ۱۰)"),
  tomanToRial: () => ta("تومان به ریال (ضرب در ۱۰)"),
  lower: () => ta("حروف کوچک"),
  stripTitle: () => ta("حذف «دکتر» از ابتدای نام"),
  number: () => ta("تبدیل به عدد"),
};
export const transforms: Transform[] = ["trim", "digits", "stripTitle", "lower", "phone", "number", "rialToToman", "tomanToRial"];
export const transformLabel = (t: Transform) => transformLabels[t]();

const extractLabels: Record<Extract, () => string> = {
  urlId: () => ta("شناسه از نشانی پروفایل"),
  imageUrl: () => ta("نشانی اصلی تصویر (از پیوند پیش‌نمایش)"),
  joinedList: () => ta("جدا کردن نام‌های چسبیده با کاتالوگ"),
  hashId: () => ta("شناسه‌ی ثابت از مقدارها (نام و تلفن)"),
};
export const extracts = Object.keys(extractLabels) as Extract[];
export const extractLabel = (e: Extract) => extractLabels[e]?.() || e;

const placeByLabels: Record<string, () => string> = {
  point: () => ta("از موقعیت نقشه"),
  address: () => ta("از نشانی"),
};
export const placeByLabel = (by?: string) => (by ? placeByLabels[by]?.() || by : "");

// the read-only table of a partner file: where each field goes
const destinationLabels: Record<PartnerDestination, () => string> = {
  name: () => ta("نام و نام خانوادگی پزشک («دکتر» از ابتدا حذف می‌شود)"),
  speciality: () => ta("تخصص پزشک (از فهرست تخصص‌ها؛ فلوشیپ و فوق تخصص تخصص دیگر او؛ تخصص تازه ساخته می‌شود)"),
  phone: () => ta("تلفن مطب (عمومی)"),
  bio: () => ta("معرفی پزشک، همان‌طور که هست"),
  diseases: () => ta("بیماری‌هایی که درمان می‌کند (بیماری تازه به‌صورت پیش‌نویس ساخته می‌شود)"),
  services: () => ta("خدمات پزشک (خدمت تازه به کاتالوگ خدمات افزوده می‌شود)"),
  location: () => ta("موقعیت مطب روی نقشه (استان و شهر از روی آن)"),
  address: () => ta("نشانی مطب"),
  photo: () => ta("عکس پزشک (دریافت و روی سرور نویان ذخیره می‌شود)"),
  centreName: () => ta("نام مرکز"),
  centrePhone: () => ta("تلفن مرکز (عمومی)"),
  centreAddress: () => ta("نشانی مرکز (استان و شهر: تهران)"),
  insurances: () => ta("بیمه‌های طرف قرارداد (بیمه‌ی ناشناخته کنار گذاشته می‌شود)"),
  roundTheClock: () => ta("شبانه‌روزی (وقتی «شبانه‌روزی» در آن آمده باشد)"),
  ignored: () => ta("نادیده گرفته می‌شود؛ هیچ‌جا ذخیره نمی‌شود"),
};
export const destinationLabel = (to: string) => destinationLabels[to as PartnerDestination]?.() || to;

const enumLabels: Record<string, () => string> = {
  male: () => ta("مرد"),
  female: () => ta("زن"),
  inPerson: () => ta("حضوری"),
  videoCall: () => ta("تصویری"),
  textChat: () => ta("متنی"),
  voiceCall: () => ta("تلفنی"),
  lab: () => ta("در آزمایشگاه"),
  labOrHome: () => ta("در آزمایشگاه یا منزل"),
  none: () => ta("بدون نمونه‌گیری"),
};
export const enumLabel = (v: string) => enumLabels[v]?.() || v;

const dayLabels = [
  () => ta("شنبه"),
  () => ta("یکشنبه"),
  () => ta("دوشنبه"),
  () => ta("سه‌شنبه"),
  () => ta("چهارشنبه"),
  () => ta("پنجشنبه"),
  () => ta("جمعه"),
];
export const dayLabel = (d: number) => dayLabels[d]?.() || String(d);
export const dayValues = ["saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday"];

const statusLabels: Record<ImportStatus, () => string> = {
  uploaded: () => ta("بارگذاری شده"),
  validating: () => ta("در حال بررسی"),
  validated: () => ta("بررسی شده"),
  applying: () => ta("در حال اعمال"),
  done: () => ta("انجام شد"),
  failed: () => ta("ناموفق"),
};
export const statusLabel = (s: ImportStatus) => statusLabels[s]?.() || s;

const actionLabels: Record<ReportRecord["action"], [() => string, () => string]> = {
  create: [() => ta("ساخته می‌شود"), () => ta("ساخته شد")],
  update: [() => ta("به‌روز می‌شود"), () => ta("به‌روز شد")],
  unchanged: [() => ta("بدون تغییر"), () => ta("بدون تغییر")],
  fail: [() => ta("ناموفق"), () => ta("ناموفق")],
  skip: [() => ta("رد شده"), () => ta("رد شده")],
};
export const actionLabel = (a: ReportRecord["action"], applied: boolean) => actionLabels[a]?.[applied ? 1 : 0]() || a;

// a backend issue: a Persian template with ${n} values
export const issueText = (code: string, params?: string[]) => ta(code, params);
