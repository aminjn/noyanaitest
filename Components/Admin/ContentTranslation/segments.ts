import { ta } from "@/Components/Admin/i18n/adminText";
// Persian titles of the translatable auto segments (backend
// Lib/i18n/translatableFields.ts), grouped the way the admin menu is.
export const segmentGroups: { title: string; segments: Record<string, string> }[] = [
  {
    get title() {
  return ta("پزشکان و مراکز");
},
    segments: {
      get doctorprofile() {
  return ta("پروفایل پزشکان");
},
      get doctor() {
  return ta("پزشکان (قدیمی)");
},
      get doctorfaq() {
  return ta("سوالات پزشکان");
},
      get galleryitem() {
  return ta("گالری");
},
      get clinic() {
  return ta("کلینیک‌ها");
},
      get clinicdepartment() {
  return ta("بخش‌های کلینیک");
},
      get clinicCategory() {
  return ta("دسته‌بندی کلینیک");
},
      get clinicTag() {
  return ta("برچسب کلینیک");
},
      get hospital() {
  return ta("بیمارستان‌ها");
},
      get hospitaldepartment() {
  return ta("بخش‌های بیمارستان");
},
      get hospitalCategory() {
  return ta("دسته‌بندی بیمارستان");
},
      get hospitalTag() {
  return ta("برچسب بیمارستان");
},
      get pharmacy() {
  return ta("داروخانه‌ها");
},
      get paraClinic() {
  return ta("آزمایشگاه‌ها و پاراکلینیک");
},
      get paraClinicCategory() {
  return ta("دسته‌بندی پاراکلینیک");
},
      get paraClinicTag() {
  return ta("برچسب پاراکلینیک");
},
      get insurance() {
  return ta("بیمه‌ها");
},
      get insurancePlan() {
  return ta("طرح‌های بیمه");
},
      get insuranceCategory() {
  return ta("دسته‌بندی بیمه");
},
      get insuranceTag() {
  return ta("برچسب بیمه");
},
    },
  },
  {
    get title() {
  return ta("دانشنامه پزشکی");
},
    segments: {
      get disease() {
  return ta("بیماری‌ها");
},
      get diseaseCategory() {
  return ta("دسته‌بندی بیماری");
},
      get diseaseTag() {
  return ta("برچسب بیماری");
},
      get symptom() {
  return ta("علائم");
},
      get symptomCategory() {
  return ta("دسته‌بندی علائم");
},
      get drug() {
  return ta("داروها");
},
      get drugTag() {
  return ta("برچسب دارو");
},
      get part() {
  return ta("اعضای بدن");
},
      get speciality() {
  return ta("تخصص‌ها");
},
      get test() {
  return ta("آزمایش‌ها");
},
      get testCategory() {
  return ta("دسته‌بندی آزمایش");
},
    },
  },
  {
    get title() {
  return ta("خدمات و فروشگاه");
},
    segments: {
      get service() {
  return ta("خدمات");
},
      get serviceCategory() {
  return ta("دسته‌بندی خدمات");
},
      get servicePackage() {
  return ta("پکیج‌های خدمات");
},
      get Product() {
  return ta("محصولات");
},
      get productSpec() {
  return ta("مشخصات محصول");
},
      get productCategory() {
  return ta("دسته‌بندی محصول");
},
      get productPackage() {
  return ta("پکیج‌های محصول");
},
      get baseDoctorLicense() {
  return ta("لایسنس پزشک");
},
      get baseClinicLicense() {
  return ta("لایسنس کلینیک");
},
      get baseHospitalLicense() {
  return ta("لایسنس بیمارستان");
},
      get basePharmacyLicense() {
  return ta("لایسنس داروخانه");
},
      get baseParaClinicLicense() {
  return ta("لایسنس پاراکلینیک");
},
      get baseInsuranceLicense() {
  return ta("لایسنس بیمه");
},
    },
  },
  {
    get title() {
  return ta("مقالات و محتوای سایت");
},
    segments: {
      get blog() {
  return ta("مقالات");
},
      get blogcategory() {
  return ta("دسته‌بندی مقالات");
},
      get blogTag() {
  return ta("برچسب مقالات");
},
      get homeIntroduction() {
  return ta("معرفی صفحه اصلی");
},
      get advertisement() {
  return ta("تبلیغات");
},
      get inlinead() {
  return ta("تبلیغات خطی");
},
      get faq() {
  return ta("سوالات متداول");
},
      get faqCategory() {
  return ta("دسته‌بندی سوالات");
},
      get aboutPartner() {
  return ta("درباره همکاران");
},
      get aboutTeam() {
  return ta("درباره تیم");
},
      get aboutWhy() {
  return ta("چرا ما");
},
      get testify() {
  return ta("نظرات مشتریان");
},
      get privacySection() {
  return ta("قوانین و حریم خصوصی");
},
      get bookingDescription() {
  return ta("توضیحات نوبت‌دهی");
},
      get pageMeta() {
  return ta("متادیتای صفحات");
},
      get province() {
  return ta("استان‌ها");
},
      get city() {
  return ta("شهرها");
},
      get district() {
  return ta("مناطق");
},
    },
  },
];

export const segmentTitle = (segment: string) => {
  for (const group of segmentGroups)
    if (segment in group.segments) return group.segments[segment];
  return segment;
};

export const fieldTitles: Record<string, string> = {
  get name() {
  return ta("نام");
},
  get title() {
  return ta("عنوان");
},
  get subTitle() {
  return ta("زیرعنوان");
},
  get summary() {
  return ta("خلاصه");
},
  get description() {
  return ta("توضیحات");
},
  get content() {
  return ta("محتوا");
},
  get author() {
  return ta("نویسنده");
},
  get question() {
  return ta("سوال");
},
  get answer() {
  return ta("پاسخ");
},
  get legend() {
  return ta("برچسب");
},
  get alt() {
  return ta("متن جایگزین تصویر");
},
  get firstName() {
  return ta("نام");
},
  get lastName() {
  return ta("نام خانوادگی");
},
  get introduction() {
  return ta("معرفی");
},
  get services() {
  return ta("خدمات");
},
  get achivements() {
  return ta("افتخارات");
},
  get address() {
  return ta("آدرس");
},
  get hours() {
  return ta("ساعات کاری");
},
  get awards() {
  return ta("جوایز");
},
  get businessTimes() {
  return ta("ساعات کاری");
},
  get businessTime() {
  return ta("ساعات کاری");
},
  get certificates() {
  return ta("گواهی‌ها");
},
  get coverages() {
  return ta("پوشش‌ها");
},
  get advantages() {
  return ta("مزایا");
},
  get features() {
  return ta("ویژگی‌ها");
},
  get details() {
  return ta("جزئیات");
},
  get whyChoose() {
  return ta("چرا انتخاب کنیم");
},
  get stages() {
  return ta("مراحل");
},
  get results() {
  return ta("نتایج");
},
  get usage() {
  return ta("نحوه مصرف");
},
  get warning() {
  return ta("هشدار");
},
  get original() {
  return ta("اصالت");
},
  get expectedPrognosis() {
  return ta("پیش‌آگهی");
},
  get naturalProgression() {
  return ta("سیر طبیعی");
},
  get pathophysiology() {
  return ta("پاتوفیزیولوژی");
},
  get possibleComplication() {
  return ta("عوارض احتمالی");
},
  get aiSummary() {
  return ta("خلاصه هوش مصنوعی");
},
  get alternateName() {
  return ta("نام دیگر");
},
  get activeIngridient() {
  return ta("ماده مؤثره");
},
  get adminstrationRoute() {
  return ta("راه مصرف");
},
  get dosageForm() {
  return ta("شکل دارویی");
},
  get drugUnit() {
  return ta("واحد");
},
  get dosage() {
  return ta("دوز");
},
  get prescriptionStatus() {
  return ta("وضعیت نسخه");
},
  get sideEffects() {
  return ta("عوارض جانبی");
},
  get alcoholWarning() {
  return ta("هشدار الکل");
},
  get breastfeedingWarning() {
  return ta("هشدار شیردهی");
},
  get foodWarning() {
  return ta("هشدار غذایی");
},
  get pregnancyWarning() {
  return ta("هشدار بارداری");
},
  get clinicalPharmacology() {
  return ta("فارماکولوژی بالینی");
},
  get overdosage() {
  return ta("مصرف بیش از حد");
},
  get prescribingInfo() {
  return ta("اطلاعات تجویز");
},
  get ogTitle() {
  return ta("عنوان شبکه‌های اجتماعی");
},
  get ogDescription() {
  return ta("توضیح شبکه‌های اجتماعی");
},
  get keywords() {
  return ta("کلمات کلیدی");
},
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
