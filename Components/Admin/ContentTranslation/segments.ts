// Persian titles of the translatable auto segments (backend
// Lib/i18n/translatableFields.ts), grouped the way the admin menu is.
export const segmentGroups: { title: string; segments: Record<string, string> }[] = [
  {
    title: "پزشکان و مراکز",
    segments: {
      doctorprofile: "پروفایل پزشکان",
      doctor: "پزشکان (قدیمی)",
      doctorfaq: "سوالات پزشکان",
      galleryitem: "گالری",
      clinic: "کلینیک‌ها",
      clinicdepartment: "بخش‌های کلینیک",
      clinicCategory: "دسته‌بندی کلینیک",
      clinicTag: "برچسب کلینیک",
      hospital: "بیمارستان‌ها",
      hospitaldepartment: "بخش‌های بیمارستان",
      hospitalCategory: "دسته‌بندی بیمارستان",
      hospitalTag: "برچسب بیمارستان",
      pharmacy: "داروخانه‌ها",
      paraClinic: "آزمایشگاه‌ها و پاراکلینیک",
      paraClinicCategory: "دسته‌بندی پاراکلینیک",
      paraClinicTag: "برچسب پاراکلینیک",
      insurance: "بیمه‌ها",
      insurancePlan: "طرح‌های بیمه",
      insuranceCategory: "دسته‌بندی بیمه",
      insuranceTag: "برچسب بیمه",
    },
  },
  {
    title: "دانشنامه پزشکی",
    segments: {
      disease: "بیماری‌ها",
      diseaseCategory: "دسته‌بندی بیماری",
      diseaseTag: "برچسب بیماری",
      symptom: "علائم",
      symptomCategory: "دسته‌بندی علائم",
      drug: "داروها",
      drugTag: "برچسب دارو",
      part: "اعضای بدن",
      speciality: "تخصص‌ها",
      specialityCategory: "دسته‌بندی تخصص",
      test: "آزمایش‌ها",
      testCategory: "دسته‌بندی آزمایش",
    },
  },
  {
    title: "خدمات و فروشگاه",
    segments: {
      service: "خدمات",
      serviceCategory: "دسته‌بندی خدمات",
      servicePackage: "پکیج‌های خدمات",
      Product: "محصولات",
      productSpec: "مشخصات محصول",
      productCategory: "دسته‌بندی محصول",
      productPackage: "پکیج‌های محصول",
      baseDoctorLicense: "لایسنس پزشک",
      baseClinicLicense: "لایسنس کلینیک",
      baseHospitalLicense: "لایسنس بیمارستان",
      basePharmacyLicense: "لایسنس داروخانه",
      baseParaClinicLicense: "لایسنس پاراکلینیک",
      baseInsuranceLicense: "لایسنس بیمه",
    },
  },
  {
    title: "مقالات و محتوای سایت",
    segments: {
      blog: "مقالات",
      blogcategory: "دسته‌بندی مقالات",
      blogTag: "برچسب مقالات",
      homeIntroduction: "معرفی صفحه اصلی",
      advertisement: "تبلیغات",
      inlinead: "تبلیغات خطی",
      faq: "سوالات متداول",
      faqCategory: "دسته‌بندی سوالات",
      aboutPartner: "درباره همکاران",
      aboutTeam: "درباره تیم",
      aboutWhy: "چرا ما",
      testify: "نظرات مشتریان",
      privacySection: "قوانین و حریم خصوصی",
      bookingDescription: "توضیحات نوبت‌دهی",
      pageMeta: "متادیتای صفحات",
      province: "استان‌ها",
      city: "شهرها",
      district: "مناطق",
    },
  },
];

export const segmentTitle = (segment: string) => {
  for (const group of segmentGroups)
    if (segment in group.segments) return group.segments[segment];
  return segment;
};

export const fieldTitles: Record<string, string> = {
  name: "نام",
  title: "عنوان",
  subTitle: "زیرعنوان",
  summary: "خلاصه",
  description: "توضیحات",
  content: "محتوا",
  author: "نویسنده",
  question: "سوال",
  answer: "پاسخ",
  legend: "برچسب",
  alt: "متن جایگزین تصویر",
  firstName: "نام",
  lastName: "نام خانوادگی",
  introduction: "معرفی",
  services: "خدمات",
  achivements: "افتخارات",
  address: "آدرس",
  hours: "ساعات کاری",
  awards: "جوایز",
  businessTimes: "ساعات کاری",
  businessTime: "ساعات کاری",
  certificates: "گواهی‌ها",
  coverages: "پوشش‌ها",
  advantages: "مزایا",
  features: "ویژگی‌ها",
  details: "جزئیات",
  whyChoose: "چرا انتخاب کنیم",
  stages: "مراحل",
  results: "نتایج",
  usage: "نحوه مصرف",
  warning: "هشدار",
  original: "اصالت",
  expectedPrognosis: "پیش‌آگهی",
  naturalProgression: "سیر طبیعی",
  pathophysiology: "پاتوفیزیولوژی",
  possibleComplication: "عوارض احتمالی",
  aiSummary: "خلاصه هوش مصنوعی",
  alternateName: "نام دیگر",
  activeIngridient: "ماده مؤثره",
  adminstrationRoute: "راه مصرف",
  dosageForm: "شکل دارویی",
  drugUnit: "واحد",
  dosage: "دوز",
  prescriptionStatus: "وضعیت نسخه",
  sideEffects: "عوارض جانبی",
  alcoholWarning: "هشدار الکل",
  breastfeedingWarning: "هشدار شیردهی",
  foodWarning: "هشدار غذایی",
  pregnancyWarning: "هشدار بارداری",
  clinicalPharmacology: "فارماکولوژی بالینی",
  overdosage: "مصرف بیش از حد",
  prescribingInfo: "اطلاعات تجویز",
  ogTitle: "عنوان شبکه‌های اجتماعی",
  ogDescription: "توضیح شبکه‌های اجتماعی",
  keywords: "کلمات کلیدی",
};

export type FieldKind = "line" | "text" | "list";

export type LocaleStatus = "done" | "partial";

export const isRtf = (value: unknown): value is string => {
  if (typeof value !== "string" || !value.trim().startsWith("[")) return false;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) && parsed.every((n) => n && typeof n === "object");
  } catch {
    return false;
  }
};
